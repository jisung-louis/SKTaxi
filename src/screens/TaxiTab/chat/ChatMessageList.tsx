import React, { useRef, forwardRef, useImperativeHandle } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import { Message } from '../../../types/firestore';

interface ChatMessageListProps {
  messages: Message[];
  currentUserId?: string;
  onCopyAccountInfo: (bankName: string, accountNumber: string) => void;
  onLeaveRoom: () => void;
  onContentSizeChange?: (width: number, height: number) => void;
}

export interface ChatMessageListRef {
  scrollToEnd: (animated?: boolean) => void;
  scrollToOffset: (offset: number, animated?: boolean) => void;
}

// 같은 시간(분 단위)인지 확인하는 헬퍼 함수
const isSameMinute = (date1: any, date2: any): boolean => {
  if (!date1 || !date2) return false;

  let d1: Date;
  if (date1 instanceof Date) {
    d1 = date1;
  } else if (date1 && typeof date1.toDate === 'function') {
    d1 = date1.toDate();
  } else {
    return false;
  }

  let d2: Date;
  if (date2 instanceof Date) {
    d2 = date2;
  } else if (date2 && typeof date2.toDate === 'function') {
    d2 = date2.toDate();
  } else {
    return false;
  }

  return d1.getHours() === d2.getHours() && d1.getMinutes() === d2.getMinutes();
};

