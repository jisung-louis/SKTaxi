import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import type {
  TaxiAcceptancePendingAvatarViewData,
  TaxiAcceptancePendingInfoRowViewData,
} from '../model/taxiAcceptancePendingViewData';
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
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
              color={COLORS.text.muted}
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
          color={COLORS.text.inverse}
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
                color={COLORS.brand.primaryStrong}
                name="location"
                size={12}
              />
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routeIconEnd}>
              <Icon
                color={COLORS.accent.blue}
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
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
    ...SHADOWS.card,
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primary,
    flexDirection: 'row',
    gap: SPACING.sm,
    minHeight: 48,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    color: COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  body: {
    padding: SPACING.lg,
  },
  routeCard: {
    backgroundColor: COLORS.background.page,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    gap: SPACING.md,
    minHeight: 102,
    padding: SPACING.md,
  },
  routeRail: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    width: 20,
  },
  routeIconStart: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primarySoft,
    borderRadius: RADIUS.pill,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  routeLine: {
    backgroundColor: COLORS.border.default,
    flex: 1,
    marginVertical: 4,
    width: 1,
  },
  routeIconEnd: {
    alignItems: 'center',
    backgroundColor: COLORS.accent.blueSoft,
    borderRadius: RADIUS.pill,
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
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 1,
  },
  routeValue: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  infoRows: {
    paddingTop: SPACING.sm,
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
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
  },
  infoRowLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    minWidth: 92,
  },
  infoIconWrap: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  infoLabel: {
    color: COLORS.text.tertiary,
    fontSize: 14,
    lineHeight: 20,
  },
  infoValue: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  infoRowRightInline: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  avatarCircle: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarBorder: {
    borderColor: COLORS.background.surface,
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
