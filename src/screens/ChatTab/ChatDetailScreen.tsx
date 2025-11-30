import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Clipboard,
  ActionSheetIOS,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import Icon from 'react-native-vector-icons/Ionicons';
import { ChatStackParamList } from '../../navigations/types';
import {
  useChatMessages,
  joinChatRoom,
  sendChatMessage,
  getChatRoomNotificationSetting,
  updateChatRoomNotificationSetting,
  markChatRoomAsRead,
} from '../../hooks/useChatMessages';
import { ChatMessage, ChatRoom } from '../../types/firestore';
import { useAuth } from '../../hooks/useAuth';
import { useScreenView } from '../../hooks/useScreenView';
import firestore, { doc, onSnapshot, arrayUnion, writeBatch } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import database from '@react-native-firebase/database';
import { createReport } from '../../lib/moderation';
import { sendMinecraftMessage } from '../../lib/minecraftChat';
import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';

type ChatDetailScreenNavigationProp = NativeStackNavigationProp<ChatStackParamList, 'ChatDetail'>;
type ChatDetailScreenRouteProp = RouteProp<ChatStackParamList, 'ChatDetail'>;

// 유틸리티 함수들
const formatMessageTime = (timestamp: any) => {
  if (!timestamp) return '';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const getMessageMinuteKey = (timestamp: any): number | null => {
  if (!timestamp) return null;
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return Math.floor(date.getTime() / (60 * 1000));
  } catch {
    return null;
  }
};

