import React from 'react';
import {
  Image,
  Linking,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import {COLORS, RADIUS} from '@/shared/design-system/tokens';

const MAX_LANDSCAPE_WIDTH = 220;
const MAX_PORTRAIT_WIDTH = 180;

export const MessageImageBubble = ({uri}: {uri: string}) => {
  const [aspectRatio, setAspectRatio] = React.useState(1);

  React.useEffect(() => {
    let cancelled = false;

    Image.getSize(
      uri,
      (width, height) => {
        if (cancelled || width <= 0 || height <= 0) {
          return;
        }

        setAspectRatio(width / height);
      },
      () => {
        if (!cancelled) {
          setAspectRatio(1);
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [uri]);

  const resolvedWidth =
    aspectRatio >= 1 ? MAX_LANDSCAPE_WIDTH : MAX_PORTRAIT_WIDTH;

  return (
    <TouchableOpacity
      accessibilityLabel="이미지 메시지 열기"
      accessibilityRole="button"
      activeOpacity={0.92}
      onPress={() => {
        Linking.openURL(uri).catch(() => undefined);
      }}>
      <Image
        resizeMode="cover"
        source={{uri}}
        style={[
          styles.image,
          {
            aspectRatio,
            width: resolvedWidth,
          },
        ]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  image: {
    backgroundColor: COLORS.background.subtle,
    borderRadius: RADIUS.xl,
    maxHeight: 260,
    minHeight: 140,
  },
});
