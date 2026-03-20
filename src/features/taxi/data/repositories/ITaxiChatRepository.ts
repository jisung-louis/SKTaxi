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
  resetSession(): Promise<void>
  sendAccountMessage(partyId: string): Promise<TaxiChatSourceData | null>
  sendArrivedMessage(
    partyId: string,
    taxiFare: number,
  ): Promise<TaxiChatSourceData | null>
  sendEndMessage(partyId: string): Promise<TaxiChatSourceData | null>
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
