import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {COLORS, SPACING} from '../tokens';

interface StackHeaderProps {
  onPressBack: () => void;
  rightAccessory?: React.ReactNode;
  title: string;
}

export const StackHeader = ({
  onPressBack,
  rightAccessory,
  title,
}: StackHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.bar}>
        <TouchableOpacity
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
          activeOpacity={0.82}
          onPress={onPressBack}
          style={styles.backButton}>
          <Icon color={COLORS.text.primary} name="arrow-back" size={22} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {rightAccessory ? (
            <View style={styles.rightAccessory}>{rightAccessory}</View>
          ) : null}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.surface,
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
    paddingHorizontal: SPACING.lg,
  },
  bar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
  },
  content: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    marginRight: SPACING.sm,
    width: 36,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  rightAccessory: {
    marginLeft: SPACING.md,
  },
});
