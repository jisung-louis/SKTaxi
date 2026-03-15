import React from 'react';
import {format} from 'date-fns';
import {ko} from 'date-fns/locale';

import {useAuth} from '@/features/auth';
import {
  getChatRoomIcon,
  hasUnreadChatRoom,
  safeToMillis,
  useChatListPresenter,
  type ChatRoomListItem,
} from '@/features/chat';
import {V2_COLORS} from '@/shared/design-system/tokens';

import type {CommunityChatRoomViewData} from '../model/communityViewData';

const formatChatTimeLabel = (timestamp: unknown) => {
  const millis = safeToMillis(timestamp);

  if (!millis) {
    return '';
  }

  return format(new Date(millis), 'a h:mm', {locale: ko});
};

const getRoomTitle = (room: ChatRoomListItem) => {
  if (room.type === 'university') {
    return '성결대학교 전체';
  }

  const baseName = room.displayName ?? room.name;
  return baseName.replace(/ 채팅방$/, '');
};

const getRoomTone = (type: ChatRoomListItem['type']) => {
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
  const {user} = useAuth();
  const {
    adminRooms,
    chatRoomStates,
    customRooms,
    fixedRooms,
    gameRooms,
    handleChatRoomPress,
    handleRefresh,
    isAdmin,
    loading,
    refreshing,
    showAllRooms,
  } = useChatListPresenter();

  const sourceRooms = React.useMemo(
    () =>
      isAdmin && showAllRooms
        ? adminRooms
        : [...fixedRooms, ...customRooms, ...gameRooms],
    [adminRooms, customRooms, fixedRooms, gameRooms, isAdmin, showAllRooms],
  );

  const rooms = React.useMemo(() => {
    return sourceRooms.map(room => {
      const roomState = room.id ? chatRoomStates[room.id] : undefined;
      const unreadCount =
        room.id && user?.uid
          ? room.unreadCount?.[user.uid] ??
            (hasUnreadChatRoom(room, roomState) ? 1 : 0)
          : 0;
      const tone = getRoomTone(room.type);

      return {
        iconBackgroundColor: tone.iconBackgroundColor,
        iconColor: tone.iconColor,
        iconName: getChatRoomIcon(room.type),
        id: room.id ?? room.name,
        memberCountLabel: `${room.members.length.toLocaleString('ko-KR')}명`,
        timeLabel: formatChatTimeLabel(
          room.lastMessage?.timestamp ?? room.updatedAt,
        ),
        title: getRoomTitle(room),
        unreadCount,
        subtitle:
          room.lastMessage?.text ?? room.description ?? '아직 메시지가 없어요',
      } satisfies CommunityChatRoomViewData;
    });
  }, [chatRoomStates, sourceRooms, user?.uid]);

  const handleOpenRoom = React.useCallback(
    (roomId: string) => {
      const targetRoom = sourceRooms.find(room => room.id === roomId);

      if (!targetRoom) {
        return;
      }

      handleChatRoomPress(targetRoom);
    },
    [handleChatRoomPress, sourceRooms],
  );

  return {
    handleOpenRoom,
    handleRefresh,
    loading,
    refreshing,
    rooms,
  };
};
