/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('../src/contexts/AuthContext', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/contexts/CourseSearchContext', () => ({
  CourseSearchProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/di/RepositoryProvider', () => ({
  RepositoryProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('../src/navigations/RootNavigator', () => ({
  RootNavigator: () => null,
}));

jest.mock('../src/config/firebase', () => ({}));

jest.mock('../src/config/google', () => ({
  configureGoogleSignin: jest.fn(),
}));

jest.mock('../src/lib/versionCheck', () => ({
  checkVersionUpdate: jest.fn(() => Promise.resolve({ forceUpdate: false })),
}));

jest.mock('../src/components/common/ForceUpdateModal', () => ({
  ForceUpdateModal: () => null,
}));

jest.mock('@react-native-firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  onAuthStateChanged: jest.fn(() => jest.fn()),
}));

jest.mock('@react-native-firebase/crashlytics', () => ({
  getCrashlytics: jest.fn(() => ({})),
  log: jest.fn(),
}));

jest.mock('react-native-immersive-mode', () => ({
  setBarMode: jest.fn(),
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
