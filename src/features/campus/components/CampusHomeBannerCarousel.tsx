import React from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
  type ImageStyle,
  type ListRenderItem,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  interpolate,
  interpolateColor,
  type SharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import {COLORS, RADIUS, SPACING} from '@/shared/design-system/tokens';

import type {CampusBannerViewData} from '../model/campusHomeBanner';

type CampusHomeBannerCarouselProps = {
  items: readonly CampusBannerViewData[];
  onPressItem: (item: CampusBannerViewData) => void;
};

const CARD_HEIGHT = 185;
const CARD_GAP = SPACING.md;
const AUTO_SCROLL_INTERVAL_MS = 3000;
const INDICATOR_ACTIVE_WIDTH = 20;
const INDICATOR_SIZE = 4;
const INDICATOR_PAST_COLOR = '#D1D5DB';

const getBannerVariant = (imageUrl: string): 'taxi' | 'notice' | 'timetable' | null => {
  if (imageUrl.startsWith('wireframe://')) {
    const variant = imageUrl.replace('wireframe://', '');

    if (
      variant === 'taxi' ||
      variant === 'notice' ||
      variant === 'timetable'
    ) {
      return variant;
    }
  }

  return null;
};

const getLocalBannerArtwork = (imageUrl: string) => {
  switch (getBannerVariant(imageUrl)) {
    case 'taxi':
      return require('../../../../assets/images/banner_default/01_taxi.png');
    case 'notice':
      return require('../../../../assets/images/banner_default/02_notice.png');
    case 'timetable':
    default:
      return require('../../../../assets/images/banner_default/03_timetable.png');
  }
};

const BannerArtwork = ({imageUrl}: Pick<CampusBannerViewData, 'imageUrl'>) => {
  if (/^https?:\/\//i.test(imageUrl)) {
    return (
      <Image
        resizeMode="contain"
        source={{uri: imageUrl}}
        style={styles.artworkImage as ImageStyle}
      />
    );
  }

  return (
    <Image
      resizeMode="contain"
      source={getLocalBannerArtwork(imageUrl)}
      style={styles.artworkImage as ImageStyle}
    />
  );
};

const BannerCard = ({
  item,
  cardWidth,
  onPressItem,
}: {
  cardWidth: number;
  item: CampusBannerViewData;
  onPressItem: (item: CampusBannerViewData) => void;
}) => {
  return (
    <LinearGradient
      colors={[...item.palette.backgroundGradient]}
      end={{x: 1, y: 1}}
      start={{x: 0, y: 0}}
      style={[styles.card, {width: cardWidth}]}>
      <View style={styles.content}>
        <View style={styles.textGroup}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: item.palette.badgeBackground,
              },
            ]}>
            <Text style={[styles.badgeLabel, {color: item.palette.badgeText}]}>
              {item.badgeLabel}
            </Text>
          </View>

          <Text numberOfLines={1} style={styles.title}>
            {item.titleLabel}
          </Text>
          <Text numberOfLines={2} style={styles.description}>
            {item.descriptionLabel}
          </Text>

          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.88}
            onPress={() => onPressItem(item)}
            style={[
              styles.ctaButton,
              {backgroundColor: item.palette.buttonBackground},
            ]}>
            <Text
              style={[styles.ctaButtonLabel, {color: item.palette.buttonText}]}>
              {item.buttonLabel}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.artworkWrap}>
          <BannerArtwork imageUrl={item.imageUrl} />
        </View>
      </View>
    </LinearGradient>
  );
};

const BannerIndicator = ({
  index,
  progress,
}: {
  index: number;
  progress: SharedValue<number>;
}) => {
  const animatedStyle = useAnimatedStyle(() => {
    const distance = Math.abs(progress.value - index);

    return {
      backgroundColor:
        progress.value >= index
          ? interpolateColor(
              progress.value,
              [index, index + 1],
              [COLORS.brand.primary, INDICATOR_PAST_COLOR],
            )
          : interpolateColor(
              progress.value,
              [index - 1, index],
              [COLORS.border.default, COLORS.brand.primary],
            ),
      width: interpolate(
        distance,
        [0, 1],
        [INDICATOR_ACTIVE_WIDTH, INDICATOR_SIZE],
        'clamp',
      ),
    };
  });

  return <Animated.View style={[styles.indicator, animatedStyle]} />;
};

