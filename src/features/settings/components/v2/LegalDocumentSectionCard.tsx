import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SPACING,
  V2_SHADOWS,
} from '@/shared/design-system/tokens';

import type {LegalDocumentSectionViewData} from '../../model/legalDocumentViewData';

interface LegalDocumentSectionCardProps {
  section: LegalDocumentSectionViewData;
}

export const LegalDocumentSectionCard = ({
  section,
}: LegalDocumentSectionCardProps) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{section.title}</Text>

      <View style={styles.paragraphGroup}>
        {section.paragraphs.map((paragraph, index) => (
          <Text key={`${section.id}-${index}`} style={styles.paragraph}>
            {paragraph}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    ...V2_SHADOWS.card,
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.lg,
    padding: V2_SPACING.lg,
  },
  paragraph: {
    color: V2_COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 19.5,
  },
  paragraphGroup: {
    gap: 0,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: V2_SPACING.sm,
  },
});