export const ChatMessageList = forwardRef<ChatMessageListRef, ChatMessageListProps>(
  ({ messages, currentUserId, onCopyAccountInfo, onLeaveRoom, onContentSizeChange }, ref) => {
    const flatListRef = useRef<FlatList>(null);

    useImperativeHandle(ref, () => ({
      scrollToEnd: (animated = true) => {
        flatListRef.current?.scrollToEnd({ animated });
      },
      scrollToOffset: (offset: number, animated = true) => {
        flatListRef.current?.scrollToOffset({ offset, animated });
      },
    }));

    // 계좌 정보 메시지 렌더링
    const renderAccountMessage = (item: Message) => {
      if (!item.accountData) return null;

      const { bankName, accountNumber, accountHolder, hideName } = item.accountData;
      const isMyMessage = item.senderId === currentUserId;

      const displayName = hideName && accountHolder
        ? accountHolder.charAt(0) + '*'.repeat(accountHolder.length - 1)
        : accountHolder;

      return (
        <View style={[
          styles.messageContainer,
          { outlineWidth: 1, outlineColor: COLORS.accent.green },
          isMyMessage ? [styles.myMessage, { backgroundColor: COLORS.background.card }] : styles.otherMessage
        ]}>
          <View style={styles.accountMessageContainer}>
            <Text style={styles.accountMessageTitle}>{item.senderName}님이 계좌번호를 공유했어요.</Text>
            <View style={styles.accountInfoContainer}>
              <View style={styles.accountInfoTextContainer}>
                <Text style={styles.accountInfo}>{bankName} {accountNumber}</Text>
                {displayName && (
                  <Text style={styles.accountHolder}>{displayName}</Text>
                )}
              </View>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={() => onCopyAccountInfo(bankName, accountNumber)}
              >
                <Icon name="copy-outline" size={20} color={COLORS.accent.green} />
              </TouchableOpacity>
            </View>
          </View>
          <Text style={styles.timestamp}>
            {item.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ||
              new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      );
    };

    // 동승 종료 메시지 렌더링
    const renderEndMessage = (item: Message) => {
      return (
        <View style={styles.endMessageContainer}>
          <View style={styles.endMessageContent}>
            <Icon name="checkmark-circle" size={20} color={COLORS.accent.green} />
            <Text style={styles.endMessageText}>{item.text}</Text>
          </View>
          <TouchableOpacity
            style={styles.leaveRoomButton}
            onPress={onLeaveRoom}
          >
            <Text style={styles.leaveRoomButtonText}>방 나가기</Text>
          </TouchableOpacity>
        </View>
      );
    };

    // 도착 메시지 렌더링
    const renderArrivalMessage = (item: Message) => {
      if (!item.arrivalData) return null;

      const { taxiFare, perPerson, memberCount, bankName, accountNumber, accountHolder, hideName } = item.arrivalData;
      const isMyMessage = item.senderId === currentUserId;

      const displayName = hideName && accountHolder
        ? accountHolder.charAt(0) + '*'.repeat(accountHolder.length - 1)
        : accountHolder;

      return (
        <View style={[
          styles.messageContainer,
          { outlineWidth: 1, outlineColor: COLORS.accent.green },
          isMyMessage ? [styles.myMessage, { backgroundColor: COLORS.background.card }] : styles.otherMessage
        ]}>
          <View style={styles.arrivalMessageContainer}>
            <View style={styles.arrivalHeader}>
              <Icon name="checkmark-circle" size={24} color={COLORS.accent.green} />
              <Text style={styles.arrivalMessageTitle}>택시가 목적지에 도착했어요!</Text>
            </View>

            <View style={styles.arrivalInfoSection}>
              <View style={styles.arrivalInfoRow}>
                <View style={styles.arrivalInfoItem}>
                  <Text style={styles.arrivalInfoLabel}>총 택시비</Text>
                  <Text style={styles.arrivalInfoValue}>{taxiFare.toLocaleString()}원</Text>
                </View>
                <View style={styles.arrivalInfoItem}>
                  <Text style={styles.arrivalInfoLabel}>N빵 인원</Text>
                  <Text style={styles.arrivalInfoValue}>{memberCount}명</Text>
                </View>
              </View>

              <View style={styles.arrivalCalculationSection}>
                <Text style={styles.arrivalCalculationText}>
                  {taxiFare.toLocaleString()}원 ÷ {memberCount}명 =
                </Text>
                <Text style={styles.arrivalPerPersonAmount}>{perPerson.toLocaleString()}원</Text>
              </View>

              <Text style={styles.arrivalInstructionText}>
                {perPerson.toLocaleString()}원씩 {item.senderName}님에게 송금해주세요
              </Text>
            </View>

            <View style={styles.arrivalAccountSection}>
              <Text style={styles.arrivalAccountSectionTitle}>송금 계좌 정보</Text>
              <View style={styles.arrivalAccountInfoContainer}>
                <View style={styles.arrivalAccountInfoTextContainer}>
                  <Text style={styles.arrivalAccountAmount}>{perPerson.toLocaleString()}원</Text>
                  <Text style={styles.arrivalAccountInfo}>{bankName} {accountNumber}</Text>
                  {displayName && (
                    <Text style={styles.arrivalAccountHolder}>{displayName}</Text>
                  )}
                </View>
                <TouchableOpacity
                  style={styles.arrivalCopyButton}
                  onPress={() => onCopyAccountInfo(bankName, accountNumber)}
                >
                  <Icon name="copy-outline" size={18} color={COLORS.accent.green} />
                  <Text style={styles.arrivalCopyButtonText}>복사</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <Text style={styles.timestamp}>
            {item.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ||
              new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      );
    };

    const renderMessage = ({ item, index }: { item: Message; index: number }) => {
      const isMyMessage = item.senderId === currentUserId;
      const isSystemMessage = item.type === 'system';
      const isAccountMessage = item.type === 'account';
      const isArrivalMessage = item.type === 'arrived';
      const isEndMessage = item.type === 'end';

      if (isEndMessage) {
        return renderEndMessage(item);
      }

      if (isSystemMessage) {
        return (
          <View style={styles.systemMessageContainer}>
            <Text style={styles.systemMessageText}>{item.text}</Text>
          </View>
        );
      }

      if (isAccountMessage) {
        return renderAccountMessage(item);
      }

      if (isArrivalMessage) {
        return renderArrivalMessage(item);
      }

      // 이전 일반 메시지 찾기
      let prevNormalMessage: Message | null = null;
      for (let i = index - 1; i >= 0; i--) {
        const msg = messages[i];
        if (msg && msg.type !== 'system' && msg.type !== 'account' && msg.type !== 'arrived' && msg.type !== 'end') {
          prevNormalMessage = msg;
          break;
        }
      }

      // 다음 일반 메시지 찾기
      let nextNormalMessage: Message | null = null;
      for (let i = index + 1; i < messages.length; i++) {
        const msg = messages[i];
        if (msg && msg.type !== 'system' && msg.type !== 'account' && msg.type !== 'arrived' && msg.type !== 'end') {
          nextNormalMessage = msg;
          break;
        }
      }

      // 이전 일반 메시지와 현재 메시지 사이에 특수 메시지가 있는지 확인
      const hasSpecialMessageBetween = (() => {
        if (!prevNormalMessage) return false;

        let prevNormalIndex = -1;
        for (let i = index - 1; i >= 0; i--) {
          const msg = messages[i];
          if (msg && msg.id === prevNormalMessage.id) {
            prevNormalIndex = i;
            break;
          }
        }

        if (prevNormalIndex === -1) return false;

        for (let i = prevNormalIndex + 1; i < index; i++) {
          const msg = messages[i];
          if (!msg) continue;

          if (!isSameMinute(msg.createdAt, item.createdAt)) {
            break;
          }

          if (msg.type === 'system' || msg.type === 'account' || msg.type === 'arrived' || msg.type === 'end') {
            return true;
          }
        }
        return false;
      })();

      const isGroupStart = !prevNormalMessage ||
        prevNormalMessage.senderId !== item.senderId ||
        !isSameMinute(prevNormalMessage.createdAt, item.createdAt) ||
        hasSpecialMessageBetween;

      const hasSpecialMessageAfter = (() => {
        if (!nextNormalMessage) return false;

        let nextNormalIndex = -1;
        for (let i = index + 1; i < messages.length; i++) {
          const msg = messages[i];
          if (msg && msg.id === nextNormalMessage.id) {
            nextNormalIndex = i;
            break;
          }
        }

        if (nextNormalIndex === -1) return false;

        for (let i = index + 1; i < nextNormalIndex; i++) {
          const msg = messages[i];
          if (!msg) continue;

          if (!isSameMinute(msg.createdAt, item.createdAt)) {
            break;
          }

          if (msg.type === 'system' || msg.type === 'account' || msg.type === 'arrived' || msg.type === 'end') {
            return true;
          }
        }
        return false;
      })();

      const isGroupEnd = !nextNormalMessage ||
        nextNormalMessage.senderId !== item.senderId ||
        !isSameMinute(nextNormalMessage.createdAt, item.createdAt) ||
        hasSpecialMessageAfter;

      const timeString = item.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ||
        new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
              <View style={[
                styles.messageRow,
                isMyMessage ? styles.myMessageRow : styles.otherMessageRow
              ]}>
                {isMyMessage && isGroupEnd && (
                  <Text style={styles.timestamp}>{timeString}</Text>
                )}
                <View style={[
                  styles.messageBubble,
                  isMyMessage ? styles.myMessage : styles.otherMessage
                ]}>
                  <Text style={[styles.messageText, { color: isMyMessage ? COLORS.text.buttonText : COLORS.text.primary }]}>
                    {item.text}
                  </Text>
                </View>
                {!isMyMessage && isGroupEnd && (
                  <Text style={styles.timestamp}>{timeString}</Text>
                )}
              </View>
            </View>
          </View>
        </View>
      );
    };

    return (
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id || ''}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={onContentSizeChange}
      />
    );
  }
);

