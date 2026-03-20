import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import {COLORS} from '@/shared/design-system/tokens';
import type {ChatThreadHeaderViewData} from '@/shared/ui/chat';

import {
  TAXI_CHAT_CURRENT_USER_ID,
  type TaxiChatActionTrayActionViewData,
  type TaxiChatSourceData,
  type TaxiChatSummaryManagementViewData,
  type TaxiChatSettlementNoticeViewData,
  type TaxiChatThreadItemViewData,
  type TaxiChatViewData,
} from '../model/taxiChatViewData';
import {formatTaxiChatDepartureTime} from '../data/mappers/taxiChatMapper';

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

  const noticeLabel = (() => {
    if (
      isLeader &&
      (partyChat.partyStatus === 'open' || partyChat.partyStatus === 'closed') &&
      nonLeaderParticipants.length === 0
    ) {
      return '동승 멤버가 있어야 택시 도착 처리를 진행할 수 있습니다.';
    }

    if (!isLeader && partyChat.partyStatus === 'arrived') {
      return '정산 현황은 상단 공지에서 확인할 수 있습니다.';
    }

    return undefined;
  })();

  return {
    canCancelParty: isLeader,
    canEditParty:
      isLeader &&
      (partyChat.partyStatus === 'open' || partyChat.partyStatus === 'closed'),
    canLeave,
    canManageSettlement: isLeader && partyChat.partyStatus === 'arrived',
    isLeader,
    noticeLabel,
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

const buildActionTrayActions = (
  partyChat: TaxiChatSourceData,
  management: TaxiChatSummaryManagementViewData,
): TaxiChatActionTrayActionViewData[] => {
  if (partyChat.partyStatus === 'ended') {
    return [];
  }

  const actions: TaxiChatActionTrayActionViewData[] = [
    {
      id: 'callTaxi',
      label: '택시 호출',
      tone: 'info',
    },
    {
      id: 'sendAccount',
      label: '계좌 전송',
      tone: 'brand',
    },
  ];

  if (!management.isLeader) {
    return actions;
  }

  if (partyChat.partyStatus === 'open') {
    actions.push({
      id: 'close',
      label: '모집 마감',
      tone: 'warning',
    });
    actions.push({
      id: 'arrive',
      label: '택시 도착',
      tone: 'brand',
    });
    return actions;
  }

  if (partyChat.partyStatus === 'closed') {
    actions.push({
      id: 'reopen',
      label: '모집 재개',
      tone: 'info',
    });
    actions.push({
      id: 'arrive',
      label: '택시 도착',
      tone: 'brand',
    });
    return actions;
  }

  if (partyChat.partyStatus === 'arrived') {
    actions.push({
      id: 'settlementStatus',
      label: '정산 현황',
      tone: 'purple',
    });
    actions.push({
      id: 'end',
      label: '파티 종료',
      tone: 'danger',
    });
  }

  return actions;
};

const buildSettlementNotice = (
  partyChat: TaxiChatSourceData,
  currentUserId: string,
): TaxiChatSettlementNoticeViewData | undefined => {
  if (!partyChat.settlement) {
    return undefined;
  }

  const members = partyChat.participants.map(participant => ({
    id: participant.id,
    isCurrentUser: participant.id === currentUserId,
    label: participant.name,
    settled: participant.isLeader ? true : participant.settled,
  }));
  const completedCount = members.filter(member => member.settled).length;
  const totalCount = members.length;
  const isCompleted =
    partyChat.settlement.status === 'completed' ||
    (totalCount > 0 && completedCount === totalCount);

  return {
    accountLabel: partyChat.latestAccountData
      ? `${partyChat.latestAccountData.bankName} ${partyChat.latestAccountData.accountNumber}`
      : undefined,
    completedCount,
    description: isCompleted
      ? '모든 정산이 완료됐어요!'
      : '계좌로 입금된 멤버를 정산완료 처리하세요',
    members,
    perPersonAmount:
      partyChat.settlement.perPersonAmount > 0
        ? partyChat.settlement.perPersonAmount
        : undefined,
    statusLabel: isCompleted ? '완료' : '진행 중',
    summaryLabel: `${completedCount}/${totalCount}명 완료`,
    totalCount,
  };
};

const buildItems = (
  partyChat: TaxiChatSourceData,
  currentUserId: string,
): TaxiChatThreadItemViewData[] => {
  const items: TaxiChatThreadItemViewData[] = [];
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

    if (message.type === 'system') {
      items.push({
        id: message.id,
        text: message.text,
        type: 'system-message',
      });
      return;
    }

    if (message.type === 'account' && message.accountData) {
      items.push({
        accountData: message.accountData,
        id: message.id,
        senderName: message.senderName,
        text: message.text,
        timeLabel: format(createdDate, 'a hh:mm', {locale: ko}),
        type: 'account-message',
      });
      return;
    }

    if (message.type === 'arrived') {
      items.push({
        accountLabel: partyChat.latestAccountData
          ? `${partyChat.latestAccountData.bankName} ${partyChat.latestAccountData.accountNumber}`
          : undefined,
        id: message.id,
        memberCount: message.arrivalData?.memberCount,
        perPerson: message.arrivalData?.perPerson,
        taxiFare: message.arrivalData?.taxiFare,
        timeLabel: format(createdDate, 'a hh:mm', {locale: ko}),
        type: 'arrived-message',
      });
      return;
    }

    if (message.type === 'end') {
      items.push({
        id: message.id,
        text: message.text,
        type: 'end-message',
      });
      return;
    }

    items.push({
      avatar: message.avatar,
      direction:
        message.senderId === currentUserId ? 'outgoing' : 'incoming',
      id: message.id,
      minuteKey: format(createdDate, 'yyyy-MM-dd HH:mm'),
      senderId: message.senderId,
      senderName: message.senderName,
      text: message.text,
      timeLabel: format(createdDate, 'a hh:mm', {locale: ko}),
      type: 'text-message',
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
  const settlementNotice = buildSettlementNotice(partyChat, currentUserId);
  const members = partyChat.participants.map(participant => ({
    id: participant.id,
    isCurrentUser: participant.id === currentUserId,
    label: participant.name,
    settled: participant.isLeader ? true : participant.settled,
  }));

  return {
    actionTrayActions: buildActionTrayActions(partyChat, management),
    composerPlaceholder: partyChat.composerPlaceholder,
    currentUserId,
    header: buildHeader(partyChat),
    items: buildItems(partyChat, currentUserId),
    menu: {
      canCancelParty: management.canCancelParty,
      canEditParty: management.canEditParty,
      canLeave: management.canLeave,
      isLeader: management.isLeader,
      leaveLabel: '파티 나가기',
      notificationEnabled: partyChat.notificationEnabled,
    },
    roomId: partyChat.id,
    summary: {
      departureLabel: partyChat.departureLocation.name,
      departureLocation: partyChat.departureLocation,
      departureTimeISO: partyChat.departureTimeISO,
      departureTimeLabel: formatTaxiChatDepartureTime(partyChat.departureTimeISO),
      detail: partyChat.detail,
      destinationLabel: partyChat.destinationLocation.name,
      destinationLocation: partyChat.destinationLocation,
      management,
      memberSummaryLabel: `${partyChat.memberCount}/${partyChat.maxMembers}명`,
      members,
      partyStatus: partyChat.partyStatus,
      settlementNotice,
      tagLabel: partyChat.tagLabel,
    },
  };
};
