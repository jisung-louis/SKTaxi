// SKTaxi: 공지사항 리스트 컴포넌트 - SRP 분리
// NoticeScreen에서 리스트 렌더링 로직 분리

import React, { useEffect } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import { Notice } from '../../../hooks/notice';
import { NoticeItem } from './NoticeItem';
import { ReadStatusMap } from '../../../repositories/interfaces/INoticeRepository';
import { isNoticeRead } from '../utils/noticeReadStatus';

interface NoticeListProps {
    notices: Notice[];
    loading: boolean;
    error: string | null;
    hasMore: boolean;
    loadingMore: boolean;
    refreshing: boolean;
    onRefresh: () => void;
    onLoadMore: () => void;
    onNoticePress: (notice: Notice) => void;
    readStatus: ReadStatusMap;
    userJoinedAt: unknown;
    userJoinedAtLoaded: boolean;
    selectedCategory: string; // 애니메이션 키용
}

export function NoticeList({
    notices,
    loading,
    error,
    hasMore,
    loadingMore,
    refreshing,
    onRefresh,
    onLoadMore,
    onNoticePress,
    readStatus,
    userJoinedAt,
    userJoinedAtLoaded,
    selectedCategory,
}: NoticeListProps) {
    const listOpacity = useSharedValue(1);
    const listTranslateY = useSharedValue(0);

    // 카테고리 변경 시 애니메이션
    useEffect(() => {
        listOpacity.value = 0;
        listTranslateY.value = 6;
        listOpacity.value = withTiming(1, { duration: 400 });
        listTranslateY.value = withTiming(0, { duration: 400 });
    }, [selectedCategory]);

    const listAnimatedStyle = useAnimatedStyle(() => ({
        opacity: listOpacity.value,
        transform: [{ translateY: listTranslateY.value }],
    }));

    if (loading || !userJoinedAtLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>공지사항을 불러오는 중...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.errorContainer}>
                <Icon name="alert-circle" size={48} color={COLORS.accent.red} />
                <Text style={styles.errorText}>공지사항을 불러올 수 없습니다</Text>
                <Text style={styles.errorSubtext}>{error}</Text>
            </View>
        );
    }

    if (notices.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Icon name="newspaper-outline" size={64} color={COLORS.text.disabled} />
                <Text style={styles.emptyTitle}>공지사항이 없어요</Text>
                <Text style={styles.emptyMessage}>
                    새로운 공지사항이 있으면 여기에 표시됩니다
                </Text>
            </View>
        );
    }

    return (
        <Animated.View style={[{ flex: 1 }, listAnimatedStyle]}>
            <FlatList
                key={`notice-list-${selectedCategory}`}
                data={notices}
                renderItem={({ item }) => (
                    <NoticeItem
                        notice={item}
                        isRead={isNoticeRead(item, readStatus, userJoinedAt)}
                        onPress={onNoticePress}
                    />
                )}
                keyExtractor={(item, index) => `${selectedCategory}-${item.id}-${index}`}
                style={styles.flatList}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={COLORS.accent.green}
                    />
                }
                onEndReached={() => {
                    if (hasMore && !loadingMore) {
                        onLoadMore();
                    }
                }}
                onEndReachedThreshold={0.1}
                removeClippedSubviews={true}
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                ListFooterComponent={() => (
                    <View>
                        {loadingMore && (
                            <View style={styles.loadingMoreContainer}>
                                <Text style={styles.loadingMoreText}>더 많은 공지사항을 불러오는 중...</Text>
                            </View>
                        )}

                        {!hasMore && notices.length > 0 && (
                            <View style={styles.noMoreContainer}>
                                <Text style={styles.noMoreText}>모든 공지사항을 불러왔습니다</Text>
                            </View>
                        )}
                    </View>
                )}
            />
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    flatList: {
        flex: 1,
        paddingHorizontal: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 40,
    },
    loadingText: {
        ...TYPOGRAPHY.body1,
        color: COLORS.text.secondary,
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 40,
    },
    errorText: {
        ...TYPOGRAPHY.title3,
        color: COLORS.text.primary,
        fontWeight: '600',
        marginTop: 16,
        marginBottom: 8,
    },
    errorSubtext: {
        ...TYPOGRAPHY.body2,
        color: COLORS.text.secondary,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 40,
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
    loadingMoreContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    loadingMoreText: {
        ...TYPOGRAPHY.body2,
        color: COLORS.text.secondary,
    },
    noMoreContainer: {
        paddingVertical: 20,
        alignItems: 'center',
    },
    noMoreText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.text.disabled,
    },
});
