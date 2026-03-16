import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';

import {V2_COLORS, V2_RADIUS, V2_SHADOWS, V2_SPACING} from '@/shared/design-system/tokens';

import {TIMETABLE_COURSE_TONES} from '../../model/timetableCourseTones';
import type {
  TimetableDayColumnViewData,
  TimetableGridBlockViewData,
  TimetablePeriodViewData,
} from '../../model/timetableDetailViewData';

interface TimetableAllViewCardProps {
  blocks: TimetableGridBlockViewData[];
  columns: TimetableDayColumnViewData[];
  onPressBlock: (courseId: string) => void;
  periods: TimetablePeriodViewData[];
}

const CARD_HORIZONTAL_PADDING = V2_SPACING.lg;
const GRID_HEADER_HEIGHT = 28;
const TIME_COLUMN_WIDTH = 52;
const GRID_GAP = V2_SPACING.sm;
const PERIOD_ROW_HEIGHT = 68;

export const TimetableAllViewCard = ({
  blocks,
  columns,
  onPressBlock,
  periods,
}: TimetableAllViewCardProps) => {
  const {width} = useWindowDimensions();
  const contentWidth = width - V2_SPACING.lg * 2 - CARD_HORIZONTAL_PADDING * 2;
  const gridWidth = contentWidth - TIME_COLUMN_WIDTH - GRID_GAP;
  const columnWidth =
    (gridWidth - GRID_GAP * Math.max(columns.length - 1, 0)) / columns.length;
  const totalGridHeight =
    periods.length * PERIOD_ROW_HEIGHT + GRID_GAP * Math.max(periods.length - 1, 0);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{width: TIME_COLUMN_WIDTH}} />
        <View style={styles.daysRow}>
          {columns.map(column => (
            <View
              key={column.id}
              style={[styles.dayCell, {width: Math.max(columnWidth, 0)}]}>
              <Text style={styles.dayLabel}>{column.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.body}>
        <View style={[styles.timeColumn, {width: TIME_COLUMN_WIDTH}]}>
          {periods.map(period => (
            <View
              key={period.id}
              style={[
                styles.timeCell,
                {height: PERIOD_ROW_HEIGHT, marginBottom: GRID_GAP},
              ]}>
              <Text style={styles.periodLabel}>{period.periodNumber}</Text>
              <Text style={styles.timeLabel}>{period.startTimeLabel}</Text>
              <Text style={styles.timeLabel}>{period.endTimeLabel}</Text>
            </View>
          ))}
        </View>

        <View style={[styles.grid, {height: totalGridHeight}]}>
          {columns.map((column, index) => (
            <View
              key={column.id}
              style={[
                styles.columnLane,
                {
                  height: totalGridHeight,
                  left: index * (columnWidth + GRID_GAP),
                  width: Math.max(columnWidth, 0),
                },
              ]}
            />
          ))}

          {periods.map((period, index) => (
            <View
              key={period.id}
              style={[
                styles.rowDivider,
                {
                  top:
                    index * (PERIOD_ROW_HEIGHT + GRID_GAP) + PERIOD_ROW_HEIGHT,
                },
              ]}
            />
          ))}

          {blocks.map(block => {
            const tone = TIMETABLE_COURSE_TONES[block.toneId];
            const columnIndex = columns.findIndex(column => column.id === block.weekdayId);
            const rowSpan = block.endPeriod - block.startPeriod + 1;
            const blockCardStyle = {
              backgroundColor: tone.softBackground,
              borderColor: block.selected ? tone.accent : 'transparent',
              height:
                rowSpan * PERIOD_ROW_HEIGHT +
                GRID_GAP * Math.max(rowSpan - 1, 0),
              left: columnIndex * (columnWidth + GRID_GAP),
              top:
                (block.startPeriod - 1) * (PERIOD_ROW_HEIGHT + GRID_GAP),
              width: Math.max(columnWidth, 0),
            };

            if (columnIndex < 0) {
              return null;
            }

            return (
              <TouchableOpacity
                key={block.id}
                accessibilityRole="button"
                activeOpacity={0.9}
                onPress={() => onPressBlock(block.courseId)}
                style={[styles.block, blockCardStyle]}>
                <View
                  style={[styles.blockAccent, {backgroundColor: tone.accent}]}
                />
                <Text numberOfLines={2} style={[styles.blockTitle, {color: tone.text}]}>
                  {block.title}
                </Text>
                {block.roomLabel ? (
                  <Text numberOfLines={1} style={styles.blockSubtitle}>
                    {block.roomLabel}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: 28,
    padding: CARD_HORIZONTAL_PADDING,
    ...V2_SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    marginBottom: V2_SPACING.sm,
  },
  daysRow: {
    flexDirection: 'row',
    flex: 1,
    gap: GRID_GAP,
    height: GRID_HEADER_HEIGHT,
  },
  dayCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayLabel: {
    color: V2_COLORS.text.secondary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  body: {
    flexDirection: 'row',
  },
  timeColumn: {
    paddingRight: GRID_GAP,
  },
  timeCell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodLabel: {
    color: V2_COLORS.text.primary,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 20,
    marginBottom: 4,
  },
  timeLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 10,
    lineHeight: 14,
  },
  grid: {
    flex: 1,
    position: 'relative',
  },
  columnLane: {
    backgroundColor: V2_COLORS.background.page,
    borderRadius: 18,
    position: 'absolute',
    top: 0,
  },
  rowDivider: {
    backgroundColor: 'rgba(229, 231, 235, 0.72)',
    height: 1,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  block: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: V2_SPACING.md,
    position: 'absolute',
  },
  blockAccent: {
    borderRadius: V2_RADIUS.pill,
    height: 4,
    marginBottom: V2_SPACING.sm,
    width: 26,
  },
  blockTitle: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  blockSubtitle: {
    color: V2_COLORS.text.secondary,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 6,
  },
});
