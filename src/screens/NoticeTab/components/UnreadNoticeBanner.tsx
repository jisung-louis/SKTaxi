// SKTaxi: 읽지 않은 공지사항 배너 컴포넌트
// NoticeScreen에서 분리됨

import React, { useEffect } from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';

interface UnreadNoticeBannerProps {
    unreadCount: number;
    selectedCategory: string;
}

export function UnreadNoticeBanner({ unreadCount, selectedCategory }: UnreadNoticeBannerProps) {
    const bannerOpacity = useSharedValue(1);

    // 카테고리 변경 시 애니메이션 효과
    useEffect(() => {
        bannerOpacity.value = 0;
        bannerOpacity.value = withTiming(1, { duration: 400 });
    }, [selectedCategory]);

    const bannerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: bannerOpacity.value,
    }));

    return (
        <Animated.View style={[
            bannerAnimatedStyle,
            styles.unreadHeader,
            unreadCount > 0 ? null : styles.unreadHeaderEmpty
        ]}>
            <Icon
                name={unreadCount > 0 ? 'notifications' : 'checkmark-circle-outline'}
                size={16}
                color={unreadCount > 0 ? COLORS.accent.green : COLORS.text.disabled}
            />
            <Text style={[
                styles.unreadText,
                unreadCount > 0 ? null : styles.unreadTextMuted
            ]}>
                {unreadCount > 0 ?
                    (selectedCategory === '전체' ? `읽지 않은 공지사항 ${unreadCount}개` :
                        `읽지 않은 ${selectedCategory} 공지 ${unreadCount}개`) :
                    (selectedCategory === '전체' ? '모든 공지를 읽었습니다' :
                        `${selectedCategory} 공지를 모두 읽었습니다`)}
            </Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    unreadHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.accent.green + '10',
        paddingHorizontal: 20,
        paddingVertical: 12,
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 12,
    },
    unreadHeaderEmpty: {
        backgroundColor: COLORS.background.card,
        borderWidth: 1,
        borderColor: COLORS.border.default,
    },
    unreadText: {
        ...TYPOGRAPHY.body2,
        color: COLORS.accent.green,
        fontWeight: '600',
        marginLeft: 8,
    },
    unreadTextMuted: {
        color: COLORS.text.secondary,
    },
});
