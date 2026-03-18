import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {V2StateCard} from '@/shared/design-system/components';
import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

import type {
  NotificationInboxItemViewData,
  NotificationInboxViewData,
} from '../../model/notificationCenterViewData';

type NotificationInboxListProps = {
  data: NotificationInboxViewData;
  onPressItem: (item: NotificationInboxItemViewData) => void;
};

const getToneStyle = (
  tone: NotificationInboxItemViewData['iconTone'],
  isRead: boolean,
) => {
  const opacity = isRead ? 0.6 : 1;

  switch (tone) {
    case 'blue':
      return {
        backgroundColor: V2_COLORS.accent.blueSoft,
        color: V2_COLORS.accent.blue,
        opacity,
      };
    case 'orange':
      return {
        backgroundColor: V2_COLORS.accent.orangeSoft,
        color: V2_COLORS.accent.orange,
        opacity,
      };
    case 'purple':
      return {
        backgroundColor: V2_COLORS.accent.purpleSoft,
        color: V2_COLORS.accent.purple,
        opacity,
      };
    case 'yellow':
      return {
        backgroundColor: V2_COLORS.accent.yellowSoft,
        color: V2_COLORS.accent.yellowStrong,
        opacity,
      };
    case 'green':
    default:
      return {
        backgroundColor: V2_COLORS.brand.primaryTint,
        color: V2_COLORS.brand.primaryStrong,
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
      <V2StateCard
        description={data.emptyDescription}
        icon={
          <Icon
            color={V2_COLORS.border.default}
            name="notifications-off-outline"
            size={28}
          />
        }
        title={data.emptyTitle}
      />
    );
  }

  return (
    <View style={styles.sectionList}>
      {data.sections.map(section => (
        <View key={section.id} style={styles.section}>
          <Text style={styles.sectionLabel}>{section.title}</Text>

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
                          color={V2_COLORS.text.muted}
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
    color: V2_COLORS.text.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    lineHeight: 16,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    overflow: 'hidden',
    ...V2_SHADOWS.card,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: 15,
  },
  rowUnread: {
    backgroundColor: V2_COLORS.brand.primaryTint,
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
    color: V2_COLORS.brand.primaryStrong,
  },
  titleRead: {
    color: V2_COLORS.text.secondary,
    fontWeight: '500',
  },
  titleMeta: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  timeLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 10,
    lineHeight: 15,
  },
  unreadDot: {
    backgroundColor: V2_COLORS.status.danger,
    borderRadius: V2_RADIUS.pill,
    height: 8,
    width: 8,
  },
  message: {
    color: V2_COLORS.text.strong,
    fontSize: 12,
    lineHeight: 19.5,
  },
  messageRead: {
    color: V2_COLORS.text.muted,
  },
  contextRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  contextLabel: {
    color: V2_COLORS.text.muted,
    flex: 1,
    fontSize: 10,
    lineHeight: 15,
  },
  contextLabelRead: {
    color: V2_COLORS.text.muted,
  },
  separator: {
    backgroundColor: V2_COLORS.border.subtle,
    height: 1,
  },
});
