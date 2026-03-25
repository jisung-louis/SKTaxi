import React, { PropsWithChildren } from 'react';

import { RepositoryProvider } from '@/di/RepositoryProvider';
import { AuthProvider } from '@/features/auth';
import { MyPartyProvider } from '@/features/taxi';

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <RepositoryProvider>
      <AuthProvider>
        <MyPartyProvider>{children}</MyPartyProvider>
      </AuthProvider>
    </RepositoryProvider>
  );
};
