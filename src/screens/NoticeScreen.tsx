// SKTaxi: Notice Screen - SRP 리팩토링 완료
// 
// 리팩토링 내용:
// 1. UI 컴포넌트 분리 (NoticeList, NoticeCategoryBar, NoticeSettingsPanel, UnreadNoticeBanner)
// 2. 비즈니스 로직은 hooks/notice/useNotices 로 위임
// 3. UI 상태 관리와 레이아웃에 집중

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typhograpy';
import { useScreenView } from '../hooks/useScreenView';
import { useNotices, Notice } from '../hooks/notice';
import { useNoticeSettings } from '../hooks/notice';

import {
  NoticeCategoryBar,
  NoticeSettingsPanel,
  UnreadNoticeBanner,
  NoticeList
} from './NoticeTab/components';

export const NoticeScreen = () => {
  useScreenView();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const isFocused = useIsFocused();

  // 상태 관리
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [refreshing, setRefreshing] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);

  // Hook 데이터
  const {
    notices, loading, loadingMore, error, hasMore, unreadCount,
    markAsRead, markAllAsRead, loadMore, refreshReadStatus,
    readStatus, userJoinedAtLoaded, userJoinedAt
  } = useNotices(selectedCategory);

  const { settings: noticeSettings, updateMaster, updateDetail } = useNoticeSettings();

  // 애니메이션 값
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const bannerOpacity = useSharedValue(1);

  // 화면 포커스 애니메이션
  useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    translateY.value = withTiming(isFocused ? 0 : 10, { duration: 200 });
  }, [isFocused]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // 배너 애니메이션
  const bannerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bannerOpacity.value,
  }));

  useEffect(() => {
    bannerOpacity.value = 0;
    bannerOpacity.value = withTiming(1, { duration: 400 });
  }, [selectedCategory]);

  // 포커스 시 읽음 상태 갱신
  useEffect(() => {
    if (isFocused && notices.length > 0) {
      refreshReadStatus();
    }
  }, [isFocused, notices.length]);

  // 이벤트 핸들러
  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleNoticePress = (notice: Notice) => {
    markAsRead(notice.id);
    navigation.navigate('NoticeDetail', { noticeId: notice.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[{ flex: 1 }, screenAnimatedStyle]}>
        {/* Header */}
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
            <TouchableOpacity style={styles.menuButtonContainer} onPress={() => setPanelVisible(true)}>
              <Icon name="notifications-circle-outline" size={28} color={COLORS.text.primary} />
              <Text style={styles.menuButtonText}>세부 알림 설정</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Unread Banner */}
        <UnreadNoticeBanner
          unreadCount={unreadCount}
          selectedCategory={selectedCategory}
        />

        {/* Category Bar */}
        <NoticeCategoryBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Notice List */}
        <NoticeList
          notices={notices}
          loading={loading}
          error={error}
          hasMore={hasMore}
          loadingMore={loadingMore}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onLoadMore={loadMore}
          onNoticePress={handleNoticePress}
          readStatus={readStatus}
          userJoinedAt={userJoinedAt}
          userJoinedAtLoaded={userJoinedAtLoaded}
          selectedCategory={selectedCategory}
        />
      </Animated.View>

      {/* Settings Panel */}
      <NoticeSettingsPanel
        visible={panelVisible}
        onClose={() => setPanelVisible(false)}
        noticeSettings={noticeSettings}
        onUpdateMaster={updateMaster}
        onUpdateDetail={updateDetail}
      />
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
    alignItems: 'center',
    gap: 2,
  },
  menuButtonText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
});