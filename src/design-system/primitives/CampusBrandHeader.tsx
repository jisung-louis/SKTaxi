import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { v2Colors, v2Radius } from '../foundation';
import { DISABLED_STATE_STYLE, PRESSED_STATE_STYLE, resolveV2Shadow } from './utils';

export interface CampusBrandHeaderProps {
  onPressProfile?: () => void;
  profileAccessibilityLabel: string;
  profileIcon: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  wordmarkSource: ImageSourcePropType;
}

export const CampusBrandHeader = ({
  onPressProfile,
  profileAccessibilityLabel,
  profileIcon,
  style,
  testID,
  wordmarkSource,
}: CampusBrandHeaderProps) => {
  const disabled = !onPressProfile;

  return (
    <View style={[styles.container, style]} testID={testID}>
      <Image resizeMode="contain" source={wordmarkSource} style={styles.wordmark} />
      <Pressable
        accessibilityLabel={profileAccessibilityLabel}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        disabled={disabled}
        hitSlop={8}
        onPress={onPressProfile}
        style={({ pressed }) => [
          styles.profileButton,
          disabled && DISABLED_STATE_STYLE,
          pressed && !disabled && PRESSED_STATE_STYLE,
        ]}
      >
        {profileIcon}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 36,
  },
  profileButton: {
    ...resolveV2Shadow('card'),
    alignItems: 'center',
    backgroundColor: v2Colors.bg.surface,
    borderRadius: v2Radius.full,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  wordmark: {
    height: 32,
    width: 94,
  },
});
