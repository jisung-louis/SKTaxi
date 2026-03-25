import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {
  type NavigationProp,
  type ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import Animated from 'react-native-reanimated';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {createCampusEntryNavigation} from '@/app/navigation/services/campusEntryNavigation';
import {BOTTOM_TAB_BAR_HEIGHT} from '@/shared/constants/layout';
import {StateCard} from '@/shared/design-system/components';
import {COLORS, SPACING} from '@/shared/design-system/tokens';
import {useScreenEnterAnimation} from '@/shared/hooks/useScreenEnterAnimation';
import {useScreenView} from '@/shared/hooks/useScreenView';

import {CampusAcademicCalendarPreviewCard} from '../components/CampusAcademicCalendarPreviewCard';
import {CampusCafeteriaPreviewCarousel} from '../components/CampusCafeteriaPreviewCarousel';
import {CampusHomeBannerCarousel} from '../components/CampusHomeBannerCarousel';
import {CampusHomeHeader} from '../components/CampusHomeHeader';
import {CampusNoticePreviewCard} from '../components/CampusNoticePreviewCard';
import {CampusQuickMenuGrid} from '../components/CampusQuickMenuGrid';
import {CampusSectionHeader} from '../components/CampusSectionHeader';
import {CampusTimetablePreviewCard} from '../components/CampusTimetablePreviewCard';
import {getDefaultCampusHomeBannerViewData} from '../application/campusHomeBannerQuery';
import {
  CAMPUS_HOME_ACTION_LABELS,
  CAMPUS_HOME_QUICK_MENU_ITEMS,
} from '../constants/campusHomePreview';
import type {CampusBannerViewData} from '../model/campusHomeBanner';
import {useCampusHomeViewData} from '../hooks/useCampusHomeViewData';

export const CampusScreen = () => {
  useScreenView();

  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const screenAnimatedStyle = useScreenEnterAnimation();
  const campusEntryNavigation = React.useMemo(
    () => createCampusEntryNavigation(navigation),
    [navigation],
  );
  const {data, loading, error, refetch} = useCampusHomeViewData();
  const defaultBannerItems = React.useMemo(
    () => getDefaultCampusHomeBannerViewData(),
    [],
  );
  const bannerItems = data?.banners ?? defaultBannerItems;

  const contentContainerStyle = React.useMemo(
    () => ({
      paddingBottom: BOTTOM_TAB_BAR_HEIGHT + insets.bottom + SPACING.xxl,
    }),
    [insets.bottom],
  );

  const handlePressBanner = React.useCallback(
    async (item: CampusBannerViewData) => {
      if (item.action.type === 'externalUrl') {
        try {
          await Linking.openURL(item.action.url);
        } catch (linkError) {
          console.warn('Campus 배너 외부 링크를 열지 못했습니다.', linkError);
          Alert.alert(
            '링크 열기 실패',
            '배너 링크를 열지 못했습니다. 잠시 후 다시 시도해주세요.',
          );
        }

        return;
      }

      switch (item.action.target) {
        case 'TAXI_MAIN':
          campusEntryNavigation.openTaxiMain();
          return;
        case 'NOTICE_MAIN':
          campusEntryNavigation.openNoticeList();
          return;
        case 'TIMETABLE_DETAIL':
          campusEntryNavigation.openCampusScreen(
            'TimetableDetail',
            item.action.params,
          );
          return;
        case 'CAFETERIA_DETAIL':
          campusEntryNavigation.openCampusScreen(
            'CafeteriaDetail',
            item.action.params,
          );
          return;
        case 'ACADEMIC_CALENDAR_DETAIL':
          campusEntryNavigation.openCampusScreen(
            'AcademicCalendarDetail',
            item.action.params,
          );
          return;
        default:
          return;
      }
    },
    [campusEntryNavigation],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Animated.View style={[styles.screen, screenAnimatedStyle]}>
        <ScrollView
          contentContainerStyle={contentContainerStyle}
          showsVerticalScrollIndicator={false}>
          <CampusHomeHeader
            onPressNotification={() =>
              campusEntryNavigation.openCampusScreen('Notification')
            }
            onPressProfile={() =>
              campusEntryNavigation.openCampusScreen('Profile')
            }
          />

          <CampusHomeBannerCarousel
            items={bannerItems}
            onPressItem={handlePressBanner}
          />

          <CampusQuickMenuGrid
            items={CAMPUS_HOME_QUICK_MENU_ITEMS}
            onPressItem={routeName => {
              campusEntryNavigation.openCampusScreen(routeName);
            }}
          />

          {loading && !data ? (
            <View style={styles.section}>
              <StateCard
                description="캠퍼스 정보를 불러오는 중입니다."
                icon={<ActivityIndicator color={COLORS.brand.primary} />}
                title="Campus 화면 준비 중"
              />
            </View>
          ) : null}

          {error && !data ? (
            <View style={styles.section}>
              <StateCard
                actionLabel="다시 시도"
                description={error}
                icon={
                  <Icon
                    color={COLORS.accent.orange}
                    name="refresh-outline"
                    size={26}
                  />
                }
                onPressAction={refetch}
                title="Campus 화면을 불러오지 못했습니다"
              />
            </View>
          ) : null}

          {data ? (
            <>
              <View style={styles.section}>
                <CampusSectionHeader
                  actionLabel={CAMPUS_HOME_ACTION_LABELS.notices}
                  onPressAction={campusEntryNavigation.openNoticeList}
                  title="읽지 않은 공지"
                />
                <CampusNoticePreviewCard
                  items={data.notices.items}
                  onPressItem={campusEntryNavigation.openNoticeList}
                />
              </View>

              <View style={styles.section}>
                <CampusSectionHeader
                  actionLabel={CAMPUS_HOME_ACTION_LABELS.timetable}
                  onPressAction={() =>
                    campusEntryNavigation.openCampusScreen('TimetableDetail', {
                      initialView: 'all',
                    })
                  }
                  subtitle={data.timetable.dateLabel}
                  title="오늘 시간표"
                />
                <CampusTimetablePreviewCard
                  collapsedVisibleCount={data.timetable.collapsedVisibleCount}
                  emptyState={data.timetable.emptyState}
                  periods={data.timetable.periods}
                  sessions={data.timetable.sessions}
                />
              </View>

              <View style={styles.section}>
                <CampusSectionHeader
                  actionLabel={CAMPUS_HOME_ACTION_LABELS.cafeteria}
                  onPressAction={() =>
                    campusEntryNavigation.openCampusScreen('CafeteriaDetail')
                  }
                  title="오늘의 추천 학식"
                />
                <CampusCafeteriaPreviewCarousel
                  items={data.cafeteria.recommendedMenus}
                  onPressItem={() =>
                    campusEntryNavigation.openCampusScreen('CafeteriaDetail')
                  }
                />
              </View>

              <View style={styles.section}>
                <CampusSectionHeader
                  actionLabel={CAMPUS_HOME_ACTION_LABELS.academicCalendar}
                  onPressAction={() =>
                    campusEntryNavigation.openCampusScreen(
                      'AcademicCalendarDetail',
                    )
                  }
                  title="다가오는 학사일정"
                />
                <CampusAcademicCalendarPreviewCard
                  items={data.academicCalendar.items}
                  onPressItem={() =>
                    campusEntryNavigation.openCampusScreen(
                      'AcademicCalendarDetail',
                    )
                  }
                />
              </View>
            </>
          ) : null}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.page,
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  section: {
    marginBottom: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
});