const styles = StyleSheet.create({
  messageList: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageWrapper: {
    marginTop: 12,
    width: '100%',
  },
  messageWrapperInGroup: {
    marginTop: 4,
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
  avatarText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.buttonText,
    fontWeight: '700',
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
  },
  senderName: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: '80%',
  },
  myMessage: {
    backgroundColor: COLORS.accent.green,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    backgroundColor: COLORS.background.card,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...TYPOGRAPHY.body2,
  },
  timestamp: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontSize: 10,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemMessageText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    backgroundColor: COLORS.background.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  messageContainer: {
    borderRadius: 16,
    padding: 14,
    marginVertical: 4,
  },
  accountMessageContainer: {
    gap: 8,
  },
  accountMessageTitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  accountInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.surface,
    padding: 12,
    borderRadius: 8,
  },
  accountInfoTextContainer: {
    flex: 1,
  },
  accountInfo: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  accountHolder: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  copyButton: {
    padding: 8,
  },
  endMessageContainer: {
    alignItems: 'center',
    marginVertical: 16,
    padding: 16,
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.accent.green,
  },
  endMessageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  endMessageText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  leaveRoomButton: {
    marginTop: 12,
    backgroundColor: COLORS.accent.green,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 20,
  },
  leaveRoomButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.buttonText,
    fontWeight: '600',
  },
  arrivalMessageContainer: {
    gap: 12,
  },
  arrivalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  arrivalMessageTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  arrivalInfoSection: {
    backgroundColor: COLORS.background.surface,
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  arrivalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  arrivalInfoItem: {
    alignItems: 'center',
  },
  arrivalInfoLabel: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  arrivalInfoValue: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  arrivalCalculationSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  arrivalCalculationText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  arrivalPerPersonAmount: {
    ...TYPOGRAPHY.title3,
    color: COLORS.accent.green,
    fontWeight: '700',
  },
  arrivalInstructionText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  arrivalAccountSection: {
    backgroundColor: COLORS.background.surface,
    padding: 12,
    borderRadius: 8,
  },
  arrivalAccountSectionTitle: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  arrivalAccountInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arrivalAccountInfoTextContainer: {
    flex: 1,
  },
  arrivalAccountAmount: {
    ...TYPOGRAPHY.body1,
    color: COLORS.accent.green,
    fontWeight: '700',
  },
  arrivalAccountInfo: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  arrivalAccountHolder: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  arrivalCopyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
  },
  arrivalCopyButtonText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.accent.green,
    fontWeight: '600',
  },
});
