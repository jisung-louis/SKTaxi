import React from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

import type {CampusCafeteriaRecommendedMenuViewData} from '../../model/campusHome';
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
      renderItem={({item}) => (
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
                color={V2_COLORS.text.inverse}
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

              <View style={styles.likeRow}>
                <Icon
                  color={V2_COLORS.text.muted}
                  name="thumbs-up-outline"
                  size={12}
                />
                <Text style={styles.likeCount}>{item.likeCountLabel}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      )}
      showsHorizontalScrollIndicator={false}
      style={styles.list}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    marginHorizontal: -V2_SPACING.lg,
  },
  listContent: {
    columnGap: V2_SPACING.md,
    paddingBottom: V2_SPACING.sm,
    paddingHorizontal: V2_SPACING.lg,
  },
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    minHeight: 125,
    width: 280,
    ...V2_SHADOWS.card,
  },
  cardContent: {
    flexDirection: 'row',
    gap: V2_SPACING.md,
    padding: V2_SPACING.lg,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.md,
    height: 64,
    justifyContent: 'center',
    width: 64,
  },
  textGroup: {
    flex: 1,
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: V2_COLORS.accent.orangeSoft,
    borderRadius: V2_RADIUS.pill,
    marginBottom: V2_SPACING.xs,
    paddingHorizontal: V2_SPACING.sm,
    paddingVertical: 2,
  },
  categoryLabel: {
    color: V2_COLORS.accent.orange,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: V2_SPACING.xs,
  },
  price: {
    color: V2_COLORS.accent.orange,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: V2_SPACING.sm,
  },
  likeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.xs,
  },
  likeCount: {
    color: V2_COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
});
