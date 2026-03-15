import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SPACING,
} from '../tokens';

interface V2DetailComposerProps {
  bottomInset: number;
  placeholder: string;
}

export const V2DetailComposer = ({
  bottomInset,
  placeholder,
}: V2DetailComposerProps) => {
  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(bottomInset, V2_SPACING.md),
        },
      ]}>
      <View style={styles.row}>
        <View style={styles.inputSurface}>
          <Text numberOfLines={1} style={styles.placeholder}>
            {placeholder}
          </Text>
        </View>

        <View style={styles.sendButton}>
          <Icon color={V2_COLORS.text.muted} name="paper-plane-outline" size={18} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: V2_COLORS.background.surface,
    borderTopColor: V2_COLORS.border.subtle,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: 13,
    position: 'absolute',
    right: 0,
  },
  row: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: V2_SPACING.sm,
  },
  inputSurface: {
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: V2_RADIUS.lg,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: 10,
  },
  placeholder: {
    color: V2_COLORS.text.muted,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 23,
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
});
