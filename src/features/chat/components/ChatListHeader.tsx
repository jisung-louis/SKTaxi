import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { COLORS } from '@/shared/constants/colors';
import { TYPOGRAPHY } from '@/shared/constants/typography';

import type { ChatRoom, ChatRoomListItem, ChatRoomStatesMap } from '../model/types';

import { ChatRoomCard } from './ChatRoomCard';

interface ChatListHeaderProps {
  isAdmin: boolean;
  showAllRooms: boolean;
  fixedRooms: ChatRoomListItem[];
  gameRooms: ChatRoomListItem[];
  customRooms: ChatRoomListItem[];
  chatRoomStates: ChatRoomStatesMap;
  onRoomPress: (room: ChatRoom) => void;
}

export const ChatListHeader = ({
  isAdmin,
  showAllRooms,
  fixedRooms,
  gameRooms,
  customRooms,
  chatRoomStates,
  onRoomPress,
}: ChatListHeaderProps) => {
  if (isAdmin && showAllRooms) {
    return null;
  }

  return (
    <View>
      {fixedRooms.map(room => (
        <View key={room.id}>
          <ChatRoomCard
            item={room}
            roomState={room.id ? chatRoomStates[room.id] : undefined}
            onPress={onRoomPress}
            useDisplayName={true}
          />
        </View>
      ))}

      {gameRooms.length > 0 && (
        <View>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>게임 채팅방</Text>
            <View style={styles.dividerLine} />
          </View>
          {gameRooms.map(room => (
            <View key={room.id}>
              <ChatRoomCard
                item={room}
                roomState={room.id ? chatRoomStates[room.id] : undefined}
                onPress={onRoomPress}
              />
            </View>
          ))}
        </View>
      )}

      {customRooms.length > 0 && (
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>내 채팅방</Text>
          <View style={styles.dividerLine} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border.default,
  },
  dividerText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    marginHorizontal: 12,
    fontWeight: '600',
  },
});
