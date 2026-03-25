import React from 'react';
import {
  ActivityIndicator,
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

import type {TaxiChatSettlementNoticeViewData} from '../model/taxiChatViewData';
import {TaxiChatBottomSheet} from './TaxiChatBottomSheet';

interface TaxiSettlementStatusSheetProps {
  isLeader: boolean;
  loadingActionId?: string | null;
  notice?: TaxiChatSettlementNoticeViewData;
  onClose: () => void;
  onConfirmMember: (memberId: string) => void;
  visible: boolean;
}

export const TaxiSettlementStatusSheet = ({
  isLeader,
  loadingActionId,
  notice,
  onClose,
  onConfirmMember,
  visible,
}: TaxiSettlementStatusSheetProps) => {
  return (
    <TaxiChatBottomSheet onClose={onClose} visible={visible}>
      <View style={styles.headerRow}>
        <View style={styles.titleIconWrap}>
          <Icon color={COLORS.accent.purple} name="wallet-outline" size={16} />
        </View>
        <View style={styles.headerCopyWrap}>
          <Text style={styles.title}>정산 현황 관리</Text>
          <Text style={styles.headerDescription}>
            {notice?.summaryLabel ?? '정산 정보가 없습니다.'}
          </Text>
        </View>
      </View>

      {notice?.perPersonAmount ? (
        <View style={styles.metricCard}>
          <View>
            <Text style={styles.metricLabel}>1인당 송금 금액</Text>
            <Text style={styles.metricValue}>
              {`${notice.perPersonAmount.toLocaleString('ko-KR')}원`}
            </Text>
          </View>
          {notice.taxiFare || notice.splitMemberCount ? (
            <View style={styles.metricCenter}>
              {notice.taxiFare ? (
                <Text style={styles.metricCaption}>
                  {`총 ${notice.taxiFare.toLocaleString('ko-KR')}원`}
                </Text>
              ) : null}
              {notice.splitMemberCount ? (
                <Text style={styles.metricCaption}>
                  {`${notice.splitMemberCount}명 정산`}
                </Text>
              ) : null}
            </View>
          ) : null}
          {notice.accountLabel ? (
            <View style={styles.metricRight}>
              <Text style={styles.metricLabel}>정산 계좌</Text>
              <Text style={styles.metricAccount}>{notice.accountLabel}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      <View style={styles.memberList}>
        {notice?.members.map(member => {
          const loading = loadingActionId === `confirmSettlement:${member.id}`;

          return (
            <View
              key={member.id}
              style={[
                styles.memberRow,
                member.settled ? styles.memberRowDone : styles.memberRowPending,
              ]}>
              <View style={styles.memberLeft}>
                <View
                  style={[
                    styles.memberIconWrap,
                    member.settled
                      ? styles.memberIconWrapDone
                      : styles.memberIconWrapPending,
                  ]}>
                  <Icon
                    color={
                      member.settled ? COLORS.status.success : COLORS.text.muted
                    }
                    name={
                      member.settled
                        ? 'checkmark-outline'
                        : 'ellipse-outline'
                    }
                    size={14}
                  />
                </View>

                <View>
                  <Text style={styles.memberLabel}>
                    {member.label}
                    {member.isCurrentUser ? ' (나)' : ''}
                  </Text>
                  <Text
                    style={[
                      styles.memberMeta,
                      member.settled
                        ? styles.memberMetaDone
                        : styles.memberMetaPending,
                    ]}>
                    {member.settled ? '정산 완료' : '정산 대기'}
                  </Text>
                </View>
              </View>

              {isLeader ? (
                member.settled ? (
                  <View style={styles.donePill}>
                    <Icon
                      color={COLORS.status.success}
                      name="checkmark-circle-outline"
                      size={14}
                    />
                    <Text style={styles.donePillLabel}>완료</Text>
                  </View>
                ) : (
                  <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={loading ? 1 : 0.84}
                    disabled={loading}
                    onPress={() => {
                      onConfirmMember(member.id);
                    }}
                    style={styles.confirmButton}>
                    {loading ? (
                      <ActivityIndicator color={COLORS.text.inverse} size="small" />
                    ) : (
                      <Text style={styles.confirmButtonLabel}>정산완료</Text>
                    )}
                  </TouchableOpacity>
                )
              ) : null}
            </View>
          );
        })}
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.84}
        onPress={onClose}
        style={styles.closeButton}>
        <Text style={styles.closeButtonLabel}>닫기</Text>
      </TouchableOpacity>
    </TaxiChatBottomSheet>
  );
};

const styles = StyleSheet.create({
  closeButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.lg,
    height: 48,
    justifyContent: 'center',
    marginTop: SPACING.xl,
  },
  closeButtonLabel: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primary,
    borderRadius: RADIUS.lg,
    justifyContent: 'center',
    minHeight: 32,
    minWidth: 88,
    paddingHorizontal: 12,
  },
  confirmButtonLabel: {
    color: COLORS.text.inverse,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  donePill: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  donePillLabel: {
    color: COLORS.status.success,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  headerCopyWrap: {
    flex: 1,
    gap: 2,
  },
  headerDescription: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  memberIconWrap: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  memberIconWrapDone: {
    backgroundColor: COLORS.brand.primarySoft,
  },
  memberIconWrapPending: {
    backgroundColor: COLORS.background.subtle,
  },
  memberLabel: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 18,
  },
  memberLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  memberList: {
    gap: SPACING.sm,
    marginTop: SPACING.xl,
  },
  memberMeta: {
    fontSize: 12,
    lineHeight: 16,
  },
  memberMetaDone: {
    color: COLORS.status.success,
  },
  memberMetaPending: {
    color: COLORS.text.muted,
  },
  memberRow: {
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  memberRowDone: {
    backgroundColor: COLORS.brand.primaryTint,
    borderColor: COLORS.border.accent,
  },
  memberRowPending: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.default,
  },
  metricAccount: {
    color: '#7E22CE',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: 2,
    textAlign: 'right',
  },
  metricCard: {
    backgroundColor: COLORS.accent.purpleSoft,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  metricCaption: {
    color: COLORS.text.secondary,
    fontSize: 11,
    lineHeight: 16,
  },
  metricCenter: {
    flex: 1,
    gap: 2,
    paddingHorizontal: SPACING.md,
  },
  metricLabel: {
    color: COLORS.accent.purple,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  metricRight: {
    alignItems: 'flex-end',
    flex: 1,
    marginLeft: SPACING.md,
  },
  metricValue: {
    color: '#7E22CE',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 2,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  titleIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.accent.purpleSoft,
    borderRadius: RADIUS.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
});
