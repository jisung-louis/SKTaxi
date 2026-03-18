import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  COLORS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

interface BoardComposeHeaderProps {
  onPressClose: () => void;
  onPressSubmit: () => void;
  submitEnabled: boolean;
  submitLabel: string;
  title: string;
}

export const BoardComposeHeader = ({
  onPressClose,
  onPressSubmit,
  submitEnabled,
  submitLabel,
  title,
}: BoardComposeHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.bar}>
        <View style={styles.leftSlot}>
          <TouchableOpacity
            accessibilityLabel="닫기"
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={onPressClose}
            style={styles.iconButton}>
            <Icon color={COLORS.text.primary} name="close" size={22} />
          </TouchableOpacity>
        </View>

        <View pointerEvents="none" style={styles.titleWrap}>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
        </View>

        <View style={styles.rightSlot}>
          <TouchableOpacity
            accessibilityLabel={submitLabel}
            accessibilityRole="button"
            activeOpacity={submitEnabled ? 0.82 : 1}
            disabled={!submitEnabled}
            onPress={onPressSubmit}
            style={[
              styles.submitButton,
              submitEnabled ? styles.submitButtonEnabled : undefined,
            ]}>
            <Text
              style={[
                styles.submitLabel,
                submitEnabled ? styles.submitLabelEnabled : undefined,
              ]}>
              {submitLabel}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
    paddingHorizontal: SPACING.lg,
    position: 'relative',
  },
  container: {
    backgroundColor: COLORS.background.surface,
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
  },
  iconButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    marginLeft: -4,
    width: 36,
  },
  leftSlot: {
    width: 56,
  },
  rightSlot: {
    alignItems: 'flex-end',
    flex: 1,
    minWidth: 96,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background.subtle,
    borderRadius: 12,
    height: 32,
    justifyContent: 'center',
    minWidth: 58,
    paddingHorizontal: SPACING.lg,
  },
  submitButtonEnabled: {
    backgroundColor: '#4ADE80',
    ...SHADOWS.card,
  },
  submitLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  submitLabelEnabled: {
    color: COLORS.text.inverse,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    textAlign: 'center',
  },
  titleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    left: 56,
    position: 'absolute',
    right: 56,
    top: 0,
    bottom: 0,
  },
});
