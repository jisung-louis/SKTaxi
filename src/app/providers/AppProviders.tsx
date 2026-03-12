import React, { PropsWithChildren } from 'react';

import { RepositoryProvider } from '@/di/RepositoryProvider';
import { AuthProvider } from '@/features/auth';
import { CourseSearchProvider } from '@/features/timetable';

export const AppProviders = ({ children }: PropsWithChildren) => {
  return (
    <RepositoryProvider>
      <AuthProvider>
        <CourseSearchProvider>{children}</CourseSearchProvider>
      </AuthProvider>
    </RepositoryProvider>
  );
};
