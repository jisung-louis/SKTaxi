import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
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
          source={require('../../../../assets/icons/skuri_icon.png')}
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
            color={COLORS.text.secondary}
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
            color={COLORS.text.secondary}
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
    paddingBottom: SPACING.lg,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
  },
  wordmarkContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  wordmarkImage: {
    borderRadius: RADIUS.sm,
    height: 48,
    width: 48,
  },
  wordmark: {
    color: COLORS.brand.logo,
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 64,
  },
  rightButtonContainer: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  button: {
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
    ...SHADOWS.card,
  },
});
