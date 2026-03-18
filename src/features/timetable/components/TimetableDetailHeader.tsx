import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {COLORS, RADIUS, SPACING} from '@/shared/design-system/tokens';

interface TimetableDetailHeaderProps {
  onPressAdd: () => void;
  onPressBack: () => void;
  onPressSemester: () => void;
  onPressShare: () => void;
  semesterLabel: string;
}

export const TimetableDetailHeader = ({
  onPressAdd,
  onPressBack,
  onPressSemester,
  onPressShare,
  semesterLabel,
}: TimetableDetailHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingTop: insets.top + SPACING.sm}]}>
      <View style={styles.row}>
        <TouchableOpacity
          accessibilityLabel="뒤로가기"
          accessibilityRole="button"
          activeOpacity={0.85}
          onPress={onPressBack}
          style={styles.backButton}>
          <Icon color={COLORS.text.primary} name="chevron-back" size={22} />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.85}
          onPress={onPressSemester}
          style={styles.semesterButton}>
          <Text numberOfLines={1} style={styles.semesterLabel}>
            {semesterLabel}
          </Text>
          <Icon color={COLORS.text.secondary} name="chevron-down" size={18} />
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity
            accessibilityLabel="공유"
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={onPressShare}
            style={styles.actionButton}>
            <Icon
              color={COLORS.text.secondary}
              name="share-social-outline"
              size={20}
            />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="수업 추가"
            accessibilityRole="button"
            activeOpacity={0.88}
            onPress={onPressAdd}
            style={styles.addButton}>
            <Icon color={COLORS.text.inverse} name="add" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.surface,
    paddingBottom: 12,
    paddingHorizontal: SPACING.lg,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  semesterButton: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: SPACING.sm,
  },
  semesterLabel: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginRight: SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primary,
    borderRadius: RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
