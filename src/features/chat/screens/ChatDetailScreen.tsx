import React, { useEffect, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Clipboard,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  RouteProp,
  useIsFocused,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { SCREEN_HEIGHT } from '@gorhom/bottom-sheet';

import { useAuth } from '@/features/auth';
import { COLORS } from '@/shared/constants/colors';
import { TYPOGRAPHY } from '@/shared/constants/typography';
import { useScreenView } from '@/shared/hooks/useScreenView';
import { createReport } from '@/shared/lib/moderation';
import { loadChatSound, playChatSound } from '@/shared/lib/sound/chatSound';

import type { ChatMessage } from '../model/types';
import type { ChatStackParamList } from '../model/navigation';
import {
  getChatRoomDisplayName,
} from '../services/chatRoomService';
import { useChatActions } from '../hooks/useChatActions';
import { useChatMessages } from '../hooks/useChatMessages';
import { useChatRoom, useChatRoomLastRead } from '../hooks/useChatRoom';
import { useChatRoomNotifications } from '../hooks/useChatRoomNotifications';

type ChatDetailScreenNavigationProp = NativeStackNavigationProp<
  ChatStackParamList,
  'ChatDetail'
>;
type ChatDetailScreenRouteProp = RouteProp<ChatStackParamList, 'ChatDetail'>;

const formatMessageTime = (timestamp: unknown) => {
  if (!timestamp) {
    return '';
  }

  try {
    const date =
      typeof (timestamp as any).toDate === 'function'
        ? (timestamp as any).toDate()
        : new Date(timestamp as string | number | Date);
    return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
};

const getMessageMinuteKey = (timestamp: unknown): number | null => {
  if (!timestamp) {
    return null;
  }

  try {
    const date =
      typeof (timestamp as any).toDate === 'function'
        ? (timestamp as any).toDate()
        : new Date(timestamp as string | number | Date);
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

  const { chatRoom, hasJoined, joinRoom, serverInfo } = useChatRoom(chatRoomId);
  const { sendMessage } = useChatActions();
  const { isNotificationEnabled, updateNotificationSetting } = useChatRoomNotifications();
  useChatRoomLastRead(chatRoomId, isFocused);

  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showServerInfo, setShowServerInfo] = useState(false);

  const flatListRef = useRef<FlatList>(null);
  const isInitialLoadCompleteRef = useRef(false);

  const isGameRoom = chatRoom?.type === 'game';
  const notificationEnabled = chatRoomId ? isNotificationEnabled(chatRoomId) : true;
  const { messages, loading: messagesLoading, loadingMore, hasMore, loadMore } =
    useChatMessages(chatRoomId, isFocused);

  const serverCurrentPlayers = serverInfo?.currentPlayers ?? null;
  const serverMaxPlayers = serverInfo?.maxPlayers ?? null;
  const serverStatus =
    serverInfo?.online === null ? null : { online: Boolean(serverInfo?.online) };
  const serverUrl = serverInfo?.serverUrl ?? null;
  const serverVersion = serverInfo?.version ?? null;

  useEffect(() => {
    loadChatSound();
  }, []);

  useEffect(() => {
    if (!chatRoomId || !user?.uid || hasJoined) {
      return;
    }

    const join = async () => {
      try {
        await joinRoom();
      } catch (error) {
        console.error('채팅방 참여 실패:', error);
        Alert.alert('오류', '채팅방에 참여할 수 없습니다.');
      }
    };

    join();
  }, [chatRoomId, hasJoined, joinRoom, user?.uid]);

  useEffect(() => {
    if (!messagesLoading && messages.length > 0 && !isInitialLoadCompleteRef.current) {
      setTimeout(() => {
        isInitialLoadCompleteRef.current = true;
      }, 100);
    }
  }, [messages.length, messagesLoading]);

  useEffect(() => {
    if (!user?.uid || !messages.length || !isInitialLoadCompleteRef.current) {
      return;
    }

    const latestMessage = messages[0];
    if (!latestMessage?.senderId || latestMessage.senderId === user.uid) {
      return;
    }

    if (latestMessage.type === 'system') {
      return;
    }

    playChatSound();
  }, [messages, user?.uid]);

  const handleSendMessage = async () => {
    if (!message.trim() || !chatRoomId || isSending) {
      return;
    }

    setIsSending(true);
    try {
      await sendMessage(chatRoomId, message, chatRoom);
      setMessage('');
      playChatSound();
    } catch (error: any) {
      console.error('메시지 전송 실패:', error);
      Alert.alert('오류', error.message || '메시지 전송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleNotification = async () => {
    if (!chatRoomId) {
      return;
    }

    try {
      await updateNotificationSetting(chatRoomId, !notificationEnabled);
    } catch (error) {
      console.error('알림 설정 변경 실패:', error);
      Alert.alert('오류', '알림 설정 변경에 실패했습니다.');
    }
  };

  const handleReportMessage = async (targetMessage: ChatMessage) => {
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

    Alert.alert('메시지 신고', '신고 사유를 선택해주세요.', [
      ...categories.map(category => ({
        text: category,
        onPress: async () => {
          try {
            await createReport({
              targetType: 'chat_message',
              targetId: targetMessage.id || '',
              targetAuthorId: targetMessage.senderId,
              category,
            });
            Alert.alert('신고 완료', '운영자가 24시간 이내 검토합니다. 감사합니다.');
          } catch {
            Alert.alert('오류', '신고에 실패했습니다. 잠시 후 다시 시도해주세요.');
          }
        },
      })),
      { text: '취소', style: 'cancel' },
    ]);
  };

  const handleMessageLongPress = (targetMessage: ChatMessage) => {
    if (targetMessage.type === 'system') {
      return;
    }

    const isMyMessage = targetMessage.senderId === user?.uid;

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['취소', '복사', ...(isMyMessage ? [] : ['신고'])],
          cancelButtonIndex: 0,
          destructiveButtonIndex: isMyMessage ? undefined : 2,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            Clipboard.setString(targetMessage.text);
            Alert.alert('복사 완료', '메시지가 클립보드에 복사되었습니다.');
          } else if (buttonIndex === 2 && !isMyMessage) {
            handleReportMessage(targetMessage);
          }
        },
      );
      return;
    }

    Alert.alert('메시지 옵션', '', [
      { text: '취소', style: 'cancel' },
      {
        text: '복사',
        onPress: () => {
          Clipboard.setString(targetMessage.text);
          Alert.alert('복사 완료', '메시지가 클립보드에 복사되었습니다.');
        },
      },
      ...(isMyMessage
        ? []
        : [
            {
              text: '신고',
              style: 'destructive' as const,
              onPress: () => handleReportMessage(targetMessage),
            },
          ]),
    ]);
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

    const timeString = formatMessageTime((item as any).createdAt || item.clientCreatedAt);
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;

    const currentMinuteKey = getMessageMinuteKey(item.createdAt);
    const prevMinuteKey = prevMessage ? getMessageMinuteKey(prevMessage.createdAt) : null;
    const nextMinuteKey = nextMessage ? getMessageMinuteKey(nextMessage.createdAt) : null;

    const isGroupStart =
      !prevMessage ||
      prevMessage.senderId !== item.senderId ||
      prevMessage.type === 'system' ||
      currentMinuteKey === null ||
      prevMinuteKey === null ||
      currentMinuteKey !== prevMinuteKey;

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
          {!isMyMessage && isGroupEnd && (
            <View
              style={[
                styles.avatarContainer,
                minecraftAvatarUrl
                  ? styles.avatarContainerWithImage
                  : styles.avatarContainerDefault,
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
            {!isMyMessage && isGroupEnd && (
              <Text style={styles.senderName}>{item.senderName}</Text>
            )}
            <TouchableOpacity
              activeOpacity={0.9}
              onLongPress={() => handleMessageLongPress(item)}
              delayLongPress={300}
            >
              <View
                style={[
                  styles.messageRow,
                  isMyMessage ? styles.myMessageRow : styles.otherMessageRow,
                ]}
              >
                {isMyMessage && isGroupStart && (
                  <View style={styles.myMessageMetaContainer}>
                    <Text style={styles.timestamp}>{timeString}</Text>
                  </View>
                )}
                <View
                  style={[
                    styles.messageBubble,
                    isMyMessage ? styles.myMessage : styles.otherMessage,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      {
                        color: isMyMessage
                          ? COLORS.text.buttonText
                          : COLORS.text.primary,
                      },
                    ]}
                  >
                    {item.text}
                  </Text>
                </View>
                {!isMyMessage && isGroupStart && (
                  <View style={styles.otherMessageMetaContainer}>
                    <Text style={styles.timestamp}>{timeString}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const handleLoadMore = () => {
    if (!isInitialLoadCompleteRef.current || !hasMore || loadingMore || messages.length === 0) {
      return;
    }

    loadMore();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
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
              {getChatRoomDisplayName(chatRoom, user?.department)}
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
              keyExtractor={item => item.id || ''}
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

            {isGameRoom && serverCurrentPlayers !== null && (
              <View style={styles.serverInfoSection}>
                <TouchableOpacity
                  style={styles.serverInfoHeader}
                  onPress={() => setShowServerInfo(previousValue => !previousValue)}
                >
                  <View style={styles.serverInfoHeaderLeft}>
                    <Image
                      source={require('../../../../assets/images/minecraft/icon.png')}
                      style={styles.serverInfoIcon}
                    />
                    <Text style={styles.serverInfoTitle}>
                      서버 접속자 {serverCurrentPlayers}
                      {serverMaxPlayers ? `/${serverMaxPlayers}` : ''}명
                    </Text>
                  </View>
                  <Icon
                    name={showServerInfo ? 'chevron-up' : 'chevron-down'}
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
                        {serverCurrentPlayers}
                        {serverMaxPlayers ? `/${serverMaxPlayers}` : ''}명
                      </Text>
                    </View>

                    {serverStatus && (
                      <View style={styles.serverInfoItem}>
                        <View style={styles.serverInfoItemRow}>
                          <Icon
                            name="radio-button-on"
                            size={16}
                            color={COLORS.text.secondary}
                          />
                          <Text style={styles.serverInfoLabel}>서버 상태</Text>
                        </View>
                        <View
                          style={[
                            styles.serverStatusBadge,
                            serverStatus.online
                              ? styles.serverStatusBadgeOnline
                              : styles.serverStatusBadgeOffline,
                          ]}
                        >
                          <View
                            style={[
                              styles.serverStatusDot,
                              serverStatus.online
                                ? styles.serverStatusDotOnline
                                : styles.serverStatusDotOffline,
                            ]}
                          />
                          <Text
                            style={[
                              styles.serverStatusText,
                              serverStatus.online
                                ? styles.serverStatusTextOnline
                                : styles.serverStatusTextOffline,
                            ]}
                          >
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
                              Alert.alert(
                                '복사 완료',
                                '서버 주소가 클립보드에 복사되었습니다.',
                              );
                            } catch {
                              Alert.alert('오류', '클립보드 복사에 실패했습니다.');
                            }
                          }}
                        >
                          <Text style={styles.serverInfoValue} numberOfLines={1}>
                            {serverUrl}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        <View
          style={[
            styles.inputContainer,
            Platform.OS === 'ios'
              ? { paddingBottom: insets.bottom }
              : styles.inputContainerAndroid,
          ]}
        >
          <TextInput
            style={styles.input}
            value={message}
            onChangeText={setMessage}
            placeholder="메시지를 입력하세요"
            placeholderTextColor={COLORS.text.disabled}
            multiline
            maxLength={500}
            onSubmitEditing={handleSendMessage}
            editable={!isSending}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!message.trim() || isSending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim() || isSending}
            activeOpacity={0.7}
          >
            {isSending ? (
              <ActivityIndicator size="small" color={COLORS.text.buttonText} />
            ) : (
              <Icon
                name="send"
                size={20}
                color={message.trim() ? COLORS.text.buttonText : COLORS.text.disabled}
              />
            )}
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
  keyboardAvoidingView: {
    flex: 1,
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
  avatarContainerDefault: {
    backgroundColor: COLORS.accent.green,
    borderRadius: 18,
  },
  avatarContainerWithImage: {
    backgroundColor: 'transparent',
    borderRadius: 8,
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
  inputContainerAndroid: {
    paddingBottom: 16,
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
    backgroundColor: `${COLORS.accent.green}20`,
    borderColor: `${COLORS.accent.green}40`,
  },
  serverStatusBadgeOffline: {
    backgroundColor: `${COLORS.accent.red}20`,
    borderColor: `${COLORS.accent.red}40`,
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
