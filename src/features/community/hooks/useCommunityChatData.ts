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

export const useCommunityChatData = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<CommunityStackParamList>>();
  const {chatRooms, loading, refresh} = useChatRooms('all');
  const [refreshing, setRefreshing] = React.useState(false);
  const rooms = React.useMemo(
    () =>
      buildCommunityChatRoomSourceItems(chatRooms).map(room => {
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
