import React from 'react';
import type {
  GestureResponderEvent,
  StyleProp,
  ViewStyle,
} from 'react-native';

import {ChatThreadCore} from './ChatThreadCore';
import type {
  ChatThreadItemViewData,
  ChatThreadMessageViewData,
} from './types';

interface ChatMessageListProps {
  autoScrollKey?: number | string
  contentContainerStyle?: StyleProp<ViewStyle>
  headerContent?: React.ReactNode
  items: ChatThreadItemViewData[]
  onLongPressMessage?: (
    item: ChatThreadMessageViewData,
    event: GestureResponderEvent,
  ) => void
}

export const ChatMessageList = ({
  autoScrollKey,
  contentContainerStyle,
  headerContent,
  items,
  onLongPressMessage,
}: ChatMessageListProps) => {
  return (
    <ChatThreadCore
      autoScrollKey={autoScrollKey}
      contentContainerStyle={contentContainerStyle}
      headerContent={headerContent}
      items={items}
      onLongPressMessage={onLongPressMessage}
    />
  );
};
