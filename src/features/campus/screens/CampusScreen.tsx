import React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native';
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
import {V2StateCard} from '@/shared/design-system/components';
import {V2_COLORS, V2_SPACING} from '@/shared/design-system/tokens';
import {useScreenEnterAnimation} from '@/shared/hooks/useScreenEnterAnimation';
import {useScreenView} from '@/shared/hooks/useScreenView';

import {CampusAcademicCalendarPreviewCard} from '../components/CampusAcademicCalendarPreviewCard';
import {CampusCafeteriaPreviewCarousel} from '../components/CampusCafeteriaPreviewCarousel';
import {CampusHomeHeader} from '../components/CampusHomeHeader';
import {CampusNoticePreviewCard} from '../components/CampusNoticePreviewCard';
import {CampusQuickMenuGrid} from '../components/CampusQuickMenuGrid';
import {CampusSectionHeader} from '../components/CampusSectionHeader';
import {CampusTaxiPreviewCards} from '../components/CampusTaxiPreviewCards';
import {CampusTimetablePreviewCard} from '../components/CampusTimetablePreviewCard';
import {
  CAMPUS_HOME_ACTION_LABELS,
  CAMPUS_HOME_QUICK_MENU_ITEMS,
} from '../constants/campusHomePreview';
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

  const contentContainerStyle = React.useMemo(
    () => ({
      paddingBottom: BOTTOM_TAB_BAR_HEIGHT + insets.bottom + V2_SPACING.xxl,
    }),
    [insets.bottom],
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

          {loading && !data ? (
            <View style={styles.section}>
              <V2StateCard
                description="캠퍼스 정보를 불러오는 중입니다."
                icon={<ActivityIndicator color={V2_COLORS.brand.primary} />}
                title="Campus 화면 준비 중"
              />
            </View>
          ) : null}

          {error && !data ? (
            <View style={styles.section}>
              <V2StateCard
                actionLabel="다시 시도"
                description={error}
                icon={
                  <Icon
                    color={V2_COLORS.accent.orange}
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
                  actionLabel={CAMPUS_HOME_ACTION_LABELS.taxi}
                  onPressAction={campusEntryNavigation.openTaxiMain}
                  title="모집 중인 택시"
                />
                <CampusTaxiPreviewCards
                  items={data.taxi.items}
                  onPressItem={campusEntryNavigation.openTaxiMain}
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

              <CampusQuickMenuGrid
                items={CAMPUS_HOME_QUICK_MENU_ITEMS}
                onPressItem={routeName => {
                  campusEntryNavigation.openCampusScreen(routeName);
                }}
              />
            </>
          ) : null}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  section: {
    marginBottom: V2_SPACING.xxl,
    paddingHorizontal: V2_SPACING.lg,
  },
});
