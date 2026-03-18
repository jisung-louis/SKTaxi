import React from 'react';
import {
  Image,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

import type {
  ChatAvatarViewData,
  ChatThreadItemViewData,
  ChatThreadMessageViewData,
} from './types';

interface ChatMessageListProps {
  contentContainerStyle?: StyleProp<ViewStyle>
  headerContent?: React.ReactNode
  items: ChatThreadItemViewData[]
}

const renderAvatar = (avatar?: ChatAvatarViewData) => {
  if (!avatar) {
    return <View style={styles.avatarSpacer} />;
  }

  if (avatar.kind === 'image') {
    return <Image source={{uri: avatar.uri}} style={styles.avatarImage} />;
  }

  return (
    <View style={[styles.avatarCircle, {backgroundColor: avatar.backgroundColor}]}>
      {avatar.kind === 'label' ? (
        <Text style={[styles.avatarLabel, {color: avatar.textColor}]}>
          {avatar.label}
        </Text>
      ) : (
        <Icon color={avatar.iconColor} name={avatar.iconName} size={16} />
      )}
    </View>
  );
};

const getPreviousMessage = (
  items: ChatThreadItemViewData[],
  index: number,
) => {
  for (let itemIndex = index - 1; itemIndex >= 0; itemIndex -= 1) {
    const item = items[itemIndex];

    if (!item || item.type !== 'message') {
      return null;
    }

    return item;
  }

  return null;
};

const getNextMessage = (items: ChatThreadItemViewData[], index: number) => {
  for (let itemIndex = index + 1; itemIndex < items.length; itemIndex += 1) {
    const item = items[itemIndex];

    if (!item || item.type !== 'message') {
      return null;
    }

    return item;
  }

  return null;
};

const isSameGroup = (
  currentMessage: ChatThreadMessageViewData,
  adjacentMessage: ChatThreadMessageViewData | null,
) => {
  return Boolean(
    adjacentMessage &&
      adjacentMessage.direction === currentMessage.direction &&
      adjacentMessage.senderId === currentMessage.senderId &&
      adjacentMessage.minuteKey === currentMessage.minuteKey,
  );
};

export const ChatMessageList = ({
  contentContainerStyle,
  headerContent,
  items,
}: ChatMessageListProps) => {
  const scrollViewRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({animated: true});
    }, 40);

    return () => clearTimeout(timeoutId);
  }, [items.length]);

  return (
    <ScrollView
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}>
      {headerContent}

      {items.map((item, index) => {
        if (item.type === 'date-divider') {
          return (
            <View key={item.id} style={styles.dateDividerRow}>
              <View style={styles.dateDividerLine} />
              <Text style={styles.dateDividerLabel}>{item.label}</Text>
              <View style={styles.dateDividerLine} />
            </View>
          );
        }

        if (item.direction === 'system') {
          return (
            <View key={item.id} style={styles.systemMessageWrap}>
              <Text style={styles.systemMessageLabel}>{item.text}</Text>
            </View>
          );
        }

        const previousMessage = getPreviousMessage(items, index);
        const nextMessage = getNextMessage(items, index);
        const isGroupStart = !isSameGroup(item, previousMessage);
        const isGroupEnd = !isSameGroup(item, nextMessage);
        const wrapperStyle = item.direction === 'outgoing'
          ? styles.outgoingMessageWrap
          : styles.incomingMessageWrap;

        if (item.direction === 'outgoing') {
          return (
            <View
              key={item.id}
              style={[
                styles.messageWrap,
                wrapperStyle,
                !isGroupStart ? styles.messageWrapCompact : null,
              ]}>
              <View style={styles.outgoingRow}>
                {isGroupEnd ? (
                  <Text style={[styles.timeLabel, styles.outgoingTimeLabel]}>
                    {item.timeLabel}
                  </Text>
                ) : null}
                <View style={[styles.bubble, styles.outgoingBubble]}>
                  <Text style={[styles.messageText, styles.outgoingMessageText]}>
                    {item.text}
                  </Text>
                </View>
              </View>
            </View>
          );
        }

        return (
          <View
            key={item.id}
            style={[
              styles.messageWrap,
              wrapperStyle,
              !isGroupStart ? styles.messageWrapCompact : null,
            ]}>
            <View style={styles.incomingRow}>
              <View style={styles.avatarWrap}>
                {isGroupStart ? renderAvatar(item.avatar) : <View style={styles.avatarSpacer} />}
              </View>

              <View style={styles.incomingContent}>
                {isGroupStart ? (
                  <Text style={styles.senderName}>{item.senderName}</Text>
                ) : null}
                <View style={styles.incomingBubbleRow}>
                  <View style={[styles.bubble, styles.incomingBubble]}>
                    <Text style={styles.messageText}>{item.text}</Text>
                  </View>
                  {isGroupEnd ? (
                    <Text style={styles.timeLabel}>{item.timeLabel}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  avatarCircle: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  avatarImage: {
    borderRadius: V2_RADIUS.pill,
    height: 36,
    width: 36,
  },
  avatarLabel: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  avatarSpacer: {
    height: 36,
    width: 36,
  },
  avatarWrap: {
    width: 36,
  },
  bubble: {
    borderRadius: 16,
    maxWidth: '82%',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: V2_SPACING.md,
  },
  dateDividerLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    paddingHorizontal: V2_SPACING.md,
  },
  dateDividerLine: {
    backgroundColor: V2_COLORS.border.default,
    flex: 1,
    height: 1,
  },
  dateDividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: V2_SPACING.md,
    marginTop: V2_SPACING.sm,
  },
  incomingBubble: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    ...V2_SHADOWS.card,
  },
  incomingBubbleRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 6,
  },
  incomingContent: {
    flex: 1,
  },
  incomingMessageWrap: {
    alignItems: 'flex-start',
  },
  incomingRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: V2_SPACING.sm,
  },
  messageText: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    lineHeight: 22,
  },
  messageWrap: {
    marginBottom: V2_SPACING.md,
  },
  messageWrapCompact: {
    marginBottom: V2_SPACING.xs,
  },
  outgoingBubble: {
    backgroundColor: V2_COLORS.brand.primary,
    borderTopRightRadius: 4,
  },
  outgoingMessageText: {
    color: V2_COLORS.text.inverse,
  },
  outgoingMessageWrap: {
    alignItems: 'flex-end',
  },
  outgoingRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-end',
  },
  outgoingTimeLabel: {
    textAlign: 'right',
  },
  senderName: {
    color: V2_COLORS.text.strong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginBottom: V2_SPACING.xs,
  },
  systemMessageLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
  },
  systemMessageWrap: {
    alignItems: 'center',
    marginBottom: V2_SPACING.md,
  },
  timeLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 10,
    lineHeight: 14,
    marginBottom: 2,
  },
});
