import {notificationApiClient} from '@/features/user/data/api/notificationApiClient';

import {taxiHomeApiClient} from '../api/taxiHomeApiClient';
import {mapJoinRequestStatusDto} from '../mappers/taxiPartyMapper';
import type {
  INotificationActionRepository,
  JoinRequestStatusValue,
} from './INotificationActionRepository';

const NOTIFICATION_PAGE_SIZE = 100;
const MAX_NOTIFICATION_SCAN_PAGES = 3;

export class SpringNotificationActionRepository
  implements INotificationActionRepository
{
  async getJoinRequestStatus(
    requestId: string,
  ): Promise<JoinRequestStatusValue | null> {
    try {
      const myJoinRequestsResponse =
        await taxiHomeApiClient.getMyJoinRequests();
      const myRequest =
        myJoinRequestsResponse.data.find(request => request.id === requestId) ??
        null;

      if (myRequest) {
        return mapJoinRequestStatusDto(myRequest.status);
      }
    } catch (error) {
      console.error('Spring join request 상태 조회 실패:', error);
    }

    return null;
  }

  async deleteJoinRequestNotifications(
    _userId: string,
    partyId: string,
  ): Promise<void> {
    try {
      let page = 0;
      let hasNext = true;
      const targetIds: string[] = [];

      while (hasNext && page < MAX_NOTIFICATION_SCAN_PAGES) {
        const response = await notificationApiClient.getNotifications({
          page,
          size: NOTIFICATION_PAGE_SIZE,
        });

        response.data.content.forEach(notification => {
          if (
            notification.type === 'PARTY_JOIN_REQUEST' &&
            notification.data?.partyId === partyId
          ) {
            targetIds.push(notification.id);
          }
        });

        hasNext = response.data.hasNext;
        page += 1;
      }

      if (targetIds.length === 0) {
        return;
      }

      await Promise.all(
        targetIds.map(notificationId =>
          notificationApiClient.deleteNotification(notificationId),
        ),
      );
    } catch (error) {
      console.error('Spring 동승 요청 알림 정리 실패:', error);
    }
  }
}
