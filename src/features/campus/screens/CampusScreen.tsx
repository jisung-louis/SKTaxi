import React from 'react';
import {
  ActivityIndicator,
  Platform,
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

import {
  type CampusStackParamList,
} from '@/app/navigation/types';
import { createCampusEntryNavigation } from '@/app/navigation/services/campusEntryNavigation';
import { useScreenView } from '@/shared/hooks/useScreenView';
import { BOTTOM_TAB_BAR_HEIGHT } from '@/shared/constants/layout';
import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

import { useCampusHomeViewData } from '../hooks/useCampusHomeViewData';
import type {
  CampusAcademicEventBadgeViewData,
  CampusAcademicEventViewData,
  CampusHighlightTone,
  CampusNoticeItemViewData,
  CampusNoticeTone,
  CampusTaxiPartyViewData,
  CampusTimetablePeriodViewData,
} from '../model/campusHome';

type QuickMenuItem = {
  label: string;
  icon: string;
  iconColor: string;
  backgroundColor: string;
  routeName: keyof CampusStackParamList;
};

const QUICK_MENU_ITEMS: readonly QuickMenuItem[] = [
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

const NOTICE_ACTION_LABEL = '전체보기';
const TIMETABLE_ACTION_LABEL = '시간표';
const TIMETABLE_EXPAND_LABEL = '야간수업 펼치기';
const TIMETABLE_COLLAPSE_LABEL = '야간수업 접기';
const TAXI_ACTION_LABEL = '전체보기';
const CAFETERIA_ACTION_LABEL = '주간메뉴';
const ACADEMIC_ACTION_LABEL = '전체보기';

const getNoticeToneColors = (tone: CampusNoticeTone) => {
  switch (tone) {
    case 'blue':
      return {
        backgroundColor: V2_COLORS.accent.blueSoft,
        textColor: V2_COLORS.accent.blue,
      };
    case 'orange':
      return {
        backgroundColor: V2_COLORS.accent.orangeSoft,
        textColor: V2_COLORS.accent.orange,
      };
    case 'purple':
      return {
        backgroundColor: V2_COLORS.accent.purpleSoft,
        textColor: V2_COLORS.accent.purple,
      };
    case 'brand':
    default:
      return {
        backgroundColor: V2_COLORS.brand.primaryTint,
        textColor: V2_COLORS.brand.primaryStrong,
      };
  }
};

const getHighlightToneColors = (tone: CampusHighlightTone) => {
  switch (tone) {
    case 'orange':
      return {
        backgroundColor: V2_COLORS.accent.orangeSoft,
        textColor: V2_COLORS.accent.orange,
        accentColor: V2_COLORS.accent.orange,
      };
    case 'pink':
      return {
        backgroundColor: V2_COLORS.accent.pinkSoft,
        textColor: V2_COLORS.status.danger,
        accentColor: V2_COLORS.status.danger,
      };
    case 'brand':
      return {
        backgroundColor: V2_COLORS.brand.primaryTint,
        textColor: V2_COLORS.brand.primaryStrong,
        accentColor: V2_COLORS.brand.primary,
      };
    case 'blue':
    default:
      return {
        backgroundColor: V2_COLORS.accent.blueSoft,
        textColor: V2_COLORS.accent.blue,
        accentColor: V2_COLORS.accent.blue,
      };
  }
};

export const CampusScreen = () => {
  useScreenView();

  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<ParamListBase>>();
  const campusEntryNavigation = React.useMemo(
    () => createCampusEntryNavigation(navigation),
    [navigation],
  );
  const { data, loading, error, refetch } = useCampusHomeViewData();
  const [isTimetableExpanded, setIsTimetableExpanded] = React.useState(false);

  const contentContainerStyle = React.useMemo(
    () => ({
      paddingBottom: BOTTOM_TAB_BAR_HEIGHT + insets.bottom + V2_SPACING.xxl,
    }),
    [insets.bottom],
  );

  const visibleTimetablePeriods = React.useMemo(() => {
    if (!data) {
      return [];
    }

    if (isTimetableExpanded) {
      return data.timetable.periods;
    }

    return data.timetable.periods.slice(0, data.timetable.collapsedVisibleCount);
  }, [data, isTimetableExpanded]);

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

        {loading && !data ? (
          <ScreenStateCard
            description="캠퍼스 정보를 불러오는 중입니다."
            icon={<ActivityIndicator color={V2_COLORS.brand.primary} />}
            title="Campus 화면 준비 중"
          />
        ) : null}

        {error && !data ? (
          <ScreenStateCard
            actionLabel="다시 시도"
            description={error}
            icon={
              <Icon
                color={V2_COLORS.accent.orange}
                name="refresh-outline"
                size={26}
              />
            }
            onPressAction={() => {
              refetch();
            }}
            title="Campus 화면을 불러오지 못했습니다"
          />
        ) : null}

        {data ? (
          <>
            <View style={styles.section}>
              <SectionHeader
                actionLabel={NOTICE_ACTION_LABEL}
                onPressAction={campusEntryNavigation.openNoticeList}
                title="읽지 않은 공지"
              />
              <NoticeCard
                items={data.notices.items}
                onPressItem={campusEntryNavigation.openNoticeList}
              />
            </View>

            <View style={styles.section}>
              <SectionHeader
                actionLabel={TIMETABLE_ACTION_LABEL}
                onPressAction={() =>
                  campusEntryNavigation.openCampusScreen('TimetableDetail')
                }
                subtitle={data.timetable.dateLabel}
                title="오늘 시간표"
              />
              <TimetableCard
                emptyState={data.timetable.emptyState}
                isExpanded={isTimetableExpanded}
                onToggleExpanded={() => {
                  setIsTimetableExpanded(previous => !previous);
                }}
                periods={visibleTimetablePeriods}
                showToggle={
                  data.timetable.periods.length >
                  data.timetable.collapsedVisibleCount
                }
              />
            </View>

            <View style={styles.section}>
              <SectionHeader
                actionLabel={TAXI_ACTION_LABEL}
                onPressAction={campusEntryNavigation.openTaxiMain}
                title="모집 중인 택시"
              />
              <TaxiCards
                items={data.taxi.items}
                onPressItem={campusEntryNavigation.openTaxiMain}
              />
            </View>

            <View style={styles.section}>
              <SectionHeader
                actionLabel={CAFETERIA_ACTION_LABEL}
                onPressAction={() =>
                  campusEntryNavigation.openCampusScreen('CafeteriaDetail')
                }
                title="오늘의 학식"
              />
              <CafeteriaCard
                description={data.cafeteria.featuredMenu?.description ?? ''}
                onPress={() =>
                  campusEntryNavigation.openCampusScreen('CafeteriaDetail')
                }
                priceLabel={data.cafeteria.featuredMenu?.priceLabel ?? ''}
                title={data.cafeteria.featuredMenu?.title ?? ''}
              />
            </View>

            <View style={styles.section}>
              <SectionHeader
                actionLabel={ACADEMIC_ACTION_LABEL}
                onPressAction={() =>
                  campusEntryNavigation.openCampusScreen(
                    'AcademicCalendarDetail',
                  )
                }
                title="다가오는 일정"
              />
              <AcademicCalendarCard
                items={data.academicCalendar.items}
                onPressItem={() =>
                  campusEntryNavigation.openCampusScreen(
                    'AcademicCalendarDetail',
                  )
                }
              />
            </View>

            <View style={styles.quickMenuSection}>
              <Text style={styles.sectionTitle}>빠른 메뉴</Text>
              <View style={styles.quickMenuGrid}>
                {QUICK_MENU_ITEMS.map(item => (
                  <TouchableOpacity
                    key={item.label}
                    activeOpacity={0.82}
                    onPress={() =>
                      campusEntryNavigation.openCampusScreen(item.routeName)
                    }
                    style={styles.quickMenuItem}
                  >
                    <View
                      style={[
                        styles.quickMenuIconBox,
                        { backgroundColor: item.backgroundColor },
                      ]}
                    >
                      <Icon color={item.iconColor} name={item.icon} size={22} />
                    </View>
                    <Text style={styles.quickMenuLabel}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onPressAction?: () => void;
};

const SectionHeader = ({
  title,
  subtitle,
  actionLabel,
  onPressAction,
}: SectionHeaderProps) => {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onPressAction ? (
        <TouchableOpacity activeOpacity={0.8} onPress={onPressAction}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

type ScreenStateCardProps = {
  title: string;
  description: string;
  icon: React.ReactNode;
  actionLabel?: string;
  onPressAction?: () => void;
};

const ScreenStateCard = ({
  title,
  description,
  icon,
  actionLabel,
  onPressAction,
}: ScreenStateCardProps) => {
  return (
    <View style={styles.section}>
      <View style={styles.stateCard}>
        <View style={styles.stateIcon}>{icon}</View>
        <Text style={styles.stateTitle}>{title}</Text>
        <Text style={styles.stateDescription}>{description}</Text>
        {actionLabel && onPressAction ? (
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={onPressAction}
            style={styles.stateButton}
          >
            <Text style={styles.stateButtonLabel}>{actionLabel}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

type NoticeCardProps = {
  items: CampusNoticeItemViewData[];
  onPressItem: () => void;
};

const NoticeCard = ({ items, onPressItem }: NoticeCardProps) => {
  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>새로운 공지가 없습니다</Text>
        <Text style={styles.emptyDescription}>
          확인하지 않은 공지가 생기면 여기에 표시됩니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {items.map((item, index) => {
        const toneColors = getNoticeToneColors(item.tone);

        return (
          <React.Fragment key={item.id}>
            <TouchableOpacity
              activeOpacity={0.82}
              onPress={onPressItem}
              style={styles.noticeRow}
            >
              <View style={styles.noticeDot} />
              <View style={styles.noticeContent}>
                <View style={styles.noticeMetaRow}>
                  <View
                    style={[
                      styles.noticeCategoryPill,
                      { backgroundColor: toneColors.backgroundColor },
                    ]}
                  >
                    <Text
                      style={[
                        styles.noticeCategoryLabel,
                        { color: toneColors.textColor },
                      ]}
                    >
                      {item.categoryLabel}
                    </Text>
                  </View>
                  <Text style={styles.noticeDate}>{item.publishedAtLabel}</Text>
                </View>
                <Text numberOfLines={1} style={styles.noticeTitle}>
                  {item.title}
                </Text>
              </View>
              <Icon
                color={V2_COLORS.text.muted}
                name="chevron-forward-outline"
                size={16}
              />
            </TouchableOpacity>
            {index < items.length - 1 ? <View style={styles.cardSeparator} /> : null}
          </React.Fragment>
        );
      })}
    </View>
  );
};

type TimetableCardProps = {
  periods: CampusTimetablePeriodViewData[];
  emptyState?: { title: string; description: string };
  showToggle: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
};

const TimetableCard = ({
  periods,
  emptyState,
  showToggle,
  isExpanded,
  onToggleExpanded,
}: TimetableCardProps) => {
  if (emptyState || periods.length === 0) {
    return (
      <View style={[styles.card, styles.timetableEmptyCard]}>
        <Icon color={V2_COLORS.accent.orange} name="sunny-outline" size={34} />
        <Text style={styles.timetableEmptyTitle}>{emptyState?.title}</Text>
        <Text style={styles.timetableEmptyDescription}>
          {emptyState?.description}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {periods.map((period, index) => {
        const toneColors = period.tone
          ? getHighlightToneColors(period.tone)
          : undefined;

        return (
          <View
            key={period.id}
            style={[
              styles.timetableRow,
              period.tone
                ? { backgroundColor: toneColors?.backgroundColor }
                : null,
              index === periods.length - 1 && !showToggle
                ? styles.timetableRowLast
                : null,
            ]}
          >
            <View style={styles.timetableTimelineCell}>
              <Text
                style={[
                  styles.timetablePeriodLabel,
                  period.isCurrent ? styles.timetablePeriodLabelCurrent : null,
                ]}
              >
                {period.periodLabel}
              </Text>
              <Text
                style={[
                  styles.timetableTimeLabel,
                  period.isCurrent ? styles.timetableTimeLabelCurrent : null,
                ]}
              >
                {period.startTimeLabel}
              </Text>
            </View>
            {period.isEmpty ? (
              <View style={styles.timetableEmptyRowContent}>
                <View style={styles.timetableEmptyDot} />
                <Text style={styles.timetableEmptyRowLabel}>수업 없음</Text>
              </View>
            ) : (
              <View style={styles.timetableClassContent}>
                <View
                  style={[
                    styles.timetableAccentBar,
                    { backgroundColor: toneColors?.accentColor },
                  ]}
                />
                <View style={styles.timetableClassTextGroup}>
                  <View style={styles.timetableClassTitleRow}>
                    <Text numberOfLines={1} style={styles.timetableClassTitle}>
                      {period.title}
                    </Text>
                    {period.status ? (
                      <View
                        style={[
                          styles.statusPill,
                          {
                            backgroundColor: getHighlightToneColors(
                              period.status.tone,
                            ).backgroundColor,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusPillLabel,
                            {
                              color: getHighlightToneColors(period.status.tone)
                                .textColor,
                            },
                          ]}
                        >
                          {period.status.label}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text numberOfLines={1} style={styles.timetableMetaText}>
                    {period.instructorLabel}
                    {period.roomLabel
                      ? ` · ${period.roomLabel}`
                      : ''}
                  </Text>
                </View>
              </View>
            )}
          </View>
        );
      })}
      {showToggle ? (
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={onToggleExpanded}
          style={styles.timetableToggleButton}
        >
          <Icon
            color={V2_COLORS.accent.blue}
            name="moon-outline"
            size={16}
          />
          <Text style={styles.timetableToggleLabel}>
            {isExpanded ? TIMETABLE_COLLAPSE_LABEL : TIMETABLE_EXPAND_LABEL}
          </Text>
          <Icon
            color={V2_COLORS.accent.blue}
            name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={16}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

type TaxiCardsProps = {
  items: CampusTaxiPartyViewData[];
  onPressItem: () => void;
};

const TaxiCards = ({ items, onPressItem }: TaxiCardsProps) => {
  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>현재 모집 중인 택시가 없습니다</Text>
        <Text style={styles.emptyDescription}>
          새로운 합승 모집이 생기면 이 섹션에서 바로 확인할 수 있습니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.stackList}>
      {items.map(item => (
        <TouchableOpacity
          key={item.id}
          activeOpacity={0.82}
          onPress={onPressItem}
          style={styles.taxiCard}
        >
          <View style={styles.taxiInfoRow}>
            <View style={styles.taxiIconBadge}>
              <Icon
                color={V2_COLORS.brand.primary}
                name="bag-handle-outline"
                size={14}
              />
            </View>
            <Text numberOfLines={1} style={styles.taxiRouteText}>
              <Text style={styles.taxiRouteTextStrong}>{item.routeLabel}</Text>
              <Text style={styles.taxiRouteTextMuted}>
                {` · ${item.departureTimeLabel} · ${item.seatStatusLabel}`}
              </Text>
            </Text>
          </View>
          <Icon
            color={V2_COLORS.text.muted}
            name="chevron-forward-outline"
            size={16}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

type CafeteriaCardProps = {
  title: string;
  description: string;
  priceLabel: string;
  onPress: () => void;
};

const CafeteriaCard = ({
  title,
  description,
  priceLabel,
  onPress,
}: CafeteriaCardProps) => {
  if (!title) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>오늘 등록된 학식 메뉴가 없습니다</Text>
        <Text style={styles.emptyDescription}>
          주간메뉴가 올라오면 이 카드에 대표 메뉴를 보여줍니다.
        </Text>
      </View>
    );
  }

  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={styles.card}>
      <View style={styles.cafeteriaCardContent}>
        <View style={styles.cafeteriaIconBox}>
          <Icon color={V2_COLORS.text.inverse} name="restaurant-outline" size={28} />
        </View>
        <View style={styles.cafeteriaTextGroup}>
          <Text numberOfLines={1} style={styles.cafeteriaTitle}>
            {title}
          </Text>
          <Text numberOfLines={1} style={styles.cafeteriaDescription}>
            {description}
          </Text>
          <Text style={styles.cafeteriaPrice}>{priceLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

type AcademicCalendarCardProps = {
  items: CampusAcademicEventViewData[];
  onPressItem: () => void;
};

const AcademicCalendarCard = ({
  items,
  onPressItem,
}: AcademicCalendarCardProps) => {
  if (items.length === 0) {
    return (
      <View style={styles.emptyCard}>
        <Text style={styles.emptyTitle}>예정된 학사일정이 없습니다</Text>
        <Text style={styles.emptyDescription}>
          중요한 학교 일정이 생기면 여기에 정리됩니다.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      {items.map((item, index) => (
        <React.Fragment key={item.id}>
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={onPressItem}
            style={styles.academicRow}
          >
            <View style={styles.academicDateBox}>
              <Text style={styles.academicMonthText}>{item.monthLabel}</Text>
              <Text style={styles.academicDayText}>{item.dayLabel}</Text>
            </View>
            <View style={styles.academicContent}>
              <View style={styles.academicTitleRow}>
                <View style={styles.academicTitleInline}>
                  <Text numberOfLines={1} style={styles.academicTitle}>
                    {item.title}
                  </Text>
                  {item.badge?.placement === 'inline' ? (
                    <EventBadge badge={item.badge} />
                  ) : null}
                </View>
                {item.badge?.placement !== 'inline' && item.badge ? (
                  <EventBadge badge={item.badge} />
                ) : null}
              </View>
              <Text style={styles.academicDateRange}>{item.dateRangeLabel}</Text>
            </View>
          </TouchableOpacity>
          {index < items.length - 1 ? <View style={styles.cardSeparator} /> : null}
        </React.Fragment>
      ))}
    </View>
  );
};

const EventBadge = ({
  badge,
}: {
  badge: CampusAcademicEventBadgeViewData;
}) => {
  const toneColors = getHighlightToneColors(badge.tone);

  return (
    <View
      style={[
        styles.eventBadge,
        { backgroundColor: toneColors.backgroundColor },
      ]}
    >
      <Text style={[styles.eventBadgeLabel, { color: toneColors.textColor }]}>
        {badge.label}
      </Text>
    </View>
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
    fontFamily: Platform.select({
      ios: 'Snell Roundhand',
      android: 'cursive',
      default: undefined,
    }),
    fontSize: 30,
    fontStyle: 'italic',
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 32,
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
  section: {
    marginBottom: V2_SPACING.lg,
    paddingHorizontal: V2_SPACING.lg,
  },
  sectionHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: V2_SPACING.md,
  },
  sectionTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  sectionSubtitle: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  sectionAction: {
    color: V2_COLORS.brand.primary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...V2_SHADOWS.card,
  },
  cardSeparator: {
    backgroundColor: V2_COLORS.border.subtle,
    height: 1,
  },
  stateCard: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: V2_SPACING.xl,
    paddingVertical: V2_SPACING.xxl,
    ...V2_SHADOWS.card,
  },
  stateIcon: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    marginBottom: V2_SPACING.md,
    width: 32,
  },
  stateTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: V2_SPACING.xs,
    textAlign: 'center',
  },
  stateDescription: {
    color: V2_COLORS.text.secondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  stateButton: {
    backgroundColor: V2_COLORS.brand.primaryTint,
    borderRadius: V2_RADIUS.pill,
    marginTop: V2_SPACING.lg,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.sm,
  },
  stateButtonLabel: {
    color: V2_COLORS.brand.primaryStrong,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  emptyCard: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: V2_SPACING.xl,
    paddingVertical: V2_SPACING.xxl,
    ...V2_SHADOWS.card,
  },
  emptyTitle: {
    color: V2_COLORS.text.strong,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: V2_SPACING.xs,
    textAlign: 'center',
  },
  emptyDescription: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  noticeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.md,
    minHeight: 76,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.md,
  },
  noticeDot: {
    backgroundColor: V2_COLORS.brand.primary,
    borderRadius: V2_RADIUS.pill,
    height: 8,
    width: 8,
  },
  noticeContent: {
    flex: 1,
  },
  noticeMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    marginBottom: V2_SPACING.xs,
  },
  noticeCategoryPill: {
    borderRadius: V2_RADIUS.xs,
    paddingHorizontal: V2_SPACING.sm,
    paddingVertical: 2,
  },
  noticeCategoryLabel: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  noticeDate: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  noticeTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  timetableRow: {
    borderBottomColor: V2_COLORS.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: 54,
  },
  timetableRowLast: {
    borderBottomWidth: 0,
  },
  timetableTimelineCell: {
    alignItems: 'center',
    borderColor: V2_COLORS.border.subtle,
    borderRightWidth: 1,
    justifyContent: 'center',
    paddingVertical: V2_SPACING.sm,
    width: 64,
  },
  timetablePeriodLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  timetablePeriodLabelCurrent: {
    color: V2_COLORS.accent.blue,
  },
  timetableTimeLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },
  timetableTimeLabelCurrent: {
    color: V2_COLORS.accent.blue,
  },
  timetableEmptyRowContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: V2_SPACING.lg,
  },
  timetableEmptyDot: {
    backgroundColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.pill,
    height: 4,
    width: 4,
  },
  timetableEmptyRowLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  timetableClassContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: V2_SPACING.md,
    paddingHorizontal: V2_SPACING.md,
    paddingVertical: V2_SPACING.sm,
  },
  timetableAccentBar: {
    borderRadius: V2_RADIUS.pill,
    height: 38,
    width: 4,
  },
  timetableClassTextGroup: {
    flex: 1,
  },
  timetableClassTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: V2_SPACING.sm,
    marginBottom: 2,
  },
  timetableClassTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  timetableMetaText: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  statusPill: {
    borderRadius: V2_RADIUS.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusPillLabel: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 15,
  },
  timetableToggleButton: {
    alignItems: 'center',
    borderColor: V2_COLORS.border.subtle,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: V2_SPACING.lg,
  },
  timetableToggleLabel: {
    color: V2_COLORS.accent.blue,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  timetableEmptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    paddingHorizontal: V2_SPACING.xl,
    paddingVertical: V2_SPACING.xxl,
  },
  timetableEmptyTitle: {
    color: V2_COLORS.text.strong,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginTop: V2_SPACING.sm,
  },
  timetableEmptyDescription: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  stackList: {
    gap: V2_SPACING.md,
  },
  taxiCard: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: 17,
    paddingVertical: 15,
    ...V2_SHADOWS.card,
  },
  taxiInfoRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    marginRight: V2_SPACING.sm,
  },
  taxiIconBadge: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primaryTint,
    borderRadius: V2_RADIUS.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  taxiRouteText: {
    color: V2_COLORS.text.muted,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  taxiRouteTextStrong: {
    color: V2_COLORS.text.primary,
    fontWeight: '600',
  },
  taxiRouteTextMuted: {
    color: V2_COLORS.text.muted,
  },
  cafeteriaCardContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.md,
    padding: V2_SPACING.lg,
  },
  cafeteriaIconBox: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.accent.orange,
    borderRadius: V2_RADIUS.lg,
    height: 60,
    justifyContent: 'center',
    width: 60,
  },
  cafeteriaTextGroup: {
    flex: 1,
  },
  cafeteriaTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 2,
  },
  cafeteriaDescription: {
    color: V2_COLORS.text.secondary,
    fontSize: 13,
    lineHeight: 20,
  },
  cafeteriaPrice: {
    color: V2_COLORS.accent.orange,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: V2_SPACING.xs,
  },
  academicRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.md,
    minHeight: 80,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.lg,
  },
  academicDateBox: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.accent.blueSoft,
    borderRadius: V2_RADIUS.md,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  academicMonthText: {
    color: V2_COLORS.accent.blue,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  academicDayText: {
    color: V2_COLORS.accent.blue,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
  },
  academicContent: {
    flex: 1,
  },
  academicTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  academicTitleInline: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginRight: V2_SPACING.sm,
  },
  academicTitle: {
    color: V2_COLORS.text.primary,
    flexShrink: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  academicDateRange: {
    color: V2_COLORS.text.tertiary,
    fontSize: 12,
    lineHeight: 16,
  },
  eventBadge: {
    borderRadius: V2_RADIUS.xs,
    paddingHorizontal: V2_SPACING.sm,
    paddingVertical: 4,
  },
  eventBadgeLabel: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  quickMenuSection: {
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: 4,
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
    lineHeight: 16,
    textAlign: 'center',
  },
});
