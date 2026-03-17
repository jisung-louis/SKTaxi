import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {V2_COLORS, V2_SPACING} from '../tokens';

interface V2DetailBackHeaderProps {
  onPressBack: () => void;
  rightAccessory?: React.ReactNode;
}

export const V2DetailBackHeader = ({
  onPressBack,
  rightAccessory,
}: V2DetailBackHeaderProps) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          paddingTop: insets.top + 12,
        },
      ]}>
      <View style={styles.row}>
        <TouchableOpacity
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
          activeOpacity={0.82}
          onPress={onPressBack}
          style={styles.backButton}>
          <Icon color={V2_COLORS.text.primary} name="arrow-back" size={22} />
        </TouchableOpacity>

        {rightAccessory ? (
          <View style={styles.rightAccessoryWrap}>{rightAccessory}</View>
        ) : (
          <View style={styles.rightAccessoryPlaceholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(249,250,251,0.9)',
    left: 0,
    paddingBottom: V2_SPACING.sm,
    paddingHorizontal: V2_SPACING.sm,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 10,
  },
  backButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  rightAccessoryPlaceholder: {
    height: 36,
    width: 36,
  },
  rightAccessoryWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 36,
    minWidth: 36,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});
