import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/auth';
import { usePartyRepository } from '../di/useRepository';

interface JoinRequestContextType {
  joinRequestCount: number;
}

const JoinRequestContext = createContext<JoinRequestContextType | undefined>(undefined);

export const useJoinRequestCount = () => {
  const context = useContext(JoinRequestContext);
  if (!context) {
    throw new Error('useJoinRequestCount must be used within a JoinRequestProvider');
  }
  return context;
};

export const JoinRequestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [joinRequestCount, setJoinRequestCount] = useState(0);
  const { user } = useAuth();
  const partyRepository = usePartyRepository();

  useEffect(() => {
    if (!user?.uid) {
      setJoinRequestCount(0);
      return;
    }

    // Repository를 통해 pending 동승 요청 개수 구독
    const unsubscribe = partyRepository.subscribeToJoinRequestCount(user.uid, {
      onData: (count) => {
        setJoinRequestCount(count);
      },
      onError: (error) => {
        console.error('동승 요청 개수 조회 실패:', error);
        setJoinRequestCount(0);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [user?.uid, partyRepository]);

  return (
    <JoinRequestContext.Provider value={{ joinRequestCount }}>
      {children}
    </JoinRequestContext.Provider>
  );
};
