'use client';

import { ApolloProvider as Provider } from '@apollo/client/react';
import { client } from '@/lib/apollo-client';
import type { ReactNode } from 'react';

export function ApolloProvider({ children }: { children: ReactNode }) {
  return <Provider client={client}>{children}</Provider>;
}
