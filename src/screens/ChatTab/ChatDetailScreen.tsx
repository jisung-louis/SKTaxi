import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Keyboard, Clipboard, ActionSheetIOS } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused, useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import Icon from 'react-native-vector-icons/Ionicons';
import { ChatStackParamList } from '../../navigations/types';
import { useChatMessages, joinChatRoom, sendChatMessage, getChatRoomNotificationSetting, updateChatRoomNotificationSetting, markChatRoomAsRead } from '../../hooks/useChatMessages';
import { ChatMessage, ChatRoom } from '../../types/firestore';
import { useAuth } from '../../hooks/useAuth';
import { useScreenView } from '../../hooks/useScreenView';
import firestore, { doc, onSnapshot, arrayUnion, writeBatch } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import { createReport } from '../../lib/moderation';

type ChatDetailScreenNavigationProp = NativeStackNavigationProp<ChatStackParamList, 'ChatDetail'>;
type ChatDetailScreenRouteProp = RouteProp<ChatStackParamList, 'ChatDetail'>;

const INPUT_CONTAINER_HEIGHT = 89;

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

const formatMessageTime = (timestamp: any) => {
  if (!timestamp) return '';
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
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
  
  const [message, setMessage] = useState('');
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<{ [messageId: string]: number }>({});
  
  const flatListRef = useRef<FlatList>(null);
  const contentHeightRef = useRef<number>(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const inputTranslateY = useSharedValue(0);
  
  const { messages, loading: messagesLoading } = useChatMessages(chatRoomId);

  useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    translateY.value = withTiming(isFocused ? 0 : 10, { duration: 200 });
  }, [isFocused]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const inputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: inputTranslateY.value }],
  }));

  // 채팅방 정보 구독
  useEffect(() => {
    if (!chatRoomId) return;

    const chatRoomRef = doc(firestore(getApp()), 'chatRooms', chatRoomId);
    const unsubscribe = onSnapshot(chatRoomRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data() as ChatRoom;
        setChatRoom({ id: snap.id, ...data });
        
        // 사용자가 멤버인지 확인
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
      if (!msg.id || msg.type === 'system') {
        return;
      }

      const readBy = msg.readBy || [];
      // 보낸 사람은 항상 읽은 것으로 간주하므로, 안읽은 사람 수 계산에서 제외
      // members에서 보낸 사람과 이미 읽은 사람을 제외한 나머지가 안읽은 사람 수
      const unreadCount = members.filter(memberId => 
        memberId !== msg.senderId && !readBy.includes(memberId)
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
        
        // 채팅방 읽음 처리 (unreadCount를 0으로 리셋)
        await markChatRoomAsRead(chatRoomId);
        
        // 채팅방 진입 시 가장 아래로 스크롤
        setTimeout(() => {
          scrollToEndWithPadding(true);
        }, 300);
      } catch (error) {
        console.error('채팅방 참여 실패:', error);
        Alert.alert('오류', '채팅방에 참여할 수 없습니다.');
      }
    };

    joinRoom();
  }, [chatRoomId, user?.uid, hasJoined]);

  // 화면이 포커스될 때마다 읽음 처리 (다른 화면에서 돌아왔을 때도)
  useEffect(() => {
    if (!chatRoomId || !user?.uid || !hasJoined || !isFocused) return;

    const markAsRead = async () => {
      try {
        await markChatRoomAsRead(chatRoomId);
        // 화면 포커스 시 가장 아래로 스크롤
        setTimeout(() => {
          scrollToEndWithPadding(true);
        }, 300);
      } catch (error) {
        console.error('채팅방 읽음 처리 실패:', error);
      }
    };

    markAsRead();
  }, [chatRoomId, user?.uid, hasJoined, isFocused]);

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

  // 키보드 이벤트 처리 (iOS 자동완성 바 대응)
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        const keyboardHeight = event.endCoordinates.height;
        setKeyboardHeight(keyboardHeight);
        
        // iOS의 경우 자동완성 바 높이(약 20px)를 추가로 고려 (CommentInput과 동일)
        const additionalOffset = Platform.OS === 'ios' ? 20 : 0;
        inputTranslateY.value = withTiming(-(keyboardHeight - additionalOffset), {
          duration: Platform.OS === 'ios' ? event.duration || 250 : 250,
        });
        
        // 키보드가 올라올 때 메시지 리스트도 스크롤
        setTimeout(() => {
          scrollToEndWithPadding(true);
        }, 100);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      (event) => {
        setKeyboardHeight(0);
        inputTranslateY.value = withTiming(0, {
          duration: Platform.OS === 'ios' ? event.duration || 250 : 250,
        });
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, [inputTranslateY]);

  // 메시지가 처음 로드되었을 때 가장 아래로 스크롤
  useEffect(() => {
    if (!hasJoined || !isFocused || messagesLoading || messages.length === 0) return;
    
    // 메시지가 처음 로드되었을 때만 스크롤
    const timer = setTimeout(() => {
      scrollToEndWithPadding(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [hasJoined, isFocused, messagesLoading]);

  // 메시지가 추가될 때마다 스크롤 및 읽음 처리
  useEffect(() => {
    if (!chatRoomId || !user?.uid || !hasJoined || !isFocused || messages.length === 0) {
      return;
    }

    // 새 메시지가 추가되었을 때 현재 사용자가 채팅방에 있으면 자동으로 읽음 처리
    const markNewMessagesAsRead = async () => {
      try {
        // 가장 최근 메시지들 중 현재 사용자가 아직 읽지 않은 메시지 찾기
        const unreadMessages = messages.filter(msg => {
          if (!msg.id || msg.type === 'system' || msg.senderId === user.uid) {
            return false; // 시스템 메시지나 내가 보낸 메시지는 제외
          }
          const readBy = msg.readBy || [];
          return !readBy.includes(user.uid);
        });

        if (unreadMessages.length === 0) {
          return;
        }

        // 배치로 readBy 업데이트
        const batch = writeBatch(firestore(getApp()));
        unreadMessages.forEach(msg => {
          if (msg.id) {
            const messageRef = doc(firestore(getApp()), 'chatRooms', chatRoomId, 'messages', msg.id);
            batch.update(messageRef, {
              readBy: arrayUnion(user.uid),
            });
          }
        });

        await batch.commit();
        console.log(`✅ ${unreadMessages.length}개 새 메시지 읽음 처리 완료`);
      } catch (error) {
        console.error('새 메시지 읽음 처리 실패:', error);
      }
    };

    // 약간의 지연을 두어 메시지가 완전히 로드된 후 처리
    const timer = setTimeout(() => {
      markNewMessagesAsRead();
    }, 500);

    return () => clearTimeout(timer);
  }, [messages, chatRoomId, user?.uid, hasJoined, isFocused]);

  // 메시지가 추가될 때마다 스크롤
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToEndWithPadding(true);
      }, 100);
    }
  }, [messages.length]);

  const scrollToEndWithPadding = (animated: boolean = true) => {
    const paddingBottom = 16;
    if (contentHeightRef.current > 0) {
      flatListRef.current?.scrollToOffset({
        offset: contentHeightRef.current + paddingBottom,
        animated,
      });
    } else {
      flatListRef.current?.scrollToEnd({ animated });
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !chatRoomId) return;

    try {
      await sendChatMessage(chatRoomId, message);
      setMessage('');
    } catch (error: any) {
      console.error('메시지 전송 실패:', error);
      Alert.alert('오류', error.message || '메시지 전송에 실패했습니다.');
    }
  };

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
            // 복사
            Clipboard.setString(item.text);
            Alert.alert('복사 완료', '메시지가 클립보드에 복사되었습니다.');
          } else if (buttonIndex === 2 && !isMyMessage) {
            // 신고
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
          ...(isMyMessage ? [] : [{
            text: '신고',
            style: 'destructive' as const,
            onPress: () => handleReportMessage(item),
          }]),
        ]
      );
    }
  };

  const handleReportMessage = async (message: ChatMessage) => {
    if (!user) {
      Alert.alert('로그인 필요', '신고를 하려면 로그인해주세요.');
      return;
    }

    const categories: Array<'스팸' | '욕설/혐오' | '불법/위험' | '음란물' | '기타'> = ['스팸', '욕설/혐오', '불법/위험', '음란물', '기타'];
    
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
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
    
    // 그룹 시작/끝 판단 (같은 사람, 같은 시간대)
    const isGroupStart = !prevMessage || 
      prevMessage.senderId !== item.senderId || 
      prevMessage.type === 'system';
    const isGroupEnd = !nextMessage || 
      nextMessage.senderId !== item.senderId || 
      nextMessage.type === 'system';
    
    const avatarText = item.senderName?.[0] || '?';

    return (
      <View style={[
        styles.messageWrapper,
        isMyMessage ? styles.myMessageWrapper : styles.otherMessageWrapper,
        !isGroupStart && styles.messageWrapperInGroup
      ]}>
        <View style={[
          styles.messageRowContainer,
          isMyMessage ? styles.myMessageRowContainer : styles.otherMessageRowContainer
        ]}>
          {!isMyMessage && isGroupStart && (
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{avatarText}</Text>
            </View>
          )}
          {!isMyMessage && !isGroupStart && (
            <View style={styles.avatarPlaceholder} />
          )}
          <View style={[
            styles.messageContent,
            isMyMessage && styles.myMessageContent
          ]}>
            {!isMyMessage && isGroupStart && (
              <Text style={styles.senderName}>{item.senderName}</Text>
            )}
            <TouchableOpacity
              activeOpacity={0.9}
              onLongPress={() => handleMessageLongPress(item)}
              delayLongPress={300}
            >
              <View style={[
                styles.messageRow,
                isMyMessage ? styles.myMessageRow : styles.otherMessageRow
              ]}>
                {isMyMessage && isGroupEnd && (
                  <View style={styles.myMessageTimeContainer}>
                    {unreadCounts[item.id || ''] > 0 && (
                      <Text style={styles.unreadCountText}>
                        {unreadCounts[item.id || '']}
                      </Text>
                    )}
                    <Text style={styles.timestamp}>{timeString}</Text>
                  </View>
                )}
                <View style={[
                  styles.messageBubble,
                  isMyMessage ? styles.myMessage : styles.otherMessage
                ]}>
                  <Text style={[
                    styles.messageText,
                    { color: isMyMessage ? COLORS.text.buttonText : COLORS.text.primary }
                  ]}>
                    {item.text}
                  </Text>
                </View>
                {!isMyMessage && isGroupEnd && (
                  <Text style={styles.timestamp}>{timeString}</Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const getChatRoomDisplayName = () => {
    if (!chatRoom) return '채팅방';
    
    if (chatRoom.type === 'university') {
      return '성결대 전체 채팅방';
    } else if (chatRoom.type === 'department' && user?.department) {
      return `${user.department} 채팅방`;
    }
    
    return chatRoom.name;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Animated.View style={[{ flex: 1 }, screenAnimatedStyle]}>
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
              <Text style={styles.headerSubtitle}>
                {chatRoom.members?.length || 0}명
              </Text>
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
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id || ''}
          renderItem={renderMessage}
          contentContainerStyle={[
            styles.messageList,
            { 
              paddingBottom: 20 + INPUT_CONTAINER_HEIGHT + keyboardHeight // inputContainer 높이 + 키보드 높이
            }
          ]}
          onContentSizeChange={(width, height) => {
            contentHeightRef.current = height;
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>메시지가 없어요</Text>
              <Text style={styles.emptySubtext}>첫 메시지를 보내보세요!</Text>
            </View>
          }
        />

        {/* Input Area */}
        <Animated.View style={inputAnimatedStyle}>
          <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
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
        </Animated.View>
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
  messageList: {
    padding: 16,
    paddingTop: 12,
  },
  messageWrapper: {
    marginTop: 12,
    width: '100%',
  },
  messageWrapperInGroup: {
    marginTop: 4, // 그룹 내 메시지는 위쪽 간격 축소
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
    backgroundColor: COLORS.accent.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 2,
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
    marginHorizontal: 8,
    marginBottom: 2,
  },
  myMessageTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 2,
  },
  unreadCountText: {
    ...TYPOGRAPHY.caption3,
    color: COLORS.accent.blue,
    marginRight: 4,
    fontWeight: '600',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    backgroundColor: COLORS.background.primary,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: INPUT_CONTAINER_HEIGHT,
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
});

