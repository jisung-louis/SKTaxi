import React from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated from 'react-native-reanimated';
import {useIsFocused, useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {V2PageHeader} from '@/shared/design-system/components';
import {useScreenEnterAnimation, useScreenView} from '@/shared/hooks';
import {BOTTOM_TAB_BAR_HEIGHT} from '@/shared/constants/layout';
import {V2_COLORS, V2_SPACING} from '@/shared/design-system/tokens';

import {NoticeSettingsPanel} from '../components/NoticeSettingsPanel';
import {NoticeCategoryBar} from '../components/NoticeCategoryBar';
import {NoticeHomeList} from '../components/NoticeHomeList';
import {NoticeUnreadBanner} from '../components/NoticeUnreadBanner';
import {useNoticeHomeData} from '../hooks/useNoticeHomeData';
import type {NoticeStackParamList} from '../model/navigation';

export const NoticeScreen = () => {
  useScreenView();

  const navigation =
    useNavigation<NativeStackNavigationProp<NoticeStackParamList>>();
  const isFocused = useIsFocused();
  const [panelVisible, setPanelVisible] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);
  const loadMoreRequestedRef = React.useRef(false);
  const screenAnimatedStyle = useScreenEnterAnimation();

  const {
    data,
    error,
    hasMore,
    loadMore,
    loading,
    loadingMore,
    markAsRead,
    noticeSettings,
    refreshReadStatus,
    selectCategory,
    updateDetail,
    updateMaster,
    userJoinedAtLoaded,
  } = useNoticeHomeData();

  React.useEffect(() => {
    if (isFocused) {
      refreshReadStatus().catch(() => undefined);
    }
  }, [isFocused, refreshReadStatus]);

  React.useEffect(() => {
    if (!loadingMore) {
      loadMoreRequestedRef.current = false;
    }
  }, [loadingMore, data.items.length]);

  const handleRefresh = React.useCallback(() => {
    setRefreshing(true);
    refreshReadStatus().finally(() => {
      setRefreshing(false);
    });
  }, [refreshReadStatus]);

  const handleOpenNotice = React.useCallback(
    (noticeId: string) => {
      markAsRead(noticeId).catch(() => undefined);
      navigation.navigate('NoticeDetail', {noticeId});
    },
    [markAsRead, navigation],
  );

  const handlePressUnreadBanner = React.useCallback(() => {
    if (!data.firstUnreadNoticeId) {
      return;
    }

    handleOpenNotice(data.firstUnreadNoticeId);
  }, [data.firstUnreadNoticeId, handleOpenNotice]);

  const handleListSectionScroll = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (
        loading ||
        loadingMore ||
        !hasMore ||
        error ||
        loadMoreRequestedRef.current
      ) {
        return;
      }

      const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
      const distanceFromBottom =
        contentSize.height - (contentOffset.y + layoutMeasurement.height);

      if (distanceFromBottom > 120) {
        return;
      }

      loadMoreRequestedRef.current = true;
      loadMore().catch(() => {
        loadMoreRequestedRef.current = false;
      });
    },
    [error, hasMore, loadMore, loading, loadingMore],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Animated.View style={[styles.content, screenAnimatedStyle]}>
        <View style={styles.headerSection}>
          <V2PageHeader
            actionAccessibilityLabel="공지 알림 설정 열기"
            onPressAction={() => setPanelVisible(true)}
            subtitle={data.subtitle}
            title={data.title}
          />
          <NoticeUnreadBanner
            banner={data.banner}
            onPressAction={
              data.banner.actionLabel ? handlePressUnreadBanner : undefined
            }
          />
        </View>

        <View style={styles.categorySection}>
          <NoticeCategoryBar
            categories={data.categoryChips}
            onSelectCategory={selectCategory}
          />
        </View>

        <View style={styles.listSection}>
          <ScrollView
            contentContainerStyle={styles.listScrollContent}
            onScroll={handleListSectionScroll}
            refreshControl={
              <RefreshControl
                onRefresh={handleRefresh}
                refreshing={refreshing}
                tintColor={V2_COLORS.brand.primary}
              />
            }
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}>
            <NoticeHomeList
              emptyState={data.emptyState}
              error={error}
              hasMore={hasMore}
              items={data.items}
              loading={loading}
              loadingMore={loadingMore}
              onPressNotice={handleOpenNotice}
              onRefresh={handleRefresh}
              userJoinedAtLoaded={userJoinedAtLoaded}
            />
          </ScrollView>
        </View>
      </Animated.View>

      <NoticeSettingsPanel
        noticeSettings={noticeSettings}
        onClose={() => setPanelVisible(false)}
        onUpdateDetail={updateDetail}
        onUpdateMaster={updateMaster}
        visible={panelVisible}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: V2_COLORS.background.page,
  },
  content: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.sm,
  },
  categorySection: {
    paddingHorizontal: V2_SPACING.lg,
  },
  listSection: {
    flex: 1,
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: V2_SPACING.xs,
  },
  listScrollContent: {
    flexGrow: 1,
    paddingBottom: BOTTOM_TAB_BAR_HEIGHT + V2_SPACING.xxl,
  },
});
