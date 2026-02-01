// SKTaxi: 채팅방 카드 컴포넌트
// SRP: 개별 채팅방 아이템  UI 렌더링

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import { ChatRoom } from '../../../types/firestore';
import { Dot } from '../../../components/common/Dot';
import { formatTimeAgo, getChatRoomColor, getChatRoomIcon, safeToMillis } from '../utils/chatListUtils';
import { ChatRoomState } from '../../../repositories/interfaces/IChatRepository';

interface ChatRoomCardProps {
    item: ChatRoom & { displayName?: string; notificationEnabled?: boolean };
    roomState?: ChatRoomState;
    onPress: (item: ChatRoom) => void;
    useDisplayName?: boolean;
}

export function ChatRoomCard({ item, roomState, onPress, useDisplayName }: ChatRoomCardProps) {
    const lastReadAt = roomState?.lastReadAt;
    const lastMessageAt = item.lastMessage?.timestamp;

    const lastReadMillis = safeToMillis(lastReadAt);
    const lastMessageMillis = safeToMillis(lastMessageAt);
    const hasUnread = lastMessageMillis ? (lastReadMillis ? lastMessageMillis > lastReadMillis : true) : false;

    const lastMessageTime = lastMessageAt ? formatTimeAgo(lastMessageAt) : '';
    const displayName = useDisplayName && item.displayName ? item.displayName : item.name;
    const iconColor = getChatRoomColor(item.type);

    return (
        <TouchableOpacity
            style={styles.chatRoomCard}
            onPress={() => onPress(item)}
            activeOpacity={0.7}
        >
            <View style={[styles.chatRoomIconContainer, { backgroundColor: `${iconColor}20` }]}>
                <Icon
                    name={getChatRoomIcon(item.type)}
                    size={24}
                    color={iconColor}
                />
            </View>

            <View style={styles.chatRoomContent}>
                <View style={styles.chatRoomHeader}>
                    <View style={styles.chatRoomNameContainer}>
                        <Text style={styles.chatRoomName} numberOfLines={1}>
                            {displayName}
                        </Text>
                        {item.notificationEnabled === false && (
                            <Icon
                                name="notifications-off"
                                size={16}
                                color={COLORS.text.secondary}
                                style={styles.notificationOffIcon}
                            />
                        )}
                    </View>
                    {lastMessageTime ? (
                        <Text style={styles.chatRoomTime}>{lastMessageTime}</Text>
                    ) : null}
                </View>

                {item.lastMessage ? (
                    <Text style={styles.chatRoomLastMessage} numberOfLines={1}>
                        {item.lastMessage.text}
                    </Text>
                ) : (
                    <Text style={styles.chatRoomLastMessage} numberOfLines={1}>
                        {item.description || '아직 메시지가 없어요'}
                    </Text>
                )}

                <View style={styles.chatRoomFooter}>
                    <View style={styles.chatRoomMembers}>
                        <Icon name="people-outline" size={14} color={COLORS.text.secondary} />
                        <Text style={styles.chatRoomMembersText}>
                            {item.members.length}명
                        </Text>
                    </View>
                </View>
            </View>

            {/* 새 메시지 여부 도트 (우측 아래) */}
            <View style={styles.badgeContainer}>
                <Dot visible={hasUnread} size="large" />
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    chatRoomCard: {
        flexDirection: 'row',
        backgroundColor: COLORS.background.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border.default,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
        position: 'relative',
    },
    badgeContainer: {
        position: 'absolute',
        left: 8,
        top: 8,
    },
    chatRoomIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.accent.blue + '20',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    chatRoomContent: {
        flex: 1,
        justifyContent: 'space-between',
    },
    chatRoomHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    chatRoomNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    chatRoomName: {
        ...TYPOGRAPHY.body1,
        fontWeight: '700',
        color: COLORS.text.primary,
        flex: 1,
    },
    notificationOffIcon: {
        marginLeft: 6,
    },
    chatRoomTime: {
        ...TYPOGRAPHY.caption1,
        color: COLORS.text.secondary,
        marginLeft: 8,
    },
    chatRoomLastMessage: {
        ...TYPOGRAPHY.body2,
        color: COLORS.text.secondary,
        marginBottom: 8,
    },
    chatRoomFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    chatRoomMembers: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    chatRoomMembersText: {
        ...TYPOGRAPHY.caption1,
        color: COLORS.text.secondary,
    },
});
