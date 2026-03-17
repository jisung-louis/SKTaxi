import React from 'react';
import {
  Image,
  ImageSourcePropType,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

interface AccountGuideStepCardProps {
  description: string;
  imageSource?: ImageSourcePropType;
  step: number;
  successMessage?: string;
  title: string;
}

export const AccountGuideStepCard = ({
  description,
  imageSource,
  step,
  successMessage,
  title,
}: AccountGuideStepCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.numberWrap}>
          <Text style={styles.numberLabel}>{step}</Text>
        </View>

        <View style={styles.textGroup}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>
      </View>

      {imageSource ? <Image source={imageSource} style={styles.image} /> : null}

      {successMessage ? (
        <View style={styles.successBanner}>
          <Icon color={V2_COLORS.status.success} name="checkmark-outline" size={16} />
          <Text style={styles.successLabel}>{successMessage}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...V2_SHADOWS.card,
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    padding: V2_SPACING.xl,
  },
  description: {
    color: V2_COLORS.text.tertiary,
    fontSize: 12,
    lineHeight: 19.5,
    marginTop: 4,
  },
  headerRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
  },
  image: {
    borderRadius: 12,
    height: 160,
    marginTop: V2_SPACING.lg,
    width: '100%',
  },
  numberLabel: {
    color: V2_COLORS.text.inverse,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  numberWrap: {
    alignItems: 'center',
    backgroundColor: '#4ADE80',
    borderRadius: V2_RADIUS.pill,
    height: 28,
    justifyContent: 'center',
    marginRight: V2_SPACING.md,
    width: 28,
  },
  successBanner: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primaryTint,
    borderRadius: 12,
    flexDirection: 'row',
    height: 48,
    marginTop: V2_SPACING.lg,
    paddingHorizontal: V2_SPACING.lg,
  },
  successLabel: {
    color: V2_COLORS.status.success,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginLeft: V2_SPACING.sm,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
