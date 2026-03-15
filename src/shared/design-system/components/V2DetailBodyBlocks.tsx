import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';

import type {ContentDetailBodyBlockViewData} from '@/shared/types/contentDetailViewData';

import {V2_COLORS, V2_RADIUS, V2_SPACING} from '../tokens';

interface V2DetailBodyBlocksProps {
  blocks: ContentDetailBodyBlockViewData[];
}

export const V2DetailBodyBlocks = ({blocks}: V2DetailBodyBlocksProps) => {
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
    color: V2_COLORS.text.strong,
    fontSize: 14,
    lineHeight: 23,
  },
  image: {
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: V2_RADIUS.lg,
    width: '100%',
  },
  blockSpacing: {
    marginBottom: V2_SPACING.lg,
  },
});
