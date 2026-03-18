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
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
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
          <Icon color={COLORS.status.success} name="checkmark-outline" size={16} />
          <Text style={styles.successLabel}>{successMessage}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...SHADOWS.card,
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.xl,
  },
  description: {
    color: COLORS.text.tertiary,
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
    height: 400,
    marginTop: SPACING.lg,
    width: '100%',
    resizeMode: 'cover',
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  numberLabel: {
    color: COLORS.text.inverse,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  numberWrap: {
    alignItems: 'center',
    backgroundColor: '#4ADE80',
    borderRadius: RADIUS.pill,
    height: 28,
    justifyContent: 'center',
    marginRight: SPACING.md,
    width: 28,
  },
  successBanner: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primaryTint,
    borderRadius: 12,
    flexDirection: 'row',
    height: 48,
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.lg,
  },
  successLabel: {
    color: COLORS.status.success,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginLeft: SPACING.sm,
  },
  textGroup: {
    flex: 1,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
