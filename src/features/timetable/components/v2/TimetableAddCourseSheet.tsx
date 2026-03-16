import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2FilterChips,
  V2SegmentedControl,
  type V2SegmentedControlItem,
} from '@/shared/design-system/components';
import {V2_COLORS, V2_RADIUS, V2_SPACING} from '@/shared/design-system/tokens';

import {TIMETABLE_COURSE_TONES} from '../../model/timetableCourseTones';
import type {
  TimetableAddCourseSheetViewData,
  TimetableCourseToneId,
  TimetableManualDayOptionViewData,
} from '../../model/timetableDetailViewData';
import {TimetableBottomSheet} from './TimetableBottomSheet';

interface TimetableAddCourseSheetProps {
  data: TimetableAddCourseSheetViewData;
  onAddCatalogCourse: (courseId: string) => void;
  onClose: () => void;
  onSelectColor: (colorId: TimetableCourseToneId) => void;
  onSelectCredits: (credits: number) => void;
  onSelectDay: (day: TimetableManualDayOptionViewData['id']) => void;
  onSetManualEndPeriod: (delta: -1 | 1) => void;
  onSetManualField: (
    field: 'locationLabel' | 'name' | 'professor',
    value: string,
  ) => void;
  onSetManualOnline: (enabled: boolean) => void;
  onSetManualStartPeriod: (delta: -1 | 1) => void;
  onSubmitManualCourse: () => void;
  onSwitchTab: (tab: 'manual' | 'search') => void;
  onUpdateQuery: (query: string) => void;
  visible: boolean;
}

const TAB_ITEMS: V2SegmentedControlItem<'manual' | 'search'>[] = [
  {id: 'search', label: '강의 검색'},
  {id: 'manual', label: '직접 입력'},
];

