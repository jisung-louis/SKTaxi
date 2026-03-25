import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
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

export const CampusCafeteriaPreviewCarousel = ({
  items,
  onPressItem,
}: CampusCafeteriaPreviewCarouselProps) => {
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
      horizontal
      contentContainerStyle={styles.listContent}
      data={items}
      keyExtractor={item => item.id}
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
    width: 280,
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