export const ChatDetailScreen = () => {
  useScreenView();
  const { user } = useAuth();
  const navigation = useNavigation<ChatDetailScreenNavigationProp>();
  const route = useRoute<ChatDetailScreenRouteProp>();
  const chatRoomId = route.params?.chatRoomId;
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();

  // 상태
  const [message, setMessage] = useState('');
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<{ [messageId: string]: number }>({});
  const [serverCurrentPlayers, setServerCurrentPlayers] = useState<number | null>(null);
  const [serverMaxPlayers, setServerMaxPlayers] = useState<number | null>(null);
  const [serverStatus, setServerStatus] = useState<{ online: boolean } | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [serverVersion, setServerVersion] = useState<string | null>(null);
  const [showServerInfo, setShowServerInfo] = useState(false);

  // Ref
  const flatListRef = useRef<FlatList>(null);
  const isInitialLoadCompleteRef = useRef(false);
  const previousMessagesLengthRef = useRef<number>(0);
  const processedMessageIdsRef = useRef<Set<string>>(new Set());

  // 메시지 훅 (inverted를 위해 내림차순으로 반환)
  const isGameRoom = chatRoom?.type === 'game';
  const { messages, loading: messagesLoading, loadingMore, hasMore, loadMore, updateMessageReadBy } = useChatMessages(chatRoomId);

  // 채팅방 정보 구독
  useEffect(() => {
    if (!chatRoomId) return;

    const chatRoomRef = doc(firestore(getApp()), 'chatRooms', chatRoomId);
    const unsubscribe = onSnapshot(chatRoomRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as ChatRoom;
        setChatRoom({ id: snap.id, ...data });

        if (user?.uid && data.members?.includes(user.uid)) {
          setHasJoined(true);
        }
      }
    }, (error) => {
      console.error('채팅방 정보 구독 실패:', error);
    });

    return () => unsubscribe();
  }, [chatRoomId, user?.uid]);

  // 각 메시지의 안읽은 사람 수 계산
  useEffect(() => {
    if (!chatRoom || !messages.length) {
      setUnreadCounts({});
      return;
    }

    const members = chatRoom.members || [];
    const counts: { [messageId: string]: number } = {};

    messages.forEach((msg) => {
      if (!msg.id || msg.type === 'system') return;

      const readBy = msg.readBy || [];
      const unreadCount = members.filter(
        (memberId) => memberId !== msg.senderId && !readBy.includes(memberId)
      ).length;
      counts[msg.id] = unreadCount;
    });

    setUnreadCounts(counts);
  }, [messages, chatRoom]);

  // 최초 접속 시 members에 추가 및 읽음 처리
  useEffect(() => {
    if (!chatRoomId || !user?.uid || hasJoined) return;

    const joinRoom = async () => {
      try {
        await joinChatRoom(chatRoomId);
        setHasJoined(true);
        await markChatRoomAsRead(chatRoomId);
        // 처리한 메시지 ID 초기화
        processedMessageIdsRef.current.clear();
        // 메시지 배열은 나중에 로드되므로, 메시지가 로드된 후 업데이트됨
      } catch (error) {
        console.error('채팅방 참여 실패:', error);
        Alert.alert('오류', '채팅방에 참여할 수 없습니다.');
      }
    };

    joinRoom();
  }, [chatRoomId, user?.uid, hasJoined]);

  // 화면이 포커스될 때마다 읽음 처리
  useEffect(() => {
    if (!chatRoomId || !user?.uid || !hasJoined || !isFocused) return;

    const markAsRead = async () => {
      try {
        await markChatRoomAsRead(chatRoomId);
        // 모든 메시지의 readBy를 로컬에서 업데이트 (UI 즉시 반영)
        if (user?.uid) {
          messages.forEach((msg) => {
            if (msg.id) {
              const readBy = msg.readBy || [];
              if (!readBy.includes(user.uid)) {
                updateMessageReadBy(msg.id, user.uid);
              }
            }
          });
        }
      } catch (error) {
        console.error('채팅방 읽음 처리 실패:', error);
      }
    };

    markAsRead();
  }, [chatRoomId, user?.uid, hasJoined, isFocused, messages, updateMessageReadBy]);

  // 알림 설정 로드
  useEffect(() => {
    if (!chatRoomId || !user?.uid) return;

    const loadNotificationSetting = async () => {
      try {
        const enabled = await getChatRoomNotificationSetting(chatRoomId);
        setNotificationEnabled(enabled);
      } catch (error) {
        console.error('알림 설정 로드 실패:', error);
      }
    };

    loadNotificationSetting();
  }, [chatRoomId, user?.uid]);

  // 게임 채팅방일 때 서버 상태 구독
  useEffect(() => {
    if (!isGameRoom) {
      setServerCurrentPlayers(null);
      setServerMaxPlayers(null);
      setServerStatus(null);
      setServerUrl(null);
      setServerVersion(null);
      return;
    }

    const statusRef = database().ref('serverStatus');
    const serverUrlRef = database().ref('serverStatus/serverUrl');
    
    const handleStatus = statusRef.on('value', (snap) => {
      const data = snap.val();
      if (data) {
        setServerCurrentPlayers(data.currentPlayers ?? data.playerCount ?? 0);
        setServerMaxPlayers(data.maxPlayers ?? data.currentPlayers ?? 0);
        setServerStatus({
          online: data.online ?? true,
        });
        if (data.version) {
          setServerVersion(data.version);
        } else {
          setServerVersion(null);
        }
      } else {
        setServerCurrentPlayers(null);
        setServerMaxPlayers(null);
        setServerStatus(null);
        setServerVersion(null);
      }
    }, (error) => {
      console.error('서버 상태 구독 실패:', error);
      setServerCurrentPlayers(null);
      setServerMaxPlayers(null);
      setServerStatus(null);
      setServerVersion(null);
    });

    const handleServerUrl = serverUrlRef.on('value', (snap) => {
      if (snap.exists()) {
        setServerUrl(snap.val() as string);
      } else {
        setServerUrl(null);
      }
    }, (error) => {
      console.error('서버 주소 구독 실패:', error);
      setServerUrl(null);
    });

    return () => {
      statusRef.off('value', handleStatus);
      serverUrlRef.off('value', handleServerUrl);
    };
  }, [isGameRoom]);

  // 초기 메시지 로드 완료 후 스크롤 (inverted에서는 자동으로 하단에 위치)
  useEffect(() => {
    if (!messagesLoading && messages.length > 0 && !isInitialLoadCompleteRef.current) {
      // inverted FlatList는 자동으로 최신 메시지가 하단에 표시되므로
      // 약간의 지연 후 스크롤 위치 확인
      setTimeout(() => {
        isInitialLoadCompleteRef.current = true;
      }, 100);
    }
  }, [messagesLoading, messages.length]);

  // 새 메시지가 추가될 때 읽음 처리
  useEffect(() => {
    if (!chatRoomId || !user?.uid || !hasJoined || !isFocused || messages.length === 0) {
      previousMessagesLengthRef.current = messages.length;
      return;
    }

    // 초기 로드 시에는 전체 읽음 처리를 하지 않음 (최초 접속 시 markChatRoomAsRead에서 처리)
    if (!isInitialLoadCompleteRef.current) {
      previousMessagesLengthRef.current = messages.length;
      return;
    }

    // 새로 추가된 메시지만 체크 (이전 길이보다 증가한 경우)
    const currentLength = messages.length;
    const previousLength = previousMessagesLengthRef.current;

    if (currentLength <= previousLength) {
      previousMessagesLengthRef.current = currentLength;
      return;
    }

    // 새로 추가된 메시지만 추출 (inverted이므로 배열 앞부분이 최신 메시지)
    const newMessages = messages.slice(0, currentLength - previousLength);

    const markNewMessagesAsRead = async () => {
      try {
        const unreadMessages = newMessages.filter((msg) => {
          if (!msg.id || msg.type === 'system' || msg.senderId === user.uid) {
            return false;
          }
          // 이미 처리한 메시지는 스킵
          if (processedMessageIdsRef.current.has(msg.id)) {
            return false;
          }
          const readBy = msg.readBy || [];
          return !readBy.includes(user.uid);
        });

        if (unreadMessages.length === 0) {
          previousMessagesLengthRef.current = currentLength;
          return;
        }

        const batch = writeBatch(firestore(getApp()));
        unreadMessages.forEach((msg) => {
          if (msg.id) {
            const messageRef = doc(firestore(getApp()), 'chatRooms', chatRoomId, 'messages', msg.id);
            batch.update(messageRef, {
              readBy: arrayUnion(user.uid),
            });
            // 처리한 메시지 ID 기록
            processedMessageIdsRef.current.add(msg.id);
          }
        });

        await batch.commit();
        console.log(`✅ ${unreadMessages.length}개 새 메시지 읽음 처리 완료`);
        
        // 로컬 메시지 배열의 readBy 업데이트 (UI 즉시 반영)
        unreadMessages.forEach((msg) => {
          if (msg.id && user?.uid) {
            updateMessageReadBy(msg.id, user.uid);
          }
        });
        
        previousMessagesLengthRef.current = currentLength;
      } catch (error) {
        console.error('새 메시지 읽음 처리 실패:', error);
        previousMessagesLengthRef.current = currentLength;
      }
    };

    // 약간의 지연을 두어 메시지가 완전히 로드된 후 처리
    const timer = setTimeout(() => {
      markNewMessagesAsRead();
    }, 100);

    return () => clearTimeout(timer);
  }, [messages, chatRoomId, user?.uid, hasJoined, isFocused]);

  // 메시지 전송
  const handleSendMessage = async () => {
    if (!message.trim() || !chatRoomId) return;

    try {
      if (isGameRoom) {
        await sendMinecraftMessage(chatRoomId, message);
      } else {
        await sendChatMessage(chatRoomId, message);
      }
      setMessage('');
    } catch (error: any) {
      console.error('메시지 전송 실패:', error);
      Alert.alert('오류', error.message || '메시지 전송에 실패했습니다.');
    }
  };

  // 알림 설정 토글
  const handleToggleNotification = async () => {
    if (!chatRoomId) return;

    try {
      const newValue = !notificationEnabled;
      await updateChatRoomNotificationSetting(chatRoomId, newValue);
      setNotificationEnabled(newValue);
    } catch (error) {
      console.error('알림 설정 변경 실패:', error);
      Alert.alert('오류', '알림 설정 변경에 실패했습니다.');
    }
  };

  // 메시지 롱프레스 처리
  const handleMessageLongPress = (item: ChatMessage) => {
    if (item.type === 'system') return;

    const isMyMessage = item.senderId === user?.uid;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '복사', ...(isMyMessage ? [] : ['신고'])],
          cancelButtonIndex: 0,
          destructiveButtonIndex: isMyMessage ? undefined : 2,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            Clipboard.setString(item.text);
            Alert.alert('복사 완료', '메시지가 클립보드에 복사되었습니다.');
          } else if (buttonIndex === 2 && !isMyMessage) {
            handleReportMessage(item);
          }
        }
      );
    } else {
      Alert.alert(
        '메시지 옵션',
        '',
        [
          { text: '취소', style: 'cancel' },
          {
            text: '복사',
            onPress: () => {
              Clipboard.setString(item.text);
              Alert.alert('복사 완료', '메시지가 클립보드에 복사되었습니다.');
            },
          },
          ...(isMyMessage
            ? []
            : [
                {
                  text: '신고',
                  style: 'destructive' as const,
                  onPress: () => handleReportMessage(item),
                },
              ]),
        ]
      );
    }
  };

  // 메시지 신고
  const handleReportMessage = async (message: ChatMessage) => {
    if (!user) {
      Alert.alert('로그인 필요', '신고를 하려면 로그인해주세요.');
      return;
    }

    const categories: Array<'스팸' | '욕설/혐오' | '불법/위험' | '음란물' | '기타'> = [
      '스팸',
      '욕설/혐오',
      '불법/위험',
      '음란물',
      '기타',
    ];

    Alert.alert(
      '메시지 신고',
      '신고 사유를 선택해주세요.',
      [
        ...categories.map((cat) => ({
          text: cat,
          onPress: async () => {
            try {
              await createReport({
                targetType: 'chat_message',
                targetId: message.id || '',
                targetAuthorId: message.senderId,
                category: cat,
              });
              Alert.alert('신고 완료', '운영자가 24시간 이내 검토합니다. 감사합니다.');
            } catch (e) {
              Alert.alert('오류', '신고에 실패했습니다. 잠시 후 다시 시도해주세요.');
            }
          },
        })),
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  // 메시지 렌더링
  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isMyMessage = item.senderId === user?.uid;
    const isSystemMessage = item.type === 'system';

    if (isSystemMessage) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }

    const timeString = formatMessageTime(item.createdAt);
    
    // inverted FlatList에서 메시지 배열 구조:
    // - messages 배열: 내림차순 (index 0 = 최신 메시지, 마지막 = 오래된 메시지)
    // - inverted가 뒤집어서 표시: 화면 하단 = index 0 (최신), 화면 상단 = 마지막 (오래된)
    // - 화면에서 보이는 순서: 하단(최신) → 상단(오래된)
    //
    // 그룹화 로직:
    // - 화면에서 위쪽에 있는 메시지 = 더 오래된 메시지 = 더 큰 index
    // - 화면에서 아래쪽에 있는 메시지 = 더 최신 메시지 = 더 작은 index
    // - isGroupStart: 화면에서 아래쪽(더 최신) 메시지와 비교 → index - 1
    // - isGroupEnd: 화면에서 위쪽(더 오래된) 메시지와 비교 → index + 1
    
    const prevMessage = index > 0 ? messages[index - 1] : null; // 화면에서 아래쪽(더 최신)
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null; // 화면에서 위쪽(더 오래된)

    const currentMinuteKey = getMessageMinuteKey(item.createdAt);
    const prevMinuteKey = prevMessage ? getMessageMinuteKey(prevMessage.createdAt) : null;
    const nextMinuteKey = nextMessage ? getMessageMinuteKey(nextMessage.createdAt) : null;

    // 그룹 시작: 아래쪽(더 최신) 메시지와 비교
    // 아래쪽 메시지와 다른 사람이거나 다른 시간대면 그룹 시작
    const isGroupStart =
      !prevMessage ||
      prevMessage.senderId !== item.senderId ||
      prevMessage.type === 'system' ||
      currentMinuteKey === null ||
      prevMinuteKey === null ||
      currentMinuteKey !== prevMinuteKey;

    // 그룹 끝: 위쪽(더 오래된) 메시지와 비교
    // 위쪽 메시지와 다른 사람이거나 다른 시간대면 그룹 끝
    const isGroupEnd =
      !nextMessage ||
      nextMessage.senderId !== item.senderId ||
      nextMessage.type === 'system' ||
      currentMinuteKey === null ||
      nextMinuteKey === null ||
      currentMinuteKey !== nextMinuteKey;

    const avatarText = item.senderName?.[0] || '?';
    const minecraftAvatarUrl = item.minecraftUuid
      ? `https://minotar.net/avatar/${item.minecraftUuid}/48`
      : undefined;

    return (
      <View
        style={[
          styles.messageWrapper,
          isMyMessage ? styles.myMessageWrapper : styles.otherMessageWrapper,
          !isGroupStart && styles.messageWrapperInGroup,
        ]}
      >
        <View
          style={[
            styles.messageRowContainer,
            isMyMessage ? styles.myMessageRowContainer : styles.otherMessageRowContainer,
          ]}
        >
          {/* inverted FlatList: 아바타는 그룹의 마지막 메시지(화면 상단)에 표시 */}
          {!isMyMessage && isGroupEnd && (
            <View
              style={[
                styles.avatarContainer,
                {
                  backgroundColor: minecraftAvatarUrl ? 'transparent' : COLORS.accent.green,
                  borderRadius: minecraftAvatarUrl ? 8 : 18,
                },
              ]}
            >
              {minecraftAvatarUrl ? (
                <Image source={{ uri: minecraftAvatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>{avatarText}</Text>
              )}
            </View>
          )}
          {!isMyMessage && !isGroupEnd && <View style={styles.avatarPlaceholder} />}
          <View style={[styles.messageContent, isMyMessage && styles.myMessageContent]}>
            {/* inverted FlatList: 이름은 그룹의 마지막 메시지(화면 상단)에 표시 */}
            {!isMyMessage && isGroupEnd && <Text style={styles.senderName}>{item.senderName}</Text>}
            <TouchableOpacity
              activeOpacity={0.9}
              onLongPress={() => handleMessageLongPress(item)}
              delayLongPress={300}
            >
              <View style={[styles.messageRow, isMyMessage ? styles.myMessageRow : styles.otherMessageRow]}>
                {/* 내 메시지: unreadCount는 항상 표시, 타임스탬프는 그룹의 첫 메시지에만 */}
                {isMyMessage && (
                  <View style={styles.myMessageMetaContainer}>
                    {unreadCounts[item.id || ''] > 0 && (
                      <Text style={styles.unreadCountText}>{unreadCounts[item.id || '']}</Text>
                    )}
                    {isGroupStart && <Text style={styles.timestamp}>{timeString}</Text>}
                  </View>
                )}
                <View style={[styles.messageBubble, isMyMessage ? styles.myMessage : styles.otherMessage]}>
                  <Text
                    style={[
                      styles.messageText,
                      { color: isMyMessage ? COLORS.text.buttonText : COLORS.text.primary },
                    ]}
                  >
                    {item.text}
                  </Text>
                </View>
                {/* 다른 사람 메시지: unreadCount는 항상 표시, 타임스탬프는 그룹의 첫 메시지에만 */}
                {!isMyMessage && (
                  <View style={styles.otherMessageMetaContainer}>
                    {unreadCounts[item.id || ''] > 0 && (
                      <Text style={styles.unreadCountText}>{unreadCounts[item.id || '']}</Text>
                    )}
                    {isGroupStart && <Text style={styles.timestamp}>{timeString}</Text>}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // 채팅방 표시 이름
  const getChatRoomDisplayName = () => {
    if (!chatRoom) return '채팅방';

    if (chatRoom.type === 'university') {
      return '성결대 전체 채팅방';
    } else if (chatRoom.type === 'department' && user?.department) {
      return `${user.department} 채팅방`;
    }

    return chatRoom.name;
  };

  // 페이징 로드 (inverted FlatList에서 onEndReached는 상단에 도달했을 때 호출됨)
  const handleLoadMore = () => {
    if (!isInitialLoadCompleteRef.current) return;
    if (!hasMore || loadingMore || messages.length === 0) return;
    loadMore();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {getChatRoomDisplayName()}
            </Text>
            {chatRoom && (
              <Text style={styles.headerSubtitle}>{chatRoom.members?.length || 0}명</Text>
            )}
          </View>

          <TouchableOpacity
            style={styles.notificationButton}
            onPress={handleToggleNotification}
            activeOpacity={0.7}
          >
            <Icon
              name={notificationEnabled ? 'notifications' : 'notifications-off'}
              size={24}
              color={notificationEnabled ? COLORS.accent.blue : COLORS.text.secondary}
            />
          </TouchableOpacity>
        </View>

        {/* Messages List */}
        {messagesLoading && messages.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.accent.blue} />
            <Text style={styles.loadingText}>메시지를 불러오는 중...</Text>
          </View>
        ) : (
          <View style={styles.messageListContainer}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id || ''}
              renderItem={renderMessage}
              inverted
              contentContainerStyle={styles.messageList}
              onEndReached={handleLoadMore}
              onEndReachedThreshold={0.25}
              showsVerticalScrollIndicator
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>메시지가 없어요</Text>
                  <Text style={styles.emptySubtext}>첫 메시지를 보내보세요!</Text>
                </View>
              }
              ListFooterComponent={
                loadingMore ? (
                  <View style={styles.loadingMoreContainer}>
                    <ActivityIndicator size="small" color={COLORS.accent.blue} />
                    <Text style={styles.loadingMoreText}>이전 메시지 불러오는 중...</Text>
                  </View>
                ) : null
              }
            />
            
            {/* 서버 정보 섹션 (게임 채팅방만) - 절대 위치 */}
            {isGameRoom && serverCurrentPlayers !== null && (
              <View style={styles.serverInfoSection}>
                <TouchableOpacity 
                  style={styles.serverInfoHeader}
                  onPress={() => setShowServerInfo(!showServerInfo)}
                >
                  <View style={styles.serverInfoHeaderLeft}>
                    <Image source={require('../../../assets/images/minecraft/icon.png')} style={styles.serverInfoIcon} />
                    <Text style={styles.serverInfoTitle}>
                      서버 접속자 {serverCurrentPlayers}{serverMaxPlayers ? `/${serverMaxPlayers}` : ''}명
                    </Text>
                  </View>
                  <Icon 
                    name={showServerInfo ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={COLORS.text.secondary} 
                  />
                </TouchableOpacity>
                
                {showServerInfo && (
                  <View style={styles.serverInfoContent}>
                    <View style={styles.serverInfoItem}>
                      <View style={styles.serverInfoItemRow}>
                        <Icon name="people" size={16} color={COLORS.text.secondary} />
                        <Text style={styles.serverInfoLabel}>접속자</Text>
                      </View>
                      <Text style={styles.serverInfoValue}>
                        {serverCurrentPlayers}{serverMaxPlayers ? `/${serverMaxPlayers}` : ''}명
                      </Text>
                    </View>
                    
                    {serverStatus && (
                      <View style={styles.serverInfoItem}>
                        <View style={styles.serverInfoItemRow}>
                          <Icon name="radio-button-on" size={16} color={COLORS.text.secondary} />
                          <Text style={styles.serverInfoLabel}>서버 상태</Text>
                        </View>
                        <View style={[
                          styles.serverStatusBadge,
                          serverStatus.online ? styles.serverStatusBadgeOnline : styles.serverStatusBadgeOffline
                        ]}>
                          <View style={[
                            styles.serverStatusDot,
                            serverStatus.online ? styles.serverStatusDotOnline : styles.serverStatusDotOffline
                          ]} />
                          <Text style={[
                            styles.serverStatusText,
                            serverStatus.online ? styles.serverStatusTextOnline : styles.serverStatusTextOffline
                          ]}>
                            {serverStatus.online ? '켜짐' : '꺼짐'}
                          </Text>
                        </View>
                      </View>
                    )}
                    
                    {serverVersion && (
                      <View style={styles.serverInfoItem}>
                        <View style={styles.serverInfoItemRow}>
                          <Icon name="code" size={16} color={COLORS.text.secondary} />
                          <Text style={styles.serverInfoLabel}>버전</Text>
                        </View>
                        <Text style={styles.serverInfoValue}>{serverVersion}</Text>
                      </View>
                    )}
                    
                    {serverUrl && (
                      <View style={styles.serverInfoItem}>
                        <View style={styles.serverInfoItemRow}>
                          <Icon name="globe" size={16} color={COLORS.text.secondary} />
                          <Text style={styles.serverInfoLabel}>서버 주소</Text>
                        </View>
                        <TouchableOpacity
                          onPress={async () => {
                            try {
                              await Clipboard.setString(serverUrl);
                              Alert.alert('복사 완료', '서버 주소가 클립보드에 복사되었습니다.');
                            } catch (error) {
                              Alert.alert('오류', '클립보드 복사에 실패했습니다.');
                            }
                          }}
                        >
                          <Text style={styles.serverInfoValue} numberOfLines={1}>{serverUrl}</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* Input Area */}
        <View style={[styles.inputContainer, { paddingBottom: Platform.OS === 'ios' ? insets.bottom : 16 }]}>
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="메시지를 입력하세요"
            placeholderTextColor={COLORS.text.disabled}
            multiline
            maxLength={500}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
            activeOpacity={0.7}
          >
            <Icon
              name="send"
              size={20}
              color={message.trim() ? COLORS.text.buttonText : COLORS.text.disabled}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    backgroundColor: COLORS.background.primary,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginTop: 12,
  },
  messageListContainer: {
    flex: 1,
    position: 'relative',
  },
  messageList: {
    padding: 16,
    paddingTop: 0,
  },
  messageWrapper: {
    marginBottom: 16,
    width: '100%',
  },
  messageWrapperInGroup: {
    marginBottom: 4,
  },
  myMessageWrapper: {
    alignItems: 'flex-end',
  },
  otherMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageRowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '100%',
  },
  myMessageRowContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageRowContainer: {
    justifyContent: 'flex-start',
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
    overflow: 'hidden',
  },
  avatarPlaceholder: {
    width: 36,
    marginRight: 8,
  },
  messageContent: {
    flex: 1,
    flexDirection: 'column',
  },
  myMessageContent: {
    flex: 1,
    alignItems: 'flex-end',
  },
  senderName: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    marginBottom: 2,
    fontWeight: '500',
  },
  avatarText: {
    fontSize: 16,
    color: COLORS.text.buttonText,
    fontWeight: 'bold',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '75%',
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: '100%',
  },
  myMessage: {
    backgroundColor: COLORS.accent.blue,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: COLORS.background.card,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...TYPOGRAPHY.body1,
    lineHeight: 20,
  },
  timestamp: {
    ...TYPOGRAPHY.caption3,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  myMessageMetaContainer: {
    alignItems: 'flex-end',
    marginRight: 4,
  },
  otherMessageMetaContainer: {
    alignItems: 'flex-start',
    marginLeft: 4,
  },
  unreadCountText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.accent.blue,
    fontWeight: 'bold',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  systemMessageText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    backgroundColor: COLORS.background.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  emptyContainer: {
    flex: 1,
    height: SCREEN_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingMoreText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    backgroundColor: COLORS.background.primary,
  },
  input: {
    flex: 1,
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    backgroundColor: COLORS.background.card,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent.blue,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.background.card,
  },
  avatarImage: {
    width: 36,
    height: 36,
  },
  // 서버 정보 섹션 스타일 (절대 위치)
  serverInfoSection: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  serverInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  serverInfoHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serverInfoIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  serverInfoTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  serverInfoContent: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    padding: 16,
    gap: 12,
  },
  serverInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  serverInfoItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serverInfoLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  serverInfoValue: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  serverStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  serverStatusBadgeOnline: {
    backgroundColor: COLORS.accent.green + '20',
    borderColor: COLORS.accent.green + '40',
  },
  serverStatusBadgeOffline: {
    backgroundColor: COLORS.accent.red + '20',
    borderColor: COLORS.accent.red + '40',
  },
  serverStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  serverStatusDotOnline: {
    backgroundColor: COLORS.accent.green,
  },
  serverStatusDotOffline: {
    backgroundColor: COLORS.accent.red,
  },
  serverStatusText: {
    ...TYPOGRAPHY.caption2,
    fontWeight: '600',
  },
  serverStatusTextOnline: {
    color: COLORS.accent.green,
  },
  serverStatusTextOffline: {
    color: COLORS.accent.red,
  },
});
