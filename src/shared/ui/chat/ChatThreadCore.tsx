import React from 'react';
import {
  GestureResponderEvent,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

import {ChatAvatar} from './ChatAvatar';
import {MessageImageBubble} from './MessageImageBubble';
import type {
  ChatThreadDateDividerViewData,
  ChatThreadItemViewData,
  ChatThreadMessageViewData,
  ChatThreadSystemMessageViewData,
} from './types';

interface ChatThreadCoreProps<
  TItem extends {id: string; type: string} = ChatThreadItemViewData,
> {
  autoScrollKey?: number | string
  contentContainerStyle?: StyleProp<ViewStyle>
  headerContent?: React.ReactNode
  items: TItem[]
  onLongPressMessage?: (
    item: ChatThreadMessageViewData,
    event: GestureResponderEvent,
  ) => void
  renderCustomItem?: (item: TItem, index: number) => React.ReactNode
}

const isDateDivider = (
  item: {type: string},
): item is ChatThreadDateDividerViewData => item.type === 'date-divider';

const isSystemMessage = (
  item: {type: string},
): item is ChatThreadSystemMessageViewData => item.type === 'system-message';

const isTextMessage = (
  item: {type: string},
): item is ChatThreadMessageViewData => item.type === 'text-message';

const getPreviousMessage = <TItem extends {type: string}>(
  items: TItem[],
  index: number,
) => {
  for (let itemIndex = index - 1; itemIndex >= 0; itemIndex -= 1) {
    const item = items[itemIndex];

    if (!item || !isTextMessage(item)) {
      return null;
    }

    return item;
  }

  return null;
};

const getNextMessage = <TItem extends {type: string}>(
  items: TItem[],
  index: number,
) => {
  for (let itemIndex = index + 1; itemIndex < items.length; itemIndex += 1) {
    const item = items[itemIndex];

    if (!item || !isTextMessage(item)) {
      return null;
    }

    return item;
  }

  return null;
};

const isSameGroup = (
  currentMessage: ChatThreadMessageViewData,
  adjacentMessage: ChatThreadMessageViewData | null,
) =>
  Boolean(
    adjacentMessage &&
      adjacentMessage.direction === currentMessage.direction &&
      adjacentMessage.senderId === currentMessage.senderId &&
      adjacentMessage.minuteKey === currentMessage.minuteKey,
  );

export const ChatThreadCore = <
  TItem extends {id: string; type: string} = ChatThreadItemViewData,
>({
  autoScrollKey,
  contentContainerStyle,
  headerContent,
  items,
  onLongPressMessage,
  renderCustomItem,
}: ChatThreadCoreProps<TItem>) => {
  const scrollViewRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({animated: true});
    }, 40);

    return () => clearTimeout(timeoutId);
  }, [autoScrollKey, items.length]);

  return (
    <ScrollView
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}>
      {headerContent}

      {items.map((item, index) => {
        if (isDateDivider(item)) {
          return (
            <View key={item.id} style={styles.dateDividerRow}>
              <View style={styles.dateDividerLine} />
              <Text style={styles.dateDividerLabel}>{item.label}</Text>
              <View style={styles.dateDividerLine} />
            </View>
          );
        }

        if (isSystemMessage(item)) {
          return (
            <View key={item.id} style={styles.systemMessageWrap}>
              <Text style={styles.systemMessageLabel}>{item.text}</Text>
            </View>
          );
        }

        if (!isTextMessage(item)) {
          const customItem = renderCustomItem?.(item, index);

          if (customItem == null) {
            return null;
          }

          return <React.Fragment key={item.id}>{customItem}</React.Fragment>;
        }

        const previousMessage = getPreviousMessage(items, index);
        const nextMessage = getNextMessage(items, index);
        const isGroupStart = !isSameGroup(item, previousMessage);
        const isGroupEnd = !isSameGroup(item, nextMessage);
        const wrapperStyle =
          item.direction === 'outgoing'
            ? styles.outgoingMessageWrap
            : styles.incomingMessageWrap;

        if (item.direction === 'outgoing') {
          return (
            <View
              key={item.id}
              style={[
                styles.messageWrap,
                wrapperStyle,
                !isGroupEnd ? styles.messageWrapCompact : null,
                isGroupStart ? styles.messageWrapSpaced : null,
              ]}>
              <View style={styles.outgoingRow}>
                {isGroupEnd ? (
                  <Text style={[styles.timeLabel, styles.outgoingTimeLabel]}>
                    {item.timeLabel}
                  </Text>
                ) : null}
                <TouchableOpacity
                  activeOpacity={0.92}
                  delayLongPress={220}
                  disabled={!onLongPressMessage || Boolean(item.imageUrl)}
                  style={styles.pressableBubble}
                  onLongPress={event => {
                    onLongPressMessage?.(item, event);
                  }}>
                  <View
                    style={[
                      styles.bubble,
                      styles.outgoingBubble,
                      item.messageKind === 'image' ? styles.imageBubble : null,
                    ]}>
                    {item.imageUrl ? (
                      <MessageImageBubble
                        onLongPress={event => {
                          onLongPressMessage?.(item, event);
                        }}
                        uri={item.imageUrl}
                      />
                    ) : (
                      <Text style={[styles.messageText, styles.outgoingMessageText]}>
                        {item.text}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
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
              !isGroupEnd ? styles.messageWrapCompact : null,
              isGroupStart ? styles.messageWrapSpaced : null,
            ]}>
            <View style={styles.incomingRow}>
              <View style={styles.avatarWrap}>
                {isGroupStart ? <ChatAvatar avatar={item.avatar} /> : <ChatAvatar />}
              </View>

              <View style={styles.incomingContent}>
                {isGroupStart ? (
                  <Text style={styles.senderName}>{item.senderName}</Text>
                ) : null}
                <View style={styles.incomingBubbleRow}>
                  <TouchableOpacity
                    activeOpacity={0.92}
                    delayLongPress={220}
                    disabled={!onLongPressMessage || Boolean(item.imageUrl)}
                    style={styles.pressableBubble}
                    onLongPress={event => {
                      onLongPressMessage?.(item, event);
                    }}>
                    <View
                      style={[
                        styles.bubble,
                        styles.incomingBubble,
                        item.messageKind === 'image' ? styles.imageBubble : null,
                      ]}>
                      {item.imageUrl ? (
                        <MessageImageBubble
                          onLongPress={event => {
                            onLongPressMessage?.(item, event);
                          }}
                          uri={item.imageUrl}
                        />
                      ) : (
                        <Text style={styles.messageText}>{item.text}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
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
  avatarWrap: {
    width: 36,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  dateDividerLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    paddingHorizontal: SPACING.md,
  },
  dateDividerLine: {
    backgroundColor: COLORS.border.default,
    flex: 1,
    height: 1,
  },
  dateDividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginVertical: SPACING.md,
  },
  imageBubble: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  incomingBubble: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    ...SHADOWS.card,
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
    gap: SPACING.sm,
  },
  messageText: {
    color: COLORS.text.primary,
    fontSize: 14,
    lineHeight: 22,
  },
  messageWrap: {
    marginBottom: SPACING.xs,
    marginTop: 0,
  },
  messageWrapCompact: {
    marginBottom: SPACING.xs,
  },
  messageWrapSpaced: {
    marginTop: SPACING.sm,
  },
  outgoingBubble: {
    backgroundColor: COLORS.brand.primary,
    borderTopRightRadius: 4,
  },
  outgoingMessageText: {
    color: COLORS.text.inverse,
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
  pressableBubble: {
    flexShrink: 1,
    maxWidth: '82%',
  },
  outgoingTimeLabel: {
    textAlign: 'right',
  },
  senderName: {
    color: COLORS.text.strong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginBottom: SPACING.xs,
  },
  systemMessageLabel: {
    backgroundColor: COLORS.background.grayLight,
    borderRadius: RADIUS.md,
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: SPACING.lg,
    textAlign: 'center',
  },
  systemMessageWrap: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  timeLabel: {
    color: COLORS.text.muted,
    fontSize: 10,
    lineHeight: 14,
  },
});
