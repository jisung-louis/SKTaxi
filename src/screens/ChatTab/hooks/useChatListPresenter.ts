// SKTaxi: 채팅 목록 프레젠터 훅 (SRP 분리)
// ChatListScreen의 비즈니스 로직 담당

import { useState, useMemo, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChatStackParamList } from '../../../navigations/types';
import { useAuth } from '../../../hooks/auth';
import { useUserProfile } from '../../../hooks/user';
import { useChatRooms, useChatRoomStates, useChatRoomNotifications } from '../../../hooks/chat';
import { ChatRoom } from '../../../types/firestore';

type ChatListScreenNavigationProp = NativeStackNavigationProp<ChatStackParamList, 'ChatList'>;

export function useChatListPresenter() {
    const { user } = useAuth();
    const navigation = useNavigation<ChatListScreenNavigationProp>();
    const [refreshing, setRefreshing] = useState(false);
    const [showAllRooms, setShowAllRooms] = useState(false);

    // Repository Hooks
    const { profile } = useUserProfile();
    const isAdmin = profile?.isAdmin ?? false;
    const { states: chatRoomStates } = useChatRoomStates();
    const { notifications: notificationSettings } = useChatRoomNotifications();

    // Data Fetching
    const { chatRooms: allRoomsRaw, loading: loadingAll } = useChatRooms('all');
    const { chatRooms: universityRooms, loading: loadingUniversity } = useChatRooms('university');
    const { chatRooms: departmentRooms, loading: loadingDepartment } = useChatRooms('department');
    const { chatRooms: gameRooms, loading: loadingGame } = useChatRooms('game');
    const { chatRooms: customRooms, loading: loadingCustom } = useChatRooms('custom');

    const loading = (isAdmin && showAllRooms)
        ? loadingAll
        : (loadingUniversity || loadingDepartment || loadingGame || loadingCustom);

    // 정렬 및 Filtering 로직
    const allRooms = useMemo(() => {
        if (!isAdmin || !showAllRooms) return [];

        return [...allRoomsRaw].sort((a, b) => {
            const typeOrder = { university: 0, department: 1, game: 2, custom: 3 };
            const aOrder = typeOrder[a.type] ?? 3;
            const bOrder = typeOrder[b.type] ?? 3;

            if (aOrder !== bOrder) return aOrder - bOrder;

            const aTime = a.updatedAt?.toDate?.()?.getTime() || 0;
            const bTime = b.updatedAt?.toDate?.()?.getTime() || 0;
            return bTime - aTime;
        });
    }, [isAdmin, showAllRooms, allRoomsRaw]);

    const fixedRooms = useMemo(() => {
        if (isAdmin && showAllRooms) return [];

        const rooms: (ChatRoom & { displayName?: string })[] = [];

        if (universityRooms.length > 0) {
            rooms.push({
                ...universityRooms[0],
                displayName: '성결대 전체 채팅방'
            });
        }

        if (departmentRooms.length > 0) {
            rooms.push({
                ...departmentRooms[0],
                displayName: user?.department ? `${user.department} 채팅방` : departmentRooms[0].name
            });
        }

        return rooms.map(room => ({
            ...room,
            notificationEnabled: room.id ? (notificationSettings[room.id] ?? true) : true,
        }));
    }, [isAdmin, showAllRooms, universityRooms, departmentRooms, user?.department, notificationSettings]);

    const gameRoomsWithSettings = useMemo(() => {
        if (isAdmin && showAllRooms) return [];

        const sorted = [...gameRooms].sort((a, b) => {
            const aTime = a.updatedAt?.toDate?.()?.getTime() || 0;
            const bTime = b.updatedAt?.toDate?.()?.getTime() || 0;
            return bTime - aTime;
        });

        return sorted.map(room => ({
            ...room,
            notificationEnabled: room.id ? (notificationSettings[room.id] ?? true) : true,
        }));
    }, [isAdmin, showAllRooms, gameRooms, notificationSettings]);

    const customRoomsWithSettings = useMemo(() => {
        if (isAdmin && showAllRooms) return [];

        const sorted = [...customRooms].sort((a, b) => {
            const aTime = a.updatedAt?.toDate?.()?.getTime() || 0;
            const bTime = b.updatedAt?.toDate?.()?.getTime() || 0;
            return bTime - aTime;
        });

        return sorted.map(room => ({
            ...room,
            notificationEnabled: room.id ? (notificationSettings[room.id] ?? true) : true,
        }));
    }, [isAdmin, showAllRooms, customRooms, notificationSettings]);

    const adminRoomsWithSettings = useMemo(() => {
        if (!isAdmin || !showAllRooms) return [];

        return allRooms.map(room => ({
            ...room,
            notificationEnabled: room.id ? (notificationSettings[room.id] ?? true) : true,
        }));
    }, [isAdmin, showAllRooms, allRooms, notificationSettings]);

    // Actions
    const handleRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    }, []);

    const handleChatRoomPress = useCallback((chatRoom: ChatRoom) => {
        if (!chatRoom.id) return;
        navigation.navigate('ChatDetail', { chatRoomId: chatRoom.id });
    }, [navigation]);

    const toggleAdminMode = useCallback(() => {
        setShowAllRooms(prev => !prev);
    }, []);

    return {
        isAdmin,
        showAllRooms,
        loading,
        refreshing,
        fixedRooms,
        gameRooms: gameRoomsWithSettings,
        customRooms: customRoomsWithSettings,
        adminRooms: adminRoomsWithSettings,
        chatRoomStates,
        handleRefresh,
        handleChatRoomPress,
        toggleAdminMode,
    };
}
