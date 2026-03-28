import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';

import {ChatThreadCore} from './ChatThreadCore';
import type {ChatThreadItemViewData} from './types';

interface ChatMessageListProps {
  autoScrollKey?: number | string
  contentContainerStyle?: StyleProp<ViewStyle>
  headerContent?: React.ReactNode
  items: ChatThreadItemViewData[]
}

export const ChatMessageList = ({
  autoScrollKey,
  contentContainerStyle,
  headerContent,
  items,
}: ChatMessageListProps) => {
  return (
    <ChatThreadCore
      autoScrollKey={autoScrollKey}
      contentContainerStyle={contentContainerStyle}
      headerContent={headerContent}
      items={items}
    />
  );
};
