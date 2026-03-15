import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {V2_COLORS, V2_SPACING} from '../tokens';

interface V2DetailNotFoundStateProps {
  actionLabel: string;
  onPressAction: () => void;
  title: string;
}

export const V2DetailNotFoundState = ({
  actionLabel,
  onPressAction,
  title,
}: V2DetailNotFoundStateProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Icon
          color={V2_COLORS.border.default}
          name="document-outline"
          size={42}
        />
        <Text style={styles.questionMark}>?</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.82}
        onPress={onPressAction}>
        <Text style={styles.actionLabel}>{actionLabel}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: V2_SPACING.xxl,
  },
  iconWrap: {
    alignItems: 'center',
    height: 48,
    justifyContent: 'center',
    marginBottom: V2_SPACING.sm,
    position: 'relative',
    width: 50,
  },
  questionMark: {
    color: V2_COLORS.border.default,
    fontSize: 20,
    fontWeight: '700',
    left: 0,
    position: 'absolute',
    right: 0,
    textAlign: 'center',
    top: 11,
  },
  title: {
    color: V2_COLORS.text.muted,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: V2_SPACING.sm,
  },
  actionLabel: {
    color: V2_COLORS.brand.primaryStrong,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
