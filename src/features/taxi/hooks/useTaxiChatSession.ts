import {useSyncExternalStore} from 'react';

import {taxiChatRepository} from '../data/repositories/taxiChatRepository';

export const useTaxiChatSession = () => {
  const currentPartyId = useSyncExternalStore(
    listener => taxiChatRepository.subscribeToSession(listener),
    () => taxiChatRepository.getSessionSnapshot().currentPartyId,
    () => taxiChatRepository.getSessionSnapshot().currentPartyId,
  );

  return {
    currentPartyId,
    hasActiveParty: Boolean(currentPartyId),
  };
};
