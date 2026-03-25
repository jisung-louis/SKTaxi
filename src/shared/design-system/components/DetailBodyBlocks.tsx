import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

import type {ContentDetailBodyBlockViewData} from '@/shared/types/contentDetailViewData';

import {COLORS, RADIUS, SPACING} from '../tokens';

interface DetailBodyBlocksProps {
  blocks: ContentDetailBodyBlockViewData[];
}

export const DetailBodyBlocks = ({blocks}: DetailBodyBlocksProps) => {
  return (
    <View>
      {blocks.map((block, index) => {
        const isLast = index === blocks.length - 1;

        if (block.type === 'image') {
          return (
            <Image
              key={block.id}
              accessibilityLabel={block.alt}
              resizeMode="cover"
              source={{uri: block.imageUrl}}
              style={[
                styles.image,
                {
                  aspectRatio: block.aspectRatio ?? 16 / 9,
                },
                !isLast ? styles.blockSpacing : null,
              ]}
            />
          );
        }

        return (
          <Text
            key={block.id}
            style={[styles.paragraph, !isLast ? styles.blockSpacing : null]}>
            {block.text}
          </Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  paragraph: {
    color: COLORS.text.strong,
    fontSize: 14,
    lineHeight: 23,
  },
  image: {
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.lg,
    width: '100%',
  },
  blockSpacing: {
    marginBottom: SPACING.lg,
  },
});
