import {IPartyRepository} from '../data/repositories/IPartyRepository';
import {INotificationActionRepository} from '../data/repositories/INotificationActionRepository';
import {reportUnsupportedSystemMessageWrite} from './systemMessageContract';

interface JoinRequestDependencies {
  partyRepository: IPartyRepository;
  notificationActionRepository: INotificationActionRepository;
  leaderId: string;
  partyId: string;
}

interface AcceptJoinRequestParams extends JoinRequestDependencies {
  requestId: string;
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
}: AcceptJoinRequestParams): Promise<void> {
  await partyRepository.acceptJoinRequest(requestId, partyId);
  await notificationActionRepository.deleteJoinRequestNotifications(
    leaderId,
    requestId,
  );
  reportUnsupportedSystemMessageWrite('join request accepted');
}

export async function declineJoinRequest({
  partyRepository,
  notificationActionRepository,
  leaderId,
  requestId,
}: DeclineJoinRequestParams): Promise<void> {
  await partyRepository.declineJoinRequest(requestId);
  await notificationActionRepository.deleteJoinRequestNotifications(
    leaderId,
    requestId,
  );
}
