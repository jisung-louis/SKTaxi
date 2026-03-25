import React from 'react';
import {Image, StyleSheet, View} from 'react-native';

import {COLORS, RADIUS} from '../tokens';

const DEFAULT_SIZE = 76;

interface ListCardThumbnailProps {
  accessibilityLabel?: string;
  size?: number;
  uri: string;
}

export const ListCardThumbnail = ({
  accessibilityLabel,
  size = DEFAULT_SIZE,
  uri,
}: ListCardThumbnailProps) => {
  return (
    <View
      style={[
        styles.frame,
        {
          height: size,
          width: size,
        },
      ]}>
      <Image
        accessibilityLabel={accessibilityLabel}
        resizeMode="cover"
        source={{uri}}
        style={styles.image}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  frame: {
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  image: {
    height: '100%',
    width: '100%',
  },
});
