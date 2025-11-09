import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChatStackParamList } from '../navigations/types';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typhograpy';
import Icon from 'react-native-vector-icons/Ionicons';
import { BOTTOM_TAB_BAR_HEIGHT } from '../constants/constants';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScreenView } from '../hooks/useScreenView';
import { useChatRooms } from '../hooks/useChatRooms';
import { ChatRoom } from '../types/firestore';
import { useAuth } from '../hooks/useAuth';
import firestore, { doc, onSnapshot } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import { TabBadge } from '../components/common/TabBadge';
import { getChatRoomNotificationSetting } from '../hooks/useChatMessages';

const formatTimeAgo = (timestamp: any) => {
  if (!timestamp) return '';
  
  try {
    const now = new Date();
    const createdAt = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffMs = now.getTime() - createdAt.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffDays > 0) return `${diffDays}일 전`;
    if (diffHours > 0) return `${diffHours}시간 전`;
    if (diffMinutes > 0) return `${diffMinutes}분 전`;
    return '방금 전';
  } catch {
    return '';
  }
};

const getChatRoomIcon = (type: ChatRoom['type']) => {
  switch (type) {
    case 'university':
      return 'school-outline';
    case 'department':
      return 'people-outline';
    case 'custom':
      return 'chatbubbles-outline';
    default:
      return 'chatbubble-outline';
  }
};

type ChatListScreenNavigationProp = NativeStackNavigationProp<ChatStackParamList, 'ChatList'>;

