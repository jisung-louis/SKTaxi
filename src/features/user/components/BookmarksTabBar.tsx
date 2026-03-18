import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {COLORS} from '@/shared/design-system/tokens';

export type BookmarksTabKey = 'community' | 'notice';

interface BookmarksTabBarProps {
  activeTab: BookmarksTabKey;
  communityCountLabel: string;
  noticeCountLabel: string;
  onPressTab: (tab: BookmarksTabKey) => void;
}

const TAB_LABELS: Record<BookmarksTabKey, string> = {
  community: '커뮤니티',
  notice: '공지사항',
};

export const BookmarksTabBar = ({
  activeTab,
  communityCountLabel,
  noticeCountLabel,
  onPressTab,
}: BookmarksTabBarProps) => {
  const counts = {
    community: communityCountLabel,
    notice: noticeCountLabel,
  };

  return (
    <View style={styles.container}>
      {(['community', 'notice'] as BookmarksTabKey[]).map(tab => {
        const isActive = tab === activeTab;

        return (
          <TouchableOpacity
            key={tab}
            accessibilityRole="button"
            activeOpacity={0.86}
            onPress={() => onPressTab(tab)}
            style={[styles.tab, isActive ? styles.tabActive : undefined]}>
            <Text style={[styles.tabLabel, isActive ? styles.tabLabelActive : undefined]}>
              {TAB_LABELS[tab]}
            </Text>
            <View
              style={[
                styles.countBadge,
                isActive ? styles.countBadgeActive : undefined,
              ]}>
              <Text
                style={[
                  styles.countLabel,
                  isActive ? styles.countLabelActive : undefined,
                ]}>
                {counts[tab]}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.surface,
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    height: 47,
  },
  tab: {
    alignItems: 'center',
    borderBottomColor: 'transparent',
    borderBottomWidth: 2,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    paddingTop: 12,
    paddingBottom: 12,
  },
  tabActive: {
    borderBottomColor: COLORS.brand.primary,
    paddingBottom: 14,
  },
  tabLabel: {
    color: COLORS.text.tertiary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  tabLabelActive: {
    color: COLORS.brand.primaryStrong,
  },
  countBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.background.subtle,
    borderRadius: 9999,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  countBadgeActive: {
    backgroundColor: COLORS.brand.primarySoft,
  },
  countLabel: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  countLabelActive: {
    color: COLORS.brand.primaryStrong,
  },
});
