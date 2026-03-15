import React from 'react';
import {Alert} from 'react-native';
import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import {V2_COLORS} from '@/shared/design-system/tokens';

import type {CommunityChatRoomViewData} from '../model/communityViewData';
import type {CommunityChatRoomSourceItem} from '../model/communityHomeData';
import {communityHomeRepository} from '../data/repositories/communityHomeRepository';

const formatChatTimeLabel = (timestamp: unknown) => {
  const millis = new Date(String(timestamp)).getTime();

  if (!millis) {
    return '';
  }

  return format(new Date(millis), 'a h:mm', {locale: ko});
};

const getRoomTone = (type: CommunityChatRoomSourceItem['tone']) => {
  switch (type) {
    case 'university':
      return {
        iconBackgroundColor: V2_COLORS.brand.primarySoft,
        iconColor: V2_COLORS.brand.primary,
      };
    case 'department':
      return {
        iconBackgroundColor: V2_COLORS.accent.blueSoft,
        iconColor: V2_COLORS.accent.blue,
      };
    case 'game':
      return {
        iconBackgroundColor: V2_COLORS.accent.orangeSoft,
        iconColor: V2_COLORS.accent.orange,
      };
    case 'custom':
    default:
      return {
        iconBackgroundColor: V2_COLORS.accent.purpleSoft,
        iconColor: V2_COLORS.accent.purple,
      };
  }
};

export const useCommunityChatData = () => {
  const [rooms, setRooms] = React.useState<CommunityChatRoomViewData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadRooms = React.useCallback(async (mode: 'initial' | 'refresh') => {
    if (mode === 'initial') {
      setLoading(true);
    }

    if (mode === 'refresh') {
      setRefreshing(true);
    }

    try {
      const sourceRooms = await communityHomeRepository.getChatRooms();

      setRooms(
        sourceRooms.map(room => {
          const tone = getRoomTone(room.tone);

          return {
            iconBackgroundColor: tone.iconBackgroundColor,
            iconColor: tone.iconColor,
            iconName:
              room.tone === 'university'
                ? 'business-outline'
                : room.tone === 'department'
                ? 'people-outline'
                : room.tone === 'game'
                ? 'game-controller-outline'
                : 'chatbubble-outline',
            id: room.id,
            memberCountLabel: `${room.memberCount.toLocaleString('ko-KR')}명`,
            timeLabel: formatChatTimeLabel(room.updatedAt),
            title: room.title,
            unreadCount: room.unreadCount,
            subtitle: room.lastMessageText,
          } satisfies CommunityChatRoomViewData;
        }),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    loadRooms('initial').catch(() => undefined);
  }, [loadRooms]);

  const handleRefresh = React.useCallback(() => {
    loadRooms('refresh').catch(() => undefined);
  }, [loadRooms]);

  const handleOpenRoom = React.useCallback(() => {
    Alert.alert(
      '준비 중',
      '채팅 상세 화면은 Spring REST API 연동 단계에서 연결할 예정입니다.',
    );
  }, []);

  return {
    handleOpenRoom,
    handleRefresh,
    loading,
    refreshing,
    rooms,
  };
};
