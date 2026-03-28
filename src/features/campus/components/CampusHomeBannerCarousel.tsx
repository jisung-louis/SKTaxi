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
  type ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';

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

const withAlpha = (hexColor: string, alpha: string) => `${hexColor}${alpha}`;

const getBannerVariant = (imageUrl: string) => {
  if (imageUrl.startsWith('wireframe://')) {
    return imageUrl.replace('wireframe://', '');
  }

  return null;
};

const BannerArtwork = ({
  imageUrl,
  palette,
}: Pick<CampusBannerViewData, 'imageUrl' | 'palette'>) => {
  if (/^https?:\/\//i.test(imageUrl)) {
    return (
      <Image
        resizeMode="contain"
        source={{uri: imageUrl}}
        style={styles.remoteArtworkImage as ImageStyle}
      />
    );
  }

  const borderColor = withAlpha(palette.accent, '2B');
  const surfaceColor = withAlpha('#FFFFFF', 'D9');
  const softAccentColor = withAlpha(palette.accent, '14');
  const variant = getBannerVariant(imageUrl);

  switch (variant) {
    case 'taxi':
      return (
        <View style={styles.artboard}>
          <View style={[styles.taxiRoofBadge, {borderColor}]}>
            <Text style={[styles.taxiRoofBadgeLabel, {color: palette.accent}]}>
              TAXI
            </Text>
          </View>

          <View
            style={[
              styles.taxiBody,
              {
                backgroundColor: surfaceColor,
                borderColor,
              },
            ]}>
            <View style={[styles.taxiWindow, {borderColor}]}>
              <View
                style={[
                  styles.avatarCircle,
                  {backgroundColor: softAccentColor},
                ]}>
                <Icon color={palette.accent} name="person" size={12} />
              </View>
              <View
                style={[
                  styles.avatarCircle,
                  {backgroundColor: softAccentColor},
                ]}>
                <Icon color={palette.accent} name="person" size={12} />
              </View>
            </View>
            <View
              style={[
                styles.taxiLight,
                styles.taxiLightLeft,
                {backgroundColor: softAccentColor},
              ]}
            />
            <View
              style={[
                styles.taxiLight,
                styles.taxiLightRight,
                {backgroundColor: softAccentColor},
              ]}
            />
            <View style={[styles.taxiPlate, {backgroundColor: borderColor}]} />
          </View>

          <View
            style={[
              styles.taxiWheel,
              styles.taxiWheelLeft,
              {backgroundColor: COLORS.text.primary},
            ]}
          />
          <View
            style={[
              styles.taxiWheel,
              styles.taxiWheelRight,
              {backgroundColor: COLORS.text.primary},
            ]}
          />
        </View>
      );
    case 'notice':
      return (
        <View style={styles.artboard}>
          <View
            style={[
              styles.noticeCard,
              {backgroundColor: surfaceColor, borderColor},
            ]}>
            <View
              style={[
                styles.noticeIconCircle,
                {backgroundColor: softAccentColor},
              ]}>
              <Icon color={palette.accent} name="megaphone-outline" size={42} />
            </View>
          </View>

          {[
            styles.noticeChipTopLeft,
            styles.noticeChipTopRight,
            styles.noticeChipBottomLeft,
            styles.noticeChipBottomRight,
          ].map((chipStyle, index) => (
            <View
              key={`notice-chip-${index}`}
              style={[
                styles.noticeChip,
                chipStyle,
                {
                  backgroundColor: withAlpha(
                    palette.accent,
                    index % 2 === 0 ? '20' : '12',
                  ),
                  borderColor,
                },
              ]}
            />
          ))}
        </View>
      );
    case 'timetable':
    default:
      return (
        <View style={styles.artboard}>
          <View
            style={[
              styles.timetableBoard,
              {backgroundColor: surfaceColor, borderColor},
            ]}>
            <View style={styles.timetableRingsRow}>
              {[0, 1, 2].map(ringIndex => (
                <View
                  key={`timetable-ring-${ringIndex}`}
                  style={[
                    styles.timetableRing,
                    {backgroundColor: palette.accent},
                  ]}
                />
              ))}
            </View>

            <View style={styles.timetableGrid}>
              {Array.from({length: 12}).map((_, cellIndex) => (
                <View
                  key={`timetable-cell-${cellIndex}`}
                  style={[
                    styles.timetableCell,
                    {
                      backgroundColor:
                        cellIndex % 4 === 0
                          ? withAlpha(palette.accent, '22')
                          : COLORS.background.surface,
                      borderColor,
                    },
                  ]}
                />
              ))}
            </View>

            <View
              style={[
                styles.timetablePointer,
                {backgroundColor: softAccentColor},
              ]}>
              <Icon color={palette.accent} name="sparkles-outline" size={18} />
            </View>
          </View>
        </View>
      );
  }
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
          <BannerArtwork imageUrl={item.imageUrl} palette={item.palette} />
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
  progress: Animated.SharedValue<number>;
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
    progress.value = withTiming(currentIndex, {
      duration: 280,
    });
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
      <FlatList
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
        onScrollToIndexFailed={handleScrollToIndexFailed}
        pagingEnabled={false}
        renderItem={renderItem}
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
  artboard: {
    alignItems: 'center',
    height: 148,
    justifyContent: 'center',
    position: 'relative',
    width: 156,
  },
  remoteArtworkImage: {
    height: 148,
    width: 156,
  },
  taxiRoofBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 34,
    paddingHorizontal: 8,
    paddingVertical: 3,
    position: 'absolute',
    top: 12,
  },
  taxiRoofBadgeLabel: {
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 10,
  },
  taxiBody: {
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 1.5,
    height: 82,
    justifyContent: 'center',
    marginTop: 18,
    width: 116,
  },
  taxiWindow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    height: 28,
    justifyContent: 'center',
    marginBottom: 12,
    width: 78,
  },
  avatarCircle: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 20,
    justifyContent: 'center',
    width: 20,
  },
  taxiLight: {
    borderRadius: RADIUS.pill,
    height: 12,
    position: 'absolute',
    top: 42,
    width: 12,
  },
  taxiLightLeft: {
    left: 14,
  },
  taxiLightRight: {
    right: 14,
  },
  taxiPlate: {
    borderRadius: RADIUS.pill,
    height: 6,
    width: 36,
  },
  taxiWheel: {
    borderRadius: RADIUS.pill,
    bottom: 18,
    height: 20,
    position: 'absolute',
    width: 20,
  },
  taxiWheelLeft: {
    left: 32,
  },
  taxiWheelRight: {
    right: 32,
  },
  noticeCard: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1.5,
    height: 112,
    justifyContent: 'center',
    width: 112,
  },
  noticeIconCircle: {
    alignItems: 'center',
    borderRadius: 40,
    height: 78,
    justifyContent: 'center',
    width: 78,
  },
  noticeChip: {
    borderRadius: RADIUS.md,
    borderWidth: 1,
    height: 16,
    position: 'absolute',
    width: 16,
  },
  noticeChipTopLeft: {
    left: 18,
    top: 26,
  } as ViewStyle,
  noticeChipTopRight: {
    right: 16,
    top: 18,
    transform: [{rotate: '12deg'}],
  } as ViewStyle,
  noticeChipBottomLeft: {
    bottom: 28,
    left: 22,
    transform: [{rotate: '-8deg'}],
  } as ViewStyle,
  noticeChipBottomRight: {
    bottom: 22,
    right: 18,
    transform: [{rotate: '8deg'}],
  } as ViewStyle,
  timetableBoard: {
    borderRadius: 22,
    borderWidth: 1.5,
    height: 112,
    paddingHorizontal: 14,
    paddingTop: 18,
    width: 118,
  },
  timetableRingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 22,
    position: 'absolute',
    right: 22,
    top: 8,
  },
  timetableRing: {
    borderRadius: RADIUS.pill,
    height: 14,
    width: 4,
  },
  timetableGrid: {
    columnGap: 6,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6,
  },
  timetableCell: {
    borderRadius: 6,
    borderWidth: 1,
    height: 14,
    width: 24,
  },
  timetablePointer: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    bottom: 8,
    height: 28,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    width: 28,
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
