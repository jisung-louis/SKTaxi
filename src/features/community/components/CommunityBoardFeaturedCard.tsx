import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';

import {V2_RADIUS, V2_SPACING} from '@/shared/design-system/tokens';

import type {CommunityBoardFeaturedViewData} from '../model/communityViewData';

interface CommunityBoardFeaturedCardProps {
  item: CommunityBoardFeaturedViewData;
  onPress: (postId: string) => void;
}

export const CommunityBoardFeaturedCard = ({
  item,
  onPress,
}: CommunityBoardFeaturedCardProps) => {
  return (
    <TouchableOpacity
      accessibilityRole="button"
      activeOpacity={0.88}
      onPress={() => onPress(item.id)}>
      <LinearGradient
        colors={['#FFF7ED', '#FDF2F8']}
        end={{x: 1, y: 1}}
        start={{x: 0, y: 0}}
        style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryLabel}>{item.categoryLabel}</Text>
          </View>
          <Text style={styles.timeLabel}>{item.timeLabel}</Text>
        </View>

        <Text numberOfLines={1} style={styles.title}>
          {item.title}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Icon color="#6B7280" name="heart-outline" size={12} />
            <Text style={styles.statLabel}>{item.likeCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon color="#6B7280" name="chatbubble-outline" size={12} />
            <Text style={styles.statLabel}>{item.commentCount}</Text>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderColor: '#FFEDD5',
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    minHeight: 110,
    padding: 17,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: V2_SPACING.sm,
  },
  categoryPill: {
    backgroundColor: '#FFFFFF',
    borderRadius: V2_RADIUS.xs,
    paddingHorizontal: V2_SPACING.sm,
    paddingVertical: V2_SPACING.xs,
  },
  categoryLabel: {
    color: '#EA580C',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  timeLabel: {
    color: '#6B7280',
    fontSize: 12,
    lineHeight: 16,
  },
  title: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: V2_SPACING.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: V2_SPACING.md,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.xs,
  },
  statLabel: {
    color: '#4B5563',
    fontSize: 12,
    lineHeight: 16,
  },
});
