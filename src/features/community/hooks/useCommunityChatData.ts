import React from 'react';
import {format} from 'date-fns';
import {ko} from 'date-fns/locale';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';

import type {CommunityStackParamList} from '@/app/navigation/types';
import {useChatRooms} from '@/features/chat';
import {COLORS} from '@/shared/design-system/tokens';

import {buildCommunityChatRoomSourceItems} from '../application/communityChatQuery';
import type {CommunityChatRoomViewData} from '../model/communityViewData';
import type {CommunityChatRoomSourceItem} from '../model/communityHomeData';

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
        iconBackgroundColor: COLORS.brand.primarySoft,
        iconColor: COLORS.brand.primary,
      };
    case 'department':
      return {
        iconBackgroundColor: COLORS.accent.blueSoft,
        iconColor: COLORS.accent.blue,
      };
    case 'game':
      return {
        iconBackgroundColor: COLORS.accent.orangeSoft,
        iconColor: COLORS.accent.orange,
      };
    case 'custom':
    default:
      return {
        iconBackgroundColor: COLORS.accent.purpleSoft,
        iconColor: COLORS.accent.purple,
      };
  }
};

const getRoomStatusTone = (isJoined: boolean) => {
  if (isJoined) {
    return {
      backgroundColor: COLORS.brand.primarySoft,
      textColor: COLORS.brand.primaryStrong,
    };
  }

  return {
    backgroundColor: COLORS.background.subtle,
    textColor: COLORS.text.secondary,
  };
};

export const useCommunityChatData = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
  const {chatRooms, loading, refresh} = useChatRooms('all');
  const [refreshing, setRefreshing] = React.useState(false);
  const rooms = React.useMemo(
    () =>
      buildCommunityChatRoomSourceItems(chatRooms).map(room => {
        const tone = getRoomTone(room.tone);
        const statusTone = getRoomStatusTone(room.isJoined);

        return {
          description: room.description,
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
          isJoined: room.isJoined,
          memberCountLabel: `${room.memberCount.toLocaleString('ko-KR')}명`,
          previewLabel: room.lastMessageText,
          previewStatusBackgroundColor: room.isJoined
            ? undefined
            : statusTone.backgroundColor,
          previewStatusLabel: room.isJoined ? undefined : '둘러보기',
          previewStatusTextColor: room.isJoined
            ? undefined
            : statusTone.textColor,
          timeLabel: formatChatTimeLabel(room.updatedAt),
          title: room.title,
          titleStatusBackgroundColor: room.isJoined
            ? statusTone.backgroundColor
            : undefined,
          titleStatusLabel: room.isJoined ? '참여 중' : undefined,
          titleStatusTextColor: room.isJoined
            ? statusTone.textColor
            : undefined,
          unreadCount: room.unreadCount,
        } satisfies CommunityChatRoomViewData;
      }),
    [chatRooms],
  );

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    refresh()
      .catch(() => undefined)
      .finally(() => {
        setRefreshing(false);
      });
  }, [refresh]);

  const handleOpenRoom = React.useCallback(
    (roomId: string) => {
      navigation.navigate('ChatDetail', {chatRoomId: roomId});
    },
    [navigation],
  );

  return {
    handleOpenRoom,
    handleRefresh,
    loading,
    refreshing,
    rooms,
  };
};
