// SKTaxi: 공지사항 아이템 컴포넌트 - SRP 분리
// NoticeScreen에서 분리된 개별 공지사항 렌더링 컴포넌트

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import { Notice } from '../../../hooks/notice';

interface NoticeItemProps {
    notice: Notice;
    isRead: boolean;
    onPress: (notice: Notice) => void;
}

/**
 * 공지사항 개별 아이템 렌더링 컴포넌트
 * SRP: 공지사항 카드 UI 렌더링만 담당
 */
export function NoticeItem({ notice, isRead, onPress }: NoticeItemProps) {
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <TouchableOpacity
            style={[
                styles.noticeItem,
                !isRead && styles.unreadNotice
            ]}
            onPress={() => onPress(notice)}
        >
            <View style={styles.noticeCategoryInlineContainer}>
                <Text style={styles.noticeCategoryInline}>{notice.category}</Text>
                {!isRead && <View style={styles.unreadDot} />}
            </View>
            <View style={styles.noticeHeader}>
                <Text style={[
                    styles.noticeTitle,
                    !isRead && styles.unreadTitle
                ]} numberOfLines={2}>
                    {notice.title}
                </Text>
            </View>

            <Text style={styles.noticeContent} numberOfLines={2}>
                {notice.content}
            </Text>

            <View style={styles.noticeFooter}>
                <View style={styles.noticeFooterLeft}>
                    <Text style={styles.noticeDate}>
                        {formatDate(notice.postedAt.toDate().toISOString())}
                    </Text>
                </View>
                <View style={styles.noticeStats}>
                    <View style={styles.statItem}>
                        <Icon name="heart-outline" size={14} color={COLORS.text.secondary} />
                        <Text style={styles.statText}>{notice.likeCount || 0}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Icon name="chatbubble-outline" size={14} color={COLORS.text.secondary} />
                        <Text style={styles.statText}>{notice.commentCount || 0}</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Icon name="eye-outline" size={14} color={COLORS.text.secondary} />
                        <Text style={styles.statText}>{notice.viewCount || 0}</Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    noticeItem: {
        backgroundColor: COLORS.background.card,
        borderRadius: 16,
        padding: 16,
        paddingTop: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    unreadNotice: {
        backgroundColor: COLORS.background.primary,
        borderWidth: 1,
        borderColor: COLORS.accent.green + '30',
    },
    noticeCategoryInlineContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
        marginLeft: -4,
    },
    noticeHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    noticeCategoryInline: {
        ...TYPOGRAPHY.caption,
        color: COLORS.accent.green,
        fontWeight: '600',
        backgroundColor: COLORS.accent.green + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    noticeTitle: {
        ...TYPOGRAPHY.body1,
        color: COLORS.text.primary,
        fontWeight: '600',
        flex: 1,
    },
    unreadTitle: {
        fontWeight: '700',
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.accent.green,
        marginTop: 4,
    },
    noticeContent: {
        ...TYPOGRAPHY.body2,
        color: COLORS.text.secondary,
        lineHeight: 20,
        marginBottom: 16,
    },
    noticeFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    noticeFooterLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    noticeDate: {
        ...TYPOGRAPHY.caption,
        color: COLORS.text.disabled,
    },
    noticeStats: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    statItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    statText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.text.secondary,
        fontWeight: '500',
    },
});
