import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

import type {
  CampusTimetableEmptyStateViewData,
  CampusTimetablePeriodViewData,
  CampusTimetableSessionViewData,
} from '../model/campusHome';
import {getHighlightToneColors} from '../utils/campusTone';
import {
  buildVisibleTimetableRows,
  TIMETABLE_ROW_HEIGHT,
} from '../utils/campusTimetablePreview';

const TIMETABLE_EXPAND_LABEL = '야간수업 펼치기';
const TIMETABLE_COLLAPSE_LABEL = '야간수업 접기';

type CampusTimetablePreviewCardProps = {
  periods: CampusTimetablePeriodViewData[];
  sessions: CampusTimetableSessionViewData[];
  collapsedVisibleCount: number;
  emptyState?: CampusTimetableEmptyStateViewData;
};

export const CampusTimetablePreviewCard = ({
  periods,
  sessions,
  collapsedVisibleCount,
  emptyState,
}: CampusTimetablePreviewCardProps) => {
  const canExpandTimetable = React.useMemo(
    () => !emptyState && periods.length > collapsedVisibleCount,
    [collapsedVisibleCount, emptyState, periods.length],
  );

  const shouldAutoExpandTimetable = React.useMemo(
    () =>
      sessions.some(
        session =>
          session.startPeriod <= collapsedVisibleCount &&
          session.endPeriod > collapsedVisibleCount,
      ),
    [collapsedVisibleCount, sessions],
  );

  const timetableStateKey = React.useMemo(
    () =>
      sessions
        .map(
          session => `${session.id}:${session.startPeriod}-${session.endPeriod}`,
        )
        .join('|'),
    [sessions],
  );

  const [isExpanded, setIsExpanded] = React.useState(shouldAutoExpandTimetable);

  React.useEffect(() => {
    setIsExpanded(shouldAutoExpandTimetable);
  }, [shouldAutoExpandTimetable, timetableStateKey]);

  if (emptyState || periods.length === 0) {
    return (
      <View style={[styles.card, styles.emptyCard]}>
        <Icon color={COLORS.accent.orange} name="sunny-outline" size={34} />
        <Text style={styles.emptyTitle}>
          {emptyState?.title ?? '오늘 시간표가 없습니다'}
        </Text>
        <Text style={styles.emptyDescription}>
          {emptyState?.description ?? '등록된 시간표 정보가 없습니다.'}
        </Text>
      </View>
    );
  }

  const visibleEndPeriod =
    isExpanded || !canExpandTimetable
      ? periods[periods.length - 1]?.periodNumber ?? collapsedVisibleCount
      : collapsedVisibleCount;

  const rows = buildVisibleTimetableRows({
    periods,
    sessions,
    visibleEndPeriod,
  });

  return (
    <View style={styles.card}>
      {rows.map((row, index) => {
        if (row.type === 'empty') {
          return (
            <View
              key={row.period.id}
              style={[
                styles.row,
                styles.emptyRow,
                index === rows.length - 1 && !canExpandTimetable
                  ? styles.rowLast
                  : null,
              ]}>
              <View style={styles.timelineCell}>
                <Text style={styles.periodLabel}>{row.period.periodLabel}</Text>
                <Text style={styles.timeLabel}>{row.period.startTimeLabel}</Text>
              </View>
              <View style={styles.emptyRowContent}>
                <View style={styles.emptyDot} />
                <Text style={styles.emptyRowLabel}>수업 없음</Text>
              </View>
            </View>
          );
        }

        const toneColors = row.session.tone
          ? getHighlightToneColors(row.session.tone)
          : undefined;
        const rowHeight = row.renderedSpan * TIMETABLE_ROW_HEIGHT;

        return (
          <View
            key={`${row.session.id}-${row.period.periodNumber}`}
            style={[
              styles.row,
              styles.sessionRow,
              {
                backgroundColor: toneColors?.backgroundColor,
                height: rowHeight,
              },
              index === rows.length - 1 && !canExpandTimetable
                ? styles.rowLast
                : null,
            ]}>
            <View
              style={[
                styles.timelineCell,
                row.renderedSpan > 1 ? styles.timelineCellSpanned : null,
              ]}>
              <View style={styles.timelineTop}>
                <Text
                  style={[
                    styles.periodLabel,
                    row.session.isCurrent ? styles.currentText : null,
                  ]}>
                  {row.period.periodLabel}
                </Text>
                <Text
                  style={[
                    styles.timeLabel,
                    row.session.isCurrent ? styles.currentText : null,
                  ]}>
                  {row.period.startTimeLabel}
                </Text>
              </View>
              {row.endTimeLabel ? (
                <Text
                  style={[
                    styles.timeLabelBottom,
                    row.session.isCurrent ? styles.currentText : null,
                  ]}>
                  {row.endTimeLabel}
                </Text>
              ) : null}
            </View>
            <View style={styles.classContent}>
              <View
                style={[
                  styles.accentBar,
                  {backgroundColor: toneColors?.accentColor},
                ]}
              />
              <View style={styles.classTextGroup}>
                <View style={styles.classTitleRow}>
                  <Text numberOfLines={1} style={styles.classTitle}>
                    {row.session.title}
                  </Text>
                  {row.session.status ? (
                    <View
                      style={[
                        styles.statusPill,
                        {
                          backgroundColor: getHighlightToneColors(
                            row.session.status.tone,
                          ).backgroundColor,
                        },
                      ]}>
                      <Text
                        style={[
                          styles.statusPillLabel,
                          {
                            color: getHighlightToneColors(
                              row.session.status.tone,
                            ).textColor,
                          },
                        ]}>
                        {row.session.status.label}
                      </Text>
                    </View>
                  ) : null}
                </View>
                <Text numberOfLines={1} style={styles.metaText}>
                  {row.session.instructorLabel}
                  {row.session.roomLabel ? ` · ${row.session.roomLabel}` : ''}
                </Text>
              </View>
            </View>
          </View>
        );
      })}
      {canExpandTimetable ? (
        <TouchableOpacity
          activeOpacity={0.82}
          onPress={() => {
            setIsExpanded(previous => !previous);
          }}
          style={styles.toggleButton}>
          <Icon color={COLORS.accent.blue} name="moon-outline" size={16} />
          <Text style={styles.toggleLabel}>
            {isExpanded ? TIMETABLE_COLLAPSE_LABEL : TIMETABLE_EXPAND_LABEL}
          </Text>
          <Icon
            color={COLORS.accent.blue}
            name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={16}
          />
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
  },
  emptyTitle: {
    color: COLORS.text.strong,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginTop: SPACING.sm,
  },
  emptyDescription: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  row: {
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    minHeight: TIMETABLE_ROW_HEIGHT,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  emptyRow: {
    backgroundColor: COLORS.background.surface,
  },
  sessionRow: {},
  timelineCell: {
    alignItems: 'center',
    borderColor: COLORS.border.subtle,
    borderRightWidth: 1,
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    width: 64,
  },
  timelineCellSpanned: {
    justifyContent: 'space-between',
  },
  timelineTop: {
    alignItems: 'center',
  },
  periodLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  timeLabel: {
    color: COLORS.text.muted,
    fontSize: 10,
    lineHeight: 15,
    marginTop: 2,
  },
  currentText: {
    color: COLORS.accent.blue,
  },
  timeLabelBottom: {
    color: COLORS.accent.blue,
    fontSize: 10,
    lineHeight: 15,
  },
  emptyRowContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: SPACING.lg,
  },
  emptyDot: {
    backgroundColor: COLORS.border.default,
    borderRadius: RADIUS.pill,
    height: 4,
    width: 4,
  },
  emptyRowLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  classContent: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  accentBar: {
    alignSelf: 'stretch',
    borderRadius: RADIUS.pill,
    marginVertical: 2,
    width: 4,
  },
  classTextGroup: {
    flex: 1,
  },
  classTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    marginBottom: 2,
  },
  classTitle: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  metaText: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  statusPill: {
    borderRadius: RADIUS.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusPillLabel: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 15,
  },
  toggleButton: {
    alignItems: 'center',
    borderColor: COLORS.border.subtle,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: SPACING.lg,
  },
  toggleLabel: {
    color: COLORS.accent.blue,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
