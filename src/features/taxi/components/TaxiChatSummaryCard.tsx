import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '@/shared/design-system/tokens';

import type {
  TaxiChatLeaderActionId,
  TaxiChatSummaryMemberActionViewData,
  TaxiChatSummaryViewData,
} from '../model/taxiChatViewData';

interface TaxiChatSummaryCardProps {
  arrivalEditorVisible: boolean
  arrivalFareInput: string
  loadingActionId?: string | null
  summary: TaxiChatSummaryViewData
  onCancelArrivalEditor: () => void
  onChangeArrivalFareInput: (value: string) => void
  onPressLeaderAction: (actionId: TaxiChatLeaderActionId) => void
  onPressMemberAction: (
    memberAction: TaxiChatSummaryMemberActionViewData,
  ) => void
  onSubmitArrivalFare: () => void
}

interface SummaryActionButtonProps {
  actionId?: string
  label: string
  loading?: boolean
  tone: 'primary' | 'secondary' | 'danger'
  onPress: () => void
}

const SummaryActionButton = ({
  label,
  loading = false,
  tone,
  onPress,
}: SummaryActionButtonProps) => {
  const isPrimary = tone === 'primary';
  const isDanger = tone === 'danger';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.84}
      disabled={loading}
      onPress={onPress}
      style={[
        styles.actionButton,
        isPrimary
          ? styles.actionButtonPrimary
          : isDanger
          ? styles.actionButtonDanger
          : styles.actionButtonSecondary,
      ]}>
      {loading ? (
        <ActivityIndicator
          color={isPrimary ? COLORS.text.inverse : COLORS.brand.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.actionButtonLabel,
            isPrimary
              ? styles.actionButtonLabelPrimary
              : isDanger
              ? styles.actionButtonLabelDanger
              : styles.actionButtonLabelSecondary,
          ]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const renderStatusLabelStyle = (
  tone: TaxiChatSummaryViewData['management']['statusTone'],
) => {
  switch (tone) {
    case 'closed':
      return {
        containerStyle: [styles.statusPill, styles.statusPillMuted],
        textStyle: styles.statusLabelMuted,
      };
    case 'arrived':
      return {
        containerStyle: [styles.statusPill, styles.statusPillPrimary],
        textStyle: styles.statusLabelPrimary,
      };
    case 'ended':
      return {
        containerStyle: [styles.statusPill, styles.statusPillDanger],
        textStyle: styles.statusLabelDanger,
      };
    case 'open':
    default:
      return {
        containerStyle: [styles.statusPill, styles.statusPillSuccess],
        textStyle: styles.statusLabelSuccess,
      };
  }
};

export const TaxiChatSummaryCard = ({
  arrivalEditorVisible,
  arrivalFareInput,
  loadingActionId,
  summary,
  onCancelArrivalEditor,
  onChangeArrivalFareInput,
  onPressLeaderAction,
  onPressMemberAction,
  onSubmitArrivalFare,
}: TaxiChatSummaryCardProps) => {
  const statusStyles = renderStatusLabelStyle(summary.management.statusTone);

  return (
    <View style={styles.card}>
      <View style={styles.routeRow}>
        <View style={styles.routeSide}>
          <View style={[styles.routeIconWrap, styles.departureIconWrap]}>
            <Icon
              color={COLORS.background.surface}
              name="location"
              size={12}
            />
          </View>
          <Text numberOfLines={1} style={styles.routeLabel}>
            {summary.departureLabel}
          </Text>
        </View>

        <Icon
          color={COLORS.text.muted}
          name="arrow-forward-outline"
          size={14}
        />

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
        <View style={styles.metaGroup}>
          <View style={styles.metaItem}>
            <Icon color={COLORS.text.secondary} name="time-outline" size={12} />
            <Text style={styles.metaLabel}>{summary.departureTimeLabel}</Text>
          </View>

          <View style={styles.metaItem}>
            <Icon color={COLORS.accent.orange} name="people-outline" size={12} />
            <Text style={styles.metaLabel}>{summary.memberSummaryLabel}</Text>
          </View>
        </View>

        <View style={styles.tagPill}>
          <Text style={styles.tagLabel}>{summary.tagLabel}</Text>
        </View>
        </View>

      <View style={styles.managementSection}>
        <View style={styles.managementTopRow}>
          <View style={statusStyles.containerStyle}>
            <Text style={statusStyles.textStyle}>
              {summary.management.statusLabel}
            </Text>
          </View>
          {summary.management.settlementSummaryLabel ? (
            <Text style={styles.settlementSummaryLabel}>
              {summary.management.settlementSummaryLabel}
            </Text>
          ) : null}
        </View>

        {summary.management.noticeLabel ? (
          <Text style={styles.noticeLabel}>{summary.management.noticeLabel}</Text>
        ) : null}

        {summary.management.primaryActions.length > 0 ? (
          <View style={styles.primaryActionsRow}>
            {summary.management.primaryActions.map(action => (
              <SummaryActionButton
                key={action.id}
                label={action.label}
                loading={loadingActionId === action.id && action.id !== 'arrive'}
                tone={action.tone}
                onPress={() => onPressLeaderAction(action.id)}
              />
            ))}
          </View>
        ) : null}

        {arrivalEditorVisible ? (
          <View style={styles.arrivalEditor}>
            <Text style={styles.arrivalEditorTitle}>택시 총액 입력</Text>
            <TextInput
              keyboardType="number-pad"
              placeholder="예: 18000"
              placeholderTextColor={COLORS.text.muted}
              selectionColor={COLORS.brand.primary}
              style={styles.arrivalInput}
              value={arrivalFareInput}
              onChangeText={onChangeArrivalFareInput}
            />
            <View style={styles.arrivalActionsRow}>
              <SummaryActionButton
                label="취소"
                tone="secondary"
                onPress={onCancelArrivalEditor}
              />
              <SummaryActionButton
                label="도착 확정"
                loading={loadingActionId === 'arrive'}
                tone="primary"
                onPress={onSubmitArrivalFare}
              />
            </View>
          </View>
        ) : null}

        {summary.management.memberActionSectionTitle &&
        summary.management.memberActions.length > 0 ? (
          <View style={styles.memberSection}>
            <Text style={styles.memberSectionTitle}>
              {summary.management.memberActionSectionTitle}
            </Text>
            {summary.management.memberActions.map(memberAction => (
              <View key={memberAction.id} style={styles.memberRow}>
                <View style={styles.memberCopy}>
                  <Text style={styles.memberLabel}>{memberAction.label}</Text>
                  <Text style={styles.memberMetaLabel}>
                    {memberAction.metaLabel}
                  </Text>
                </View>
                {memberAction.actionId && memberAction.actionLabel ? (
                  <SummaryActionButton
                    label={memberAction.actionLabel}
                    loading={loadingActionId === `${memberAction.actionId}:${memberAction.id}`}
                    tone={memberAction.actionTone ?? 'secondary'}
                    onPress={() => onPressMemberAction(memberAction)}
                  />
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  actionButton: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 38,
    paddingHorizontal: SPACING.md,
  },
  actionButtonDanger: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.status.danger,
  },
  actionButtonLabel: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  actionButtonLabelDanger: {
    color: COLORS.status.danger,
  },
  actionButtonLabelPrimary: {
    color: COLORS.text.inverse,
  },
  actionButtonLabelSecondary: {
    color: COLORS.text.primary,
  },
  actionButtonPrimary: {
    backgroundColor: COLORS.brand.primary,
    borderColor: COLORS.brand.primary,
  },
  actionButtonSecondary: {
    backgroundColor: COLORS.background.subtle,
    borderColor: COLORS.border.default,
  },
  arrivalActionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  arrivalEditor: {
    backgroundColor: COLORS.background.subtle,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    gap: SPACING.sm,
    marginTop: SPACING.md,
    padding: SPACING.md,
  },
  arrivalEditorTitle: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  arrivalInput: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    color: COLORS.text.primary,
    fontSize: 15,
    fontWeight: '600',
    minHeight: 44,
    paddingHorizontal: SPACING.md,
    paddingVertical: 10,
  },
  card: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.accent.yellowBorder,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    marginBottom: SPACING.lg,
    marginTop: SPACING.xs,
    padding: 13,
  },
  departureIconWrap: {
    backgroundColor: COLORS.accent.yellow,
  },
  destinationIconWrap: {
    backgroundColor: COLORS.accent.orange,
  },
  managementSection: {
    borderTopColor: COLORS.border.subtle,
    borderTopWidth: 1,
    gap: SPACING.sm,
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
  },
  managementTopRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'space-between',
  },
  memberCopy: {
    flex: 1,
    gap: 2,
  },
  memberLabel: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  memberMetaLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  memberRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  memberSection: {
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  memberSectionTitle: {
    color: COLORS.text.primary,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  metaGroup: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  metaItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  metaLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noticeLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 18,
  },
  primaryActionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xs,
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
    marginBottom: SPACING.sm,
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
  settlementSummaryLabel: {
    color: COLORS.text.secondary,
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'right',
  },
  statusLabelDanger: {
    color: COLORS.status.danger,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  statusLabelMuted: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  statusLabelPrimary: {
    color: COLORS.brand.primary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  statusLabelSuccess: {
    color: COLORS.status.success,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  statusPill: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    minHeight: 24,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
  },
  statusPillDanger: {
    backgroundColor: COLORS.background.subtle,
  },
  statusPillMuted: {
    backgroundColor: COLORS.background.subtle,
  },
  statusPillPrimary: {
    backgroundColor: COLORS.accent.yellowSoft,
  },
  statusPillSuccess: {
    backgroundColor: '#E9F8EF',
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
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
});
