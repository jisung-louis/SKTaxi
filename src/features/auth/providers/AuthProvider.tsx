import React, {
  PropsWithChildren,
  createContext,
  useContext,
} from 'react';

import { AuthContextValue } from '../model/types';
import { useAuthSession } from '../hooks/useAuthSession';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const auth = useAuthSession();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
