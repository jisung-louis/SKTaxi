import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated from 'react-native-reanimated';

import type {CommunityStackParamList} from '@/app/navigation/types';
import {
  DetailComposer,
  DetailNotFoundState,
  StateCard,
} from '@/shared/design-system/components';
import {COLORS, SPACING} from '@/shared/design-system/tokens';
import {useScreenEnterAnimation, useScreenView} from '@/shared/hooks';
import {pickImageAsset} from '@/shared/lib/media/pickImageAsset';
import Button from '@/shared/ui/Button';
import {
  ChatHeader,
  ChatMessageList,
  ChatPopupMenu,
} from '@/shared/ui/chat';

import {useChatDetailData} from '../hooks/useChatDetailData';
import type {ChatStackParamList} from '../model/navigation';

type ChatDetailNavigationProp = NativeStackNavigationProp<
  CommunityStackParamList,
  'ChatDetail'
>

export const ChatDetailScreen = () => {
  useScreenView();

  const navigation = useNavigation<ChatDetailNavigationProp>();
  const route =
    useRoute<
      NativeStackScreenProps<ChatStackParamList, 'ChatDetail'>['route']
    >();
  const insets = useSafeAreaInsets();
  const screenAnimatedStyle = useScreenEnterAnimation();
  const {
    data,
    error,
    joinRoom,
    leaveRoom,
    loading,
    membershipLoading,
    notFound,
    reload,
    sendMessage,
    sendImageMessage,
    toggleNotification,
  } = useChatDetailData(route.params?.chatRoomId);
  const [composerValue, setComposerValue] = React.useState('');
  const [imageSending, setImageSending] = React.useState(false);
  const [menuVisible, setMenuVisible] = React.useState(false);

  const navigateToCommunityChat = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('BoardMain', {
      initialSegment: 'chat',
    });
  }, [navigation]);

  const handlePressBack = navigateToCommunityChat;

  const handleSend = React.useCallback(
    async (messageText: string) => {
      try {
        await sendMessage(messageText);
        setComposerValue('');
      } catch (sendError) {
        Alert.alert(
          '메시지 전송 실패',
          sendError instanceof Error
            ? sendError.message
            : '메시지를 전송하지 못했습니다.',
        );
      }
    },
    [sendMessage],
  );

  const handleJoin = React.useCallback(async () => {
    try {
      await joinRoom();
    } catch (joinError) {
      Alert.alert(
        '참여하기 실패',
        joinError instanceof Error
          ? joinError.message
          : '채팅방에 참여하지 못했습니다.',
      );
    }
  }, [joinRoom]);

  const handlePickImage = React.useCallback(async () => {
    if (imageSending) {
      return;
    }

    const image = await pickImageAsset();

    if (!image) {
      return;
    }

    try {
      setImageSending(true);
      await sendImageMessage({
        fileName: image.fileName,
        mimeType: image.mimeType,
        uri: image.uri,
      });
    } catch (sendError) {
      Alert.alert(
        '이미지 전송 실패',
        sendError instanceof Error
          ? sendError.message
          : '이미지를 전송하지 못했습니다.',
      );
    } finally {
      setImageSending(false);
    }
  }, [imageSending, sendImageMessage]);

  const handleLeave = React.useCallback(() => {
    Alert.alert('채팅방 나가기', '채팅방에서 나갈까요?', [
      {text: '취소', style: 'cancel'},
      {
        text: '나가기',
        style: 'destructive',
        onPress: () => {
          leaveRoom()
            .then(() => {
              setComposerValue('');
              setMenuVisible(false);
              navigateToCommunityChat();
            })
            .catch(leaveError => {
              Alert.alert(
                '채팅방 나가기 실패',
                leaveError instanceof Error
                  ? leaveError.message
                  : '채팅방에서 나가지 못했습니다.',
              );
            });
        },
      },
    ]);
  }, [leaveRoom, navigateToCommunityChat]);

  const handleReport = React.useCallback(() => {
    Alert.alert('신고하기', '신고 기능은 다음 단계에서 연결할 예정입니다.');
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Animated.View style={[styles.screen, screenAnimatedStyle]}>
        {data ? (
          <ChatHeader
            header={data.header}
            onPressBack={handlePressBack}
            onPressMenu={
              data.mode === 'preview'
                ? undefined
                : () => setMenuVisible(previousValue => !previousValue)
            }
          />
        ) : (
          <View style={[styles.headerPlaceholder, {paddingTop: insets.top}]} />
        )}

        {loading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator color={COLORS.brand.primary} size="large" />
          </View>
        ) : notFound ? (
          <View style={styles.centeredState}>
            <DetailNotFoundState
              actionLabel="목록으로 돌아가기"
              onPressAction={handlePressBack}
              title="채팅방을 찾을 수 없어요"
            />
          </View>
        ) : error ? (
          <View style={styles.centeredState}>
            <StateCard
              actionLabel="다시 시도"
              description={error}
              icon={
                <Icon
                  color={COLORS.accent.orange}
                  name="alert-circle-outline"
                  size={28}
                />
              }
              onPressAction={() => {
                reload().catch(() => undefined);
              }}
              title="채팅 상세를 불러오지 못했습니다"
            />
          </View>
        ) : data ? (
          data.mode === 'preview' && data.preview ? (
            <View style={styles.previewWrap}>
              <View style={styles.previewCard}>
                <View style={styles.previewStatusPill}>
                  <Text style={styles.previewStatusLabel}>
                    {data.preview.statusLabel}
                  </Text>
                </View>

                <Text style={styles.previewDescription}>
                  {data.header.title}
                </Text>
                <Text style={styles.previewHelperText}>
                  {data.preview.description}
                </Text>

                <View style={styles.previewInfoRow}>
                  <View style={styles.previewInfoItem}>
                    <Icon
                      color={COLORS.text.muted}
                      name="people-outline"
                      size={16}
                    />
                    <Text style={styles.previewInfoText}>
                      {data.preview.memberCountLabel}
                    </Text>
                  </View>

                  <View style={styles.previewInfoItem}>
                    <Icon
                      color={COLORS.text.muted}
                      name="time-outline"
                      size={16}
                    />
                    <Text style={styles.previewInfoText}>
                      {data.preview.timeLabel}
                    </Text>
                  </View>
                </View>

                <View style={styles.previewMessageCard}>
                  <Text style={styles.previewMessageCaption}>최근 메시지</Text>
                  <Text style={styles.previewMessageText}>
                    {data.preview.lastMessageText}
                  </Text>
                </View>

                <Button
                  loading={membershipLoading}
                  onPress={handleJoin}
                  style={styles.previewJoinButton}
                  title={data.preview.joinLabel}
                />
              </View>
            </View>
          ) : (
            <>
              <View style={styles.threadWrap}>
                <ChatMessageList
                  contentContainerStyle={styles.threadContent}
                  items={data.items}
                />
              </View>

              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}>
                <DetailComposer
                  leadingActionAccessibilityLabel="이미지 보내기"
                  leadingIconName="image-outline"
                  onChangeText={setComposerValue}
                  onPressLeadingAction={() => {
                    handlePickImage().catch(() => undefined);
                  }}
                  onSend={handleSend}
                  placeholder={data.composerPlaceholder}
                  sendAccessibilityLabel="메시지 전송"
                  value={composerValue}
                />
              </KeyboardAvoidingView>
            </>
          )
        ) : null}

        {data ? (
          <ChatPopupMenu
            canReport={data.menu.canReport}
            canToggleNotification={data.menu.canToggleNotification}
            leaveLabel={data.menu.leaveLabel}
            notificationEnabled={data.menu.notificationEnabled}
            onClose={() => setMenuVisible(false)}
            onLeave={data.menu.canLeave ? handleLeave : undefined}
            onReport={handleReport}
            onToggleNotification={() => {
              toggleNotification().catch(() => undefined);
            }}
            visible={menuVisible}
          />
        ) : null}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centeredState: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  container: {
    backgroundColor: COLORS.background.page,
    flex: 1,
  },
  headerPlaceholder: {
    borderBottomColor: COLORS.border.subtle,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  previewCard: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.subtle,
    borderRadius: 24,
    borderWidth: 1,
    padding: SPACING.xl,
  },
  previewDescription: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: SPACING.sm,
  },
  previewHelperText: {
    color: COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: SPACING.lg,
  },
  previewInfoItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACING.xs,
  },
  previewInfoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  previewInfoText: {
    color: COLORS.text.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  previewJoinButton: {
    marginTop: SPACING.md,
  },
  previewMessageCaption: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    lineHeight: 16,
    marginBottom: SPACING.xs,
  },
  previewMessageCard: {
    backgroundColor: COLORS.background.subtle,
    borderRadius: 18,
    padding: SPACING.lg,
  },
  previewMessageText: {
    color: COLORS.text.strong,
    fontSize: 15,
    lineHeight: 22,
  },
  previewStatusLabel: {
    color: COLORS.brand.primaryStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  previewStatusPill: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.brand.primarySoft,
    borderRadius: 999,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
  },
  previewWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  screen: {
    flex: 1,
  },
  threadContent: {
    paddingBottom: SPACING.md,
  },
  threadWrap: {
    flex: 1,
  },
});
