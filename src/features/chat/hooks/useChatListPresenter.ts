import { useCallback, useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAuth } from '@/features/auth';
import { useUserProfile } from '@/features/user';
import type { ChatStackParamList } from '@/navigations/types';

import type { ChatRoom, ChatRoomListItem } from '../model/types';

import { getChatRoomDisplayName } from '../services/chatRoomService';

import { useChatRoomNotifications } from './useChatRoomNotifications';
import { useChatRoomStates } from './useChatRoomStates';
import { useChatRooms } from './useChatRooms';

type ChatListScreenNavigationProp = NativeStackNavigationProp<ChatStackParamList, 'ChatList'>;

const withNotificationSetting = (
  rooms: ChatRoom[],
  notifications: Record<string, boolean>,
): ChatRoomListItem[] => {
  return rooms.map(room => ({
    ...room,
    notificationEnabled: room.id ? (notifications[room.id] ?? true) : true,
  }));
};

export const useChatListPresenter = () => {
  const { user } = useAuth();
  const navigation = useNavigation<ChatListScreenNavigationProp>();
  const { profile } = useUserProfile();

  const [refreshing, setRefreshing] = useState(false);
  const [showAllRooms, setShowAllRooms] = useState(false);

  const isAdmin = profile?.isAdmin ?? false;
  const { states: chatRoomStates } = useChatRoomStates();
  const { notifications } = useChatRoomNotifications();

  const { chatRooms: allRoomsRaw, loading: loadingAll } = useChatRooms('all');
  const { chatRooms: universityRooms, loading: loadingUniversity } = useChatRooms('university');
  const { chatRooms: departmentRooms, loading: loadingDepartment } = useChatRooms('department');
  const { chatRooms: gameRooms, loading: loadingGame } = useChatRooms('game');
  const { chatRooms: customRooms, loading: loadingCustom } = useChatRooms('custom');

  const loading =
    isAdmin && showAllRooms
      ? loadingAll
      : loadingUniversity || loadingDepartment || loadingGame || loadingCustom;

  const allRooms = useMemo(() => {
    if (!isAdmin || !showAllRooms) {
      return [];
    }

    return [...allRoomsRaw].sort((leftRoom, rightRoom) => {
      const typeOrder = { university: 0, department: 1, game: 2, custom: 3 };
      const leftOrder = typeOrder[leftRoom.type] ?? 3;
      const rightOrder = typeOrder[rightRoom.type] ?? 3;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      const leftTime = leftRoom.updatedAt?.toDate?.()?.getTime() || 0;
      const rightTime = rightRoom.updatedAt?.toDate?.()?.getTime() || 0;
      return rightTime - leftTime;
    });
  }, [allRoomsRaw, isAdmin, showAllRooms]);

  const fixedRooms = useMemo<ChatRoomListItem[]>(() => {
    if (isAdmin && showAllRooms) {
      return [];
    }

    const rooms: ChatRoomListItem[] = [];

    if (universityRooms[0]) {
      rooms.push({
        ...universityRooms[0],
        displayName: getChatRoomDisplayName(universityRooms[0], user?.department),
      });
    }

    if (departmentRooms[0]) {
      rooms.push({
        ...departmentRooms[0],
        displayName: getChatRoomDisplayName(departmentRooms[0], user?.department),
      });
    }

    return withNotificationSetting(rooms, notifications);
  }, [departmentRooms, isAdmin, notifications, showAllRooms, universityRooms, user?.department]);

  const gameRoomItems = useMemo(() => {
    if (isAdmin && showAllRooms) {
      return [];
    }

    const sortedRooms = [...gameRooms].sort((leftRoom, rightRoom) => {
      const leftTime = leftRoom.updatedAt?.toDate?.()?.getTime() || 0;
      const rightTime = rightRoom.updatedAt?.toDate?.()?.getTime() || 0;
      return rightTime - leftTime;
    });

    return withNotificationSetting(sortedRooms, notifications);
  }, [gameRooms, isAdmin, notifications, showAllRooms]);

  const customRoomItems = useMemo(() => {
    if (isAdmin && showAllRooms) {
      return [];
    }

    const sortedRooms = [...customRooms].sort((leftRoom, rightRoom) => {
      const leftTime = leftRoom.updatedAt?.toDate?.()?.getTime() || 0;
      const rightTime = rightRoom.updatedAt?.toDate?.()?.getTime() || 0;
      return rightTime - leftTime;
    });

    return withNotificationSetting(sortedRooms, notifications);
  }, [customRooms, isAdmin, notifications, showAllRooms]);

  const adminRooms = useMemo(() => {
    if (!isAdmin || !showAllRooms) {
      return [];
    }

    return withNotificationSetting(allRooms, notifications);
  }, [allRooms, isAdmin, notifications, showAllRooms]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleChatRoomPress = useCallback(
    (chatRoom: ChatRoom) => {
      if (!chatRoom.id) {
        return;
      }

      navigation.navigate('ChatDetail', { chatRoomId: chatRoom.id });
    },
    [navigation],
  );

  const toggleAdminMode = useCallback(() => {
    setShowAllRooms(previousValue => !previousValue);
  }, []);

  return {
    isAdmin,
    showAllRooms,
    loading,
    refreshing,
    fixedRooms,
    gameRooms: gameRoomItems,
    customRooms: customRoomItems,
    adminRooms,
    chatRoomStates,
    handleRefresh,
    handleChatRoomPress,
    toggleAdminMode,
  };
};
