import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import type {
  TaxiHomeAvatarViewData,
  TaxiHomePartyCardViewData,
} from '../../model/taxiHomeViewData';
import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

interface TaxiHomePartyCardProps {
  onPress: (party: TaxiHomePartyCardViewData) => void;
  party: TaxiHomePartyCardViewData;
}

const renderAvatarLabel = (avatar: TaxiHomeAvatarViewData) => {
  if (!avatar.label) {
    return '?';
  }

  return avatar.label.slice(0, 1);
};

export const TaxiHomePartyCard = ({onPress, party}: TaxiHomePartyCardProps) => {
  const statusStyles =
    party.statusTone === 'active'
      ? styles.statusPillActive
      : styles.statusPillInactive;
  const statusLabelStyles =
    party.statusTone === 'active'
      ? styles.statusLabelActive
      : styles.statusLabelInactive;

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.92}
      onPress={() => onPress(party)}
      style={styles.card}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.caption}>출발 시간</Text>
          <Text style={styles.departureTime}>{party.departureTimeLabel}</Text>
        </View>
        <View style={[styles.statusPill, statusStyles]}>
          <Text style={[styles.statusLabel, statusLabelStyles]}>
            {party.statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.routeCard}>
        <View style={styles.routeSide}>
          <View style={styles.routeIconStart}>
            <Icon
              color={V2_COLORS.brand.primaryStrong}
              name="location"
              size={12}
            />
          </View>
          <Text numberOfLines={1} style={styles.routeText}>
            {party.departureLabel}
          </Text>
        </View>
        <Icon
          color={V2_COLORS.border.default}
          name="arrow-forward-outline"
          size={14}
        />
        <View style={[styles.routeSide, styles.routeSideEnd]}>
          <Text numberOfLines={1} style={styles.routeText}>
            {party.destinationLabel}
          </Text>
          <View style={styles.routeIconEnd}>
            <Icon
              color={V2_COLORS.accent.blue}
              name="business-outline"
              size={12}
            />
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <View
            style={[
              styles.leaderAvatar,
              {
                backgroundColor: party.leaderAvatar.backgroundColor,
              },
            ]}>
            <Text
              style={[
                styles.leaderAvatarLabel,
                {
                  color: party.leaderAvatar.textColor,
                },
              ]}>
              {renderAvatarLabel(party.leaderAvatar)}
            </Text>
          </View>
          <View style={styles.leaderMeta}>
            <Text numberOfLines={1} style={styles.leaderName}>
              {party.leaderName}
            </Text>
            <Text style={styles.leaderRole}>{party.leaderRoleLabel}</Text>
          </View>
          <View style={styles.footerDivider} />
          <View style={styles.memberSummary}>
            <View style={styles.memberAvatarStack}>
              {party.participantAvatars.map((avatar, index) => (
                <View
                  key={avatar.id}
                  style={[
                    styles.memberAvatar,
                    index > 0 ? styles.memberAvatarStackOffset : null,
                    {
                      backgroundColor: avatar.backgroundColor,
                      zIndex: party.participantAvatars.length - index,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.memberAvatarLabel,
                      {
                        color: avatar.textColor,
                      },
                    ]}>
                    {renderAvatarLabel(avatar)}
                  </Text>
                </View>
              ))}
            </View>
            <Text style={styles.memberSummaryLabel}>
              {party.memberSummaryLabel}
            </Text>
          </View>
        </View>
        <View style={styles.priceGroup}>
          <Text style={styles.priceCaption}>예상 요금</Text>
          <Text style={styles.priceLabel}>{party.estimatedFareLabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    padding: 17,
    ...V2_SHADOWS.card,
  },
  topRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: V2_SPACING.md,
  },
  caption: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  departureTime: {
    color: V2_COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
  },
  statusPill: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.pill,
    justifyContent: 'center',
    minHeight: 28,
    paddingHorizontal: V2_SPACING.md,
  },
  statusPillActive: {
    backgroundColor: V2_COLORS.brand.primaryTint,
  },
  statusPillInactive: {
    backgroundColor: V2_COLORS.background.subtle,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  statusLabelActive: {
    color: V2_COLORS.brand.primaryStrong,
  },
  statusLabelInactive: {
    color: V2_COLORS.text.secondary,
  },
  routeCard: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.page,
    borderRadius: V2_RADIUS.md,
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    minHeight: 44,
    paddingHorizontal: V2_SPACING.md,
    paddingVertical: V2_SPACING.sm,
  },
  routeSide: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 6,
  },
  routeSideEnd: {
    justifyContent: 'flex-end',
  },
  routeText: {
    color: V2_COLORS.text.primary,
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  routeIconStart: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primarySoft,
    borderRadius: V2_RADIUS.pill,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  routeIconEnd: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.accent.blueSoft,
    borderRadius: V2_RADIUS.pill,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  footer: {
    alignItems: 'flex-end',
    borderTopColor: V2_COLORS.border.subtle,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: V2_SPACING.lg,
    paddingTop: 13,
  },
  footerLeft: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    marginRight: V2_SPACING.md,
  },
  leaderAvatar: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  leaderAvatarLabel: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  leaderMeta: {
    marginLeft: V2_SPACING.sm,
  },
  leaderName: {
    color: V2_COLORS.text.strong,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  leaderRole: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  footerDivider: {
    backgroundColor: V2_COLORS.border.default,
    height: 24,
    marginHorizontal: V2_SPACING.sm,
    width: 1,
  },
  memberSummary: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  memberAvatarStack: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  memberAvatar: {
    alignItems: 'center',
    borderColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.pill,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  memberAvatarStackOffset: {
    marginLeft: -8,
  },
  memberAvatarLabel: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
  },
  memberSummaryLabel: {
    color: V2_COLORS.text.tertiary,
    fontSize: 12,
    lineHeight: 16,
    marginLeft: 6,
  },
  priceGroup: {
    alignItems: 'flex-end',
  },
  priceCaption: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
  },
  priceLabel: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
});
