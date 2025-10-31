import React from 'react';
import { Text, StyleSheet, FlatList, TouchableOpacity, View, Linking, RefreshControl, ScrollView, TextInput, Alert } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import Modal from 'react-native-modal';
import { useNoticeSettings } from '../hooks/useNoticeSettings';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typhograpy';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNotices, Notice } from '../hooks/useNotices';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Button from '../components/common/Button';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { BOTTOM_TAB_BAR_HEIGHT } from '../constants/constants';

export const NoticeScreen = () => {
  const isFocused = useIsFocused();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const { notices, loading, loadingMore, error, hasMore, unreadCount, markAsRead, markAllAsRead, loadMore, refreshReadStatus, readStatus, readStatusLoading, userJoinedAtLoaded, userJoinedAt } = useNotices(selectedCategory);
  const [refreshing, setRefreshing] = useState(false);
  // SKTaxi: 키워드 알림(더미 UI 상태)
  const [keywordEnabled, setKeywordEnabled] = useState<boolean>(false);
  const [keywordInput, setKeywordInput] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>(['장학', '등록']);
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { settings: noticeSettings, updateMaster, updateDetail } = useNoticeSettings();
  const [panelVisible, setPanelVisible] = useState(false);

  const insets = useSafeAreaInsets();

  const openPanel = () => setPanelVisible(true);
  const closePanel = () => setPanelVisible(false);
  useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    translateY.value = withTiming(isFocused ? 0 : 10, { duration: 200 });
  }, [isFocused]);

  // SKTaxi: 화면이 포커싱될 때 읽음 상태 새로고침
  useEffect(() => {
    if (isFocused && notices.length > 0) {
      refreshReadStatus();
    }
  }, [isFocused, notices.length]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // 카테고리 전환 애니메이션 (리스트/배너)
  const listOpacity = useSharedValue(1);
  const listTranslateY = useSharedValue(0);
  const bannerOpacity = useSharedValue(1);

  useEffect(() => {
    // 전환 시 살짝 사라졌다가 나타나는 애니메이션
    listOpacity.value = 0;
    listTranslateY.value = 6;
    listOpacity.value = withTiming(1, { duration: 400 });
    listTranslateY.value = withTiming(0, { duration: 400 });

    bannerOpacity.value = 0;
    bannerOpacity.value = withTiming(1, { duration: 400 });
  }, [selectedCategory]);

  const listAnimatedStyle = useAnimatedStyle(() => ({
    opacity: listOpacity.value,
    transform: [{ translateY: listTranslateY.value }],
  }));

  const bannerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bannerOpacity.value,
  }));

  const CATEGORIES = [
    '전체',
    '새소식',
    '학사',
    '학생',
    '장학/등록/학자금',
    '입학',
    '취업/진로개발/창업',
    '공모/행사',
    '교육/글로벌',
    '일반',
    '입찰구매정보',
    '사회봉사센터',
    '장애학생지원센터',
    '생활관',
    '비교과',
  ];

  // 카테고리 리스트
  const categories = useMemo(() => CATEGORIES, []);

  const filteredNotices = useMemo(() => {
    if (selectedCategory === '전체') return notices;
    return notices.filter(n => n.category === selectedCategory);
  }, [notices, selectedCategory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // SKTaxi: Firestore 실시간 구독으로 새로운 공지가 추가되면 자동 업뎃됨
    // 추후 좋아요/댓글 기능 추가 시 해당 기능도 자동 업데이트될 예정
    setTimeout(() => {
      setRefreshing(false);
    }, 1000); // 사용자에게 새로고침 피드백 제공
  };

  const handleNoticePress =  (notice: Notice) => {
    markAsRead(notice.id);
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
          {/* {!isRead && <View style={styles.unreadDot} />} */}
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
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[ { flex: 1 }, screenAnimatedStyle]}>
        <View style={styles.header}>
          <Text style={styles.title}>학교 공지사항</Text>
          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <Animated.View style={bannerAnimatedStyle}>
                <TouchableOpacity style={styles.markAllButton} onPress={markAllAsRead}>
                  <Text style={styles.markAllText}>모두 읽음</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
            <TouchableOpacity style={styles.menuButtonContainer} onPress={openPanel}>
              <Icon name="notifications-circle-outline" size={32} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
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
            selectedCategory === '전체' ? `읽지 않은 공지사항 ${unreadCount}개` :
            `읽지 않은 ${selectedCategory} 공지 ${unreadCount}개` : 
            selectedCategory === '전체' ? '모든 공지를 읽었습니다' :
            `${selectedCategory} 공지를 모두 읽었습니다`}
          </Text>
        </Animated.View>

        {/* 카테고리 칩 바 */}
         <View style={{
          //backgroundColor: 'red'
          }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryBar}
          >
            {categories.map((cat) => {
              const active = cat === selectedCategory;
              return (
                <TouchableOpacity
                  key={cat}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

         <Animated.View style={[{ flex: 1 }, listAnimatedStyle]}> 
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
               data={filteredNotices}
               renderItem={({ item }) => renderNoticeItem(item)}
               keyExtractor={(item, index) => `${selectedCategory}-${item.id}-${index}`}
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
      </Animated.View>
      <Modal
        isVisible={panelVisible}
        onBackdropPress={closePanel}
        backdropOpacity={0.5}
        animationIn="slideInRight"
        animationOut="slideOutRight"
        animationInTiming={280}
        animationOutTiming={280}
        backdropTransitionInTiming={280}
        backdropTransitionOutTiming={280}
        useNativeDriver
        useNativeDriverForBackdrop
        hideModalContentWhileAnimating
        statusBarTranslucent
        style={{ margin: 0, justifyContent: 'flex-start', alignItems: 'flex-end' }}
      >
        <View style={[styles.rightPanel, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>공지 알림 설정</Text>
            <TouchableOpacity onPress={closePanel}>
              <Icon name="close" size={24} color={COLORS.text.primary} />
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.panelContent}>
              <View style={[styles.panelSection, { borderBottomWidth: 1, borderBottomColor: COLORS.border.dark, marginBottom: 12 }]}> 
                <Text style={styles.panelSectionTitle}>전체</Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemLabel}>전체 공지 알림</Text>
                  <TouchableOpacity
                    onPress={() => updateMaster(!noticeSettings.noticeNotifications)}
                    style={[styles.toggle, noticeSettings.noticeNotifications && styles.toggleOn]}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.knob, noticeSettings.noticeNotifications && styles.knobOn]} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.panelSection}>
                <Text style={styles.panelSectionTitle}>카테고리별</Text>
                {CATEGORIES.filter(c => c !== '전체').map((cat) => {
                  const key = (cat === '새소식' ? 'news'
                    : cat === '학사' ? 'academy'
                    : cat === '학생' ? 'student'
                    : cat === '장학/등록/학자금' ? 'scholarship'
                    : cat === '입학' ? 'admission'
                    : cat === '취업/진로개발/창업' ? 'career'
                    : cat === '공모/행사' ? 'event'
                    : cat === '교육/글로벌' ? 'education'
                    : cat === '일반' ? 'general'
                    : cat === '입찰구매정보' ? 'procurement'
                    : cat === '사회봉사센터' ? 'volunteer'
                    : cat === '장애학생지원센터' ? 'accessibility'
                    : cat === '생활관' ? 'dormitory'
                    : cat === '비교과' ? 'extracurricular'
                    : 'general');
                  const enabled = noticeSettings.noticeNotificationsDetail?.[key] !== false; // 기본 허용
                  const disabled = !noticeSettings.noticeNotifications;
                  return (
                    <View key={key} style={styles.rowBetween}>
                      <Text style={[styles.itemLabel, disabled && styles.itemDisabled]}>{cat}</Text>
                      <TouchableOpacity
                        onPress={() => !disabled && updateDetail(key, !enabled)}
                        style={[styles.toggle, enabled && styles.toggleOn, disabled && styles.toggleDisabled]}
                        activeOpacity={0.8}
                        disabled={disabled}
                      >
                        <View style={[styles.knob, enabled && styles.knobOn]} />
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>

              {/* 키워드 알림 (UI 더미) */}
              <View style={[styles.panelSection, { borderTopWidth: 1, borderTopColor: COLORS.border.dark, paddingTop: 12 }]}> 
                <Text style={styles.panelSectionTitle}>키워드 알림</Text>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemLabel}>키워드 알림 사용</Text>
                  <TouchableOpacity
                    onPress={() => 
                      //setKeywordEnabled(!keywordEnabled)
                      { Alert.alert('아직 만들고있어...', '키워드 알림은 아직 구현을 못했어요.\n조금만 기둘..'); }
                    }
                    style={[styles.toggle, keywordEnabled && styles.toggleOn]}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.knob, keywordEnabled && styles.knobOn]} />
                  </TouchableOpacity>
                </View>

                {/* <View style={{ gap: 8 }}>
                  <Text style={[styles.itemLabel, { marginBottom: 4 }]}>키워드 추가</Text>
                  <View style={styles.keywordRow}>
                    <TextInput
                      value={keywordInput}
                      onChangeText={setKeywordInput}
                      placeholder="예: 장학, 등록, 공모"
                      placeholderTextColor={COLORS.text.disabled}
                      style={styles.keywordInput}
                      editable={keywordEnabled}
                      onSubmitEditing={() => {
                        const v = (keywordInput || '').trim();
                        if (!v) return;
                        if (keywords.includes(v)) { setKeywordInput(''); return; }
                        setKeywords(prev => [...prev, v]);
                        setKeywordInput('');
                      }}
                      returnKeyType="done"
                    />
                    <TouchableOpacity
                      style={[styles.keywordAddBtn, !keywordInput.trim() && { opacity: 0.5 }]}
                      onPress={() => {
                        const v = (keywordInput || '').trim();
                        if (!v) return;
                        if (keywords.includes(v)) { setKeywordInput(''); return; }
                        setKeywords(prev => [...prev, v]);
                        setKeywordInput('');
                      }}
                      disabled={!keywordInput.trim()}
                      activeOpacity={0.85}
                    >
                      <Icon name="add" size={18} color={COLORS.text.buttonText} />
                    </TouchableOpacity>
                  </View>

                  {!!keywords.length && (
                    <View style={styles.keywordChipsWrap}>
                      {keywords.map((kw) => (
                        <View key={kw} style={styles.keywordChip}>
                          <Text style={styles.keywordChipText}>{kw}</Text>
                          <TouchableOpacity style={styles.keywordChipDel} onPress={() => setKeywords(prev => prev.filter(k => k !== kw))}>
                            <Icon name="close" size={14} color={COLORS.text.secondary} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View> */}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
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
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  title: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
  menuButtonContainer: {
    paddingVertical: 8,
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
  unreadHeaderEmpty: {
    backgroundColor: COLORS.background.card,
    outlineWidth: 1,
    outlineColor: COLORS.border.default,
  },
  categoryBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  categoryChip: {
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryChipActive: {
    backgroundColor: COLORS.accent.green + '20',
    borderColor: COLORS.accent.green,
  },
  categoryChipText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: '600',
    lineHeight: 18,
  },
  categoryChipTextActive: {
    color: COLORS.accent.green,
    fontWeight: '600',
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
  flatList: {
    flex: 1,
    paddingHorizontal: 20,
  },
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
  noticeCategory: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent.green,
    fontWeight: '600',
    backgroundColor: COLORS.accent.green + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  noticeStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00000066',
  },
  rightPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: WINDOW_WIDTH * 0.7,
    backgroundColor: COLORS.background.card,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border.default,
    paddingHorizontal: 16,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  panelTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  panelContent: {
    paddingVertical: 12,
  },
  panelSection: {
  },
  panelSectionTitle: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  itemLabel: {
    ...TYPOGRAPHY.body1,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  itemDisabled: {
    color: COLORS.text.disabled,
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: {
    backgroundColor: COLORS.accent.green + '33',
    borderColor: COLORS.accent.green,
  },
  toggleDisabled: {
    opacity: 0.5,
  },
  knob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.border.default,
    transform: [{ translateX: 0 }],
  },
  knobOn: {
    backgroundColor: COLORS.accent.green,
    transform: [{ translateX: 20 }],
  },
  keywordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  keywordInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.primary,
  },
  keywordAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.accent.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keywordChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  keywordChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  keywordChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.primary,
  },
  keywordChipDel: {
    padding: 2,
  },
});