export const TimetableAddCourseSheet = ({
  data,
  onAddCatalogCourse,
  onClose,
  onSelectColor,
  onSelectCredits,
  onSelectDay,
  onSetManualEndPeriod,
  onSetManualField,
  onSetManualOnline,
  onSetManualStartPeriod,
  onSubmitManualCourse,
  onSwitchTab,
  onUpdateQuery,
  visible,
}: TimetableAddCourseSheetProps) => {
  const dayItems = data.manual.dayOptions.map(option => ({
    id: option.id,
    label: option.label,
    selected: option.selected,
  }));
  const creditItems = data.manual.credits.map(option => ({
    id: String(option.id),
    label: option.label,
    selected: option.selected,
  }));

  return (
    <TimetableBottomSheet onClose={onClose} visible={visible}>
      <Text style={styles.title}>수업 추가</Text>
      <Text style={styles.subtitle}>
        시간표에 강의를 더하고 블록 색상을 미리 선택할 수 있어요.
      </Text>

      <V2SegmentedControl
        items={TAB_ITEMS}
        onSelect={onSwitchTab}
        selectedId={data.activeTab}
        style={styles.segmentedControl}
        variant="surface"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>블록 색상</Text>
          <View style={styles.colorsRow}>
            {data.colors.map(color => {
              const tone = TIMETABLE_COURSE_TONES[color.id];

              return (
                <TouchableOpacity
                  key={color.id}
                  accessibilityRole="button"
                  activeOpacity={0.88}
                  onPress={() => onSelectColor(color.id)}
                  style={[
                    styles.colorOption,
                    {backgroundColor: tone.pillBackground},
                    color.selected ? {borderColor: tone.accent} : null,
                  ]}>
                  <View
                    style={[
                      styles.colorSwatch,
                      {backgroundColor: tone.accent},
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {data.activeTab === 'search' ? (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>강의 검색</Text>
              <View style={styles.searchInputWrapper}>
                <Icon
                  color={V2_COLORS.text.muted}
                  name="search-outline"
                  size={18}
                />
                <TextInput
                  onChangeText={onUpdateQuery}
                  placeholder={data.search.placeholder}
                  placeholderTextColor={V2_COLORS.text.muted}
                  style={styles.searchInput}
                  value={data.search.query}
                />
              </View>
            </View>

            <View style={styles.list}>
              {data.search.items.map(item => (
                <View key={item.courseId} style={styles.catalogCard}>
                  <View style={styles.catalogCopy}>
                    <Text numberOfLines={1} style={styles.catalogTitle}>
                      {item.title}
                    </Text>
                    <Text numberOfLines={1} style={styles.catalogCode}>
                      {item.codeLabel}
                    </Text>
                    <Text numberOfLines={2} style={styles.catalogMeta}>
                      {item.metaLabel}
                    </Text>
                  </View>

                  <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={0.88}
                    disabled={item.alreadyAdded}
                    onPress={() => onAddCatalogCourse(item.courseId)}
                    style={[
                      styles.catalogAction,
                      item.alreadyAdded
                        ? styles.catalogActionDisabled
                        : styles.catalogActionEnabled,
                    ]}>
                    <Text
                      style={[
                        styles.catalogActionLabel,
                        item.alreadyAdded
                          ? styles.catalogActionLabelDisabled
                          : styles.catalogActionLabelEnabled,
                      ]}>
                      {item.alreadyAdded ? '추가됨' : '추가'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {data.search.emptyLabel ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyLabel}>{data.search.emptyLabel}</Text>
              </View>
            ) : null}
          </>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>강의명</Text>
              <TextInput
                onChangeText={value => onSetManualField('name', value)}
                placeholder="예: 운영체제"
                placeholderTextColor={V2_COLORS.text.muted}
                style={styles.textField}
                value={data.manual.nameValue}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>담당 교수</Text>
              <TextInput
                onChangeText={value => onSetManualField('professor', value)}
                placeholder="예: 이서현"
                placeholderTextColor={V2_COLORS.text.muted}
                style={styles.textField}
                value={data.manual.professorValue}
              />
            </View>

            <View style={styles.switchCard}>
              <View>
                <Text style={styles.switchTitle}>온라인 수업</Text>
                <Text style={styles.switchDescription}>
                  온라인 수업이면 강의실 없이 추가합니다.
                </Text>
              </View>
              <Switch
                onValueChange={onSetManualOnline}
                thumbColor={V2_COLORS.background.surface}
                trackColor={{
                  false: V2_COLORS.border.default,
                  true: V2_COLORS.brand.primary,
                }}
                value={data.manual.isOnline}
              />
            </View>

            {!data.manual.isOnline ? (
              <>
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>강의실</Text>
                  <TextInput
                    onChangeText={value => onSetManualField('locationLabel', value)}
                    placeholder="예: 공학관 302"
                    placeholderTextColor={V2_COLORS.text.muted}
                    style={styles.textField}
                    value={data.manual.locationValue}
                  />
                </View>

                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>요일</Text>
                  <ScrollView
                    horizontal
                    keyboardShouldPersistTaps="handled"
                    showsHorizontalScrollIndicator={false}>
                    <V2FilterChips
                      inactiveVariant="surface"
                      items={dayItems}
                      onPressItem={onSelectDay}
                      style={styles.inlineChips}
                    />
                  </ScrollView>
                </View>

                <View style={styles.stepperGrid}>
                  <StepperCard
                    label="시작 교시"
                    onDecrease={() => onSetManualStartPeriod(-1)}
                    onIncrease={() => onSetManualStartPeriod(1)}
                    valueLabel={data.manual.startPeriod.label}
                    canDecrease={data.manual.startPeriod.canDecrease}
                    canIncrease={data.manual.startPeriod.canIncrease}
                  />
                  <StepperCard
                    label="종료 교시"
                    onDecrease={() => onSetManualEndPeriod(-1)}
                    onIncrease={() => onSetManualEndPeriod(1)}
                    valueLabel={data.manual.endPeriod.label}
                    canDecrease={data.manual.endPeriod.canDecrease}
                    canIncrease={data.manual.endPeriod.canIncrease}
                  />
                </View>
              </>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>학점</Text>
              <ScrollView
                horizontal
                keyboardShouldPersistTaps="handled"
                showsHorizontalScrollIndicator={false}>
                <V2FilterChips
                  inactiveVariant="surface"
                  items={creditItems}
                  onPressItem={value => onSelectCredits(Number(value))}
                  style={styles.inlineChips}
                />
              </ScrollView>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.9}
              disabled={!data.manual.canSubmit}
              onPress={onSubmitManualCourse}
              style={[
                styles.submitButton,
                data.manual.canSubmit
                  ? styles.submitButtonEnabled
                  : styles.submitButtonDisabled,
              ]}>
              <Text
                style={[
                  styles.submitLabel,
                  data.manual.canSubmit
                    ? styles.submitLabelEnabled
                    : styles.submitLabelDisabled,
                ]}>
                직접 입력 강의 추가
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </TimetableBottomSheet>
  );
};

const StepperCard = ({
  canDecrease,
  canIncrease,
  label,
  onDecrease,
  onIncrease,
  valueLabel,
}: {
  canDecrease: boolean;
  canIncrease: boolean;
  label: string;
  onDecrease: () => void;
  onIncrease: () => void;
  valueLabel: string;
}) => {
  return (
    <View style={styles.stepperCard}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <View style={styles.stepperControls}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.85}
          disabled={!canDecrease}
          onPress={onDecrease}
          style={[
            styles.stepperButton,
            !canDecrease ? styles.stepperButtonDisabled : null,
          ]}>
          <Icon color={V2_COLORS.text.primary} name="remove" size={18} />
        </TouchableOpacity>

        <Text style={styles.stepperValue}>{valueLabel}</Text>

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.85}
          disabled={!canIncrease}
          onPress={onIncrease}
          style={[
            styles.stepperButton,
            !canIncrease ? styles.stepperButtonDisabled : null,
          ]}>
          <Icon color={V2_COLORS.text.primary} name="add" size={18} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 30,
  },
  subtitle: {
    color: V2_COLORS.text.secondary,
    fontSize: 13,
    lineHeight: 20,
    marginTop: V2_SPACING.xs,
  },
  segmentedControl: {
    marginTop: V2_SPACING.lg,
  },
  content: {
    paddingBottom: V2_SPACING.xl,
    paddingTop: V2_SPACING.lg,
  },
  section: {
    marginBottom: V2_SPACING.lg,
  },
  sectionTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
    marginBottom: V2_SPACING.sm,
  },
  colorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: V2_SPACING.sm,
  },
  colorOption: {
    alignItems: 'center',
    borderColor: 'transparent',
    borderRadius: V2_RADIUS.pill,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  colorSwatch: {
    borderRadius: V2_RADIUS.pill,
    height: 18,
    width: 18,
  },
  searchInputWrapper: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.page,
    borderRadius: V2_RADIUS.lg,
    flexDirection: 'row',
    paddingHorizontal: V2_SPACING.lg,
  },
  searchInput: {
    color: V2_COLORS.text.primary,
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    marginLeft: V2_SPACING.sm,
    paddingVertical: 14,
  },
  list: {
    gap: V2_SPACING.sm,
  },
  catalogCard: {
    backgroundColor: V2_COLORS.background.page,
    borderRadius: V2_RADIUS.lg,
    flexDirection: 'row',
    padding: V2_SPACING.lg,
  },
  catalogCopy: {
    flex: 1,
    paddingRight: V2_SPACING.md,
  },
  catalogTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
  },
  catalogCode: {
    color: V2_COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  catalogMeta: {
    color: V2_COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: V2_SPACING.sm,
  },
  catalogAction: {
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: V2_RADIUS.pill,
    justifyContent: 'center',
    minWidth: 68,
    paddingHorizontal: V2_SPACING.md,
    paddingVertical: V2_SPACING.sm,
  },
  catalogActionEnabled: {
    backgroundColor: V2_COLORS.brand.primaryTint,
  },
  catalogActionDisabled: {
    backgroundColor: V2_COLORS.background.subtle,
  },
  catalogActionLabel: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  catalogActionLabelEnabled: {
    color: V2_COLORS.brand.primaryStrong,
  },
  catalogActionLabelDisabled: {
    color: V2_COLORS.text.muted,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: V2_SPACING.xxl,
  },
  emptyLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  textField: {
    backgroundColor: V2_COLORS.background.page,
    borderRadius: V2_RADIUS.lg,
    color: V2_COLORS.text.primary,
    fontSize: 15,
    lineHeight: 22,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: 14,
  },
  switchCard: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.page,
    borderRadius: V2_RADIUS.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: V2_SPACING.lg,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.lg,
  },
  switchTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
  },
  switchDescription: {
    color: V2_COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  inlineChips: {
    paddingRight: V2_SPACING.lg,
  },
  stepperGrid: {
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    marginBottom: V2_SPACING.lg,
  },
  stepperCard: {
    backgroundColor: V2_COLORS.background.page,
    borderRadius: V2_RADIUS.lg,
    flex: 1,
    padding: V2_SPACING.lg,
  },
  stepperLabel: {
    color: V2_COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: V2_SPACING.sm,
  },
  stepperControls: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepperButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  stepperButtonDisabled: {
    opacity: 0.35,
  },
  stepperValue: {
    color: V2_COLORS.text.primary,
    fontSize: 16,
    fontWeight: '800',
    lineHeight: 24,
  },
  submitButton: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.pill,
    marginTop: V2_SPACING.sm,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: 15,
  },
  submitButtonEnabled: {
    backgroundColor: V2_COLORS.brand.primary,
  },
  submitButtonDisabled: {
    backgroundColor: V2_COLORS.background.subtle,
  },
  submitLabel: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 22,
  },
  submitLabelEnabled: {
    color: V2_COLORS.text.inverse,
  },
  submitLabelDisabled: {
    color: V2_COLORS.text.muted,
  },
});
