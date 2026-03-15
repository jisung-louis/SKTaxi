import { IPartyRepository } from '../data/repositories/IPartyRepository';
import { INotificationActionRepository } from '../data/repositories/INotificationActionRepository';
import { sendSystemMessage } from './partyMessageService';

interface JoinRequestDependencies {
  partyRepository: IPartyRepository;
  notificationActionRepository: INotificationActionRepository;
  leaderId: string;
  partyId: string;
}

interface AcceptJoinRequestParams extends JoinRequestDependencies {
  requestId: string;
  requesterId: string;
  requesterName: string;
}

interface DeclineJoinRequestParams extends JoinRequestDependencies {
  requestId: string;
}

export async function acceptJoinRequest({
  partyRepository,
  notificationActionRepository,
  leaderId,
  partyId,
  requestId,
  requesterId,
  requesterName,
}: AcceptJoinRequestParams): Promise<void> {
  await partyRepository.acceptJoinRequest(requestId, partyId, requesterId);
  await notificationActionRepository.deleteJoinRequestNotifications(leaderId, partyId);
  await sendSystemMessage({
    partyRepository,
    partyId,
    text: `${requesterName}님이 파티에 합류했어요.`,
  });
}

export async function declineJoinRequest({
  partyRepository,
  notificationActionRepository,
  leaderId,
  partyId,
  requestId,
}: DeclineJoinRequestParams): Promise<void> {
  await partyRepository.declineJoinRequest(requestId);
  await notificationActionRepository.deleteJoinRequestNotifications(leaderId, partyId);
}
