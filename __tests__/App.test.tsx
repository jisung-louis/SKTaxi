/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('../src/features/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/contexts/CourseSearchContext', () => ({
  CourseSearchProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/di/RepositoryProvider', () => ({
  RepositoryProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/app/navigation/AppNavigation', () => ({
  AppNavigation: () => null,
}));

jest.mock('../src/app/bootstrap/AppRuntimeHost', () => ({
  AppRuntimeHost: () => null,
}));

jest.mock('../src/app/bootstrap/useAppBootstrap', () => ({
  useAppBootstrap: () => ({
    forceUpdateRequired: false,
    modalConfig: null,
  }),
}));

jest.mock('../src/shared/ui/ForceUpdateModal', () => ({
  ForceUpdateModal: () => null,
}));

jest.mock('../src/shared/lib/firebase', () => ({}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
