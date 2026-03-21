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
  SPACING,
} from '@/shared/design-system/tokens';

import type {TaxiChatSummaryViewData} from '../model/taxiChatViewData';

interface TaxiChatSummaryCardProps {
  settlementNoticeExpanded: boolean;
  summary: TaxiChatSummaryViewData;
  onToggleSettlementNotice: () => void;
}

const renderStatusCopy = (status: TaxiChatSummaryViewData['partyStatus']) => {
  switch (status) {
    case 'closed':
      return '모집 마감';
    case 'arrived':
      return '도착 / 정산 중';
    case 'ended':
      return '파티 종료';
    case 'open':
    default:
      return '모집 중';
  }
};

export const TaxiChatSummaryCard = ({
  settlementNoticeExpanded,
  summary,
  onToggleSettlementNotice,
}: TaxiChatSummaryCardProps) => {
  return (
    <View style={styles.wrap}>
      <View style={styles.routeCard}>
        <View style={styles.routeRow}>
          <View style={styles.routeSide}>
            <View style={[styles.routeIconWrap, styles.departureIconWrap]}>
              <Icon color={COLORS.background.surface} name="location" size={12} />
            </View>
            <Text numberOfLines={1} style={styles.routeLabel}>
              {summary.departureLabel}
            </Text>
          </View>

          <Icon color={COLORS.text.muted} name="arrow-forward-outline" size={14} />

          <View style={[styles.routeSide, styles.routeSideEnd]}>
            <Text numberOfLines={1} style={styles.routeLabel}>
              {summary.destinationLabel}
            </Text>
            <View style={[styles.routeIconWrap, styles.destinationIconWrap]}>
              <Icon
                color={COLORS.background.surface}
                name="business-outline"
                size={12}
              />
            </View>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Icon color={COLORS.text.secondary} name="time-outline" size={12} />
            <Text style={styles.metaLabel}>{summary.departureTimeLabel}</Text>
          </View>

          <View style={styles.metaItem}>
            <Icon color={COLORS.accent.orange} name="people-outline" size={12} />
            <Text style={styles.metaLabel}>{summary.memberSummaryLabel}</Text>
          </View>

          <View style={styles.tagPill}>
            <Text style={styles.tagLabel}>{summary.tagLabel}</Text>
          </View>
        </View>

        <View style={styles.statusRow}>
          <View style={styles.statusPill}>
            <Text style={styles.statusLabel}>
              {renderStatusCopy(summary.partyStatus)}
            </Text>
          </View>

          {summary.detail ? (
            <Text numberOfLines={1} style={styles.detailLabel}>
              {summary.detail}
            </Text>
          ) : null}
        </View>
      </View>

      {summary.settlementNotice ? (
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.92}
          onPress={onToggleSettlementNotice}
          style={styles.noticeCard}>
          <View style={styles.noticeHeaderRow}>
            <View style={styles.noticeTitleWrap}>
              <View style={styles.noticeIconWrap}>
                <Icon
                  color={COLORS.accent.purple}
                  name="wallet-outline"
                  size={14}
                />
              </View>
              <View style={styles.noticeCopyWrap}>
                <View style={styles.noticeTitleRow}>
                  <Text style={styles.noticeTitle}>정산 현황</Text>
                  <View
                    style={[
                      styles.noticeStatusPill,
                      summary.settlementNotice.statusLabel === '완료'
                        ? styles.noticeStatusPillDone
                        : styles.noticeStatusPillPending,
                    ]}>
                    <Text
                      style={[
                        styles.noticeStatusLabel,
                        summary.settlementNotice.statusLabel === '완료'
                          ? styles.noticeStatusLabelDone
                          : styles.noticeStatusLabelPending,
                      ]}>
                      {summary.settlementNotice.statusLabel}
                    </Text>
                  </View>
                </View>
                <Text style={styles.noticeDescription}>
                  {summary.settlementNotice.description}
                </Text>
              </View>
            </View>

            <Icon
              color={COLORS.text.muted}
              name={settlementNoticeExpanded ? 'chevron-up' : 'chevron-down'}
              size={18}
            />
          </View>

          <Text style={styles.noticeSummary}>
            {summary.settlementNotice.summaryLabel}
          </Text>

          {settlementNoticeExpanded ? (
            <View style={styles.noticeExpandedContent}>
              {summary.settlementNotice.perPersonAmount ? (
                <View style={styles.noticeMetricCard}>
                  <View>
                    <Text style={styles.noticeMetricLabel}>1인당 송금 금액</Text>
                    <Text style={styles.noticeMetricValue}>
                      {`${summary.settlementNotice.perPersonAmount.toLocaleString('ko-KR')}원`}
                    </Text>
                  </View>
                  {summary.settlementNotice.accountLabel ? (
                    <View style={styles.noticeMetricRight}>
                      <Text style={styles.noticeMetricLabel}>정산 계좌</Text>
                      <Text style={styles.noticeMetricValueRight}>
                        {summary.settlementNotice.accountLabel}
                      </Text>
                    </View>
                  ) : null}
                </View>
              ) : null}

              {summary.settlementNotice.taxiFare ||
              summary.settlementNotice.splitMemberCount ? (
                <View style={styles.noticeMetaStrip}>
                  {summary.settlementNotice.taxiFare ? (
                    <Text style={styles.noticeMetaLabel}>
                      {`총 ${summary.settlementNotice.taxiFare.toLocaleString('ko-KR')}원`}
                    </Text>
                  ) : null}
                  {summary.settlementNotice.splitMemberCount ? (
                    <Text style={styles.noticeMetaLabel}>
                      {`${summary.settlementNotice.splitMemberCount}명 정산`}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              <View style={styles.noticeMemberList}>
                {summary.settlementNotice.members.map(member => (
                  <View
                    key={member.id}
                    style={[
                      styles.noticeMemberRow,
                      member.settled
                        ? styles.noticeMemberRowDone
                        : styles.noticeMemberRowPending,
                    ]}>
                    <View style={styles.noticeMemberLeft}>
                      <View
                        style={[
                          styles.noticeMemberIconWrap,
                          member.settled
                            ? styles.noticeMemberIconWrapDone
                            : styles.noticeMemberIconWrapPending,
                        ]}>
                        <Icon
                          color={
                            member.settled
                              ? COLORS.status.success
                              : COLORS.text.muted
                          }
                          name={
                            member.settled
                              ? 'checkmark-outline'
                              : 'ellipse-outline'
                          }
                          size={14}
                        />
                      </View>
                      <View style={styles.noticeMemberCopyWrap}>
                        <Text style={styles.noticeMemberLabel}>
                          {member.label}
                          {member.isCurrentUser ? ' (나)' : ''}
                        </Text>
                        <Text
                          style={[
                            styles.noticeMemberMeta,
                            member.settled
                              ? styles.noticeMemberMetaDone
                              : styles.noticeMemberMetaPending,
                          ]}>
                          {member.settled ? '정산 완료' : '정산 대기'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </TouchableOpacity>
      ) : null}

      {summary.management.noticeLabel ? (
        <Text style={styles.managementNoticeLabel}>
          {summary.management.noticeLabel}
        </Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  departureIconWrap: {
    backgroundColor: COLORS.accent.yellow,
  },
  destinationIconWrap: {
    backgroundColor: COLORS.accent.orange,
  },
  detailLabel: {
    color: COLORS.text.secondary,
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'right',
  },
  managementNoticeLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 18,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  metaLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  noticeCard: {
    backgroundColor: COLORS.background.surface,
    borderTopColor: COLORS.border.subtle,
    borderTopWidth: 1,
    paddingTop: SPACING.md,
  },
  noticeCopyWrap: {
    flex: 1,
    gap: 2,
  },
  noticeDescription: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  noticeExpandedContent: {
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  noticeHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noticeIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.accent.purpleSoft,
    borderRadius: RADIUS.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  noticeMemberCopyWrap: {
    gap: 2,
  },
  noticeMemberIconWrap: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  noticeMemberIconWrapDone: {
    backgroundColor: COLORS.brand.primarySoft,
  },
  noticeMemberIconWrapPending: {
    backgroundColor: COLORS.background.subtle,
  },
  noticeMemberLabel: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  noticeMemberLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  noticeMemberList: {
    gap: SPACING.sm,
  },
  noticeMemberMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  noticeMemberMetaDone: {
    color: COLORS.status.success,
  },
  noticeMemberMetaPending: {
    color: COLORS.text.muted,
  },
  noticeMemberRow: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  noticeMemberRowDone: {
    backgroundColor: COLORS.brand.primaryTint,
    borderColor: COLORS.border.accent,
  },
  noticeMemberRowPending: {
    backgroundColor: COLORS.background.subtle,
    borderColor: COLORS.border.default,
  },
  noticeMetricCard: {
    backgroundColor: COLORS.accent.purpleSoft,
    borderRadius: RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  noticeMetricLabel: {
    color: COLORS.accent.purple,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  noticeMetricRight: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: SPACING.md,
  },
  noticeMetaLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  noticeMetaStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  noticeMetricValue: {
    color: '#7E22CE',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 2,
  },
  noticeMetricValueRight: {
    color: '#7E22CE',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: 2,
    textAlign: 'right',
  },
  noticeStatusLabel: {
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
  },
  noticeStatusLabelDone: {
    color: COLORS.status.success,
  },
  noticeStatusLabelPending: {
    color: COLORS.accent.purple,
  },
  noticeStatusPill: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    minHeight: 18,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  noticeStatusPillDone: {
    backgroundColor: COLORS.brand.primarySoft,
  },
  noticeStatusPillPending: {
    backgroundColor: COLORS.accent.purpleSoft,
  },
  noticeSummary: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginTop: SPACING.sm,
    marginLeft: 36,
  },
  noticeTitle: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  noticeTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  noticeTitleWrap: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  routeCard: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.accent.yellowBorder,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: 13,
  },
  routeIconWrap: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  routeLabel: {
    color: COLORS.text.primary,
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  routeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
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
  statusLabel: {
    color: COLORS.accent.yellowStrong,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 14,
  },
  statusPill: {
    alignItems: 'center',
    backgroundColor: COLORS.accent.yellowSoft,
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    minHeight: 18,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  tagLabel: {
    color: COLORS.accent.yellowStrong,
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
  },
  tagPill: {
    alignItems: 'center',
    backgroundColor: COLORS.accent.yellowSoft,
    borderRadius: RADIUS.pill,
    justifyContent: 'center',
    minHeight: 18,
    marginLeft: 'auto',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  wrap: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
    marginTop: SPACING.xs,
  },
});
