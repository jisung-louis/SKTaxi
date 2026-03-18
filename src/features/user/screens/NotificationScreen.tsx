import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import {handleStoredNotificationNavigation} from '@/app/navigation/services/notificationNavigation';
import type {CampusStackParamList} from '@/app/navigation/types';
import {
  V2StackHeader,
  V2StateCard,
} from '@/shared/design-system/components';
import {V2_COLORS, V2_SPACING} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks/useScreenView';

import {
  AppNoticeFeedList,
  useAppNoticeFeedData,
} from '@/features/settings';

import {NotificationHubTabBar} from '../components/v2/NotificationHubTabBar';
import {NotificationInboxList} from '../components/v2/NotificationInboxList';
import {useNotificationCenterData} from '../hooks/useNotificationCenterData';
import type {NotificationInboxItemViewData} from '../model/notificationCenterViewData';

type NotificationScreenNavigationProp = NativeStackNavigationProp<
  CampusStackParamList,
  'Notification'
>;

export const NotificationScreen = () => {
  useScreenView();

  const navigation = useNavigation<NotificationScreenNavigationProp>();
  const [selectedTab, setSelectedTab] = React.useState<'inbox' | 'appNotice'>(
    'inbox',
  );
  const [refreshing, setRefreshing] = React.useState(false);
  const notificationCenter = useNotificationCenterData();
  const appNoticeFeed = useAppNoticeFeedData();

  const unreadCount = notificationCenter.data?.unreadCount ?? 0;

  const handleRefresh = React.useCallback(async () => {
    setRefreshing(true);

    try {
      await Promise.all([notificationCenter.reload(), appNoticeFeed.reload()]);
    } finally {
      setRefreshing(false);
    }
  }, [appNoticeFeed, notificationCenter]);

  const handlePressNotification = React.useCallback(
    async (item: NotificationInboxItemViewData) => {
      if (!item.isRead) {
        await notificationCenter.markAsRead(item.id);
      }

      navigation.popToTop();
      handleStoredNotificationNavigation({
        navigation,
        notification: item.notification,
      });
    },
    [navigation, notificationCenter],
  );

  const handlePressAppNotice = React.useCallback(
    (noticeId: string) => {
      navigation.navigate('AppNoticeDetail', {noticeId});
    },
    [navigation],
  );

  const headerRightAccessory =
    selectedTab === 'inbox' ? (
      <TouchableOpacity
        accessibilityLabel="모든 알림 읽음 처리"
        accessibilityRole="button"
        activeOpacity={0.82}
        disabled={unreadCount === 0}
        onPress={notificationCenter.markAllAsRead}>
        <Text
          style={[
            styles.headerActionLabel,
            unreadCount === 0 ? styles.headerActionDisabled : null,
          ]}>
          모두 읽음
        </Text>
      </TouchableOpacity>
    ) : null;

  const renderInboxContent = () => {
    if (notificationCenter.loading && !notificationCenter.data) {
      return (
        <V2StateCard
          description="도착한 알림을 확인하는 중입니다."
          icon={<ActivityIndicator color={V2_COLORS.brand.primary} />}
          title="알림함을 불러오는 중"
        />
      );
    }

    if (notificationCenter.error || !notificationCenter.data) {
      return (
        <V2StateCard
          actionLabel="다시 시도"
          description={
            notificationCenter.error ??
            '알림함을 준비하지 못했습니다. 잠시 후 다시 시도해주세요.'
          }
          icon={
            <Icon
              color={V2_COLORS.accent.orange}
              name="refresh-outline"
              size={26}
            />
          }
          onPressAction={notificationCenter.reload}
          title="알림함을 불러오지 못했습니다"
        />
      );
    }

    return (
      <NotificationInboxList
        data={notificationCenter.data}
        onPressItem={handlePressNotification}
      />
    );
  };

  const renderAppNoticeContent = () => {
    if (appNoticeFeed.loading && !appNoticeFeed.data) {
      return (
        <V2StateCard
          description="최근 앱 공지사항을 정리하고 있습니다."
          icon={<ActivityIndicator color={V2_COLORS.brand.primary} />}
          title="앱 공지사항을 불러오는 중"
        />
      );
    }

    if (appNoticeFeed.error || !appNoticeFeed.data) {
      return (
        <V2StateCard
          actionLabel="다시 시도"
          description={
            appNoticeFeed.error ??
            '앱 공지사항을 준비하지 못했습니다. 잠시 후 다시 시도해주세요.'
          }
          icon={
            <Icon
              color={V2_COLORS.accent.orange}
              name="refresh-outline"
              size={26}
            />
          }
          onPressAction={appNoticeFeed.reload}
          title="앱 공지사항을 불러오지 못했습니다"
        />
      );
    }

    return (
      <AppNoticeFeedList
        data={appNoticeFeed.data}
        onPressItem={handlePressAppNotice}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <V2StackHeader
        onPressBack={() => navigation.goBack()}
        rightAccessory={headerRightAccessory}
        title="알림"
      />

      <NotificationHubTabBar
        onSelectTab={setSelectedTab}
        selectedTab={selectedTab}
        unreadCount={unreadCount}
      />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            onRefresh={handleRefresh}
            refreshing={refreshing}
            tintColor={V2_COLORS.brand.primary}
          />
        }
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}>
        {selectedTab === 'inbox' ? renderInboxContent() : renderAppNoticeContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  headerActionLabel: {
    color: V2_COLORS.brand.primaryStrong,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  headerActionDisabled: {
    color: V2_COLORS.text.muted,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: V2_SPACING.lg,
  },
});
