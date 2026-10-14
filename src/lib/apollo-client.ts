import { useAuthStore } from '@/features/auth/model/useAuthStore';
import { ApolloLink } from '@apollo/client';
import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/api/graphql',
});

const authLink = new ApolloLink((operation, forward) => {
  const token = useAuthStore.getState().accessToken;

  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  }));

  return forward(operation);
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});
