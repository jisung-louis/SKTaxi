import type {
  SubscriptionCallbacks,
  Unsubscribe,
} from '@/shared/types/subscription';

import type {TaxiRecruitDraft} from '../../model/taxiRecruitData';
import type {
  TaxiChatSessionSnapshot,
  TaxiChatSourceData,
} from '../../model/taxiChatViewData';

export interface ITaxiChatRepository {
  createPartyChat(draft: TaxiRecruitDraft): Promise<{partyId: string}>
  getPartyChat(partyId: string): Promise<TaxiChatSourceData | null>
  getSessionSnapshot(): TaxiChatSessionSnapshot
  leaveParty(partyId: string): Promise<void>
  resetSession(): Promise<void>
  sendMessage(
    partyId: string,
    messageText: string,
  ): Promise<TaxiChatSourceData | null>
  setCurrentParty(partyId: string): Promise<void>
  subscribeToPartyChat(
    partyId: string,
    callbacks: SubscriptionCallbacks<TaxiChatSourceData | null>,
  ): Unsubscribe
  subscribeToSession(listener: () => void): () => void
  updateNotificationSetting(
    partyId: string,
    enabled: boolean,
  ): Promise<TaxiChatSourceData | null>
}
