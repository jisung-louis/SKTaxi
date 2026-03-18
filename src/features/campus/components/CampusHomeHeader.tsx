import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

type CampusHomeHeaderProps = {
  onPressProfile: () => void;
  onPressNotification: () => void;
};

export const CampusHomeHeader = ({
  onPressProfile,
  onPressNotification,
}: CampusHomeHeaderProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.wordmarkContainer}>
        <Image
          source={require('../../../../../assets/icons/skuri_icon.png')}
          style={styles.wordmarkImage}
        />
        <Text style={styles.wordmark}>SKURI</Text>
      </View>
      <View style={styles.rightButtonContainer}>
        {/* 알림 버튼 */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={onPressNotification}
          style={styles.button}>
          <Icon
            color={V2_COLORS.text.secondary}
            name="notifications-outline"
            size={18}
          />
          {/* TODO : 알림 개수 뱃지 추가 */}
        </TouchableOpacity>
        {/* 프로필 버튼 */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onPressProfile}
          style={styles.button}>
          <Icon
            color={V2_COLORS.text.secondary}
            name="person-outline"
            size={18}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: V2_SPACING.lg,
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: V2_SPACING.xxl,
  },
  wordmarkContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.lg,
  },
  wordmarkImage: {
    borderRadius: V2_RADIUS.sm,
    height: 48,
    width: 48,
  },
  wordmark: {
    color: V2_COLORS.brand.logo,
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 64,
  },
  rightButtonContainer: {
    flexDirection: 'row',
    gap: V2_SPACING.lg,
  },
  button: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
    ...V2_SHADOWS.card,
  },
});
