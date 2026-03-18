import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {V2_RADIUS, V2_SPACING} from '../tokens';

interface InfoBannerProps {
  backgroundColor: string;
  iconColor: string;
  iconName: string;
  lines: string[];
  style?: StyleProp<ViewStyle>;
  textColor: string;
}

export const InfoBanner = ({
  backgroundColor,
  iconColor,
  iconName,
  lines,
  style,
  textColor,
}: InfoBannerProps) => {
  return (
    <View style={[styles.container, {backgroundColor}, style]}>
      <Icon color={iconColor} name={iconName} size={16} style={styles.icon} />

      <View style={styles.textGroup}>
        {lines.map((line, index) => (
          <Text
            key={`${line}-${index}`}
            style={[styles.line, {color: textColor}]}>
            {line}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: V2_RADIUS.lg,
    flexDirection: 'row',
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: 14,
  },
  icon: {
    marginRight: 12,
    marginTop: 2,
  },
  textGroup: {
    flex: 1,
  },
  line: {
    fontSize: 12,
    lineHeight: 19.5,
  },
});
