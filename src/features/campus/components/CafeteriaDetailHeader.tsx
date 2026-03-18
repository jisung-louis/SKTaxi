import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  COLORS,
  SPACING,
} from '@/shared/design-system/tokens';

interface CafeteriaDetailHeaderProps {
  onPressBack: () => void;
  title: string;
}

export const CafeteriaDetailHeader = ({
  onPressBack,
  title,
}: CafeteriaDetailHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.topBar, {paddingTop: insets.top}]}>
        <View style={styles.row}>
          <View style={styles.leftGroup}>
            <TouchableOpacity
              accessibilityLabel="뒤로 가기"
              accessibilityRole="button"
              activeOpacity={0.82}
              onPress={onPressBack}
              style={styles.backButton}>
              <Icon
                color={COLORS.text.primary}
                name="arrow-back"
                size={22}
              />
            </TouchableOpacity>

            <Text style={styles.title}>{title}</Text>
          </View>

          <View style={styles.rightSpacer} />
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
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
  },
  leftGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  backButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
  },
  rightSpacer: {
    height: 32,
    width: 32,
  },
});