export const CampusHomeBannerCarousel = ({
  items,
  onPressItem,
}: CampusHomeBannerCarouselProps) => {
  const {width} = useWindowDimensions();
  const cardWidth = width - SPACING.lg * 2;
  const snapToInterval = cardWidth + CARD_GAP;
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const flatListRef = React.useRef<FlatList<CampusBannerViewData>>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const progress = useSharedValue(0);

  React.useEffect(() => {
    if (currentIndex > items.length - 1) {
      setCurrentIndex(0);
    }
  }, [currentIndex, items.length]);

  React.useEffect(() => {
    progress.value = currentIndex;
  }, [currentIndex, progress]);

  const clearAutoScrollTimer = React.useCallback(() => {
    if (!timerRef.current) {
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  React.useEffect(() => {
    clearAutoScrollTimer();

    if (items.length <= 1) {
      return () => undefined;
    }

    timerRef.current = setTimeout(() => {
      const nextIndex = currentIndex >= items.length - 1 ? 0 : currentIndex + 1;

      flatListRef.current?.scrollToIndex({
        animated: true,
        index: nextIndex,
      });
    }, AUTO_SCROLL_INTERVAL_MS);

    return () => {
      clearAutoScrollTimer();
    };
  }, [clearAutoScrollTimer, currentIndex, items.length]);

  const handleMomentumScrollEnd = React.useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const nextIndex = Math.round(offsetX / snapToInterval);

      setCurrentIndex(Math.max(0, Math.min(items.length - 1, nextIndex)));
    },
    [items.length, snapToInterval],
  );

  const handleScroll = useAnimatedScrollHandler(
    event => {
      const nextProgress = event.contentOffset.x / snapToInterval;

      progress.value = Math.max(0, Math.min(items.length - 1, nextProgress));
    },
    [items.length, progress, snapToInterval],
  );

  const handleScrollToIndexFailed = React.useCallback(
    ({index}: {index: number}) => {
      flatListRef.current?.scrollToOffset({
        animated: true,
        offset: snapToInterval * index,
      });
    },
    [snapToInterval],
  );

  const renderItem = React.useCallback<ListRenderItem<CampusBannerViewData>>(
    ({item}) => (
      <BannerCard cardWidth={cardWidth} item={item} onPressItem={onPressItem} />
    ),
    [cardWidth, onPressItem],
  );

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Animated.FlatList
        ref={flatListRef}
        contentContainerStyle={styles.listContent}
        data={[...items]}
        decelerationRate="fast"
        disableIntervalMomentum
        getItemLayout={(_data, index) => ({
          index,
          length: snapToInterval,
          offset: snapToInterval * index,
        })}
        horizontal
        keyExtractor={item => item.id}
        onScrollBeginDrag={clearAutoScrollTimer}
        onMomentumScrollEnd={handleMomentumScrollEnd}
        onScroll={handleScroll}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        pagingEnabled={false}
        renderItem={renderItem}
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={snapToInterval}
      />

      <View style={styles.indicatorRow}>
        {items.map((item, index) => (
          <BannerIndicator
            index={index}
            key={item.id}
            progress={progress}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: SPACING.xl,
  },
  listContent: {
    columnGap: CARD_GAP,
    paddingHorizontal: SPACING.lg,
  },
  card: {
    borderRadius: 24,
    height: CARD_HEIGHT,
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xl,
  },
  textGroup: {
    flex: 1,
    maxWidth: 152,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: RADIUS.pill,
    marginBottom: SPACING.sm,
    minHeight: 24,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 24,
    marginBottom: 4,
  },
  description: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    lineHeight: 19,
  },
  ctaButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: RADIUS.md,
    height: 32,
    justifyContent: 'center',
    marginTop: SPACING.md,
    paddingHorizontal: 14,
  },
  ctaButtonLabel: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  artworkWrap: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginLeft: SPACING.md,
  },
  artworkImage: {
    height: 148,
    width: 156,
  },
  indicatorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  indicator: {
    borderRadius: RADIUS.pill,
    height: INDICATOR_SIZE,
  },
});
