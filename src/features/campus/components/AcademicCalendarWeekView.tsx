import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View, useWindowDimensions} from 'react-native';

import {
  COLORS,
  RADIUS,
  SHADOWS,
} from '@/shared/design-system/tokens';

import type {
  AcademicCalendarDayCellViewData,
  AcademicCalendarEventBarViewData,
} from '../../model/academicCalendarDetailViewData';

const CALENDAR_HORIZONTAL_PADDING = 16;
const WEEK_BAR_HEIGHT = 12;
const WEEK_BAR_GAP = 4;

const getBarRadiusStyle = (bar: AcademicCalendarEventBarViewData) => {
  if (bar.roundedStart && bar.roundedEnd) {
    return {
      borderRadius: RADIUS.pill,
    };
  }

  return {
    borderBottomLeftRadius: bar.roundedStart ? RADIUS.pill : 0,
    borderBottomRightRadius: bar.roundedEnd ? RADIUS.pill : 0,
    borderTopLeftRadius: bar.roundedStart ? RADIUS.pill : 0,
    borderTopRightRadius: bar.roundedEnd ? RADIUS.pill : 0,
  };
};

interface AcademicCalendarWeekViewProps {
  bars: AcademicCalendarEventBarViewData[];
  days: AcademicCalendarDayCellViewData[];
  laneCount: number;
  onPressDate: (date: Date) => void;
  onPressEvent: (eventId: string) => void;
}

export const AcademicCalendarWeekView = ({
  bars,
  days,
  laneCount,
  onPressDate,
  onPressEvent,
}: AcademicCalendarWeekViewProps) => {
  const {width} = useWindowDimensions();
  const cardWidth = width - CALENDAR_HORIZONTAL_PADDING * 2;
  const cellWidth = cardWidth / 7;
  const contentHeight =
    64 + Math.max(20, laneCount * WEEK_BAR_HEIGHT + Math.max(0, laneCount - 1) * WEEK_BAR_GAP + 12);

  return (
    <View style={[styles.card, {height: contentHeight}]}>
      <View style={styles.dayRow}>
        {days.map(day => (
          <View key={day.id} style={[styles.dayCell, {width: cellWidth}]}>
            <Text
              style={[
                styles.weekdayLabel,
                day.tone === 'sunday' ? styles.sundayText : null,
                day.tone === 'saturday' ? styles.saturdayText : null,
              ]}>
              {day.weekdayLabel}
            </Text>

            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.82}
              onPress={() => onPressDate(new Date(day.isoDate!))}
              style={[
                styles.dayCircle,
                day.isToday ? styles.dayCircleToday : null,
              ]}>
              <Text
                style={[
                  styles.dayLabel,
                  day.tone === 'sunday' ? styles.sundayText : null,
                  day.tone === 'saturday' ? styles.saturdayText : null,
                  day.isToday ? styles.dayLabelToday : null,
                ]}>
                {day.dayNumberLabel}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {bars.map(bar => (
        <TouchableOpacity
          key={bar.id}
          accessibilityRole="button"
          activeOpacity={0.84}
          onPress={() => onPressEvent(bar.eventId)}
          style={[
            styles.weekBar,
            getBarRadiusStyle(bar),
            {
              backgroundColor: bar.barColor,
              left: bar.leftColumn * cellWidth + 4,
              top: 72 + bar.rowIndex * (WEEK_BAR_HEIGHT + WEEK_BAR_GAP),
              width: bar.span * cellWidth - 8,
            },
          ]}>
          <Text numberOfLines={1} style={styles.weekBarLabel}>
            {bar.title}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  dayRow: {
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 64,
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  weekdayLabel: {
    color: COLORS.text.muted,
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 15,
    marginBottom: 4,
  },
  dayCircle: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  dayCircleToday: {
    backgroundColor: COLORS.brand.logo,
  },
  dayLabel: {
    color: COLORS.text.primary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  dayLabelToday: {
    color: COLORS.text.inverse,
  },
  sundayText: {
    color: '#FB7185',
  },
  saturdayText: {
    color: '#60A5FA',
  },
  weekBar: {
    height: WEEK_BAR_HEIGHT,
    justifyContent: 'center',
    paddingHorizontal: 6,
    position: 'absolute',
  },
  weekBarLabel: {
    color: COLORS.text.inverse,
    fontSize: 8,
    fontWeight: '500',
    lineHeight: 8,
  },
});
