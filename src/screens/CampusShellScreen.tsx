import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  CampusBrandHeader,
  CategoryTag,
  ElevatedCard,
  SectionHeader,
  v2Colors,
  v2Radius,
  v2Spacing,
  v2Typography,
} from '../design-system';
import { BOTTOM_TAB_BAR_HEIGHT } from '../constants/constants';
import { useScreenView } from '../hooks/useScreenView';

const SKURI_WORDMARK = require('../../assets/icons/skuri_wordmark.png');

type TimetableRow = {
  badge?: string;
  kind: 'activeBlue' | 'activeOrange' | 'empty';
  label: string;
  period: string;
  time: string;
  title?: string;
};

type CompactTaxiPreview = {
  headcount: string;
  route: string;
  time: string;
};

type ScheduleItem = {
  day: string;
  label: string;
  month: string;
  title: string;
};

type QuickMenuItem = {
  backgroundColor: string;
  iconColor: string;
  iconName: string;
  label: string;
  route: string;
};

const UNREAD_NOTICE_ROWS = [
  { category: '학사', date: '2024-03-15', title: '2024학년도 1학기 중간고사 일정 안내' },
  { category: '장학', date: '2024-03-14', title: '2024년 1학기 국가장학금 신청 안내' },
] as const;

const TIMETABLE_ROWS: readonly TimetableRow[] = [
  { kind: 'empty', label: '수업 없음', period: '1교시', time: '09:00' },
  {
    kind: 'activeOrange',
    label: '윤성호 교수님  ·  공학관 205',
    period: '2교시',
    time: '09:55',
    title: '자료구조',
  },
  { kind: 'empty', label: '수업 없음', period: '3교시', time: '10:50' },
  {
    badge: '전공',
    kind: 'activeBlue',
    label: '이서연 교수님  ·  공학관 302',
    period: '4교시',
    time: '11:55',
    title: '운영체제',
  },
];

const TIMETABLE_EXPANDED_ROWS: readonly TimetableRow[] = [
  { kind: 'empty', label: '수업 없음', period: '7교시', time: '14:45' },
  { kind: 'empty', label: '수업 없음', period: '8교시', time: '15:35' },
  {
    badge: '야간',
    kind: 'activeBlue',
    label: '홍길동 교수님  ·  새천년관 201',
    period: '9교시',
    time: '18:00',
    title: '캡스톤디자인',
  },
];

const TAXI_PREVIEWS: readonly CompactTaxiPreview[] = [
  { headcount: '2/4명', route: '안양역 → 성결대', time: '오전 09:00' },
  { headcount: '1/4명', route: '안양역 → 성결대', time: '오후 01:00' },
] as const;

const SCHEDULE_ITEMS: readonly ScheduleItem[] = [
  { day: '15', label: '시험', month: '4월', title: '중간고사' },
  { day: '10', label: '행사', month: '5월', title: '봄 축제' },
  { day: '25', label: '학사', month: '3월', title: '수강신청 변경' },
] as const;

const QUICK_MENUS: readonly QuickMenuItem[] = [
  {
    backgroundColor: v2Colors.accent.purple.soft,
    iconColor: v2Colors.accent.purple.base,
    iconName: 'calendar-month-outline',
    label: '시간표',
    route: 'TimetableDetail',
  },
  {
    backgroundColor: v2Colors.accent.orange.soft,
    iconColor: v2Colors.accent.orange.base,
    iconName: 'silverware-fork-knife',
    label: '학식',
    route: 'CafeteriaDetail',
  },
  {
    backgroundColor: v2Colors.accent.blue.soft,
    iconColor: v2Colors.accent.blue.base,
    iconName: 'calendar-clock-outline',
    label: '학사일정',
    route: 'AcademicCalendarDetail',
  },
  {
    backgroundColor: v2Colors.bg.subtle,
    iconColor: v2Colors.text.secondary,
    iconName: 'cog-outline',
    label: '설정',
    route: 'Setting',
  },
] as const;

