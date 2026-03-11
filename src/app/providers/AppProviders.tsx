import React, { PropsWithChildren } from 'react';

import { CourseSearchProvider } from '@/contexts/CourseSearchContext';
import { RepositoryProvider } from '@/di/RepositoryProvider';
import { AuthProvider } from '@/features/auth';

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <RepositoryProvider>
      <AuthProvider>
        <CourseSearchProvider>{children}</CourseSearchProvider>
      </AuthProvider>
    </RepositoryProvider>
  );
};
