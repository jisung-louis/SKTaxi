import React from 'react';
import {
  Alert,
  Clipboard,
  Image,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

import type {
  TaxiChatTextMessageViewData,
  TaxiChatThreadItemViewData,
} from '../model/taxiChatViewData';

interface TaxiChatMessageListProps {
  contentContainerStyle?: StyleProp<ViewStyle>;
  headerContent?: React.ReactNode;
  items: TaxiChatThreadItemViewData[];
}

const renderAvatar = (avatar?: TaxiChatTextMessageViewData['avatar']) => {
  if (!avatar) {
    return <View style={styles.avatarSpacer} />;
  }

  if (avatar.kind === 'image') {
    return <Image source={{uri: avatar.uri}} style={styles.avatarImage} />;
  }

  return (
    <View style={[styles.avatarCircle, {backgroundColor: avatar.backgroundColor}]}>
      {avatar.kind === 'label' ? (
        <Text style={[styles.avatarLabel, {color: avatar.textColor}]}>
          {avatar.label}
        </Text>
      ) : (
        <Icon color={avatar.iconColor} name={avatar.iconName} size={16} />
      )}
    </View>
  );
};

const getPreviousMessage = (
  items: TaxiChatThreadItemViewData[],
  index: number,
) => {
  for (let itemIndex = index - 1; itemIndex >= 0; itemIndex -= 1) {
    const item = items[itemIndex];

    if (!item || item.type !== 'text-message') {
      return null;
    }

    return item;
  }

  return null;
};

const getNextMessage = (
  items: TaxiChatThreadItemViewData[],
  index: number,
) => {
  for (let itemIndex = index + 1; itemIndex < items.length; itemIndex += 1) {
    const item = items[itemIndex];

    if (!item || item.type !== 'text-message') {
      return null;
    }

    return item;
  }

  return null;
};

const isSameGroup = (
  currentMessage: TaxiChatTextMessageViewData,
  adjacentMessage: TaxiChatTextMessageViewData | null,
) =>
  Boolean(
    adjacentMessage &&
      adjacentMessage.direction === currentMessage.direction &&
      adjacentMessage.senderId === currentMessage.senderId &&
      adjacentMessage.minuteKey === currentMessage.minuteKey,
  );

const copyToClipboard = (value: string, message: string) => {
  Clipboard.setString(value);
  Alert.alert('복사 완료', message);
};

export const TaxiChatMessageList = ({
  contentContainerStyle,
  headerContent,
  items,
}: TaxiChatMessageListProps) => {
  const scrollViewRef = React.useRef<ScrollView>(null);

  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({animated: true});
    }, 40);

    return () => clearTimeout(timeoutId);
  }, [items.length]);

  return (
    <ScrollView
      contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}>
      {headerContent}

      {items.map((item, index) => {
        if (item.type === 'date-divider') {
          return (
            <View key={item.id} style={styles.dateDividerRow}>
              <View style={styles.dateDividerLine} />
              <Text style={styles.dateDividerLabel}>{item.label}</Text>
              <View style={styles.dateDividerLine} />
            </View>
          );
        }

        if (item.type === 'system-message') {
          return (
            <View key={item.id} style={styles.systemMessageWrap}>
              <Text style={styles.systemMessageLabel}>{item.text}</Text>
            </View>
          );
        }

        if (item.type === 'end-message') {
          return (
            <View key={item.id} style={styles.specialWrap}>
              <View style={styles.endCard}>
                <Icon
                  color={COLORS.status.success}
                  name="checkmark-circle-outline"
                  size={18}
                />
                <Text style={styles.endCardLabel}>{item.text}</Text>
              </View>
            </View>
          );
        }

        if (item.type === 'account-message') {
          return (
            <View key={item.id} style={styles.specialWrap}>
              <View style={styles.accountCard}>
                <View style={styles.specialHeaderRow}>
                  <View style={styles.specialHeaderTitleWrap}>
                    <View style={styles.accountIconWrap}>
                      <Icon color={COLORS.accent.blue} name="card-outline" size={16} />
                    </View>
                    <Text style={styles.specialTitle}>계좌 전송</Text>
                  </View>
                  <Text style={styles.specialTimeLabel}>{item.timeLabel}</Text>
                </View>

                <Text style={styles.specialSenderLabel}>{item.senderName}</Text>
                <Text style={styles.accountBankLabel}>
                  {item.accountData.bankName}
                </Text>
                <Text style={styles.accountNumberLabel}>
                  {item.accountData.accountNumber}
                </Text>
                <Text style={styles.accountHolderLabel}>
                  {item.accountData.accountHolder}
                </Text>

                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.84}
                  onPress={() => {
                    copyToClipboard(
                      `${item.accountData.bankName} ${item.accountData.accountNumber}`,
                      '계좌 정보가 복사되었습니다.',
                    );
                  }}
                  style={styles.accountCopyButton}>
                  <Icon color={COLORS.accent.blue} name="copy-outline" size={14} />
                  <Text style={styles.accountCopyLabel}>계좌 복사</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }

        if (item.type === 'arrived-message') {
          return (
            <View key={item.id} style={styles.specialWrap}>
              <View style={styles.arrivedCard}>
                <View style={styles.specialHeaderRow}>
                  <View style={styles.specialHeaderTitleWrap}>
                    <View style={styles.arrivedIconWrap}>
                      <Icon
                        color={COLORS.status.success}
                        name="location-outline"
                        size={16}
                      />
                    </View>
                    <Text style={styles.specialTitle}>{'택시 도착 & 정산'}</Text>
                  </View>
                  <Text style={[styles.specialTimeLabel, styles.arrivedTimeLabel]}>
                    {item.timeLabel}
                  </Text>
                </View>

                <View style={styles.arrivedMetricRow}>
                  <View style={styles.arrivedMetricCard}>
                    <Text style={styles.arrivedMetricLabel}>총 택시비</Text>
                    <Text style={styles.arrivedMetricValue}>
                      {item.taxiFare
                        ? `${item.taxiFare.toLocaleString('ko-KR')}원`
                        : '미정'}
                    </Text>
                  </View>

                  <View style={styles.arrivedMetricCard}>
                    <Text style={styles.arrivedMetricLabel}>1인당 금액</Text>
                    <Text style={styles.arrivedMetricValue}>
                      {item.perPerson
                        ? `${item.perPerson.toLocaleString('ko-KR')}원`
                        : '미정'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.arrivedDescription}>
                  {item.memberCount
                    ? `${item.memberCount}명이 정산 대상입니다.`
                    : '정산 대상 인원을 확인해주세요.'}
                </Text>

                {item.accountLabel ? (
                  <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={0.84}
                    onPress={() => {
                      copyToClipboard(
                        item.accountLabel!,
                        '정산 계좌가 복사되었습니다.',
                      );
                    }}
                    style={styles.arrivedAccountRow}>
                    <View style={styles.arrivedAccountTextWrap}>
                      <Text style={styles.arrivedAccountLabel}>정산 계좌</Text>
                      <Text style={styles.arrivedAccountValue}>
                        {item.accountLabel}
                      </Text>
                    </View>
                    <Icon color={COLORS.status.success} name="copy-outline" size={16} />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          );
        }

        const previousMessage = getPreviousMessage(items, index);
        const nextMessage = getNextMessage(items, index);
        const isGroupStart = !isSameGroup(item, previousMessage);
        const isGroupEnd = !isSameGroup(item, nextMessage);
        const wrapperStyle =
          item.direction === 'outgoing'
            ? styles.outgoingMessageWrap
            : styles.incomingMessageWrap;

        if (item.direction === 'outgoing') {
          return (
            <View
              key={item.id}
              style={[
                styles.messageWrap,
                wrapperStyle,
                !isGroupStart ? styles.messageWrapCompact : null,
              ]}>
              <View style={styles.outgoingRow}>
                {isGroupEnd ? (
                  <Text style={[styles.timeLabel, styles.outgoingTimeLabel]}>
                    {item.timeLabel}
                  </Text>
                ) : null}
                <View style={[styles.bubble, styles.outgoingBubble]}>
                  <Text style={[styles.messageText, styles.outgoingMessageText]}>
                    {item.text}
                  </Text>
                </View>
              </View>
            </View>
          );
        }

        return (
          <View
            key={item.id}
            style={[
              styles.messageWrap,
              wrapperStyle,
              !isGroupStart ? styles.messageWrapCompact : null,
            ]}>
            <View style={styles.incomingRow}>
              <View style={styles.avatarWrap}>
                {isGroupStart ? renderAvatar(item.avatar) : <View style={styles.avatarSpacer} />}
              </View>

              <View style={styles.incomingContent}>
                {isGroupStart ? (
                  <Text style={styles.senderName}>{item.senderName}</Text>
                ) : null}
                <View style={styles.incomingBubbleRow}>
                  <View style={[styles.bubble, styles.incomingBubble]}>
                    <Text style={styles.messageText}>{item.text}</Text>
                  </View>
                  {isGroupEnd ? (
                    <Text style={styles.timeLabel}>{item.timeLabel}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  accountBankLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginTop: SPACING.sm,
  },
  accountCard: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    width: '100%',
    ...SHADOWS.card,
  },
  accountCopyButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.accent.blueSoft,
    borderRadius: RADIUS.pill,
    flexDirection: 'row',
    gap: 6,
    marginTop: SPACING.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  accountCopyLabel: {
    color: COLORS.accent.blue,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  accountHolderLabel: {
    color: COLORS.text.strong,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  accountIconWrap: {
    alignItems: 'center',
    backgroundColor: COLORS.accent.blueSoft,
    borderRadius: RADIUS.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  accountNumberLabel: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
    marginTop: 2,
  },
  arrivedAccountLabel: {
    color: COLORS.status.success,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  arrivedAccountRow: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.24)',
    borderRadius: RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
  },
  arrivedAccountTextWrap: {
    flex: 1,
    gap: 2,
  },
  arrivedAccountValue: {
    color: COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  arrivedCard: {
    backgroundColor: COLORS.brand.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    width: '100%',
  },
  arrivedDescription: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    lineHeight: 16,
    marginTop: SPACING.sm,
  },
  arrivedIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: RADIUS.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  arrivedMetricCard: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: RADIUS.md,
    flex: 1,
    gap: 4,
    padding: SPACING.md,
  },
  arrivedMetricLabel: {
    color: 'rgba(255,255,255,0.76)',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  arrivedMetricRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  arrivedMetricValue: {
    color: COLORS.text.inverse,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  arrivedTimeLabel: {
    color: 'rgba(255,255,255,0.76)',
  },
  avatarCircle: {
    alignItems: 'center',
    borderRadius: RADIUS.pill,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  avatarImage: {
    borderRadius: RADIUS.pill,
    height: 36,
    width: 36,
  },
  avatarLabel: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  avatarSpacer: {
    height: 36,
    width: 36,
  },
  avatarWrap: {
    width: 36,
  },
  bubble: {
    borderRadius: 16,
    maxWidth: '82%',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  contentContainer: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  dateDividerLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    paddingHorizontal: SPACING.md,
  },
  dateDividerLine: {
    backgroundColor: COLORS.border.default,
    flex: 1,
    height: 1,
  },
  dateDividerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  endCard: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primaryTint,
    borderColor: COLORS.border.accent,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    width: '100%',
  },
  endCardLabel: {
    color: COLORS.status.success,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  incomingBubble: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    ...SHADOWS.card,
  },
  incomingBubbleRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 6,
  },
  incomingContent: {
    flex: 1,
  },
  incomingMessageWrap: {
    alignItems: 'flex-start',
  },
  incomingRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  messageText: {
    color: COLORS.text.primary,
    fontSize: 14,
    lineHeight: 22,
  },
  messageWrap: {
    marginBottom: SPACING.md,
  },
  messageWrapCompact: {
    marginBottom: SPACING.xs,
  },
  outgoingBubble: {
    backgroundColor: COLORS.brand.primary,
    borderTopRightRadius: 4,
  },
  outgoingMessageText: {
    color: COLORS.text.inverse,
  },
  outgoingMessageWrap: {
    alignItems: 'flex-end',
  },
  outgoingRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-end',
  },
  outgoingTimeLabel: {
    textAlign: 'right',
  },
  senderName: {
    color: COLORS.text.strong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    marginBottom: SPACING.xs,
  },
  specialHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specialHeaderTitleWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  specialSenderLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  specialTimeLabel: {
    color: COLORS.text.muted,
    fontSize: 11,
    lineHeight: 16,
  },
  specialTitle: {
    color: COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
  },
  specialWrap: {
    marginBottom: SPACING.md,
  },
  systemMessageLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  systemMessageWrap: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  timeLabel: {
    color: COLORS.text.muted,
    fontSize: 10,
    lineHeight: 14,
  },
});