// Keep `행사` visually neutral here until its schedule token is approved.
const formatScheduleTone = (label: ScheduleItem['label']) => {
  switch (label) {
    case '학사':
      return styles.scheduleBadgeNeutral;
    case '시험':
      return styles.scheduleBadgeBlue;
    case '행사':
      return styles.scheduleBadgePlaceholder;
    default:
      return styles.scheduleBadgeNeutral;
  }
};

const formatScheduleToneLabel = (label: ScheduleItem['label']) => {
  switch (label) {
    case '학사':
      return styles.scheduleBadgeNeutralLabel;
    case '시험':
      return styles.scheduleBadgeBlueLabel;
    case '행사':
      return styles.scheduleBadgePlaceholderLabel;
    default:
      return styles.scheduleBadgeNeutralLabel;
  }
};

export const CampusShellScreen = () => {
  useScreenView();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const [expandedNightClasses, setExpandedNightClasses] = React.useState(false);

  const timetableRows = React.useMemo(
    () =>
      expandedNightClasses ? [...TIMETABLE_ROWS, ...TIMETABLE_EXPANDED_ROWS] : TIMETABLE_ROWS,
    [expandedNightClasses],
  );

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BOTTOM_TAB_BAR_HEIGHT + insets.bottom + v2Spacing[6] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <CampusBrandHeader
          onPressProfile={() => navigation.navigate('My', { screen: 'MyMain' })}
          profileAccessibilityLabel="MY로 이동"
          profileIcon={<Icon color={v2Colors.text.primary} name="person-outline" size={20} />}
          wordmarkSource={SKURI_WORDMARK}
        />

        <View style={styles.sectionBlock}>
          <SectionHeader
            actionAccessibilityLabel="공지 전체보기"
            actionLabel="전체보기"
            onPressAction={() => navigation.navigate('Main', { screen: '공지' })}
            title="읽지 않은 공지"
          />
          <ElevatedCard padding={0} style={styles.sectionCard}>
            {UNREAD_NOTICE_ROWS.map((row, index) => (
              <View
                key={`${row.date}-${row.title}`}
                style={[
                  styles.noticeRow,
                  index < UNREAD_NOTICE_ROWS.length - 1 && styles.noticeRowDivider,
                ]}
              >
                <View style={styles.noticeDot} />
                <View style={styles.noticeCopy}>
                  <View style={styles.noticeMetaRow}>
                    <CategoryTag
                      label={row.category}
                      tone={row.category === '학사' ? 'academic' : 'scholarship'}
                    />
                    <Text style={styles.noticeDate}>{row.date}</Text>
                  </View>
                  <Text numberOfLines={1} style={styles.noticeTitle}>
                    {row.title}
                  </Text>
                </View>
                <Icon color={v2Colors.text.quaternary} name="chevron-forward" size={14} />
              </View>
            ))}
          </ElevatedCard>
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader
            actionAccessibilityLabel="시간표로 이동"
            actionLabel="시간표"
            onPressAction={() => navigation.navigate('TimetableDetail')}
            subtitle="3월 10일 화요일 2주차"
            title="오늘 시간표"
          />
          <ElevatedCard padding={0} style={styles.sectionCard}>
            {timetableRows.map(row => (
              <View
                key={`${row.period}-${row.time}`}
                style={[styles.timetableRow, row.kind === 'empty' ? styles.timetableEmptyRow : undefined]}
              >
                <View style={styles.periodColumn}>
                  <Text
                    style={[
                      styles.periodLabel,
                      row.kind === 'empty' ? styles.periodLabelMuted : undefined,
                    ]}
                  >
                    {row.period}
                  </Text>
                  <Text style={styles.periodTime}>{row.time}</Text>
                </View>

                <View
                  style={[
                    styles.slotColumn,
                    row.kind === 'activeOrange' && styles.orangeSlot,
                    row.kind === 'activeBlue' && styles.blueSlot,
                  ]}
                >
                  {row.kind === 'empty' ? (
                    <View style={styles.emptySlotState}>
                      <View style={styles.emptySlotDot} />
                      <Text style={styles.emptySlotLabel}>{row.label}</Text>
                    </View>
                  ) : (
                    <View style={styles.activeSlotCopy}>
                      <View style={styles.activeSlotHeader}>
                        <Text style={styles.activeSlotTitle}>{row.title}</Text>
                        {row.badge ? (
                          <View style={styles.activeBadge}>
                            <Text style={styles.activeBadgeLabel}>{row.badge}</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.activeSlotMeta}>{row.label}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}

            <Pressable
              accessibilityLabel={expandedNightClasses ? '야간수업 접기' : '야간수업 펼치기'}
              accessibilityRole="button"
              onPress={() => setExpandedNightClasses(value => !value)}
              style={({ pressed }) => [styles.expandButton, pressed && styles.buttonPressed]}
            >
              <Icon
                color={v2Colors.text.secondary}
                name={expandedNightClasses ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={16}
              />
              <Text style={styles.expandButtonLabel}>
                {expandedNightClasses ? '야간수업 접기' : '야간수업 펼치기'}
              </Text>
            </Pressable>
          </ElevatedCard>
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader
            actionAccessibilityLabel="택시로 이동"
            actionLabel="전체보기"
            onPressAction={() => navigation.navigate('Main', { screen: '택시' })}
            title="모집 중인 택시"
          />
          <ElevatedCard padding={0} style={styles.sectionCard}>
            {TAXI_PREVIEWS.map((preview, index) => (
              <View
                key={`${preview.time}-${preview.route}`}
                style={[
                  styles.taxiPreviewRow,
                  index < TAXI_PREVIEWS.length - 1 && styles.noticeRowDivider,
                ]}
              >
                <View style={styles.taxiPreviewLeading}>
                  <View style={styles.departureBadge}>
                    <Icon color={v2Colors.accent.green.strong} name="location" size={12} />
                  </View>
                  <Text style={styles.taxiPreviewRoute}>{preview.route}</Text>
                </View>
                <View style={styles.taxiPreviewTrailing}>
                  <Text style={styles.taxiPreviewMeta}>{preview.time}</Text>
                  <Text style={styles.taxiPreviewMeta}>{preview.headcount}</Text>
                  <Icon color={v2Colors.text.quaternary} name="chevron-forward" size={14} />
                </View>
              </View>
            ))}
          </ElevatedCard>
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader
            actionAccessibilityLabel="주간메뉴로 이동"
            actionLabel="주간메뉴"
            onPressAction={() => navigation.navigate('CafeteriaDetail')}
            title="오늘의 학식"
          />
          <ElevatedCard style={styles.mealCard}>
            <View style={styles.mealIconBox}>
              <MaterialCommunityIcons color={v2Colors.text.inverse} name="silverware-fork-knife" size={24} />
            </View>
            <View style={styles.mealCopy}>
              <Text style={styles.mealTitle}>제육볶음</Text>
              <Text style={styles.mealDescription}>된장국, 시금치나물, 배추김치</Text>
              <Text style={styles.mealPrice}>5,000원</Text>
            </View>
          </ElevatedCard>
        </View>

        <View style={styles.sectionBlock}>
          <SectionHeader
            actionAccessibilityLabel="학사일정으로 이동"
            actionLabel="전체보기"
            onPressAction={() => navigation.navigate('AcademicCalendarDetail')}
            title="다가오는 일정"
          />
          <ElevatedCard padding={0} style={styles.sectionCard}>
            {SCHEDULE_ITEMS.map((item, index) => (
              <View
                key={`${item.month}-${item.day}-${item.title}`}
                style={[
                  styles.scheduleRow,
                  index < SCHEDULE_ITEMS.length - 1 && styles.noticeRowDivider,
                ]}
              >
                <View style={styles.scheduleDateBox}>
                  <Text style={styles.scheduleMonth}>{item.month}</Text>
                  <Text style={styles.scheduleDay}>{item.day}</Text>
                </View>
                <View style={styles.scheduleCopy}>
                  <Text style={styles.scheduleTitle}>{item.title}</Text>
                  <Text style={styles.scheduleRange}>
                    {item.month === '4월' ? '2024-04-15 ~ 2024-04-19' : item.month === '5월' ? '2024-05-10 ~ 2024-05-11' : '2024-03-25 ~ 2024-03-29'}
                  </Text>
                </View>
                <View style={[styles.scheduleBadge, formatScheduleTone(item.label)]}>
                  <Text style={[styles.scheduleBadgeLabel, formatScheduleToneLabel(item.label)]}>
                    {item.label}
                  </Text>
                </View>
              </View>
            ))}
          </ElevatedCard>
        </View>

        <View style={styles.sectionBlock}>
          <Text style={styles.quickMenuTitle}>빠른 메뉴</Text>
          <View style={styles.quickMenuGrid}>
            {QUICK_MENUS.map(menu => (
              <Pressable
                accessibilityLabel={menu.label}
                accessibilityRole="button"
                key={menu.label}
                onPress={() => navigation.navigate(menu.route)}
                style={({ pressed }) => [styles.quickMenuItem, pressed && styles.buttonPressed]}
              >
                <View style={[styles.quickMenuIconBox, { backgroundColor: menu.backgroundColor }]}>
                  <MaterialCommunityIcons color={menu.iconColor} name={menu.iconName} size={20} />
                </View>
                <Text style={styles.quickMenuLabel}>{menu.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  activeBadge: {
    alignItems: 'center',
    backgroundColor: v2Colors.accent.blue.soft,
    borderRadius: v2Radius.sm,
    height: 20,
    justifyContent: 'center',
    marginLeft: v2Spacing[2],
    paddingHorizontal: 8,
  },
  activeBadgeLabel: {
    ...v2Typography.meta.medium,
    color: v2Colors.accent.blue.base,
  },
  activeSlotCopy: {
    flex: 1,
  },
  activeSlotHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 2,
  },
  activeSlotMeta: {
    ...v2Typography.meta.default,
    color: v2Colors.text.tertiary,
  },
  activeSlotTitle: {
    ...v2Typography.body.medium,
    color: v2Colors.text.primary,
    fontWeight: '700',
  },
  blueSlot: {
    backgroundColor: v2Colors.accent.blue.soft,
  },
  buttonPressed: {
    opacity: 0.72,
  },
  container: {
    backgroundColor: v2Colors.bg.app,
    flex: 1,
  },
  departureBadge: {
    alignItems: 'center',
    backgroundColor: v2Colors.accent.green.soft,
    borderRadius: v2Radius.full,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  emptySlotDot: {
    backgroundColor: v2Colors.border.default,
    borderRadius: v2Radius.full,
    height: 4,
    marginRight: 6,
    width: 4,
  },
  emptySlotLabel: {
    ...v2Typography.meta.default,
    color: v2Colors.text.quaternary,
  },
  emptySlotState: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  expandButton: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: v2Spacing[4],
  },
  expandButtonLabel: {
    ...v2Typography.body.default,
    color: v2Colors.text.secondary,
    marginLeft: 4,
  },
  mealCard: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  mealCopy: {
    flex: 1,
    marginLeft: v2Spacing[3],
  },
  mealDescription: {
    ...v2Typography.body.default,
    color: v2Colors.text.secondary,
    marginTop: 2,
  },
  mealIconBox: {
    alignItems: 'center',
    backgroundColor: v2Colors.accent.orange.base,
    borderRadius: v2Radius.lg,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  mealPrice: {
    ...v2Typography.body.medium,
    color: v2Colors.accent.orange.base,
    fontWeight: '700',
    marginTop: 6,
  },
  mealTitle: {
    ...v2Typography.title.card,
    color: v2Colors.text.primary,
  },
  noticeCopy: {
    flex: 1,
  },
  noticeDate: {
    ...v2Typography.meta.default,
    color: v2Colors.text.quaternary,
  },
  noticeDot: {
    backgroundColor: v2Colors.status.unread.dot,
    borderRadius: v2Radius.full,
    height: 8,
    marginRight: v2Spacing[3],
    marginTop: 8,
    width: 8,
  },
  noticeMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: v2Spacing[2],
    marginBottom: v2Spacing[1],
  },
  noticeRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    paddingHorizontal: v2Spacing[4],
    paddingVertical: v2Spacing[4],
  },
  noticeRowDivider: {
    borderBottomColor: v2Colors.border.subtle,
    borderBottomWidth: 1,
  },
  noticeTitle: {
    ...v2Typography.body.medium,
    color: v2Colors.text.primary,
    fontWeight: '700',
  },
  orangeSlot: {
    backgroundColor: v2Colors.accent.orange.soft,
  },
  periodColumn: {
    alignItems: 'center',
    borderRightColor: v2Colors.border.subtle,
    borderRightWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 8,
    width: 64,
  },
  periodLabel: {
    ...v2Typography.meta.medium,
    color: v2Colors.text.secondary,
  },
  periodLabelMuted: {
    color: v2Colors.text.quaternary,
  },
  periodTime: {
    ...v2Typography.meta.default,
    color: v2Colors.text.quaternary,
    marginTop: 2,
  },
  quickMenuGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickMenuIconBox: {
    alignItems: 'center',
    borderRadius: v2Radius.xl,
    height: 56,
    justifyContent: 'center',
    width: 56,
  },
  quickMenuItem: {
    alignItems: 'center',
    gap: v2Spacing[2],
    width: 76,
  },
  quickMenuLabel: {
    ...v2Typography.meta.medium,
    color: v2Colors.text.secondary,
    textAlign: 'center',
  },
  quickMenuTitle: {
    ...v2Typography.title.section,
    color: v2Colors.text.primary,
    marginBottom: v2Spacing[3],
  },
  scheduleBadge: {
    alignItems: 'center',
    borderRadius: v2Radius.sm,
    height: 24,
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  scheduleBadgeBlue: {
    backgroundColor: v2Colors.accent.blue.soft,
  },
  scheduleBadgeBlueLabel: {
    color: v2Colors.accent.blue.base,
  },
  scheduleBadgeLabel: {
    ...v2Typography.meta.medium,
  },
  scheduleBadgeNeutral: {
    backgroundColor: v2Colors.accent.blue.soft,
  },
  scheduleBadgeNeutralLabel: {
    color: v2Colors.accent.blue.base,
  },
  scheduleBadgePlaceholder: {
    backgroundColor: v2Colors.bg.subtle,
  },
  scheduleBadgePlaceholderLabel: {
    color: v2Colors.text.secondary,
  },
  scheduleCopy: {
    flex: 1,
    marginHorizontal: v2Spacing[3],
  },
  scheduleDateBox: {
    alignItems: 'center',
    backgroundColor: v2Colors.accent.blue.soft,
    borderRadius: v2Radius.lg,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  scheduleDay: {
    ...v2Typography.title.screen,
    color: v2Colors.accent.blue.base,
  },
  scheduleMonth: {
    ...v2Typography.meta.medium,
    color: v2Colors.accent.blue.base,
  },
  scheduleRange: {
    ...v2Typography.meta.default,
    color: v2Colors.text.secondary,
    marginTop: 2,
  },
  scheduleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: v2Spacing[4],
    paddingVertical: v2Spacing[4],
  },
  scheduleTitle: {
    ...v2Typography.body.medium,
    color: v2Colors.text.primary,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: v2Spacing[4],
    paddingTop: 24,
  },
  sectionBlock: {
    marginTop: v2Spacing[4],
  },
  sectionCard: {
    marginTop: v2Spacing[3],
  },
  slotColumn: {
    alignItems: 'flex-start',
    flex: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
  },
  taxiPreviewLeading: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: v2Spacing[2],
  },
  taxiPreviewMeta: {
    ...v2Typography.meta.default,
    color: v2Colors.text.secondary,
  },
  taxiPreviewRoute: {
    ...v2Typography.body.medium,
    color: v2Colors.text.primary,
  },
  taxiPreviewRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: v2Spacing[4],
    paddingVertical: v2Spacing[4],
  },
  taxiPreviewTrailing: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: v2Spacing[2],
  },
  timetableEmptyRow: {
    backgroundColor: v2Colors.bg.surface,
  },
  timetableRow: {
    alignItems: 'stretch',
    backgroundColor: v2Colors.bg.surface,
    borderBottomColor: v2Colors.bg.app,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
  },
});
