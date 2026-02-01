// SKTaxi: 채팅 목록 빈 상태 컴포넌트
// SRP: 데이터가 없을 때의 UI 렌더링

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';

interface EmptyChatListProps {
    type: 'no-participation' | 'no-rooms';
}

export function EmptyChatList({ type }: EmptyChatListProps) {
    if (type === 'no-participation') {
        return (
            <View style={styles.emptyContainer}>
                <Icon name="chatbubbles-outline" size={64} color={COLORS.text.disabled} />
                <Text style={styles.emptyTitle}>참여 중인 채팅방이 없어요</Text>
                <Text style={styles.emptyMessage}>
                    새로운 채팅방을 만들거나 초대를 받아보세요
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.emptyContainer}>
            <Icon name="chatbubbles-outline" size={64} color={COLORS.text.disabled} />
            <Text style={styles.emptyTitle}>채팅방이 없어요</Text>
            <Text style={styles.emptyMessage}>
                새로운 채팅방이 있으면 여기에 표시됩니다
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 60,
    },
    emptyTitle: {
        ...TYPOGRAPHY.title2,
        color: COLORS.text.primary,
        fontWeight: '700',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyMessage: {
        ...TYPOGRAPHY.body1,
        color: COLORS.text.secondary,
        textAlign: 'center',
        lineHeight: 22,
    },
});
