import { logEvent } from '@/shared/lib/analytics';

import {
  AccountMessageData,
  ArrivalMessageData,
  IPartyRepository,
} from '../data/repositories/IPartyRepository';

interface PartyMessageDependencies {
  partyRepository: IPartyRepository;
}

interface SendPartyMessageParams extends PartyMessageDependencies {
  partyId: string;
  senderId: string;
  text: string;
}

interface SendPartyAccountMessageParams extends PartyMessageDependencies {
  partyId: string;
  senderId: string;
  accountData: AccountMessageData;
}

interface SendPartyArrivedMessageParams extends PartyMessageDependencies {
  partyId: string;
  senderId: string;
  arrivalData: ArrivalMessageData;
}

interface SendPartyEndMessageParams extends PartyMessageDependencies {
  partyId: string;
  senderId: string;
  partyArrived: boolean;
}

interface SendPartySystemMessageParams extends PartyMessageDependencies {
  partyId: string;
  text: string;
}

export async function sendMessage({
  partyRepository,
  partyId,
  senderId,
  text,
}: SendPartyMessageParams): Promise<void> {
  const trimmedText = text.trim();

  if (!trimmedText) {
    throw new Error('메시지를 입력해주세요.');
  }

  await partyRepository.sendPartyMessage(partyId, senderId, trimmedText);
  await logEvent('chat_message_sent', {
    party_id: partyId,
    message_length: trimmedText.length,
  });
}

export async function sendSystemMessage({
  partyRepository,
  partyId,
  text,
}: SendPartySystemMessageParams): Promise<void> {
  await partyRepository.sendSystemMessage(partyId, text);
}

export async function sendAccountMessage({
  partyRepository,
  partyId,
  senderId,
  accountData,
}: SendPartyAccountMessageParams): Promise<void> {
  await partyRepository.sendAccountMessage(partyId, senderId, accountData);
}

export async function sendArrivedMessage({
  partyRepository,
  partyId,
  senderId,
  arrivalData,
}: SendPartyArrivedMessageParams): Promise<void> {
  await partyRepository.sendArrivedMessage(partyId, senderId, arrivalData);
}

export async function sendEndMessage({
  partyRepository,
  partyId,
  senderId,
  partyArrived,
}: SendPartyEndMessageParams): Promise<void> {
  await partyRepository.sendEndMessage(partyId, senderId, partyArrived);
}

export type { AccountMessageData, ArrivalMessageData };
