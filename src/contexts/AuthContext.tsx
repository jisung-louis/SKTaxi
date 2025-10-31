import React, { createContext, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthState } from '../types/auth';

interface AuthContextType extends AuthState {
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ firstLogin: boolean }>; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}; 