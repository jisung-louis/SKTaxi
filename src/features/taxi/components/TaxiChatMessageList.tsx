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
import LinearGradient from 'react-native-linear-gradient';

import {
  COLORS,
  RADIUS,
  TYPOGRAPHY,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';
import Button from '@/shared/ui/Button';

import type {
  TaxiChatTextMessageViewData,
  TaxiChatThreadItemViewData,
} from '../model/taxiChatViewData';

interface TaxiChatMessageListProps {
  contentContainerStyle?: StyleProp<ViewStyle>;
  headerContent?: React.ReactNode;
  items: TaxiChatThreadItemViewData[];
  onPressEndPartyExit?: () => void;
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

const formatMaskedAccountHolder = (accountHolder: string, hideName: boolean) => {
  if (!hideName) {
    return accountHolder;
  }

  if (accountHolder.length <= 1) {
    return accountHolder;
  }

  return `${accountHolder.slice(0, 1)}${'*'.repeat(accountHolder.length - 1)}`;
};

export const TaxiChatMessageList = ({
  contentContainerStyle,
  headerContent,
  items,
  onPressEndPartyExit,
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
                <View style={styles.endCardContent}>
                  <Icon
                    color={COLORS.status.success}
                    name="checkmark-circle-outline"
                    size={18}
                  />
                  <Text style={styles.endCardLabel}>{item.text}</Text>
                </View>

                {onPressEndPartyExit ? (
                  <Button
                    onPress={onPressEndPartyExit}
                    size="small"
                    style={styles.endLeaveButton}
                    textStyle={styles.endLeaveButtonText}
                    title="파티 나가기"
                    variant="secondary"
                  />
                ) : null}
              </View>
            </View>
          );
        }

        if (item.type === 'account-message') {
          const accountHolderLabel = formatMaskedAccountHolder(
            item.accountData.accountHolder,
            item.accountData.hideName,
          );
          const isOutgoing = item.direction === 'outgoing';
          const accountIconColor = isOutgoing
            ? 'rgba(255,255,255,0.9)'
            : COLORS.accent.blue;

          return (
            <View key={item.id} style={styles.messageWrap}>
              {isOutgoing ? (
                <View style={styles.accountMessageRow}>
                  <View style={styles.accountTimeWrap}>
                    <Text style={styles.accountTimeLabel}>{item.timeLabel}</Text>
                  </View>

                  <View
                    style={[styles.accountBubble, styles.accountBubbleOutgoing]}>
                    <View style={styles.accountBubbleBody}>
                      <View style={styles.accountBubbleTitleRow}>
                        <Icon
                          color={accountIconColor}
                          name="wallet"
                          size={14}
                          style={styles.accountBubbleTitleIcon}
                        />
                        <Text
                          style={[
                            styles.accountBubbleTitle,
                            styles.accountBubbleTitleOutgoing,
                          ]}>
                          계좌 정보
                        </Text>
                      </View>

                      <Text
                        numberOfLines={1}
                        style={[
                          styles.accountBubbleHolder,
                          styles.accountBubbleHolderOutgoing,
                        ]}>
                        {accountHolderLabel}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.accountBubbleBank,
                          styles.accountBubbleBankOutgoing,
                        ]}>
                        {item.accountData.bankName}
                      </Text>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.accountBubbleNumber,
                          styles.accountBubbleNumberOutgoing,
                        ]}>
                        {item.accountData.accountNumber}
                      </Text>
                    </View>

                    <TouchableOpacity
                      accessibilityRole="button"
                      activeOpacity={0.84}
                      onPress={() => {
                        copyToClipboard(
                          item.accountData.accountNumber,
                          '계좌번호가 복사되었습니다.',
                        );
                      }}
                      style={[
                        styles.accountBubbleCopyButton,
                        styles.accountBubbleCopyButtonOutgoing,
                      ]}>
                      <Text
                        style={[
                          styles.accountBubbleCopyLabel,
                          styles.accountBubbleCopyLabelOutgoing,
                        ]}>
                        계좌번호 복사
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.incomingRow}>
                  <View style={styles.avatarWrap}>
                    {renderAvatar(item.avatar)}
                  </View>

                  <View style={styles.incomingContent}>
                    <Text style={styles.senderName}>{item.senderName}</Text>

                    <View style={styles.accountIncomingBubbleRow}>
                      <View
                        style={[styles.accountBubble, styles.accountBubbleIncoming]}>
                        <View style={styles.accountBubbleBody}>
                          <View style={styles.accountBubbleTitleRow}>
                            <Icon
                              color={accountIconColor}
                              name="wallet"
                              size={14}
                              style={styles.accountBubbleTitleIcon}
                            />
                            <Text
                              style={[
                                styles.accountBubbleTitle,
                                styles.accountBubbleTitleIncoming,
                              ]}>
                              계좌 정보
                            </Text>
                          </View>

                          <Text
                            numberOfLines={1}
                            style={[
                              styles.accountBubbleHolder,
                              styles.accountBubbleHolderIncoming,
                            ]}>
                            {accountHolderLabel}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.accountBubbleBank,
                              styles.accountBubbleBankIncoming,
                            ]}>
                            {item.accountData.bankName}
                          </Text>
                          <Text
                            numberOfLines={1}
                            style={[
                              styles.accountBubbleNumber,
                              styles.accountBubbleNumberIncoming,
                            ]}>
                            {item.accountData.accountNumber}
                          </Text>
                        </View>

                        <TouchableOpacity
                          accessibilityRole="button"
                          activeOpacity={0.84}
                          onPress={() => {
                            copyToClipboard(
                              item.accountData.accountNumber,
                              '계좌번호가 복사되었습니다.',
                            );
                          }}
                          style={[
                            styles.accountBubbleCopyButton,
                            styles.accountBubbleCopyButtonIncoming,
                          ]}>
                          <Text
                            style={[
                              styles.accountBubbleCopyLabel,
                              styles.accountBubbleCopyLabelIncoming,
                            ]}>
                            계좌번호 복사
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.accountTimeLabel}>{item.timeLabel}</Text>
                    </View>
                  </View>
                </View>
              )}
            </View>
          );
        }

        if (item.type === 'arrived-message') {
          const arrivedAccountHolder = item.accountData
            ? formatMaskedAccountHolder(
                item.accountData.accountHolder,
                item.accountData.hideName,
              )
            : undefined;

          return (
            <View key={item.id} style={styles.specialWrap}>
              <View style={styles.arrivedCardStack}>
                <LinearGradient
                  colors={['#2BCB7E', '#17B96E']}
                  end={{x: 1, y: 1}}
                  start={{x: 0, y: 0}}
                  style={styles.arrivedHeaderCard}>
                  <View style={styles.arrivedHeaderRow}>
                    <View style={styles.arrivedIconWrap}>
                      <Icon
                        color={COLORS.text.inverse}
                        name="location"
                        size={20}
                      />
                    </View>
                    <View style={styles.arrivedHeaderCopy}>
                      <Text style={styles.arrivedHeaderTitle}>
                        택시가 목적지에 도착했어요!
                      </Text>
                      <Text style={styles.arrivedHeaderTime}>{item.timeLabel}</Text>
                    </View>
                  </View>
                </LinearGradient>

                <View style={styles.arrivedBodyCard}>
                  <View style={styles.arrivedBody}>
                    <View style={styles.arrivedInfoRow}>
                      <Text style={styles.arrivedInfoLabel}>총 택시비</Text>
                      <Text style={styles.arrivedInfoValue}>
                        {item.taxiFare
                          ? `${item.taxiFare.toLocaleString('ko-KR')}원`
                          : '미정'}
                      </Text>
                    </View>

                    <View
                      style={[styles.arrivedInfoRow, styles.arrivedInfoRowSpaced]}>
                      <Text style={styles.arrivedInfoLabel}>N빵 인원</Text>
                      <Text numberOfLines={1} style={styles.arrivedSplitMemberLabel}>
                        {item.splitMemberSummaryLabel ??
                          (item.splitMemberCount
                            ? `${item.splitMemberCount}명`
                            : '미정')}
                      </Text>
                    </View>

                    <View
                      style={[styles.arrivedInfoRow, styles.arrivedInfoRowSpaced]}>
                      <Text style={styles.arrivedAmountLabel}>1인당 금액</Text>
                      <Text style={styles.arrivedAmountValue}>
                        {item.perPersonAmount
                          ? `${item.perPersonAmount.toLocaleString('ko-KR')}원`
                          : '미정'}
                      </Text>
                    </View>

                    <View style={styles.arrivedDivider} />

                    {item.accountLabel ? (
                      <View style={styles.arrivedAccountCard}>
                        <Text style={styles.arrivedAccountCardLabel}>송금 계좌</Text>
                        {arrivedAccountHolder ? (
                          <Text style={styles.arrivedAccountCardHolder}>
                            {arrivedAccountHolder}
                          </Text>
                        ) : null}
                        <Text style={styles.arrivedAccountCardValue}>
                          {item.accountLabel.replace(' ', ' · ')}
                        </Text>
                      </View>
                    ) : null}
                  </View>

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
                      style={styles.arrivedCopyButton}>
                      <Icon
                        color={COLORS.status.success}
                        name="copy-outline"
                        size={14}
                      />
                      <Text style={styles.arrivedCopyLabel}>계좌번호 복사</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
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
                !isGroupEnd ? styles.messageWrapCompact : null,
                { marginTop: isGroupStart ? SPACING.sm : 0 },
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
              !isGroupEnd ? styles.messageWrapCompact : null,
              { marginTop: isGroupStart ? SPACING.sm : 0 },
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
  accountBubble: {
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.card,
  },
  accountBubbleBank: {
    fontSize: 12,
    lineHeight: 16,
  },
  accountBubbleBody: {
    paddingBottom: 4,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  accountBubbleCopyButton: {
    alignItems: 'center',
    height: 33,
    justifyContent: 'center',
    paddingBottom: 8,
    paddingTop: 9,
  },
  accountBubbleCopyLabel: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  accountBubbleHolder: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginTop: 4,
  },
  accountBubbleHolderIncoming: {
    color: COLORS.text.primary,
  },
  accountBubbleHolderOutgoing: {
    color: COLORS.text.inverse,
  },
  accountBubbleIncoming: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderTopLeftRadius: 2,
    borderTopRightRadius: RADIUS.lg,
    borderWidth: 1,
    maxWidth: 156,
    minWidth: 156,
  },
  accountBubbleBankIncoming: {
    color: COLORS.text.muted,
  },
  accountBubbleBankOutgoing: {
    color: 'rgba(255,255,255,0.8)',
  },
  accountBubbleNumber: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  accountBubbleNumberIncoming: {
    color: COLORS.text.strong,
  },
  accountBubbleNumberOutgoing: {
    color: COLORS.text.inverse,
  },
  accountBubbleCopyButtonIncoming: {
    borderTopColor: COLORS.border.subtle,
    borderTopWidth: 1,
  },
  accountBubbleCopyButtonOutgoing: {
    borderTopColor: 'rgba(255,255,255,0.2)',
    borderTopWidth: 1,
  },
  accountBubbleCopyLabelIncoming: {
    color: COLORS.accent.blue,
  },
  accountBubbleCopyLabelOutgoing: {
    color: 'rgba(255,255,255,0.8)',
  },
  accountBubbleTitle: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  accountBubbleTitleIncoming: {
    color: COLORS.text.secondary,
  },
  accountBubbleTitleOutgoing: {
    color: 'rgba(255,255,255,0.9)',
  },
  accountBubbleTitleIcon: {
    height: 14,
    width: 15,
  },
  accountBubbleTitleRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  accountMessageRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'flex-end',
  },
  accountBubbleOutgoing: {
    backgroundColor: COLORS.brand.primary,
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: 2,
    minWidth: 104,
  },
  accountIncomingBubbleRow: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 6,
  },
  accountTimeLabel: {
    color: COLORS.text.muted,
    fontSize: 10,
    lineHeight: 14,
  },
  accountTimeWrap: {
    paddingBottom: 2,
  },
  arrivedAccountCard: {
    backgroundColor: COLORS.background.subtle,
    borderRadius: 12,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  arrivedAccountCardHolder: {
    color: COLORS.text.primary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  arrivedAccountCardLabel: {
    color: COLORS.text.placeholder,
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 15,
    marginBottom: 4,
  },
  arrivedAccountCardValue: {
    color: COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 1,
  },
  arrivedBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  arrivedBodyCard: {
    backgroundColor: COLORS.background.surface,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: RADIUS.lg,
    borderBottomRightRadius: RADIUS.lg,
    borderTopWidth: 0,
    overflow: 'hidden',
    width: '100%',
  },
  arrivedCopyButton: {
    alignItems: 'center',
    borderTopColor: COLORS.border.subtle,
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 6,
    height: 41,
    justifyContent: 'center',
  },
  arrivedCopyLabel: {
    color: COLORS.status.success,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  arrivedDivider: {
    backgroundColor: COLORS.border.subtle,
    height: 1,
    marginTop: 8,
  },
  arrivedHeaderCard: {
    alignSelf: 'stretch',
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    width: '100%',
  },
  arrivedHeaderCopy: {
    gap: 2,
  },
  arrivedHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  arrivedHeaderTime: {
    color: 'rgba(255,255,255,0.7)',
    ...TYPOGRAPHY.caption2,
  },
  arrivedHeaderTitle: {
    color: COLORS.text.inverse,
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
  },
  arrivedCardStack: {
    alignSelf: 'stretch',
    backgroundColor: COLORS.background.surface,
    borderRadius: RADIUS.lg,
    width: '100%',
    ...SHADOWS.card,
  },
  arrivedIconWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: RADIUS.pill,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  arrivedAmountLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  arrivedAmountValue: {
    color: COLORS.status.success,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  arrivedInfoLabel: {
    color: COLORS.text.secondary,
    fontSize: 12,
    lineHeight: 16,
  },
  arrivedInfoRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  arrivedInfoRowSpaced: {
    marginTop: 8,
  },
  arrivedInfoValue: {
    color: COLORS.text.primary,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  arrivedSplitMemberLabel: {
    color: COLORS.text.secondary,
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    marginLeft: SPACING.md,
    textAlign: 'right',
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
    marginVertical: SPACING.md,
  },
  endCard: {
    backgroundColor: COLORS.brand.primaryTint,
    borderColor: COLORS.border.accent,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    width: '100%',
  },
  endCardContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.sm,
    justifyContent: 'center',
  },
  endCardLabel: {
    color: COLORS.status.success,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  endLeaveButton: {
    alignSelf: 'stretch',
    borderColor: COLORS.status.danger,
    marginTop: SPACING.md,
  },
  endLeaveButtonText: {
    color: COLORS.status.danger,
    fontWeight: '700',
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
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
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
    alignSelf: 'stretch',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  systemMessageLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    backgroundColor: COLORS.background.grayLight,
    paddingHorizontal: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  systemMessageWrap: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    marginTop: SPACING.sm,
  },
  timeLabel: {
    color: COLORS.text.muted,
    fontSize: 10,
    lineHeight: 14,
  },
});
