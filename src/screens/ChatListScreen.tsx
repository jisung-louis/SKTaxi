// SKTaxi: ChatListScreen - SRP 리팩토링 완료
// 
// 리팩토링 내용:
// 1. UI 컴포넌트 분리 (ChatRoomCard, ChatListHeader, EmptyChatList)
// 2. 비즈니스 로직은 hooks/useChatListPresenter 로 위임
// 3. UI 상태 관리와 레이아웃에 집중

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import { useIsFocused } from '@react-navigation/native';

import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typhograpy';
import { BOTTOM_TAB_BAR_HEIGHT } from '../constants/constants';
import { useScreenView } from '../hooks/useScreenView';

import { useChatListPresenter } from './ChatTab/hooks/useChatListPresenter';
import { ChatRoomCard, ChatListHeader, EmptyChatList } from './ChatTab/components';

export const ChatListScreen = () => {
  useScreenView();
  const isFocused = useIsFocused();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const insets = useSafeAreaInsets();

  const {
    isAdmin,
    showAllRooms,
    loading,
    refreshing,
    fixedRooms,
    gameRooms,
    customRooms,
    adminRooms,
    chatRoomStates,
    handleRefresh,
    handleChatRoomPress,
    toggleAdminMode,
  } = useChatListPresenter();

  // 화면 포커스 애니메이션
  useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    translateY.value = withTiming(isFocused ? 0 : 10, { duration: 200 });
  }, [isFocused]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const shouldShowEmpty = (isAdmin && showAllRooms)
    ? adminRooms.length === 0
    : (fixedRooms.length === 0 && gameRooms.length === 0 && customRooms.length === 0);

  const flatListData = (isAdmin && showAllRooms) ? adminRooms : customRooms;

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[{ flex: 1 }, screenAnimatedStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>채팅</Text>
          {isAdmin && (
            <TouchableOpacity
              style={styles.adminToggleButton}
              onPress={toggleAdminMode}
              activeOpacity={0.7}
            >
              <Icon
                name={showAllRooms ? "eye-off" : "eye"}
                size={20}
                color={showAllRooms ? COLORS.text.secondary : COLORS.accent.blue}
              />
              <Text style={[
                styles.adminToggleText,
                !showAllRooms && styles.adminToggleTextActive
              ]}>
                {showAllRooms ? '일반 보기' : '전체 보기'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Chat List */}
        {loading && shouldShowEmpty ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>채팅방을 불러오는 중...</Text>
          </View>
        ) : (
          <FlatList
            data={flatListData}
            keyExtractor={(item) => item.id || ''}
            renderItem={({ item }) => (
              <ChatRoomCard
                item={item}
                roomState={item.id ? chatRoomStates[item.id] : undefined}
                onPress={handleChatRoomPress}
              />
            )}
            ListHeaderComponent={
              <ChatListHeader
                isAdmin={isAdmin}
                showAllRooms={showAllRooms}
                fixedRooms={fixedRooms}
                gameRooms={gameRooms}
                customRooms={customRooms}
                chatRoomStates={chatRoomStates}
                onRoomPress={handleChatRoomPress}
              />
            }
            contentContainerStyle={[
              styles.listContent,
              shouldShowEmpty && styles.listContentEmpty,
              { paddingBottom: BOTTOM_TAB_BAR_HEIGHT + insets.bottom + 20 }
            ]}
            ListEmptyComponent={shouldShowEmpty ? <EmptyChatList type="no-participation" /> : null}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={COLORS.accent.blue}
              />
            }
          />
        )}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  title: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  adminToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  adminToggleText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  adminToggleTextActive: {
    color: COLORS.accent.blue,
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
});
