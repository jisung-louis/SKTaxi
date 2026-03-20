import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {ToggleSwitch} from '@/shared/design-system/components';
import {
  COLORS,
  RADIUS,
  SPACING,
} from '@/shared/design-system/tokens';
import type {AccountInfo} from '@/features/user/hooks/useAccountInfo';

import type {TaxiChatSettlementMemberViewData} from '../model/taxiChatViewData';
import {TaxiChatBottomSheet} from './TaxiChatBottomSheet';

interface TaxiArriveSettlementSheetProps {
  accountInfo?: AccountInfo | null;
  loading?: boolean;
  members: TaxiChatSettlementMemberViewData[];
  onClose: () => void;
  onSubmit: (taxiFare: number) => void;
  visible: boolean;
}

export const TaxiArriveSettlementSheet = ({
  accountInfo,
  loading = false,
  members,
  onClose,
  onSubmit,
  visible,
}: TaxiArriveSettlementSheetProps) => {
  const [taxiFareInput, setTaxiFareInput] = React.useState('');

  React.useEffect(() => {
    if (!visible) {
      return;
    }

    setTaxiFareInput('');
  }, [visible]);

  const parsedTaxiFare = Number(taxiFareInput.replace(/,/g, '').trim());
  const canSubmit = Number.isFinite(parsedTaxiFare) && parsedTaxiFare > 0;

  return (
    <TaxiChatBottomSheet onClose={onClose} visible={visible}>
      <View style={styles.headerRow}>
        <View style={styles.titleIconWrap}>
          <Icon color={COLORS.status.success} name="location-outline" size={16} />
        </View>
        <Text style={styles.title}>{'택시 도착 & 정산'}</Text>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>이름</Text>
        <View style={styles.readOnlyField}>
          <Text style={styles.readOnlyLabel}>
            {accountInfo?.accountHolder || '계좌 정보 미등록'}
          </Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>은행명</Text>
        <View style={styles.readOnlyField}>
          <Text style={styles.readOnlyLabel}>
            {accountInfo?.bankName || '계좌 정보 미등록'}
          </Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>계좌번호</Text>
        <View style={styles.readOnlyField}>
          <Text style={styles.readOnlyLabel}>
            {accountInfo?.accountNumber || '계좌 정보 미등록'}
          </Text>
        </View>
      </View>

      <View style={styles.toggleRow}>
        <View style={styles.toggleCopyWrap}>
          <Text style={styles.toggleTitle}>이름 가리기</Text>
          <Text style={styles.toggleDescription}>예) 홍길동 → 홍**</Text>
        </View>
        <ToggleSwitch disabled value={Boolean(accountInfo?.hideName)} />
      </View>

      <View style={styles.divider} />

      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>총 택시비</Text>
        <View style={styles.fareInputWrap}>
          <TextInput
            keyboardType="number-pad"
            placeholder="예: 4800"
            placeholderTextColor={COLORS.text.placeholder}
            selectionColor={COLORS.brand.primary}
            style={styles.fareInput}
            value={taxiFareInput}
            onChangeText={setTaxiFareInput}
          />
          <Text style={styles.fareSuffix}>원</Text>
        </View>
      </View>

      <View style={styles.formSection}>
        <Text style={styles.fieldLabel}>{`N빵할 인원 (${members.length}명)`}</Text>
        <View style={styles.memberList}>
          {members.map(member => (
            <View key={member.id} style={styles.memberRow}>
              <View style={styles.memberCheckWrap}>
                <Icon color={COLORS.text.inverse} name="checkmark" size={12} />
              </View>
              <Text style={styles.memberLabel}>
                {member.label}
                {member.isCurrentUser ? ' (나)' : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.84}
          onPress={onClose}
          style={[styles.button, styles.cancelButton]}>
          <Text style={styles.cancelButtonLabel}>취소</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={canSubmit && !loading ? 0.84 : 1}
          disabled={!canSubmit || loading}
          onPress={() => {
            if (canSubmit) {
              onSubmit(parsedTaxiFare);
            }
          }}
          style={[
            styles.button,
            canSubmit && !loading
              ? styles.submitButton
              : styles.submitButtonDisabled,
          ]}>
          <Text
            style={[
              styles.submitButtonLabel,
              (!canSubmit || loading) && styles.submitButtonLabelDisabled,
            ]}>
            {loading ? '처리 중...' : '확인'}
          </Text>
        </TouchableOpacity>
      </View>
    </TaxiChatBottomSheet>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    borderRadius: RADIUS.lg,
    flex: 1,
    height: 48,
    justifyContent: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.xl,
  },
  cancelButton: {
    backgroundColor: COLORS.background.subtle,
  },
  cancelButtonLabel: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  divider: {
    backgroundColor: COLORS.border.subtle,
    height: 1,
    marginTop: SPACING.lg,
  },
  fareInput: {
    color: COLORS.text.primary,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    padding: 0,
  },
  fareInputWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.background.page,
    borderColor: COLORS.border.subtle,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  fareSuffix: {
    color: COLORS.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  fieldLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 6,
  },
  formSection: {
    marginTop: SPACING.lg,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  memberCheckWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primary,
    borderRadius: RADIUS.pill,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  memberLabel: {
    color: COLORS.status.success,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  memberList: {
    gap: SPACING.sm,
  },
  memberRow: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primaryTint,
    borderColor: COLORS.border.accent,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
    minHeight: 46,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  readOnlyField: {
    backgroundColor: COLORS.background.page,
    borderColor: COLORS.border.subtle,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 46,
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  readOnlyLabel: {
    color: COLORS.text.primary,
    fontSize: 14,
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: COLORS.brand.primary,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.background.subtle,
  },
  submitButtonLabel: {
    color: COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  submitButtonLabelDisabled: {
    color: COLORS.text.placeholder,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  titleIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primaryTint,
    borderRadius: RADIUS.pill,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  toggleCopyWrap: {
    flex: 1,
    gap: 2,
  },
  toggleDescription: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  toggleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  toggleTitle: {
    color: COLORS.text.strong,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
