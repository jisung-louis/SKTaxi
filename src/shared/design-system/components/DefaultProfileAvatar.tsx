import React from 'react';
import {StyleProp, StyleSheet, View, ViewStyle} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {COLORS, RADIUS} from '../tokens';

interface DefaultProfileAvatarProps {
  backgroundColor?: string;
  iconColor?: string;
  iconName?: string;
  iconSize?: number;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

export const DefaultProfileAvatar = ({
  backgroundColor = COLORS.border.default,
  iconColor = COLORS.text.muted,
  iconName = 'person-outline',
  iconSize,
  size = 28,
  style,
}: DefaultProfileAvatarProps) => {
  return (
    <View
      style={[
        styles.avatar,
        {
          backgroundColor,
          borderRadius: size / 2,
          height: size,
          width: size,
        },
        style,
      ]}>
      <Icon
        color={iconColor}
        name={iconName}
        size={iconSize ?? Math.max(14, Math.round(size * 0.5))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
  },
});
