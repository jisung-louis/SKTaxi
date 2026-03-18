import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type ImageSourcePropType,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

type AppNoticeHeroCarouselProps = {
  images: ImageSourcePropType[];
};

const HERO_HEIGHT = 208;

export const AppNoticeHeroCarousel = ({
  images,
}: AppNoticeHeroCarouselProps) => {
  const {width} = useWindowDimensions();
  const listRef = React.useRef<FlatList<ImageSourcePropType>>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const handleMomentumScrollEnd = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
      setCurrentIndex(nextIndex);
    },
    [width],
  );

  const scrollToIndex = React.useCallback((nextIndex: number) => {
    listRef.current?.scrollToIndex({animated: true, index: nextIndex});
    setCurrentIndex(nextIndex);
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        ref={listRef}
        data={images}
        horizontal
        keyExtractor={(_, index) => `hero-${index}`}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        pagingEnabled
        renderItem={({item}) => (
          <Image source={item} style={[styles.image, {width}]} />
        )}
        showsHorizontalScrollIndicator={false}
      />

      {images.length > 1 ? (
        <>
          <TouchableOpacity
            accessibilityLabel="이전 이미지"
            accessibilityRole="button"
            activeOpacity={0.82}
            disabled={currentIndex === 0}
            onPress={() => scrollToIndex(currentIndex - 1)}
            style={[
              styles.arrowButton,
              styles.leftArrow,
              currentIndex === 0 ? styles.arrowDisabled : null,
            ]}>
            <Icon color={V2_COLORS.text.primary} name="chevron-back" size={18} />
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityLabel="다음 이미지"
            accessibilityRole="button"
            activeOpacity={0.82}
            disabled={currentIndex === images.length - 1}
            onPress={() => scrollToIndex(currentIndex + 1)}
            style={[
              styles.arrowButton,
              styles.rightArrow,
              currentIndex === images.length - 1 ? styles.arrowDisabled : null,
            ]}>
            <Icon
              color={V2_COLORS.text.primary}
              name="chevron-forward"
              size={18}
            />
          </TouchableOpacity>

          <View style={styles.pageIndicator}>
            <Text style={styles.pageIndicatorLabel}>
              {currentIndex + 1} / {images.length}
            </Text>
          </View>
        </>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: V2_COLORS.background.subtle,
    height: HERO_HEIGHT,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  image: {
    height: HERO_HEIGHT,
    resizeMode: 'cover',
  },
  arrowButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: V2_RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    position: 'absolute',
    top: HERO_HEIGHT / 2 - 18,
    width: 36,
    ...V2_SHADOWS.card,
  },
  leftArrow: {
    left: V2_SPACING.lg,
  },
  rightArrow: {
    right: V2_SPACING.lg,
  },
  arrowDisabled: {
    opacity: 0.35,
  },
  pageIndicator: {
    backgroundColor: 'rgba(17,24,39,0.72)',
    borderRadius: V2_RADIUS.pill,
    bottom: V2_SPACING.md,
    paddingHorizontal: 10,
    paddingVertical: 5,
    position: 'absolute',
    right: V2_SPACING.lg,
  },
  pageIndicatorLabel: {
    color: V2_COLORS.text.inverse,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
});
