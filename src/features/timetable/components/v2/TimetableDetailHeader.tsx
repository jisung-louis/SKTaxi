import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {V2_COLORS, V2_RADIUS, V2_SPACING} from '@/shared/design-system/tokens';

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
    <View style={[styles.container, {paddingTop: insets.top + V2_SPACING.sm}]}>
      <View style={styles.row}>
        <TouchableOpacity
          accessibilityLabel="뒤로가기"
          accessibilityRole="button"
          activeOpacity={0.85}
          onPress={onPressBack}
          style={styles.backButton}>
          <Icon color={V2_COLORS.text.primary} name="chevron-back" size={22} />
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.85}
          onPress={onPressSemester}
          style={styles.semesterButton}>
          <Text numberOfLines={1} style={styles.semesterLabel}>
            {semesterLabel}
          </Text>
          <Icon color={V2_COLORS.text.secondary} name="chevron-down" size={18} />
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity
            accessibilityLabel="공유"
            accessibilityRole="button"
            activeOpacity={0.85}
            onPress={onPressShare}
            style={styles.actionButton}>
            <Icon
              color={V2_COLORS.text.secondary}
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
            <Icon color={V2_COLORS.text.inverse} name="add" size={20} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: V2_COLORS.background.surface,
    paddingBottom: 12,
    paddingHorizontal: V2_SPACING.lg,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: V2_RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  semesterButton: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    marginHorizontal: V2_SPACING.sm,
  },
  semesterLabel: {
    color: V2_COLORS.text.primary,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    marginRight: V2_SPACING.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: V2_SPACING.sm,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: V2_RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  addButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primary,
    borderRadius: V2_RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
