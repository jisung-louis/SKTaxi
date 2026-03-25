import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import type {ContentDetailBadgeViewData} from '@/shared/types/contentDetailViewData';
import {COLORS, RADIUS, SPACING} from '@/shared/design-system/tokens';

import {ToneBadge} from './ToneBadge';

interface DetailTitleHeaderProps {
  authorLabel?: string;
  badges?: ContentDetailBadgeViewData[];
  dateLabel?: string;
  title: string;
}

export const DetailTitleHeader = ({
  authorLabel,
  badges = [],
  dateLabel,
  title,
}: DetailTitleHeaderProps) => {
  const [primaryBadge, ...secondaryBadges] = badges;

  return (
    <View style={styles.container}>
      {primaryBadge || dateLabel || secondaryBadges.length > 0 ? (
        <View style={styles.metaRow}>
          {primaryBadge ? (
            <ToneBadge label={primaryBadge.label} tone={primaryBadge.tone} />
          ) : null}
          {dateLabel ? <Text style={styles.dateLabel}>{dateLabel}</Text> : null}
          {secondaryBadges.map(badge => (
            <ToneBadge key={badge.id} label={badge.label} tone={badge.tone} />
          ))}
        </View>
      ) : null}

      <Text style={styles.title}>{title}</Text>

      {authorLabel ? (
        <View style={styles.authorRow}>
          <View style={styles.avatarCircle}>
            <Icon color={COLORS.text.muted} name="person-outline" size={14} />
          </View>
          <Text style={styles.authorLabel}>{authorLabel}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  authorLabel: {
    color: COLORS.text.tertiary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  authorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: COLORS.border.default,
    borderRadius: RADIUS.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  container: {
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  dateLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  metaRow: {
    alignItems: 'center',
    columnGap: SPACING.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: SPACING.xs,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
  },
});
