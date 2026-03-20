import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import {COLORS} from '@/shared/design-system/tokens';
import type {
  ChatThreadHeaderViewData,
  ChatThreadItemViewData,
} from '@/shared/ui/chat';

import {
  TAXI_CHAT_CURRENT_USER_ID,
  type TaxiChatSourceData,
  type TaxiChatSummaryActionViewData,
  type TaxiChatSummaryManagementViewData,
  type TaxiChatSummaryMemberActionViewData,
  type TaxiChatViewData,
} from '../model/taxiChatViewData';

const formatCurrency = (value: number) => `${value.toLocaleString('ko-KR')}원`;

const buildManagement = (
  partyChat: TaxiChatSourceData,
  currentUserId: string,
): TaxiChatSummaryManagementViewData => {
  const isLeader = partyChat.leaderId === currentUserId;
  const nonLeaderParticipants = partyChat.participants.filter(
    participant => !participant.isLeader,
  );
  const canLeave =
    !isLeader &&
    (partyChat.partyStatus === 'open' || partyChat.partyStatus === 'closed');
  const settledCount = nonLeaderParticipants.filter(
    participant => participant.settled,
  ).length;

  const statusLabel = (() => {
    switch (partyChat.partyStatus) {
      case 'closed':
        return '모집 마감';
      case 'arrived':
        return '도착 / 정산 중';
      case 'ended':
        return '파티 종료';
      case 'open':
      default:
        return '모집 중';
    }
  })();

  const primaryActions: TaxiChatSummaryActionViewData[] = [];

  if (isLeader) {
    if (partyChat.partyStatus === 'open') {
      primaryActions.push({id: 'close', label: '모집 마감', tone: 'secondary'});
      if (nonLeaderParticipants.length > 0) {
        primaryActions.push({
          id: 'arrive',
          label: '도착 처리',
          tone: 'primary',
        });
      }
    } else if (partyChat.partyStatus === 'closed') {
      primaryActions.push({
        id: 'reopen',
        label: '모집 재개',
        tone: 'secondary',
      });
      if (nonLeaderParticipants.length > 0) {
        primaryActions.push({
          id: 'arrive',
          label: '도착 처리',
          tone: 'primary',
        });
      }
    } else if (partyChat.partyStatus === 'arrived') {
      primaryActions.push({id: 'end', label: '파티 종료', tone: 'danger'});
    }
  }

  const memberActions: TaxiChatSummaryMemberActionViewData[] = (() => {
    if (!isLeader) {
      return [];
    }

    if (partyChat.partyStatus === 'open' || partyChat.partyStatus === 'closed') {
      return nonLeaderParticipants.map(participant => ({
        actionId: 'kick',
        actionLabel: '내보내기',
        actionTone: 'danger',
        id: participant.id,
        label: participant.name,
        metaLabel: '동승 멤버',
      }));
    }

    if (partyChat.partyStatus === 'arrived') {
      return nonLeaderParticipants.map(participant => ({
        actionId: participant.settled ? undefined : 'confirmSettlement',
        actionLabel: participant.settled ? undefined : '정산 확인',
        actionTone: participant.settled ? undefined : 'primary',
        id: participant.id,
        label: participant.name,
        metaLabel: participant.settled ? '정산 확인 완료' : '정산 대기',
      }));
    }

    return [];
  })();

  const noticeLabel = (() => {
    if (
      isLeader &&
      (partyChat.partyStatus === 'open' || partyChat.partyStatus === 'closed') &&
      nonLeaderParticipants.length === 0
    ) {
      return '동승 멤버가 있어야 도착 처리할 수 있습니다.';
    }

    if (!canLeave && !isLeader && partyChat.partyStatus === 'arrived') {
      return '도착 후에는 파티 나가기를 지원하지 않습니다.';
    }

    return undefined;
  })();

  return {
    canLeave,
    isLeader,
    memberActionSectionTitle:
      memberActions.length > 0
        ? partyChat.partyStatus === 'arrived'
          ? '정산 확인'
          : '파티 멤버 관리'
        : undefined,
    memberActions,
    noticeLabel,
    primaryActions,
    settlementSummaryLabel:
      partyChat.partyStatus === 'arrived' && partyChat.settlement
        ? `1인당 ${formatCurrency(
            partyChat.settlement.perPersonAmount,
          )} · ${settledCount}/${nonLeaderParticipants.length}명 확인`
        : undefined,
    statusLabel,
    statusTone: partyChat.partyStatus,
  };
};

const buildHeader = (
  partyChat: TaxiChatSourceData,
): ChatThreadHeaderViewData => ({
  iconBackgroundColor: COLORS.accent.yellowSoft,
  iconColor: COLORS.accent.yellow,
  iconName: 'car-sport-outline',
  subtitle: `${partyChat.memberCount}명`,
  title: partyChat.title,
});

const buildItems = (partyChat: TaxiChatSourceData, currentUserId: string) => {
  const items: ChatThreadItemViewData[] = [];
  let previousDateKey: string | null = null;

  partyChat.messages.forEach(message => {
    const createdDate = new Date(message.createdAt);
    const dateKey = format(createdDate, 'yyyy-MM-dd');

    if (dateKey !== previousDateKey) {
      items.push({
        id: `${partyChat.id}-${dateKey}`,
        label: format(createdDate, 'yyyy년 M월 d일 EEEE', {locale: ko}),
        type: 'date-divider',
      });
      previousDateKey = dateKey;
    }

    items.push({
      avatar: message.avatar,
      direction:
        message.type === 'system'
          ? 'system'
          : message.senderId === currentUserId
          ? 'outgoing'
          : 'incoming',
      id: message.id,
      minuteKey: format(createdDate, 'yyyy-MM-dd HH:mm'),
      senderId: message.senderId,
      senderName: message.senderName,
      text: message.text,
      timeLabel: format(createdDate, 'a hh:mm', {locale: ko}),
      type: 'message',
    });
  });

  return items;
};

export const buildTaxiChatViewData = ({
  currentUserId = TAXI_CHAT_CURRENT_USER_ID,
  partyChat,
}: {
  currentUserId?: string;
  partyChat: TaxiChatSourceData;
}): TaxiChatViewData => {
  const management = buildManagement(partyChat, currentUserId);

  return {
    composerPlaceholder: partyChat.composerPlaceholder,
    currentUserId,
    header: buildHeader(partyChat),
    items: buildItems(partyChat, currentUserId),
    menu: {
      canLeave: management.canLeave,
      leaveLabel: '파티 나가기',
      notificationEnabled: partyChat.notificationEnabled,
    },
    roomId: partyChat.id,
    summary: {
      ...partyChat.summary,
      management,
    },
  };
};
