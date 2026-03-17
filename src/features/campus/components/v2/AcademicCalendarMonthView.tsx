import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View, useWindowDimensions} from 'react-native';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
} from '@/shared/design-system/tokens';

import type {
  AcademicCalendarEventBarViewData,
  AcademicCalendarMonthWeekViewData,
} from '../../model/academicCalendarDetailViewData';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const CALENDAR_HORIZONTAL_PADDING = 16;
const MONTH_DAY_HEIGHT = 36;
const MONTH_BAR_HEIGHT = 12;
const MONTH_BAR_GAP = 2;
const MONTH_BASE_WEEK_HEIGHT = 52;

const getBarRadiusStyle = (bar: AcademicCalendarEventBarViewData) => {
  if (bar.roundedStart && bar.roundedEnd) {
    return {
      borderRadius: V2_RADIUS.pill,
    };
  }

  return {
    borderBottomLeftRadius: bar.roundedStart ? V2_RADIUS.pill : 0,
    borderBottomRightRadius: bar.roundedEnd ? V2_RADIUS.pill : 0,
    borderTopLeftRadius: bar.roundedStart ? V2_RADIUS.pill : 0,
    borderTopRightRadius: bar.roundedEnd ? V2_RADIUS.pill : 0,
  };
};

interface AcademicCalendarMonthViewProps {
  onPressDate: (date: Date) => void;
  onPressEvent: (eventId: string) => void;
  weeks: AcademicCalendarMonthWeekViewData[];
}

export const AcademicCalendarMonthView = ({
  onPressDate,
  onPressEvent,
  weeks,
}: AcademicCalendarMonthViewProps) => {
  const {width} = useWindowDimensions();
  const cardWidth = width - CALENDAR_HORIZONTAL_PADDING * 2;
  const cellWidth = cardWidth / 7;

  return (
    <View style={styles.card}>
      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label, index) => (
          <View key={label} style={[styles.weekdayCell, {width: cellWidth}]}>
            <Text
              style={[
                styles.weekdayLabel,
                index === 0 ? styles.sundayText : null,
                index === 6 ? styles.saturdayText : null,
              ]}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      {weeks.map((week, weekIndex) => {
        const weekHeight =
          MONTH_BASE_WEEK_HEIGHT + week.laneCount * (MONTH_BAR_HEIGHT + MONTH_BAR_GAP);

        return (
          <View
            key={week.id}
            style={[
              styles.weekSection,
              weekIndex < weeks.length - 1 ? styles.weekDivider : null,
              {height: weekHeight},
            ]}>
            <View style={styles.dateRow}>
              {week.days.map(day => {
                const content = (
                  <View
                    style={[
                      styles.dayCircle,
                      day.isToday ? styles.dayCircleToday : null,
                    ]}>
                    {day.dayNumberLabel ? (
                      <Text
                        style={[
                          styles.dayLabel,
                          day.tone === 'sunday' ? styles.sundayText : null,
                          day.tone === 'saturday' ? styles.saturdayText : null,
                          day.isToday ? styles.dayLabelToday : null,
                        ]}>
                        {day.dayNumberLabel}
                      </Text>
                    ) : null}
                  </View>
                );

                return (
                  <View key={day.id} style={[styles.dayCell, {width: cellWidth}]}>
                    {day.isoDate ? (
                      <TouchableOpacity
                        accessibilityRole="button"
                        activeOpacity={0.82}
                        onPress={() => onPressDate(new Date(day.isoDate!))}>
                        {content}
                      </TouchableOpacity>
                    ) : (
                      content
                    )}
                  </View>
                );
              })}
            </View>

            {week.bars.map(bar => (
              <TouchableOpacity
                key={bar.id}
                accessibilityRole="button"
                activeOpacity={0.84}
                onPress={() => onPressEvent(bar.eventId)}
                style={[
                  styles.monthBar,
                  getBarRadiusStyle(bar),
                  {
                    backgroundColor: bar.barColor,
                    left: bar.leftColumn * cellWidth + 2,
                    top: 42 + bar.rowIndex * (MONTH_BAR_HEIGHT + MONTH_BAR_GAP),
                    width: bar.span * cellWidth - 4,
                  },
                ]}>
                <Text numberOfLines={1} style={styles.monthBarLabel}>
                  {bar.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.lg,
    overflow: 'hidden',
    ...V2_SHADOWS.card,
  },
  weekdayRow: {
    borderBottomColor: V2_COLORS.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 32,
  },
  weekdayCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdayLabel: {
    color: V2_COLORS.text.tertiary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  weekSection: {
    position: 'relative',
  },
  weekDivider: {
    borderBottomColor: V2_COLORS.background.page,
    borderBottomWidth: 1,
  },
  dateRow: {
    flexDirection: 'row',
    height: MONTH_DAY_HEIGHT,
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircle: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  dayCircleToday: {
    backgroundColor: V2_COLORS.brand.logo,
  },
  dayLabel: {
    color: V2_COLORS.text.primary,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  dayLabelToday: {
    color: V2_COLORS.text.inverse,
    fontWeight: '700',
  },
  sundayText: {
    color: '#FB7185',
  },
  saturdayText: {
    color: '#60A5FA',
  },
  monthBar: {
    alignItems: 'flex-start',
    height: MONTH_BAR_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    position: 'absolute',
  },
  monthBarLabel: {
    color: V2_COLORS.text.inverse,
    fontSize: 8,
    fontWeight: '500',
    lineHeight: 8,
  },
});
