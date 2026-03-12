import { logEvent } from '@/shared/lib/analytics';

import { IPartyRepository } from '../data/repositories/IPartyRepository';
import { Party } from '../model/types';
import { sendSystemMessage } from './partyMessageService';

interface CreateTaxiPartyParams {
  partyRepository: IPartyRepository;
  party: Omit<Party, 'id'>;
}

export async function createTaxiParty({
  partyRepository,
  party,
}: CreateTaxiPartyParams): Promise<string> {
  const partyId = await partyRepository.createParty(party);

  await logEvent('party_created', {
    party_id: partyId,
    departure: party.departure.name,
    destination: party.destination.name,
    max_members: party.maxMembers,
    has_keywords: (party.tags?.length ?? 0) > 0,
    keyword_count: party.tags?.length ?? 0,
    has_detail: Boolean(party.detail?.trim()),
  });

  try {
    await sendSystemMessage({
      partyRepository,
      partyId,
      text: '채팅방이 생성되었어요!',
    });
  } catch (error) {
    console.error('createTaxiParty: Error sending initial system message:', error);
  }

  return partyId;
}
