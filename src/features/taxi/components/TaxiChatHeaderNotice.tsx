import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  COLORS,
  RADIUS,
  SPACING,
} from '@/shared/design-system/tokens';

import type {TaxiChatSettlementNoticeViewData} from '../model/taxiChatViewData';

interface TaxiChatHeaderNoticeProps {
  noticeLabel?: string;
  settlementNotice?: TaxiChatSettlementNoticeViewData;
  onPressSettlementNotice: () => void;
}

export const TaxiChatHeaderNotice = ({
  noticeLabel,
  settlementNotice,
  onPressSettlementNotice,
}: TaxiChatHeaderNoticeProps) => {
  if (settlementNotice) {
    return (
      <View style={styles.wrap}>
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.88}
          onPress={onPressSettlementNotice}
          style={styles.noticePill}>
          <Text numberOfLines={1} style={styles.noticeLabel}>
            {`정산 현황 · ${settlementNotice.summaryLabel}`}
          </Text>
        </TouchableOpacity>
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
});
