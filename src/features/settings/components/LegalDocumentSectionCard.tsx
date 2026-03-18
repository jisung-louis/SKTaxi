import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

import {
  COLORS,
  RADIUS,
  SPACING,
  SHADOWS,
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
    ...SHADOWS.card,
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
  },
  paragraph: {
    color: COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 19.5,
  },
  paragraphGroup: {
    gap: 0,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
});
