import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import type {
  TaxiAcceptancePendingAvatarViewData,
  TaxiAcceptancePendingInfoRowViewData,
} from '../../model/taxiAcceptancePendingViewData';
import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

interface TaxiAcceptancePendingInfoCardProps {
  departureLabel: string;
  destinationLabel: string;
  rows: TaxiAcceptancePendingInfoRowViewData[];
  title: string;
}

const AvatarCircle = ({
  avatar,
  size = 24,
  withBorder = false,
}: {
  avatar: TaxiAcceptancePendingAvatarViewData;
  size?: number;
  withBorder?: boolean;
}) => {
  const baseStyle = [
    styles.avatarCircle,
    {
      height: size,
      width: size,
    },
    withBorder ? styles.avatarBorder : null,
  ];

  if (avatar.kind === 'image') {
    return (
      <Image
        source={{uri: avatar.uri}}
        style={[baseStyle, styles.avatarImage]}
      />
    );
  }

  return (
    <View
      style={[
        baseStyle,
        {
          backgroundColor: avatar.backgroundColor,
        },
      ]}>
      <Text
        style={[
          styles.avatarLabel,
          size <= 20 ? styles.avatarLabelSmall : null,
          {
            color: avatar.textColor,
          },
        ]}>
        {avatar.label.slice(0, 1)}
      </Text>
    </View>
  );
};

const AvatarStack = ({
  avatars,
}: {
  avatars: TaxiAcceptancePendingAvatarViewData[];
}) => {
  const visibleAvatars = avatars.slice(0, 2);

  return (
    <View style={styles.avatarStack}>
      {visibleAvatars.map((avatar, index) => (
        <View
          key={avatar.id}
          style={index > 0 ? styles.avatarStackOverlap : null}>
          <AvatarCircle avatar={avatar} withBorder />
        </View>
      ))}
    </View>
  );
};

const InfoRow = ({
  isLast,
  row,
}: {
  isLast: boolean;
  row: TaxiAcceptancePendingInfoRowViewData;
}) => {
  const hasIcon = 'iconName' in row;

  return (
    <View style={[styles.infoRow, !isLast ? styles.infoRowDivider : null]}>
      <View style={styles.infoRowLeft}>
        <View style={styles.infoIconWrap}>
          {hasIcon ? (
            <Icon
              color={V2_COLORS.text.muted}
              name={row.iconName}
              size={18}
            />
          ) : null}
        </View>
        <Text style={styles.infoLabel}>{row.label}</Text>
      </View>

      {row.type === 'leader' ? (
        <View style={styles.infoRowRightInline}>
          <AvatarCircle avatar={row.avatar} />
          <Text style={styles.infoValue}>{row.value}</Text>
        </View>
      ) : row.type === 'members' ? (
        <View style={styles.infoRowRightInline}>
          <AvatarStack avatars={row.avatars} />
          <Text style={styles.infoValue}>{row.value}</Text>
        </View>
      ) : (
        <Text
          style={styles.infoValue}>
          {row.value}
        </Text>
      )}
    </View>
  );
};

export const TaxiAcceptancePendingInfoCard = ({
  departureLabel,
  destinationLabel,
  rows,
  title,
}: TaxiAcceptancePendingInfoCardProps) => {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Icon
          color={V2_COLORS.text.inverse}
          name="information-circle-outline"
          size={16}
        />
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.routeCard}>
          <View style={styles.routeRail}>
            <View style={styles.routeIconStart}>
              <Icon
                color={V2_COLORS.brand.primaryStrong}
                name="location"
                size={12}
              />
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeIconEnd}>
              <Icon
                color={V2_COLORS.accent.blue}
                name="business-outline"
                size={12}
              />
            </View>
          </View>

          <View style={styles.routeLabels}>
            <View style={styles.routeLabelBlock}>
              <Text style={styles.routeCaption}>출발지</Text>
              <Text style={styles.routeValue}>{departureLabel}</Text>
            </View>

            <View style={styles.routeLabelBlock}>
              <Text style={styles.routeCaption}>도착지</Text>
              <Text style={styles.routeValue}>{destinationLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoRows}>
          {rows.map((row, index) => (
            <InfoRow
              isLast={index === rows.length - 1}
              key={row.id}
              row={row}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
    ...V2_SHADOWS.card,
  },
  header: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primary,
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    minHeight: 48,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.md,
  },
  headerTitle: {
    color: V2_COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  body: {
    padding: V2_SPACING.lg,
  },
  routeCard: {
    backgroundColor: V2_COLORS.background.page,
    borderRadius: V2_RADIUS.md,
    flexDirection: 'row',
    gap: V2_SPACING.md,
    minHeight: 102,
    padding: V2_SPACING.md,
  },
  routeRail: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    width: 20,
  },
  routeIconStart: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primarySoft,
    borderRadius: V2_RADIUS.pill,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  routeLine: {
    backgroundColor: V2_COLORS.border.default,
    flex: 1,
    marginVertical: 4,
    width: 1,
  },
  routeIconEnd: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.accent.blueSoft,
    borderRadius: V2_RADIUS.pill,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  routeLabels: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  routeLabelBlock: {
    minHeight: 36,
  },
  routeCaption: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 1,
  },
  routeValue: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  infoRows: {
    paddingTop: V2_SPACING.sm,
  },
  infoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 45,
    paddingBottom: 9,
    paddingTop: 8,
  },
  infoRowDivider: {
    borderBottomColor: V2_COLORS.border.subtle,
    borderBottomWidth: 1,
  },
  infoRowLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    minWidth: 92,
  },
  infoIconWrap: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  infoLabel: {
    color: V2_COLORS.text.tertiary,
    fontSize: 14,
    lineHeight: 20,
  },
  infoValue: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  infoRowRightInline: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.sm,
  },
  avatarCircle: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.pill,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarBorder: {
    borderColor: V2_COLORS.background.surface,
    borderWidth: 2,
  },
  avatarImage: {
    resizeMode: 'cover',
  },
  avatarLabel: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  avatarLabelSmall: {
    fontSize: 10,
  },
  avatarStack: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  avatarStackOverlap: {
    marginLeft: -6,
  },
});
