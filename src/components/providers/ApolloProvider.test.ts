import { createElement as h } from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const { Provider, client } = vi.hoisted(() => ({
  Provider: vi.fn(({ children }: { children: React.ReactNode }) =>
    h('div', { 'data-testid': 'apollo-provider' }, children)
  ),
  client: { id: 'mock-apollo-client' },
}));

vi.mock('@apollo/client/react', () => ({
  ApolloProvider: Provider,
}));

vi.mock('@/lib/apollo-client', () => ({
  client,
}));

import { ApolloProvider } from './ApolloProvider';

describe('ApolloProvider', () => {
  it('wraps children with Apollo client provider', () => {
    render(h(ApolloProvider, null, h('span', null, 'app')));

    expect(screen.getByTestId('apollo-provider')).toBeInTheDocument();
    expect(screen.getByText('app')).toBeInTheDocument();
    expect(Provider).toHaveBeenCalledWith(expect.objectContaining({ client }), undefined);
  });
});
