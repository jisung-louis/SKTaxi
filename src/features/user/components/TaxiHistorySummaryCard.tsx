import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import {RADIUS, SPACING} from '@/shared/design-system/tokens';

import type {TaxiHistorySummaryViewData} from '../model/userActivityViewData';

interface TaxiHistorySummaryCardProps {
  item: TaxiHistorySummaryViewData;
}

export const TaxiHistorySummaryCard = ({
  item,
}: TaxiHistorySummaryCardProps) => {
  return (
    <LinearGradient
      colors={['#22C55E', '#059669']}
      end={{x: 1, y: 1}}
      start={{x: 0, y: 0}}
      style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.title}>{item.title}</Text>

        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.value}>{item.completedRideCountLabel}</Text>
            <Text style={styles.subtitle}>{item.subtitleCompleted}</Text>
          </View>

          <View style={styles.statBlock}>
            <Text style={styles.value}>{item.savedFareLabel}</Text>
            <Text style={styles.subtitle}>{item.subtitleSaved}</Text>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    minHeight: 118,
  },
  content: {
    padding: SPACING.xl,
  },
  title: {
    color: '#DCFCE7',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statBlock: {
    flex: 1,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
    marginBottom: 2,
  },
  subtitle: {
    color: '#DCFCE7',
    fontSize: 12,
    lineHeight: 16,
  },
});
