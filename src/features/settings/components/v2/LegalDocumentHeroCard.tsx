import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_RADIUS,
  V2_SPACING,
  V2_SHADOWS,
} from '@/shared/design-system/tokens';

import type {LegalDocumentBannerViewData} from '../../model/legalDocumentViewData';

interface LegalDocumentHeroCardProps {
  banner: LegalDocumentBannerViewData;
}

export const LegalDocumentHeroCard = ({
  banner,
}: LegalDocumentHeroCardProps) => {
  return (
    <View style={[styles.container, {backgroundColor: banner.backgroundColor}]}>
      <View style={styles.iconWrap}>
        <Icon color={banner.iconColor} name={banner.iconName} size={18} />
      </View>

      <View style={styles.content}>
        <Text style={[styles.title, {color: banner.titleColor}]}>
          {banner.title}
        </Text>

        {banner.lines.map((line, index) => (
          <Text
            key={`${line.text}-${index}`}
            style={[styles.line, {color: line.color}]}>
            {line.text}
          </Text>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...V2_SHADOWS.card,
    borderRadius: V2_RADIUS.lg,
    flexDirection: 'row',
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: 12,
  },
  content: {
    flex: 1,
  },
  iconWrap: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    marginRight: 12,
    width: 32,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    marginBottom: 2,
  },
  line: {
    fontSize: 12,
    lineHeight: 16,
  },
});
