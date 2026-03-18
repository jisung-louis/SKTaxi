import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {StateCard} from '@/shared/design-system/components';
import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

import type {
  NotificationInboxItemViewData,
  NotificationInboxViewData,
} from '../model/notificationCenterViewData';

type NotificationInboxListProps = {
  data: NotificationInboxViewData;
  onPressItem: (item: NotificationInboxItemViewData) => void;
};

const NOTIFICATION_INBOX_EMPTY_TITLE = '알림이 없습니다';
const NOTIFICATION_INBOX_EMPTY_DESCRIPTION =
  '새로운 소식이 도착하면 이곳에서 바로 확인할 수 있어요.';
const NOTIFICATION_SECTION_LABELS = {
  read: '이전 알림',
  unread: '새 알림',
} as const;

const getToneStyle = (
  tone: NotificationInboxItemViewData['iconTone'],
  isRead: boolean,
) => {
  const opacity = isRead ? 0.6 : 1;

  switch (tone) {
    case 'blue':
      return {
        backgroundColor: COLORS.accent.blueSoft,
        color: COLORS.accent.blue,
        opacity,
      };
    case 'orange':
      return {
        backgroundColor: COLORS.accent.orangeSoft,
        color: COLORS.accent.orange,
        opacity,
      };
    case 'purple':
      return {
        backgroundColor: COLORS.accent.purpleSoft,
        color: COLORS.accent.purple,
        opacity,
      };
    case 'yellow':
      return {
        backgroundColor: COLORS.accent.yellowSoft,
        color: COLORS.accent.yellowStrong,
        opacity,
      };
    case 'green':
    default:
      return {
        backgroundColor: COLORS.brand.primaryTint,
        color: COLORS.brand.primaryStrong,
        opacity,
      };
  }
};

export const NotificationInboxList = ({
  data,
  onPressItem,
}: NotificationInboxListProps) => {
  if (data.sections.length === 0) {
    return (
      <StateCard
        description={NOTIFICATION_INBOX_EMPTY_DESCRIPTION}
        icon={
          <Icon
            color={COLORS.border.default}
            name="notifications-off-outline"
            size={28}
          />
        }
        title={NOTIFICATION_INBOX_EMPTY_TITLE}
      />
    );
  }

  return (
    <View style={styles.sectionList}>
      {data.sections.map(section => (
        <View key={section.id} style={styles.section}>
          <Text style={styles.sectionLabel}>
            {NOTIFICATION_SECTION_LABELS[section.id]}
          </Text>

          <View style={styles.card}>
            {section.items.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity
                  activeOpacity={0.86}
                  onPress={() => onPressItem(item)}
                  style={[
                    styles.row,
                    !item.isRead ? styles.rowUnread : null,
                  ]}>
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor: getToneStyle(item.iconTone, item.isRead)
                          .backgroundColor,
                        opacity: getToneStyle(item.iconTone, item.isRead).opacity,
                      },
                    ]}>
                    <Icon
                      color={getToneStyle(item.iconTone, item.isRead).color}
                      name={item.iconName}
                      size={19}
                    />
                  </View>

                  <View style={styles.body}>
                    <View style={styles.titleRow}>
                      <Text
                        style={[
                          styles.title,
                          item.isRead ? styles.titleRead : styles.titleUnread,
                        ]}>
                        {item.title}
                      </Text>
                      <View style={styles.titleMeta}>
                        <Text style={styles.timeLabel}>{item.timeLabel}</Text>
                        {!item.isRead ? <View style={styles.unreadDot} /> : null}
                      </View>
                    </View>

                    <Text
                      numberOfLines={2}
                      style={[
                        styles.message,
                        item.isRead ? styles.messageRead : null,
                      ]}>
                      {item.message}
                    </Text>

                    {item.contextLabel ? (
                      <View style={styles.contextRow}>
                        <Icon
                          color={COLORS.text.muted}
                          name="document-text-outline"
                          size={10}
                        />
                        <Text
                          numberOfLines={1}
                          style={[
                            styles.contextLabel,
                            item.isRead ? styles.contextLabelRead : null,
                          ]}>
                          {item.contextLabel}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>

                {index < section.items.length - 1 ? (
                  <View style={styles.separator} />
                ) : null}
              </React.Fragment>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionList: {
    gap: 18,
  },
  section: {
    gap: 8,
  },
  sectionLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    lineHeight: 16,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 15,
  },
  rowUnread: {
    backgroundColor: COLORS.brand.primaryTint,
  },
  iconBox: {
    alignItems: 'center',
    borderRadius: 12,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  body: {
    flex: 1,
  },
  titleRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  title: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginRight: 8,
  },
  titleUnread: {
    color: COLORS.brand.primaryStrong,
  },
  titleRead: {
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  titleMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  timeLabel: {
    color: COLORS.text.muted,
    fontSize: 10,
    lineHeight: 15,
  },
  unreadDot: {
    backgroundColor: COLORS.status.danger,
    borderRadius: RADIUS.pill,
    height: 8,
    width: 8,
  },
  message: {
    color: COLORS.text.strong,
    fontSize: 12,
    lineHeight: 19.5,
  },
  messageRead: {
    color: COLORS.text.muted,
  },
  contextRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  contextLabel: {
    color: COLORS.text.muted,
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
  },
  contextLabelRead: {
    color: COLORS.text.muted,
  },
  separator: {
    backgroundColor: COLORS.border.subtle,
    height: 1,
  },
});
