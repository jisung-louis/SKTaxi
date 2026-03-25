import React, { PropsWithChildren } from 'react';

import { RepositoryProvider } from '@/di/RepositoryProvider';
import { AuthProvider } from '@/features/auth';

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <RepositoryProvider>
      <AuthProvider>{children}</AuthProvider>
    </RepositoryProvider>
  );
};
