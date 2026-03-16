import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View, useWindowDimensions} from 'react-native';

import {V2_COLORS, V2_SHADOWS} from '@/shared/design-system/tokens';

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

const HEADER_HEIGHT = 37;
const ROW_HEIGHT = 44;
const CARD_HORIZONTAL_MARGIN = 8;
const CARD_RADIUS = 16;
const BLOCK_INSET_X = 2;
const BLOCK_INSET_Y = 2;
const BLOCK_RADIUS = 8;

export const TimetableAllViewCard = ({
  blocks,
  columns,
  onPressBlock,
  periods,
}: TimetableAllViewCardProps) => {
  const {width} = useWindowDimensions();
  const cardWidth = width - CARD_HORIZONTAL_MARGIN * 2;
  const columnWidth = cardWidth / (columns.length + 1);
  const cardHeight = HEADER_HEIGHT + periods.length * ROW_HEIGHT;

  return (
    <View style={[styles.card, {height: cardHeight, width: cardWidth}]}>
      <View style={[styles.gridLineHorizontal, {top: HEADER_HEIGHT - 1, width: cardWidth}]} />

      {Array.from({length: columns.length + 1}).map((_, index) => (
        <View
          key={`col-${index}`}
          style={[
            styles.gridLineVertical,
            {
              height: cardHeight - HEADER_HEIGHT,
              left: columnWidth * index,
              top: HEADER_HEIGHT,
            },
          ]}
        />
      ))}

      {periods.map((period, index) => (
        <View
          key={`row-${period.id}`}
          style={[
            styles.gridLineHorizontal,
            {
              top: HEADER_HEIGHT + index * ROW_HEIGHT,
              width: cardWidth,
            },
          ]}
        />
      ))}

      <View style={styles.headerRow}>
        <View style={[styles.headerCell, {width: columnWidth}]}>
          <Text style={styles.axisLabel}>교시</Text>
        </View>
        {columns.map(column => (
          <View
            key={column.id}
            style={[styles.headerCell, {width: columnWidth}]}>
            <Text style={styles.dayLabel}>{column.label}</Text>
          </View>
        ))}
      </View>

      {periods.map((period, index) => (
        <View
          key={period.id}
          style={[
            styles.timeCell,
            {
              height: ROW_HEIGHT,
              top: HEADER_HEIGHT + index * ROW_HEIGHT,
              width: columnWidth,
            },
          ]}>
          <Text style={styles.periodIndex}>{period.periodNumber}</Text>
          <Text style={styles.periodTime}>{period.startTimeLabel}</Text>
        </View>
      ))}

      {blocks.map(block => {
        const tone = TIMETABLE_COURSE_TONES[block.toneId];
        const dayIndex = columns.findIndex(column => column.id === block.weekdayId);
        const rowSpan = block.endPeriod - block.startPeriod + 1;
        const showSubtitle = rowSpan > 1 && Boolean(block.roomLabel);

        if (dayIndex < 0) {
          return null;
        }

        return (
          <TouchableOpacity
            key={block.id}
            accessibilityRole="button"
            activeOpacity={0.9}
            onPress={() => onPressBlock(block.courseId)}
            style={[
              styles.block,
              {
                backgroundColor: tone.softBackground,
                height: rowSpan * ROW_HEIGHT - BLOCK_INSET_Y * 2,
                left:
                  columnWidth +
                  dayIndex * columnWidth +
                  BLOCK_INSET_X,
                top:
                  HEADER_HEIGHT +
                  (block.startPeriod - 1) * ROW_HEIGHT +
                  BLOCK_INSET_Y,
                width: columnWidth - BLOCK_INSET_X * 2 - 1,
              },
            ]}>
            <Text
              numberOfLines={showSubtitle ? 2 : 3}
              style={[styles.blockTitle, {color: tone.text}]}>
              {block.title}
            </Text>
            {showSubtitle ? (
              <Text numberOfLines={1} style={[styles.blockSubtitle, {color: tone.text}]}>
                {block.roomLabel}
              </Text>
            ) : null}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignSelf: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    position: 'relative',
    ...V2_SHADOWS.card,
  },
  headerRow: {
    flexDirection: 'row',
    height: HEADER_HEIGHT,
  },
  headerCell: {
    alignItems: 'center',
    height: HEADER_HEIGHT,
    justifyContent: 'center',
  },
  axisLabel: {
    color: '#D1D5DB',
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 15,
  },
  dayLabel: {
    color: V2_COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  timeCell: {
    alignItems: 'center',
    justifyContent: 'center',
    left: 0,
    position: 'absolute',
  },
  periodIndex: {
    color: '#D1D5DB',
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 15,
  },
  periodTime: {
    color: '#E5E7EB',
    fontSize: 8,
    lineHeight: 12,
    marginTop: 2,
  },
  gridLineHorizontal: {
    backgroundColor: '#F9FAFB',
    height: 1,
    left: 0,
    position: 'absolute',
  },
  gridLineVertical: {
    backgroundColor: '#F9FAFB',
    position: 'absolute',
    width: 1,
  },
  block: {
    alignItems: 'center',
    borderRadius: BLOCK_RADIUS,
    justifyContent: 'center',
    paddingHorizontal: 2,
    position: 'absolute',
  },
  blockTitle: {
    fontSize: 9,
    fontWeight: '700',
    lineHeight: 11,
    textAlign: 'center',
  },
  blockSubtitle: {
    fontSize: 8,
    lineHeight: 10,
    marginTop: 2,
    opacity: 0.7,
    textAlign: 'center',
  },
});
