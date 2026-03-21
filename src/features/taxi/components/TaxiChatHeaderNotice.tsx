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

import type {TaxiChatSettlementNoticeViewData} from '../model/taxiChatViewData';

interface TaxiChatHeaderNoticeProps {
  noticeLabel?: string;
  settlementNotice?: TaxiChatSettlementNoticeViewData;
}

const formatCurrency = (value?: number) =>
  value ? `${value.toLocaleString('ko-KR')}원` : '미정';

const buildSettlementSubtitle = (
  settlementNotice: TaxiChatSettlementNoticeViewData,
) => {
  const segments: string[] = [];

  if (settlementNotice.perPersonAmount) {
    segments.push(`1인당 ${formatCurrency(settlementNotice.perPersonAmount)}`);
  }

  if (settlementNotice.accountLabel) {
    segments.push(settlementNotice.accountLabel);
  }

  return segments.join(' · ') || settlementNotice.description;
};

export const TaxiChatHeaderNotice = ({
  noticeLabel,
  settlementNotice,
}: TaxiChatHeaderNoticeProps) => {
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    setExpanded(false);
  }, [
    settlementNotice?.completedCount,
    settlementNotice?.summaryLabel,
    settlementNotice?.totalCount,
  ]);

  if (settlementNotice) {
    return (
      <View style={styles.settlementWrap}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.88}
          onPress={() => {
            setExpanded(current => !current);
          }}
          style={styles.settlementHeader}>
          <View style={styles.settlementHeaderMain}>
            <View style={styles.settlementIconWrap}>
              <Icon color={COLORS.accent.purple} name="wallet-outline" size={14} />
            </View>

            <View style={styles.settlementCopy}>
              <View style={styles.settlementTitleRow}>
                <Text style={styles.settlementTitle}>정산 현황</Text>
                <View
                  style={[
                    styles.settlementStatusPill,
                    settlementNotice.completedCount === settlementNotice.totalCount &&
                    settlementNotice.totalCount > 0
                      ? styles.settlementStatusPillDone
                      : styles.settlementStatusPillPending,
                  ]}>
                  <Text
                    style={[
                      styles.settlementStatusLabel,
                      settlementNotice.completedCount === settlementNotice.totalCount &&
                      settlementNotice.totalCount > 0
                        ? styles.settlementStatusLabelDone
                        : styles.settlementStatusLabelPending,
                    ]}>
                    {`${settlementNotice.completedCount}/${settlementNotice.totalCount}`}
                  </Text>
                </View>
              </View>

              <Text numberOfLines={1} style={styles.settlementSubtitle}>
                {buildSettlementSubtitle(settlementNotice)}
              </Text>
            </View>
          </View>

          <Icon
            color={COLORS.text.muted}
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
          />
        </TouchableOpacity>

        {expanded ? (
          <View style={styles.settlementExpandedWrap}>
            <View style={styles.settlementExpandedCard}>
              <View style={styles.settlementTotalRow}>
                <Text style={styles.settlementTotalLabel}>총 택시비</Text>
                <Text style={styles.settlementTotalValue}>
                  {formatCurrency(settlementNotice.taxiFare)}
                </Text>
              </View>

              {settlementNotice.members.length > 0 ? (
                <View style={styles.settlementDivider} />
              ) : null}

              {settlementNotice.members.map(member => (
                <View key={member.id} style={styles.settlementMemberRow}>
                  <View style={styles.settlementMemberLeft}>
                    <View
                      style={[
                        styles.settlementMemberIconWrap,
                        member.settled
                          ? styles.settlementMemberIconWrapDone
                          : null,
                      ]}>
                      <Icon
                        color={
                          member.settled
                            ? COLORS.status.success
                            : COLORS.text.muted
                        }
                        name={
                          member.settled ? 'checkmark-outline' : 'ellipse-outline'
                        }
                        size={10}
                      />
                    </View>

                    <View style={styles.settlementMemberLabelRow}>
                      <Text style={styles.settlementMemberLabel}>{member.label}</Text>
                      {member.isCurrentUser ? (
                        <Text style={styles.settlementMemberCurrentUser}>
                          {'(나)'}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <Text style={styles.settlementMemberAmount}>
                    {formatCurrency(settlementNotice.perPersonAmount)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  if (!noticeLabel) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.noticePill}>
        <Text numberOfLines={1} style={styles.noticeLabel}>
          {noticeLabel}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  noticeLabel: {
    color: COLORS.text.placeholder,
    fontSize: 11,
    lineHeight: 16.5,
  },
  noticePill: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: 'rgba(243,244,246,0.8)',
    borderRadius: RADIUS.pill,
    minHeight: 24.5,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  wrap: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
  },
  settlementCopy: {
    flex: 1,
    gap: 1,
  },
  settlementDivider: {
    backgroundColor: COLORS.border.default,
    height: 1,
    marginTop: 8,
    width: '100%',
  },
  settlementExpandedCard: {
    backgroundColor: COLORS.background.page,
    borderRadius: 12,
    padding: 12,
  },
  settlementExpandedWrap: {
    paddingBottom: 12,
    paddingHorizontal: SPACING.lg,
  },
  settlementHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    minHeight: 53,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  settlementHeaderMain: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  settlementIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.accent.purpleSoft,
    borderRadius: RADIUS.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  settlementMemberAmount: {
    color: COLORS.text.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  settlementMemberCurrentUser: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  settlementMemberIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.background.gray,
    borderRadius: RADIUS.pill,
    height: 16,
    justifyContent: 'center',
    width: 16,
  },
  settlementMemberIconWrapDone: {
    backgroundColor: COLORS.brand.primarySoft,
  },
  settlementMemberLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  settlementMemberLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 2,
  },
  settlementMemberLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  settlementMemberRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  settlementStatusLabel: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 15,
  },
  settlementStatusLabelDone: {
    color: COLORS.status.success,
  },
  settlementStatusLabelPending: {
    color: COLORS.accent.yellowStrong,
  },
  settlementStatusPill: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    minHeight: 19,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  settlementStatusPillDone: {
    backgroundColor: COLORS.brand.primarySoft,
  },
  settlementStatusPillPending: {
    backgroundColor: COLORS.accent.yellowSoft,
  },
  settlementSubtitle: {
    color: COLORS.text.muted,
    fontSize: 11,
    lineHeight: 14,
  },
  settlementTitle: {
    color: COLORS.text.primary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  settlementTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  settlementTotalLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  settlementTotalRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  settlementTotalValue: {
    color: COLORS.text.primary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  settlementWrap: {
    backgroundColor: COLORS.background.surface,
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
    ...SHADOWS.card,
  },
});
