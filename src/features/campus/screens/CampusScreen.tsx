import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  type NavigationProp,
  type ParamListBase,
  useNavigation,
} from '@react-navigation/native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { createCampusEntryNavigation } from '@/app/navigation/services/campusEntryNavigation';
import { useScreenView } from '@/shared/hooks/useScreenView';
import { BOTTOM_TAB_BAR_HEIGHT } from '@/shared/constants/layout';
import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';
import { AcademicCalendarSection, CafeteriaSection } from '@/features/campus';
import { NoticeSection } from '@/features/home/components/NoticeSection';
import { TaxiSection } from '@/features/home/components/TaxiSection';
import { TimetableSection } from '@/features/timetable';

const QUICK_MENU_ITEMS = [
  {
    label: '시간표',
    icon: 'calendar-outline',
    iconColor: V2_COLORS.accent.purple,
    backgroundColor: V2_COLORS.accent.purpleSoft,
    routeName: 'TimetableDetail',
  },
  {
    label: '학식',
    icon: 'restaurant-outline',
    iconColor: V2_COLORS.accent.orange,
    backgroundColor: V2_COLORS.accent.orangeSoft,
    routeName: 'CafeteriaDetail',
  },
  {
    label: '학사일정',
    icon: 'calendar-clear-outline',
    iconColor: V2_COLORS.accent.blue,
    backgroundColor: V2_COLORS.accent.blueSoft,
    routeName: 'AcademicCalendarDetail',
  },
  {
    label: '설정',
    icon: 'settings-outline',
    iconColor: V2_COLORS.text.secondary,
    backgroundColor: V2_COLORS.background.subtle,
    routeName: 'Setting',
  },
] as const;

/**
 * Transitional Campus v2 shell.
 * Header, page spacing, and quick menu already use the v2 token set.
 * Individual content sections still render legacy components until they
 * are migrated one by one in follow-up commits.
 */
export const CampusScreen = () => {
  useScreenView();

  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const campusEntryNavigation = React.useMemo(
    () => createCampusEntryNavigation(navigation),
    [navigation],
  );

  const contentContainerStyle = React.useMemo(
    () => ({
      paddingBottom: BOTTOM_TAB_BAR_HEIGHT + insets.bottom + V2_SPACING.xxl,
    }),
    [insets.bottom],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.wordmark}>SKURI</Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => campusEntryNavigation.openCampusScreen('Profile')}
            style={styles.profileButton}
          >
            <Icon
              color={V2_COLORS.text.secondary}
              name="person-outline"
              size={18}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.legacySectionBlock}>
          <NoticeSection
            onOpenNoticeDetail={campusEntryNavigation.openNoticeDetail}
            onOpenNoticeList={campusEntryNavigation.openNoticeList}
          />
        </View>

        <View style={styles.legacySectionBlock}>
          <TimetableSection />
        </View>

        <View style={styles.legacySectionBlock}>
          <TaxiSection
            onOpenPendingJoinRequest={
              campusEntryNavigation.openPendingJoinRequest
            }
            onOpenTaxiHome={campusEntryNavigation.openTaxiMain}
          />
        </View>

        <View style={styles.legacySectionBlock}>
          <CafeteriaSection />
        </View>

        <View style={styles.legacySectionBlock}>
          <AcademicCalendarSection />
        </View>

        <View style={styles.quickMenuSection}>
          <Text style={styles.quickMenuTitle}>빠른 메뉴</Text>
          <View style={styles.quickMenuGrid}>
            {QUICK_MENU_ITEMS.map(item => (
              <TouchableOpacity
                key={item.label}
                activeOpacity={0.8}
                onPress={() => navigation.navigate(item.routeName)}
                style={styles.quickMenuItem}
              >
                <View
                  style={[
                    styles.quickMenuIconBox,
                    { backgroundColor: item.backgroundColor },
                  ]}
                >
                  <Icon
                    color={item.iconColor}
                    name={item.icon}
                    size={22}
                  />
                </View>
                <Text style={styles.quickMenuLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: V2_COLORS.background.page,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: V2_SPACING.xxl,
    paddingBottom: V2_SPACING.lg,
  },
  wordmark: {
    color: V2_COLORS.brand.logo,
    fontSize: 28,
    fontStyle: 'italic',
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  profileButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
    ...V2_SHADOWS.card,
  },
  legacySectionBlock: {
    marginBottom: V2_SPACING.sm,
  },
  quickMenuSection: {
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: V2_SPACING.md,
  },
  quickMenuTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: V2_SPACING.md,
  },
  quickMenuGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickMenuItem: {
    alignItems: 'center',
    width: 76,
  },
  quickMenuIconBox: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.lg,
    height: 56,
    justifyContent: 'center',
    marginBottom: V2_SPACING.sm,
    width: 56,
  },
  quickMenuLabel: {
    color: V2_COLORS.text.strong,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
});
