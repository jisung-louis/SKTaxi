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

import {TaxiChatBottomSheet} from './TaxiChatBottomSheet';

export type TaxiCallProvider = 'kakaoT' | 'uber' | 'tmoneyGo';

interface TaxiTaxiCallSheetProps {
  onClose: () => void;
  onSelectProvider: (provider: TaxiCallProvider) => void;
  visible: boolean;
}

const PROVIDERS: Array<{
  id: TaxiCallProvider;
  iconName: string;
  iconTone: string;
  label: string;
}> = [
  {
    id: 'kakaoT',
    iconName: 'car-sport-outline',
    iconTone: COLORS.accent.yellow,
    label: '카카오T',
  },
  {
    id: 'uber',
    iconName: 'car-outline',
    iconTone: COLORS.text.primary,
    label: 'Uber',
  },
  {
    id: 'tmoneyGo',
    iconName: 'navigate-outline',
    iconTone: COLORS.accent.blue,
    label: '티머니GO',
  },
];

export const TaxiTaxiCallSheet = ({
  onClose,
  onSelectProvider,
  visible,
}: TaxiTaxiCallSheetProps) => {
  return (
    <TaxiChatBottomSheet onClose={onClose} visible={visible}>
      <View style={styles.headerRow}>
        <View style={styles.titleIconWrap}>
          <Icon color={COLORS.brand.primaryStrong} name="car-sport-outline" size={16} />
        </View>
        <Text style={styles.title}>택시 호출</Text>
      </View>

      <View style={styles.providerList}>
        {PROVIDERS.map(provider => (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.84}
            key={provider.id}
            onPress={() => {
              onSelectProvider(provider.id);
            }}
            style={styles.providerRow}>
            <View style={styles.providerLeft}>
              <View style={styles.providerIconWrap}>
                <Icon color={provider.iconTone} name={provider.iconName} size={18} />
              </View>
              <Text style={styles.providerLabel}>{provider.label}</Text>
            </View>
            <Icon color={COLORS.text.muted} name="chevron-forward" size={18} />
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        accessibilityRole="button"
        activeOpacity={0.84}
        onPress={onClose}
        style={styles.cancelButton}>
        <Text style={styles.cancelButtonLabel}>취소</Text>
      </TouchableOpacity>
    </TaxiChatBottomSheet>
  );
};

const styles = StyleSheet.create({
  cancelButton: {
    alignItems: 'center',
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.lg,
    height: 48,
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  cancelButtonLabel: {
    color: COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  providerIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  providerLabel: {
    color: COLORS.text.primary,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  providerLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  providerList: {
    marginTop: SPACING.xl,
  },
  providerRow: {
    alignItems: 'center',
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 60,
    paddingVertical: 8,
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
});
