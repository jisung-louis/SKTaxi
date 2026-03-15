import {useSyncExternalStore} from 'react';

import {taxiChatRepository} from '../data/repositories/taxiChatRepository';

export const useTaxiChatSession = () => {
  const sessionSnapshot = useSyncExternalStore(
    listener => taxiChatRepository.subscribeToSession(listener),
    () => taxiChatRepository.getSessionSnapshot(),
    () => taxiChatRepository.getSessionSnapshot(),
  );

  return {
    currentPartyId: sessionSnapshot.currentPartyId,
    hasActiveParty: Boolean(sessionSnapshot.currentPartyId),
  };
};
