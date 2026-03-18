import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';
import {
  SegmentedControl,
  type SegmentedControlItem,
} from '@/shared/design-system/components';

import type {AcademicCalendarDetailViewMode} from '../../model/academicCalendarDetailViewData';

const MODE_ITEMS: SegmentedControlItem<AcademicCalendarDetailViewMode>[] = [
  {id: 'month', label: '월간'},
  {id: 'week', label: '주간'},
];

interface AcademicCalendarDetailHeaderProps {
  currentLabel: string;
  currentSubLabel?: string;
  mode: AcademicCalendarDetailViewMode;
  onMoveNext: () => void;
  onMovePrev: () => void;
  onPressBack: () => void;
  onSelectMode: (mode: AcademicCalendarDetailViewMode) => void;
}

export const AcademicCalendarDetailHeader = ({
  currentLabel,
  currentSubLabel,
  mode,
  onMoveNext,
  onMovePrev,
  onPressBack,
  onSelectMode,
}: AcademicCalendarDetailHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.topBar,
          {
            paddingTop: insets.top,
          },
        ]}>
        <View style={styles.topBarRow}>
          <TouchableOpacity
            accessibilityLabel="뒤로 가기"
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={onPressBack}
            style={styles.backButton}>
            <Icon color={COLORS.text.primary} name="arrow-back" size={22} />
          </TouchableOpacity>

          <Text style={styles.screenTitle}>학사일정</Text>
        </View>
      </View>

      <View style={styles.content}>
        <SegmentedControl
          height={40}
          isRounded={true}
          items={MODE_ITEMS}
          onSelect={onSelectMode}
          selectedId={mode}
          style={styles.segmentedControl}
          variant="surface"
        />

        <View style={styles.periodRow}>
          <TouchableOpacity
            accessibilityLabel="이전 기간"
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={onMovePrev}
            style={styles.periodButton}>
            <Icon
              color={COLORS.text.secondary}
              name="chevron-back"
              size={18}
            />
          </TouchableOpacity>

          <View style={styles.periodLabelWrap}>
            <Text style={styles.periodLabel}>{currentLabel}</Text>
            {currentSubLabel ? (
              <Text style={styles.periodSubLabel}>{currentSubLabel}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            accessibilityLabel="다음 기간"
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={onMoveNext}
            style={styles.periodButton}>
            <Icon
              color={COLORS.text.secondary}
              name="chevron-forward"
              size={18}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.page,
  },
  topBar: {
    backgroundColor: COLORS.background.surface,
    borderBottomColor: COLORS.border.default,
    borderBottomWidth: 1,
  },
  topBarRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    height: 56,
    paddingHorizontal: SPACING.lg,
  },
  backButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  screenTitle: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  segmentedControl: {
    marginBottom: SPACING.lg,
  },
  periodRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: SPACING.md,
  },
  periodButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
    ...SHADOWS.card,
  },
  periodLabelWrap: {
    alignItems: 'center',
    flex: 1,
  },
  periodLabel: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  periodSubLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
});
