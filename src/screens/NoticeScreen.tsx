import React from 'react';
import { Text, StyleSheet, FlatList, TouchableOpacity, View, Linking, RefreshControl } from 'react-native';
import Animated from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typhograpy';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useEffect, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNotices, Notice } from '../hooks/useNotices';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const NoticeScreen = () => {
  const isFocused = useIsFocused();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const { notices, loading, loadingMore, error, hasMore, unreadCount, markAsRead, markAllAsRead, loadMore, readStatus, readStatusLoading, userJoinedAtLoaded, userJoinedAt } = useNotices();
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    translateY.value = withTiming(isFocused ? 0 : 10, { duration: 200 });
  }, [isFocused]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleRefresh = async () => {
    setRefreshing(true);
    // SKTaxi: Firestore 실시간 구독으로 새로운 공지가 추가되면 자동 업뎃됨
    // 추후 좋아요/댓글 기능 추가 시 해당 기능도 자동 업데이트될 예정
    setTimeout(() => {
      setRefreshing(false);
    }, 1000); // 사용자에게 새로고침 피드백 제공
  };

  const handleNoticePress = async (notice: Notice) => {
    await markAsRead(notice.id);
    navigation.navigate('NoticeDetail', { noticeId: notice.id });
    // if (notice.link) {
    //   Linking.openURL(notice.link);
    // }
  };

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

  const renderNoticeItem = (notice: Notice) => {
    // SKTaxi: UI 레벨에서도 가입일 이전 공지는 즉시 읽음으로 간주하여 플래시 방지
    const joinedTs = userJoinedAt && (userJoinedAt as any).toMillis ? (userJoinedAt as any).toMillis() : 0;
    const postedTs = notice.postedAt && (notice.postedAt as any).toMillis ? (notice.postedAt as any).toMillis() : 0;
    const derivedReadByJoin = joinedTs && postedTs && postedTs <= joinedTs;
    const isRead = Boolean(readStatus[notice.id] || derivedReadByJoin);
    
    return (
      <TouchableOpacity
        key={notice.id}
        style={[
          styles.noticeItem,
          !isRead && styles.unreadNotice
        ]}
        onPress={() => handleNoticePress(notice)}
      >
        <View style={styles.noticeHeader}>
          <Text style={[
            styles.noticeTitle,
            !isRead && styles.unreadTitle
          ]} numberOfLines={2}>
            {notice.title}
          </Text>
          {!isRead && <View style={styles.unreadDot} />}
        </View>
        
        <Text style={styles.noticeContent} numberOfLines={2}>
          {notice.content}
        </Text>
        
        <View style={styles.noticeFooter}>
          <Text style={styles.noticeDate}>
            {formatDate(notice.postedAt.toDate().toISOString())}
          </Text>
          <Text style={styles.noticeCategory}>
            {notice.category}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[{ flex: 1 }, screenAnimatedStyle]}>
        <View style={styles.header}>
          <Text style={styles.title}>학교 공지사항</Text>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
              <Text style={styles.markAllText}>모두 읽음</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {unreadCount > 0 && (
          <View style={styles.unreadHeader}>
            <Icon name="notifications" size={16} color={COLORS.accent.green} />
            <Text style={styles.unreadText}>
              읽지 않은 공지사항 {unreadCount}개
            </Text>
          </View>
        )}

        {loading
         // || readStatusLoading 
         || !userJoinedAtLoaded 
         ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>공지사항을 불러오는 중...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color={COLORS.accent.red} />
            <Text style={styles.errorText}>공지사항을 불러올 수 없습니다</Text>
            <Text style={styles.errorSubtext}>{error}</Text>
          </View>
        ) : notices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="newspaper-outline" size={64} color={COLORS.text.disabled} />
            <Text style={styles.emptyTitle}>공지사항이 없어요</Text>
            <Text style={styles.emptyMessage}>
              새로운 공지사항이 있으면 여기에 표시됩니다
            </Text>
          </View>
        ) : (
          <FlatList
            data={notices}
            renderItem={({ item }) => renderNoticeItem(item)}
            keyExtractor={(item) => item.id}
            style={styles.flatList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.accent.green}
              />
            }
            onEndReached={() => {
              // SKTaxi: 하단에 도달하면 더 많은 데이터 로드
              if (hasMore && !loadingMore) {
                loadMore();
              }
            }}
            onEndReachedThreshold={0.1} // 하단에서 10% 지점에서 로드
            ListFooterComponent={() => (
              <View>
                {/* SKTaxi: 로딩 인디케이터 */}
                {loadingMore && (
                  <View style={styles.loadingMoreContainer}>
                    <Text style={styles.loadingMoreText}>더 많은 공지사항을 불러오는 중...</Text>
                  </View>
                )}
                
                {/* SKTaxi: 더 이상 로드할 데이터가 없을 때 */}
                {!hasMore && notices.length > 0 && (
                  <View style={styles.noMoreContainer}>
                    <Text style={styles.noMoreText}>모든 공지사항을 불러왔습니다</Text>
                  </View>
                )}
              </View>
            )}
            initialNumToRender={20} // 초기 렌더링 개수
            maxToRenderPerBatch={10} // 배치당 렌더링 개수
            windowSize={10} // 화면 밖 아이템 유지 개수
            removeClippedSubviews={true} // 화면 밖 아이템 제거
            // SKTaxi: getItemLayout 제거 (동적 높이 때문에)
            // getItemLayout={(data, index) => ({
            //   length: 100,
            //   offset: 100 * index,
            //   index,
            // })}
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  title: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  markAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.accent.green,
    borderRadius: 16,
  },
  markAllText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.buttonText,
    fontWeight: '600',
  },
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
  unreadText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.accent.green,
    fontWeight: '600',
    marginLeft: 8,
  },
  flatList: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  noticeItem: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    padding: 16,
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
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  noticeTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
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
    marginBottom: 12,
  },
  noticeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  noticeDate: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.disabled,
  },
  noticeCategory: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent.green,
    fontWeight: '600',
    backgroundColor: COLORS.accent.green + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
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
  // SKTaxi: 무한 스크롤 관련 스타일
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