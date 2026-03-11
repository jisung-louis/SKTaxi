import React, { PropsWithChildren } from 'react';

import { AuthProvider } from '@/contexts/AuthContext';
import { CourseSearchProvider } from '@/contexts/CourseSearchContext';
import { RepositoryProvider } from '@/di/RepositoryProvider';

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <RepositoryProvider>
      <AuthProvider>
        <CourseSearchProvider>{children}</CourseSearchProvider>
      </AuthProvider>
    </RepositoryProvider>
  );
};
