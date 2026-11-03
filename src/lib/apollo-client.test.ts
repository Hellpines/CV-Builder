import { gql } from '@apollo/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/features/auth/models/useAuthStore';
import { client } from './apollo-client';

const PING = gql`
  query Ping {
    ping
  }
`;

function graphqlResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

function readRequestBody(input: RequestInfo | URL, init?: RequestInit) {
  if (typeof input !== 'string' && !(input instanceof URL) && 'body' in input && input.body) {
    return String(input.body);
  }
  return String(init?.body ?? '');
}

function readAuthHeader(input: RequestInfo | URL, init?: RequestInit) {
  if (typeof input !== 'string' && !(input instanceof URL) && 'headers' in input) {
    return new Headers(input.headers).get('authorization');
  }
  return new Headers(init?.headers).get('authorization');
}

describe('apollo-client', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    useAuthStore.setState({
      accessToken: null,
      refreshToken: null,
      user: null,
      verificationRequested: false,
    });
    void client.clearStore();

    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('exports a configured Apollo client', () => {
    expect(client).toBeDefined();
    expect(client.cache).toBeDefined();
  });

  it('attaches Bearer access token on requests', async () => {
    useAuthStore.setState({ accessToken: 'access-1' });

    fetchMock.mockResolvedValue(graphqlResponse({ data: { ping: 'ok' } }));

    const result = await client.query({ query: PING, fetchPolicy: 'network-only' });

    expect(result.data).toEqual({ ping: 'ok' });
    expect(fetchMock).toHaveBeenCalled();
    expect(readAuthHeader(fetchMock.mock.calls[0][0], fetchMock.mock.calls[0][1])).toBe(
      'Bearer access-1'
    );
  });

  it('sends empty authorization when there is no token', async () => {
    fetchMock.mockResolvedValue(graphqlResponse({ data: { ping: 'ok' } }));

    await client.query({ query: PING, fetchPolicy: 'network-only' });

    expect(readAuthHeader(fetchMock.mock.calls[0][0], fetchMock.mock.calls[0][1])).toBe('');
  });

  it('keeps an explicit authorization header from context', async () => {
    useAuthStore.setState({ accessToken: 'access-1' });
    fetchMock.mockResolvedValue(graphqlResponse({ data: { ping: 'ok' } }));

    await client.query({
      query: PING,
      fetchPolicy: 'network-only',
      context: {
        headers: {
          authorization: 'Bearer custom',
        },
      },
    });

    expect(readAuthHeader(fetchMock.mock.calls[0][0], fetchMock.mock.calls[0][1])).toBe(
      'Bearer custom'
    );
  });

  it('propagates non-auth GraphQL errors without refresh', async () => {
    useAuthStore.setState({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    fetchMock.mockResolvedValue(
      graphqlResponse({
        errors: [{ message: 'Nope', extensions: { code: 'FORBIDDEN' } }],
      })
    );

    await expect(client.query({ query: PING, fetchPolicy: 'network-only' })).rejects.toThrow();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().accessToken).toBe('access-1');
  });

  it('propagates network errors without refresh', async () => {
    useAuthStore.setState({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));

    await expect(client.query({ query: PING, fetchPolicy: 'network-only' })).rejects.toThrow(
      'Failed to fetch'
    );
    expect(useAuthStore.getState().accessToken).toBe('access-1');
  });

  it('logs out when UNAUTHENTICATED and no refresh token', async () => {
    useAuthStore.setState({ accessToken: 'access-1', refreshToken: null });
    const clearStore = vi.spyOn(client, 'clearStore').mockResolvedValue([]);

    fetchMock.mockResolvedValue(
      graphqlResponse({
        errors: [{ message: 'Unauthenticated', extensions: { code: 'UNAUTHENTICATED' } }],
      })
    );

    await expect(client.query({ query: PING, fetchPolicy: 'network-only' })).rejects.toThrow();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(clearStore).toHaveBeenCalled();
  });

  it('logs out when UNAUTHENTICATED and skipAuthRefresh is set', async () => {
    useAuthStore.setState({ accessToken: 'access-1', refreshToken: 'refresh-1' });
    const clearStore = vi.spyOn(client, 'clearStore').mockResolvedValue([]);

    fetchMock.mockResolvedValue(
      graphqlResponse({
        errors: [{ message: 'Unauthenticated', extensions: { code: 'UNAUTHENTICATED' } }],
      })
    );

    await expect(
      client.query({
        query: PING,
        fetchPolicy: 'network-only',
        context: { skipAuthRefresh: true },
      })
    ).rejects.toThrow();

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(clearStore).toHaveBeenCalled();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('refreshes token and retries after UNAUTHENTICATED', async () => {
    useAuthStore.setState({ accessToken: 'old-access', refreshToken: 'refresh-1' });

    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const body = readRequestBody(input, init);

      if (body.includes('UpdateToken')) {
        expect(readAuthHeader(input, init)).toBe('Bearer refresh-1');
        return Promise.resolve(
          graphqlResponse({
            data: {
              updateToken: {
                access_token: 'new-access',
                refresh_token: 'new-refresh',
              },
            },
          })
        );
      }

      if (readAuthHeader(input, init) === 'Bearer new-access') {
        return Promise.resolve(graphqlResponse({ data: { ping: 'ok' } }));
      }

      return Promise.resolve(
        graphqlResponse({
          errors: [{ message: 'Unauthenticated', extensions: { code: 'UNAUTHENTICATED' } }],
        })
      );
    });

    const result = await client.query({ query: PING, fetchPolicy: 'network-only' });

    expect(result.data).toEqual({ ping: 'ok' });
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
    expect(
      fetchMock.mock.calls.some(([input, init]) =>
        readRequestBody(input, init).includes('UpdateToken')
      )
    ).toBe(true);
  });

  it('shares a single refresh promise across concurrent UNAUTHENTICATED requests', async () => {
    useAuthStore.setState({ accessToken: 'old-access', refreshToken: 'refresh-1' });

    let refreshCalls = 0;
    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const body = readRequestBody(input, init);

      if (body.includes('UpdateToken')) {
        refreshCalls += 1;
        return Promise.resolve(
          graphqlResponse({
            data: {
              updateToken: {
                access_token: 'new-access',
                refresh_token: 'new-refresh',
              },
            },
          })
        );
      }

      if (readAuthHeader(input, init) === 'Bearer new-access') {
        return Promise.resolve(graphqlResponse({ data: { ping: 'ok' } }));
      }

      return Promise.resolve(
        graphqlResponse({
          errors: [{ message: 'Unauthenticated', extensions: { code: 'UNAUTHENTICATED' } }],
        })
      );
    });

    const [first, second] = await Promise.all([
      client.query({ query: PING, fetchPolicy: 'network-only', context: { requestId: 1 } }),
      client.query({ query: PING, fetchPolicy: 'network-only', context: { requestId: 2 } }),
    ]);

    expect(first.data).toEqual({ ping: 'ok' });
    expect(second.data).toEqual({ ping: 'ok' });
    expect(refreshCalls).toBe(1);
  });

  it('logs out when token refresh returns GraphQL errors', async () => {
    useAuthStore.setState({ accessToken: 'old-access', refreshToken: 'refresh-1' });
    const clearStore = vi.spyOn(client, 'clearStore').mockResolvedValue([]);

    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const body = readRequestBody(input, init);

      if (body.includes('UpdateToken')) {
        return Promise.resolve(
          graphqlResponse({
            errors: [{ message: 'refresh exploded' }],
          })
        );
      }

      return Promise.resolve(
        graphqlResponse({
          errors: [{ message: 'Unauthenticated', extensions: { code: 'UNAUTHENTICATED' } }],
        })
      );
    });

    await expect(client.query({ query: PING, fetchPolicy: 'network-only' })).rejects.toThrow(
      'refresh exploded'
    );
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(clearStore).toHaveBeenCalled();
  });

  it('logs out when token refresh returns no tokens', async () => {
    useAuthStore.setState({ accessToken: 'old-access', refreshToken: 'refresh-1' });
    const clearStore = vi.spyOn(client, 'clearStore').mockResolvedValue([]);

    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const body = readRequestBody(input, init);

      if (body.includes('UpdateToken')) {
        return Promise.resolve(graphqlResponse({ data: { updateToken: null } }));
      }

      return Promise.resolve(
        graphqlResponse({
          errors: [{ message: 'Unauthenticated', extensions: { code: 'UNAUTHENTICATED' } }],
        })
      );
    });

    await expect(client.query({ query: PING, fetchPolicy: 'network-only' })).rejects.toThrow(
      'Refresh token mutation returned no tokens'
    );
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(clearStore).toHaveBeenCalled();
  });

  it('swallows clearStore rejection during force logout', async () => {
    useAuthStore.setState({ accessToken: 'access-1', refreshToken: null });
    vi.spyOn(client, 'clearStore').mockRejectedValue(new Error('cache locked'));

    fetchMock.mockResolvedValue(
      graphqlResponse({
        errors: [{ message: 'Unauthenticated', extensions: { code: 'UNAUTHENTICATED' } }],
      })
    );

    await expect(client.query({ query: PING, fetchPolicy: 'network-only' })).rejects.toThrow();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('propagates UNAUTHENTICATED from retry after a successful refresh', async () => {
    useAuthStore.setState({ accessToken: 'old-access', refreshToken: 'refresh-1' });

    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const body = readRequestBody(input, init);

      if (body.includes('UpdateToken')) {
        return Promise.resolve(
          graphqlResponse({
            data: {
              updateToken: {
                access_token: 'new-access',
                refresh_token: 'new-refresh',
              },
            },
          })
        );
      }

      return Promise.resolve(
        graphqlResponse({
          errors: [{ message: 'Unauthenticated', extensions: { code: 'UNAUTHENTICATED' } }],
        })
      );
    });

    await expect(client.query({ query: PING, fetchPolicy: 'network-only' })).rejects.toThrow();
    expect(useAuthStore.getState()).toMatchObject({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
    });
  });

  it('falls back to default refresh error message when errors have no message', async () => {
    useAuthStore.setState({ accessToken: 'old-access', refreshToken: 'refresh-1' });
    vi.spyOn(client, 'clearStore').mockResolvedValue([]);

    fetchMock.mockImplementation((input: RequestInfo | URL, init?: RequestInit) => {
      const body = readRequestBody(input, init);

      if (body.includes('UpdateToken')) {
        return Promise.resolve(graphqlResponse({ errors: [{}] }));
      }

      return Promise.resolve(
        graphqlResponse({
          errors: [{ message: 'Unauthenticated', extensions: { code: 'UNAUTHENTICATED' } }],
        })
      );
    });

    await expect(client.query({ query: PING, fetchPolicy: 'network-only' })).rejects.toThrow(
      'Token refresh failed'
    );
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
