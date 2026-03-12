import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { COLORS } from '@/shared/constants/colors';
import { TYPOGRAPHY } from '@/shared/constants/typography';
import { useScreenView } from '@/shared/hooks/useScreenView';

import {
  NoticeCategoryBar,
  NoticeList,
  NoticeSettingsPanel,
  UnreadNoticeBanner,
} from '../components';
import { NoticeStackParamList } from '../model/navigation';
import type { Notice } from '../model/types';
import { useNoticeSettings } from '../hooks/useNoticeSettings';
import { useNotices } from '../hooks/useNotices';

export const NoticeScreen = () => {
  useScreenView();

  const navigation = useNavigation<NativeStackNavigationProp<NoticeStackParamList>>();
  const isFocused = useIsFocused();

  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [refreshing, setRefreshing] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);

  const {
    notices,
    loading,
    loadingMore,
    error,
    hasMore,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loadMore,
    refreshReadStatus,
    readStatus,
    userJoinedAtLoaded,
    userJoinedAt,
  } = useNotices(selectedCategory);
  const { settings: noticeSettings, updateMaster, updateDetail } = useNoticeSettings();

  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    translateY.value = withTiming(isFocused ? 0 : 10, { duration: 200 });
  }, [isFocused, opacity, translateY]);

  useEffect(() => {
    if (isFocused && notices.length > 0) {
      refreshReadStatus();
    }
  }, [isFocused, notices.length, refreshReadStatus]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleRefresh = () => {
    setRefreshing(true);
    refreshReadStatus().finally(() => {
      setRefreshing(false);
    });
  };

  const handleNoticePress = (notice: Notice) => {
    markAsRead(notice.id);
    navigation.navigate('NoticeDetail', { noticeId: notice.id });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[{ flex: 1 }, screenAnimatedStyle]}>
        <View style={styles.header}>
          <Text style={styles.title}>학교 공지사항</Text>
          <View style={styles.headerRight}>
            {unreadCount > 0 && (
              <TouchableOpacity
                style={styles.markAllButton}
                onPress={() => markAllAsRead()}
              >
                <Text style={styles.markAllText}>모두 읽음</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.menuButtonContainer}
              onPress={() => setPanelVisible(true)}
            >
              <Icon
                name="notifications-circle-outline"
                size={28}
                color={COLORS.text.primary}
              />
              <Text style={styles.menuButtonText}>세부 알림 설정</Text>
            </TouchableOpacity>
          </View>
        </View>

        <UnreadNoticeBanner
          unreadCount={unreadCount}
          selectedCategory={selectedCategory}
        />

        <NoticeCategoryBar
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

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
