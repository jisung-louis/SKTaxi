import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {V2_COLORS, V2_SPACING} from '../tokens';

interface V2StackHeaderProps {
  onPressBack: () => void;
  title: string;
}

export const V2StackHeader = ({
  onPressBack,
  title,
}: V2StackHeaderProps) => {
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
          <Icon color={V2_COLORS.text.primary} name="arrow-back" size={22} />
        </TouchableOpacity>

        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: V2_COLORS.background.surface,
    borderBottomColor: V2_COLORS.border.subtle,
    borderBottomWidth: 1,
    paddingHorizontal: V2_SPACING.lg,
  },
  bar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 56,
  },
  backButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    marginRight: V2_SPACING.sm,
    width: 36,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
});