export const ChatListScreen = () => {
  useScreenView();
  const { user } = useAuth();
  const navigation = useNavigation<ChatListScreenNavigationProp>();
  const isFocused = useIsFocused();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState<{ [chatRoomId: string]: boolean }>({});

  // 관리자 여부 확인
  useEffect(() => {
    if (!user?.uid) {
      setIsAdmin(false);
      return;
    }

    const userDocRef = doc(firestore(getApp()), 'users', user.uid);
    const unsubscribe = onSnapshot(
      userDocRef,
      (snap) => {
        if (snap.exists()) {
          const userData = snap.data();
          setIsAdmin(!!userData?.isAdmin);
        } else {
          setIsAdmin(false);
        }
      },
      (error) => {
        console.error('관리자 여부 확인 실패:', error);
        setIsAdmin(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // 관리자인 경우: 모든 채팅방 조회
  const { chatRooms: allRoomsRaw, loading: loadingAll } = useChatRooms('all');
  
  // 일반 사용자인 경우: 각 카테고리별 채팅방 조회
  const { chatRooms: universityRooms, loading: loadingUniversity } = useChatRooms('university');
  const { chatRooms: departmentRooms, loading: loadingDepartment } = useChatRooms('department');
  const { chatRooms: customRooms, loading: loadingCustom } = useChatRooms('custom');

  // 관리자일 때는 allRooms 사용, 아닐 때는 기존 로직
  const loading = isAdmin 
    ? loadingAll 
    : (loadingUniversity || loadingDepartment || loadingCustom);

  // 관리자 모드: 채팅방을 타입별로 정렬 (university > department > custom)
  const allRooms = useMemo(() => {
    if (!isAdmin) return [];
    
    const sorted = [...allRoomsRaw].sort((a, b) => {
      // 타입 우선순위: university > department > custom
      const typeOrder = { university: 0, department: 1, custom: 2 };
      const aOrder = typeOrder[a.type] ?? 3;
      const bOrder = typeOrder[b.type] ?? 3;
      
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      
      // 같은 타입 내에서는 updatedAt 기준 내림차순
      const aTime = a.updatedAt?.toDate?.()?.getTime() || 0;
      const bTime = b.updatedAt?.toDate?.()?.getTime() || 0;
      return bTime - aTime;
    });
    
    return sorted;
  }, [isAdmin, allRoomsRaw]);
  
  // 상단 고정 채팅방: 전체 채팅방, 학과 채팅방
  const fixedRooms = useMemo(() => {
    if (isAdmin) {
      // 관리자는 고정 채팅방 없이 모든 채팅방을 리스트로 표시
      return [];
    }
    
    const rooms: ChatRoom[] = [];
    
    // 전체 채팅방 (첫 번째)
    if (universityRooms.length > 0) {
      rooms.push(universityRooms[0]);
    }
    
    // 학과 채팅방 (두 번째)
    if (departmentRooms.length > 0) {
      rooms.push(departmentRooms[0]);
    }
    
    return rooms;
  }, [isAdmin, universityRooms, departmentRooms]);

  // 일반 사용자 모드: 커스텀 채팅방을 updatedAt 기준으로 정렬
  const sortedCustomRooms = useMemo(() => {
    if (isAdmin) return [];
    
    return [...customRooms].sort((a, b) => {
      const aTime = a.updatedAt?.toDate?.()?.getTime() || 0;
      const bTime = b.updatedAt?.toDate?.()?.getTime() || 0;
      return bTime - aTime; // 내림차순
    });
  }, [isAdmin, customRooms]);

  // 각 채팅방의 알림 설정 구독
  useEffect(() => {
    if (!user?.uid) {
      setNotificationSettings({});
      return;
    }

    const allRoomsToCheck = isAdmin ? allRooms : [...fixedRooms, ...sortedCustomRooms];
    const unsubscribes: (() => void)[] = [];

    allRoomsToCheck.forEach((room) => {
      if (!room.id) return;

      const settingRef = doc(firestore(getApp()), 'users', user.uid, 'chatRoomNotifications', room.id);
      const unsubscribe = onSnapshot(
        settingRef,
        (snap) => {
          if (snap.exists()) {
            const data = snap.data();
            setNotificationSettings(prev => ({
              ...prev,
              [room.id!]: data?.enabled !== false,
            }));
          } else {
            // 문서가 없으면 기본값 true
            setNotificationSettings(prev => ({
              ...prev,
              [room.id!]: true,
            }));
          }
        },
        (error) => {
          console.error(`채팅방 ${room.id} 알림 설정 구독 실패:`, error);
          // 에러 시 기본값 true
          setNotificationSettings(prev => ({
            ...prev,
            [room.id!]: true,
          }));
        }
      );
      unsubscribes.push(unsubscribe);
    });

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  }, [user?.uid, isAdmin, allRooms, fixedRooms, sortedCustomRooms]);

  useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    translateY.value = withTiming(isFocused ? 0 : 10, { duration: 200 });
  }, [isFocused]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleChatRoomPress = (chatRoom: ChatRoom) => {
    if (!chatRoom.id) return;
    navigation.navigate('ChatDetail', { chatRoomId: chatRoom.id });
  };

  const getUnreadCount = (chatRoom: ChatRoom): number => {
    if (!user?.uid || !chatRoom.unreadCount) return 0;
    return chatRoom.unreadCount[user.uid] || 0;
  };

  const renderChatRoomCard = ({ item, useDisplayName }: { item: ChatRoom & { displayName?: string; notificationEnabled?: boolean }; useDisplayName?: boolean }) => {
    const unreadCount = getUnreadCount(item);
    const lastMessageTime = item.lastMessage?.timestamp 
      ? formatTimeAgo(item.lastMessage.timestamp)
      : '';
    
    const displayName = useDisplayName && item.displayName ? item.displayName : item.name;

    return (
      <TouchableOpacity
        style={styles.chatRoomCard}
        onPress={() => handleChatRoomPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.chatRoomIconContainer}>
          <Icon 
            name={getChatRoomIcon(item.type)} 
            size={24} 
            color={COLORS.accent.blue} 
          />
        </View>
        
        <View style={styles.chatRoomContent}>
          <View style={styles.chatRoomHeader}>
            <View style={styles.chatRoomNameContainer}>
              <Text style={styles.chatRoomName} numberOfLines={1}>
                {displayName}
              </Text>
              {item.notificationEnabled === false && (
                <Icon 
                  name="notifications-off" 
                  size={16} 
                  color={COLORS.text.secondary} 
                  style={styles.notificationOffIcon}
                />
              )}
            </View>
            {lastMessageTime ? (
              <Text style={styles.chatRoomTime}>{lastMessageTime}</Text>
            ) : null}
          </View>
          
          {item.lastMessage ? (
            <Text style={styles.chatRoomLastMessage} numberOfLines={1}>
              {item.lastMessage.text}
            </Text>
          ) : (
            <Text style={styles.chatRoomLastMessage} numberOfLines={1}>
              {item.description || '아직 메시지가 없어요'}
            </Text>
          )}
          
          <View style={styles.chatRoomFooter}>
            <View style={styles.chatRoomMembers}>
              <Icon name="people-outline" size={14} color={COLORS.text.secondary} />
              <Text style={styles.chatRoomMembersText}>
                {item.members.length}명
              </Text>
            </View>
          </View>
        </View>
        
        {/* 읽지 않은 메시지 수 배지 (우측 아래) */}
        <View style={styles.badgeContainer}>
          <TabBadge count={unreadCount} location="bottom" size="large" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderListHeader = () => {
    // 관리자는 고정 채팅방 없음
    if (isAdmin) {
      return null;
    }

    // 고정 채팅방 이름 설정
    const fixedRoomsWithNames = fixedRooms.map((room, index) => {
      const roomWithSettings = {
        ...room,
        displayName: room.type === 'university' 
          ? '성결대 전체 채팅방' 
          : (room.type === 'department' && user?.department 
            ? `${user.department} 채팅방` 
            : room.name),
        notificationEnabled: room.id ? (notificationSettings[room.id] ?? true) : true,
      };
      return roomWithSettings;
    });

    return (
      <View>
        {/* 고정 채팅방 (전체 채팅방, 학과 채팅방) */}
        {fixedRoomsWithNames.map((room) => (
          <View key={room.id}>
            {renderChatRoomCard({ item: room, useDisplayName: true })}
          </View>
        ))}
        
        {/* 구분선 */}
        {fixedRooms.length > 0 && sortedCustomRooms.length > 0 && (
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>내 채팅방</Text>
            <View style={styles.dividerLine} />
          </View>
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    // 고정 채팅방이 있고 커스텀 채팅방만 없을 때
    if (fixedRooms.length > 0 && sortedCustomRooms.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Icon name="chatbubbles-outline" size={64} color={COLORS.text.disabled} />
          <Text style={styles.emptyTitle}>참여 중인 채팅방이 없어요</Text>
          <Text style={styles.emptyMessage}>
            새로운 채팅방을 만들거나 초대를 받아보세요
          </Text>
        </View>
      );
    }
    
    // 모든 채팅방이 없을 때
    return (
      <View style={styles.emptyContainer}>
        <Icon name="chatbubbles-outline" size={64} color={COLORS.text.disabled} />
        <Text style={styles.emptyTitle}>채팅방이 없어요</Text>
        <Text style={styles.emptyMessage}>
          새로운 채팅방이 있으면 여기에 표시됩니다
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[{ flex: 1 }, screenAnimatedStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>채팅</Text>
        </View>

        {/* Chat List */}
        {loading && (isAdmin ? allRooms.length === 0 : (fixedRooms.length === 0 && sortedCustomRooms.length === 0)) ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>채팅방을 불러오는 중...</Text>
          </View>
        ) : (
          <FlatList
            data={isAdmin 
              ? allRooms.map(room => ({
                  ...room,
                  notificationEnabled: room.id ? (notificationSettings[room.id] ?? true) : true,
                }))
              : sortedCustomRooms.map(room => ({
                  ...room,
                  notificationEnabled: room.id ? (notificationSettings[room.id] ?? true) : true,
                }))
            }
            keyExtractor={(item) => item.id || ''}
            renderItem={renderChatRoomCard}
            ListHeaderComponent={renderListHeader}
            contentContainerStyle={[
              styles.listContent,
              (isAdmin ? allRooms.length === 0 : (fixedRooms.length === 0 && sortedCustomRooms.length === 0)) && styles.listContentEmpty,
              { paddingBottom: BOTTOM_TAB_BAR_HEIGHT + insets.bottom + 20 }
            ]}
            ListEmptyComponent={(isAdmin ? allRooms.length === 0 : fixedRooms.length === 0) ? renderEmpty : null}
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
  listContent: {
    padding: 16,
  },
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
  listContentEmpty: {
    flex: 1,
  },
  chatRoomCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    left: 24,
    top: 24,
  },
  chatRoomIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.accent.blue + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chatRoomContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  chatRoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatRoomNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chatRoomName: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.text.primary,
    flex: 1,
  },
  notificationOffIcon: {
    marginLeft: 6,
  },
  chatRoomTime: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    marginLeft: 8,
  },
  chatRoomLastMessage: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  chatRoomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatRoomMembers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  chatRoomMembersText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 40,
  },
  errorText: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginTop: 16,
  },
});

