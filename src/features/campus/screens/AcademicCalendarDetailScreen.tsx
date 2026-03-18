import React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, View} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

import type {CampusStackParamList} from '@/app/navigation/types';
import {StateCard} from '@/shared/design-system/components';
import {
  V2_COLORS,
  V2_SPACING,
} from '@/shared/design-system/tokens';
import {normalizeDate} from '@/shared/lib/date';
import {useScreenView} from '@/shared/hooks/useScreenView';

import {AcademicCalendarDetailHeader} from '../components/AcademicCalendarDetailHeader';
import {AcademicCalendarEventCard} from '../components/AcademicCalendarEventCard';
import {AcademicCalendarMonthView} from '../components/AcademicCalendarMonthView';
import {AcademicCalendarWeekView} from '../components/AcademicCalendarWeekView';
import {useAcademicCalendarDetailData} from '../hooks/useAcademicCalendarDetailData';

type AcademicCalendarDetailRouteProp = RouteProp<
  CampusStackParamList,
  'AcademicCalendarDetail'
>;
type AcademicCalendarDetailNavigationProp = NativeStackNavigationProp<
  CampusStackParamList,
  'AcademicCalendarDetail'
>;

export const AcademicCalendarDetailScreen = () => {
  useScreenView();

  const navigation = useNavigation<AcademicCalendarDetailNavigationProp>();
  const route = useRoute<AcademicCalendarDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const cardRefs = React.useRef<Record<string, View | null>>({});
  const hasAutoScrolledRef = React.useRef(false);
  const initialDate = route.params?.initialDate;
  const scheduleId = route.params?.scheduleId;

  const {
    data,
    error,
    findInitialScrollTargetEventId,
    findScrollTargetEventId,
    loading,
    moveNext,
    movePrev,
    reload,
    selectMode,
  } = useAcademicCalendarDetailData(initialDate);

  const scrollToEvent = React.useCallback((eventId: string) => {
    const targetRef = cardRefs.current[eventId];

    if (!targetRef || !scrollViewRef.current) {
      return;
    }

    targetRef.measureLayout(
      scrollViewRef.current as never,
      (_x, y) => {
        scrollViewRef.current?.scrollTo({
          animated: true,
          y: Math.max(0, y - 20),
        });
      },
      () => undefined,
    );
  }, []);

  React.useEffect(() => {
    if (!data || hasAutoScrolledRef.current) {
      return;
    }

    const targetEventId =
      findInitialScrollTargetEventId(scheduleId) ??
      (initialDate
        ? findScrollTargetEventId(normalizeDate(initialDate))
        : undefined);

    if (!targetEventId) {
      return;
    }

    hasAutoScrolledRef.current = true;

    const timeoutId = setTimeout(() => {
      scrollToEvent(targetEventId);
    }, 280);

    return () => clearTimeout(timeoutId);
  }, [
    data,
    findInitialScrollTargetEventId,
    findScrollTargetEventId,
    initialDate,
    scheduleId,
    scrollToEvent,
  ]);

  const handlePressDate = React.useCallback(
    (date: Date) => {
      const targetEventId = findScrollTargetEventId(date);

      if (targetEventId) {
        scrollToEvent(targetEventId);
      }
    },
    [findScrollTargetEventId, scrollToEvent],
  );

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <View style={styles.container}>
        <AcademicCalendarDetailHeader
          currentLabel={data?.currentLabel ?? '학사일정'}
          currentSubLabel={data?.currentSubLabel}
          mode={data?.activeMode ?? 'month'}
          onMoveNext={moveNext}
          onMovePrev={movePrev}
          onPressBack={() => navigation.goBack()}
          onSelectMode={selectMode}
        />

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.content,
            {paddingBottom: insets.bottom + V2_SPACING.xxl},
          ]}
          showsVerticalScrollIndicator={false}>
          {loading && !data ? (
            <StateCard
              description="학사일정을 준비하고 있습니다."
              icon={<ActivityIndicator color={V2_COLORS.brand.primary} />}
              style={styles.stateCard}
              title="학사일정을 불러오는 중"
            />
          ) : null}

          {error && !data ? (
            <StateCard
              actionLabel="다시 시도"
              description={error}
              icon={
                <Icon
                  color={V2_COLORS.accent.orange}
                  name="alert-circle-outline"
                  size={28}
                />
              }
              onPressAction={() => {
                reload().catch(() => undefined);
              }}
              style={styles.stateCard}
              title="학사일정을 불러오지 못했습니다"
            />
          ) : null}

          {data ? (
            <>
              {data.activeMode === 'month' ? (
                <AcademicCalendarMonthView
                  onPressDate={handlePressDate}
                  onPressEvent={scrollToEvent}
                  weeks={data.monthView.weeks}
                />
              ) : (
                <AcademicCalendarWeekView
                  bars={data.weekView.bars}
                  days={data.weekView.days}
                  laneCount={data.weekView.laneCount}
                  onPressDate={handlePressDate}
                  onPressEvent={scrollToEvent}
                />
              )}

              <View style={styles.listHeader}>
                <Text style={styles.listTitle}>{data.listTitle}</Text>
                <Text style={styles.listCount}>{data.countLabel}</Text>
              </View>

              {data.listItems.length > 0 ? (
                <View style={styles.list}>
                  {data.listItems.map((item, index) => (
                    <View
                      key={item.eventId}
                      ref={node => {
                        cardRefs.current[item.eventId] = node;
                      }}
                      collapsable={false}
                      style={index > 0 ? styles.cardGap : undefined}>
                      <AcademicCalendarEventCard item={item} />
                    </View>
                  ))}
                </View>
              ) : (
                <StateCard
                  description="선택한 기간에는 등록된 학사일정이 없습니다."
                  icon={
                    <Icon
                      color={V2_COLORS.text.muted}
                      name="calendar-outline"
                      size={28}
                    />
                  }
                  style={styles.stateCard}
                  title="표시할 일정이 없습니다"
                />
              )}
            </>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  container: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  content: {
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: V2_SPACING.xs,
  },
  stateCard: {
    marginTop: V2_SPACING.xs,
  },
  listHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: V2_SPACING.md,
    marginTop: V2_SPACING.xl,
  },
  listTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  listCount: {
    color: V2_COLORS.brand.logo,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginLeft: 14,
  },
  list: {
    paddingBottom: V2_SPACING.sm,
  },
  cardGap: {
    marginTop: 10,
  },
});
