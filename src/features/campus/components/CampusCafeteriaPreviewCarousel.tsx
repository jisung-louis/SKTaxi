import React from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

import type {CampusCafeteriaRecommendedMenuViewData} from '../model/campusHome';
import {CampusEmptyCard} from './CampusEmptyCard';

type CampusCafeteriaPreviewCarouselProps = {
  items: CampusCafeteriaRecommendedMenuViewData[];
  onPressItem: () => void;
};

const AUTO_SCROLL_INTERVAL_MS = 3000;
const CARD_WIDTH = 280;
const CARD_GAP = SPACING.md;

export const CampusCafeteriaPreviewCarousel = ({
  items,
  onPressItem,
}: CampusCafeteriaPreviewCarouselProps) => {
  const flatListRef =
    React.useRef<FlatList<CampusCafeteriaRecommendedMenuViewData>>(null);
  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const clearAutoScrollTimer = React.useCallback(() => {
    if (!timerRef.current) {
      return;
    }

    clearTimeout(timerRef.current);
    timerRef.current = null;
  }, []);

  React.useEffect(() => {
    if (currentIndex > items.length - 1) {
      setCurrentIndex(0);
    }
  }, [currentIndex, items.length]);

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

  if (items.length === 0) {
    return (
      <CampusEmptyCard
        description="주간메뉴가 올라오면 이 카드에 대표 메뉴를 보여줍니다."
        title="오늘 등록된 학식 메뉴가 없습니다"
      />
    );
  }

  return (
    <FlatList
      contentContainerStyle={styles.listContent}
      data={items}
      decelerationRate="fast"
      disableIntervalMomentum
      getItemLayout={(_data, index) => ({
        index,
        length: CARD_WIDTH + CARD_GAP,
        offset: (CARD_WIDTH + CARD_GAP) * index,
      })}
      horizontal
      keyExtractor={item => item.id}
      onMomentumScrollEnd={event => {
        const nextIndex = Math.round(
          event.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP),
        );

        setCurrentIndex(Math.max(0, Math.min(items.length - 1, nextIndex)));
      }}
      onScrollBeginDrag={clearAutoScrollTimer}
      onScrollToIndexFailed={({index}) => {
        flatListRef.current?.scrollToOffset({
          animated: true,
          offset: (CARD_WIDTH + CARD_GAP) * index,
        });
      }}
      pagingEnabled={false}
      ref={flatListRef}
      renderItem={({item}) => {
        const hasLikeCount = item.likeCountLabel.trim().length > 0;

        return (
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={onPressItem}
            style={styles.card}>
            <View style={styles.cardContent}>
              <LinearGradient
                colors={['#FB923C', '#F97316']}
                end={{x: 1, y: 1}}
                start={{x: 0, y: 0}}
                style={styles.iconBox}>
                <Icon
                  color={COLORS.text.inverse}
                  name="restaurant-outline"
                  size={28}
                />
              </LinearGradient>

              <View style={styles.textGroup}>
                <View style={styles.categoryPill}>
                  <Text numberOfLines={1} style={styles.categoryLabel}>
                    {item.categoryLabel}
                  </Text>
                </View>

                <Text numberOfLines={1} style={styles.title}>
                  {item.title}
                </Text>
                <Text style={styles.price}>{item.priceLabel}</Text>

                {hasLikeCount ? (
                  <View style={styles.likeRow}>
                    <Icon
                      color={COLORS.text.muted}
                      name="thumbs-up-outline"
                      size={12}
                    />
                    <Text style={styles.likeCount}>{item.likeCountLabel}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        );
      }}
      showsHorizontalScrollIndicator={false}
      snapToAlignment="start"
      snapToInterval={CARD_WIDTH + CARD_GAP}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    marginHorizontal: -SPACING.lg,
  },
  listContent: {
    columnGap: SPACING.md,
    paddingBottom: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    minHeight: 125,
    width: CARD_WIDTH,
    ...SHADOWS.card,
  },
  cardContent: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: RADIUS.md,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  textGroup: {
    flex: 1,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent.orangeSoft,
    borderRadius: RADIUS.pill,
    marginBottom: SPACING.xs,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
  },
  categoryLabel: {
    color: COLORS.accent.orange,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  title: {
    color: COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: SPACING.xs,
  },
  price: {
    color: COLORS.accent.orange,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: SPACING.sm,
  },
  likeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  likeCount: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
