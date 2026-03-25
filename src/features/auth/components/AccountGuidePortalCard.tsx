import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
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
          <Icon color={COLORS.brand.primary} name="globe-outline" size={18} />
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
        <Icon color={COLORS.text.inverse} name="open-outline" size={14} />
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
    paddingHorizontal: SPACING.lg,
    shadowColor: '#4ADE80',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 1,
  },
  buttonLabel: {
    color: COLORS.text.inverse,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  card: {
    ...SHADOWS.card,
    alignItems: 'center',
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
  },
  iconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primaryTint,
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    marginRight: SPACING.md,
    width: 40,
  },
  infoGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    marginRight: SPACING.md,
  },
  subtitle: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 2,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
