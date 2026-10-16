import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { ApolloClient, ApolloLink, HttpLink, InMemoryCache, FetchResult } from '@apollo/client';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { ErrorLink } from '@apollo/client/link/error';
import { from, Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

const graphqlUri = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/api/graphql';

const httpLink = new HttpLink({
  uri: graphqlUri,
  credentials: 'include',
});

const authLink = new ApolloLink((operation, forward) => {
  const token = useAuthStore.getState().accessToken;

  operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }));

  return forward(operation);
});

let isRefreshing = false;

interface UpdateTokenResponse {
  data?: {
    updateToken: {
      access_token: string;
      refresh_token: string;
    };
  };
}

interface GraphQLErrorItem {
  extensions?: {
    code?: string;
  };
}

const errorLink: ApolloLink = new ErrorLink(({ error, operation, forward }) => {
  if (!CombinedGraphQLErrors.is(error)) {
    return;
  }

  const unauthorizedError = error.errors.find(
    (item: GraphQLErrorItem) => item.extensions?.code === 'UNAUTHENTICATED'
  );

  if (!unauthorizedError) {
    return;
  }

  const refreshToken = useAuthStore.getState().refreshToken;

  if (!refreshToken) {
    useAuthStore.getState().logout();
    return;
  }

  if (isRefreshing) {
    return;
  }

  isRefreshing = true;

  return from(
    (async (): Promise<string> => {
      try {
        const res = await fetch(graphqlUri, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${refreshToken}`,
          },
          body: JSON.stringify({
            query: `
              mutation UpdateToken {
                updateToken {
                  access_token
                  refresh_token
                }
              }
            `,
          }),
        });

        const result: UpdateTokenResponse = await res.json();
        const tokens = result.data?.updateToken;

        if (!tokens?.access_token || !tokens?.refresh_token) {
          throw new Error('Refresh token mutation returned no tokens');
        }

        useAuthStore.setState({
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
        });

        operation.setContext(({ headers = {} }: { headers?: Record<string, string> }) => ({
          headers: {
            ...headers,
            authorization: `Bearer ${tokens.access_token}`,
          },
        }));

        return tokens.access_token;
      } catch (refreshError) {
        useAuthStore.getState().logout();
        throw refreshError;
      } finally {
        isRefreshing = false;
      }
    })()
  ).pipe(switchMap((): Observable<ApolloLink.Result> => forward(operation)));
});

export const client = new ApolloClient({
  link: ApolloLink.from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
});
