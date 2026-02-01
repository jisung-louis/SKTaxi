// SKTaxi: 채팅 목록 헤더 컴포넌트
// SRP: 리스트 헤더 렌더링 (고정 채팅방, 섹션 구분 등)

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ChatRoom } from '../../../types/firestore';
import { ChatRoomCard } from './ChatRoomCard';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import { ChatRoomState, ChatRoomStatesMap } from '../../../repositories/interfaces/IChatRepository';

interface ChatListHeaderProps {
    isAdmin: boolean;
    showAllRooms: boolean;
    fixedRooms: (ChatRoom & { displayName?: string; notificationEnabled?: boolean })[];
    gameRooms: (ChatRoom & { notificationEnabled?: boolean })[];
    customRooms: (ChatRoom & { notificationEnabled?: boolean })[];
    chatRoomStates: ChatRoomStatesMap;
    onRoomPress: (room: ChatRoom) => void;
}

export function ChatListHeader({
    isAdmin,
    showAllRooms,
    fixedRooms,
    gameRooms,
    customRooms,
    chatRoomStates,
    onRoomPress,
}: ChatListHeaderProps) {
    // 관리자 모드가 켜져있으면 헤더 없음 (전체 리스트가 렌더링되므로)
    if (isAdmin && showAllRooms) {
        return null;
    }

    return (
        <View>
            {/* 고정 채팅방 (전체 채팅방, 학과 채팅방) */}
            {fixedRooms.map((room) => (
                <View key={room.id}>
                    <ChatRoomCard
                        item={room}
                        roomState={room.id ? chatRoomStates[room.id] : undefined}
                        onPress={onRoomPress}
                        useDisplayName={true}
                    />
                </View>
            ))}

            {/* 게임 채팅방 */}
            {gameRooms.length > 0 && (
                <View>
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>게임 채팅방</Text>
                        <View style={styles.dividerLine} />
                    </View>
                    {gameRooms.map((room) => (
                        <View key={room.id}>
                            <ChatRoomCard
                                item={room}
                                roomState={room.id ? chatRoomStates[room.id] : undefined}
                                onPress={onRoomPress}
                            />
                        </View>
                    ))}
                </View>
            )}

            {/* 구분선 */}
            {customRooms.length > 0 && (
                <View style={styles.divider}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.dividerText}>내 채팅방</Text>
                    <View style={styles.dividerLine} />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
        marginHorizontal: 16,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: COLORS.border.default,
    },
    dividerText: {
        ...TYPOGRAPHY.caption1,
        color: COLORS.text.secondary,
        marginHorizontal: 12,
        fontWeight: '600',
    },
});
