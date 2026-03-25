import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {BOTTOM_TAB_BAR_HEIGHT} from '@/shared/constants/layout';
import {StateCard} from '@/shared/design-system/components';
import {COLORS, SPACING} from '@/shared/design-system/tokens';

import {CommunityChatRoomCard} from './CommunityChatRoomCard';
import type {CommunityChatRoomViewData} from '../model/communityViewData';

interface CommunityChatSegmentProps {
  loading: boolean;
  onPressRoom: (roomId: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
  rooms: CommunityChatRoomViewData[];
}

export const CommunityChatSegment = ({
  loading,
  onPressRoom,
  onRefresh,
  refreshing,
  rooms,
}: CommunityChatSegmentProps) => {
  return (
    <View style={styles.container}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={rooms}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          loading ? (
            <View style={styles.stateWrap}>
              <StateCard
                description="채팅방을 불러오는 중입니다."
                icon={<ActivityIndicator color={COLORS.brand.primary} />}
                title="채팅 준비 중"
              />
            </View>
          ) : (
            <View style={styles.stateWrap}>
              <StateCard
                description="참여 중이거나 둘러볼 수 있는 공개 채팅방이 여기에 표시됩니다."
                icon={
                  <Icon
                    color={COLORS.text.muted}
                    name="chatbubbles-outline"
                    size={28}
                  />
                }
                title="표시할 채팅방이 없습니다"
              />
            </View>
          )
        }
        refreshControl={
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={refreshing}
            tintColor={COLORS.brand.primary}
          />
        }
        renderItem={({item}) => (
          <CommunityChatRoomCard item={item} onPress={onPressRoom} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: BOTTOM_TAB_BAR_HEIGHT + SPACING.xxl,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  stateWrap: {
    minHeight: 320,
    paddingTop: SPACING.xl,
  },
});
