import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

interface AccountGuidePortalCardProps {
  onPressPortal: () => void;
}

export const AccountGuidePortalCard = ({
  onPressPortal,
}: AccountGuidePortalCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.infoGroup}>
        <View style={styles.iconWrap}>
          <Icon color={V2_COLORS.brand.primary} name="globe-outline" size={18} />
        </View>

        <View>
          <Text style={styles.title}>성결대학교 포탈시스템</Text>
          <Text style={styles.subtitle}>portal.sungkyul.ac.kr</Text>
        </View>
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.9}
        onPress={onPressPortal}
        style={styles.button}>
        <Icon color={V2_COLORS.text.inverse} name="open-outline" size={14} />
        <Text style={styles.buttonLabel}>포탈 열기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: '#4ADE80',
    borderRadius: 12,
    flexDirection: 'row',
    gap: 6,
    height: 40,
    justifyContent: 'center',
    minWidth: 102,
    paddingHorizontal: V2_SPACING.lg,
    shadowColor: '#4ADE80',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonLabel: {
    color: V2_COLORS.text.inverse,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  card: {
    ...V2_SHADOWS.card,
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: V2_SPACING.xl,
    paddingVertical: V2_SPACING.lg,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primaryTint,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    marginRight: V2_SPACING.md,
    width: 40,
  },
  infoGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    marginRight: V2_SPACING.md,
  },
  subtitle: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
