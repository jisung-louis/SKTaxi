import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import {COLORS, SPACING} from '@/shared/design-system/tokens';

export type NotificationHubTabId = 'inbox' | 'appNotice';

type NotificationHubTabBarProps = {
  selectedTab: NotificationHubTabId;
  unreadCount: number;
  onSelectTab: (tabId: NotificationHubTabId) => void;
};

export const NotificationHubTabBar = ({
  selectedTab,
  unreadCount,
  onSelectTab,
}: NotificationHubTabBarProps) => {
  return (
    <View style={styles.container}>
      <TabButton
        active={selectedTab === 'inbox'}
        badgeCount={unreadCount}
        label="내 알림함"
        onPress={() => onSelectTab('inbox')}
      />
      <TabButton
        active={selectedTab === 'appNotice'}
        label="앱 공지사항"
        onPress={() => onSelectTab('appNotice')}
      />
    </View>
  );
};

const TabButton = ({
  active,
  badgeCount,
  label,
  onPress,
}: {
  active: boolean;
  badgeCount?: number;
  label: string;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity activeOpacity={0.82} onPress={onPress} style={styles.tab}>
      <View style={styles.tabLabelRow}>
        <Text style={[styles.tabLabel, active ? styles.tabLabelActive : null]}>
          {label}
        </Text>
        {badgeCount ? (
          <View style={styles.badge}>
            <Text style={styles.badgeLabel}>{badgeCount}</Text>
          </View>
        ) : null}
      </View>
      <View
        style={[styles.underline, active ? styles.underlineActive : null]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.surface,
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    paddingTop: 12,
  },
  tabLabelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    height: 20,
    marginBottom: 10,
  },
  tabLabel: {
    color: COLORS.text.muted,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  tabLabelActive: {
    color: COLORS.text.primary,
  },
  badge: {
    alignItems: 'center',
    backgroundColor: COLORS.status.danger,
    borderRadius: 10,
    height: 20,
    justifyContent: 'center',
    minWidth: 20,
    paddingHorizontal: 6,
  },
  badgeLabel: {
    color: COLORS.text.inverse,
    fontSize: 10,
    fontWeight: '700',
    lineHeight: 10,
    textAlign: 'center',
  },
  underline: {
    backgroundColor: 'transparent',
    borderRadius: 999,
    height: 2,
    width: '100%',
  },
  underlineActive: {
    backgroundColor: COLORS.brand.primary,
  },
});
