import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated from 'react-native-reanimated';

import {
  DetailComposer,
  StateCard,
} from '@/shared/design-system/components';
import {COLORS, SPACING} from '@/shared/design-system/tokens';
import {useScreenEnterAnimation, useScreenView} from '@/shared/hooks';
import {
  ChatHeader,
  ChatMessageList,
  ChatPopupMenu,
} from '@/shared/ui/chat';

import {TaxiChatSummaryCard} from '../components/TaxiChatSummaryCard';
import {useTaxiChatDetailData} from '../hooks/useTaxiChatDetailData';
import type {TaxiStackParamList} from '../model/navigation';
import type {TaxiChatSummaryMemberActionViewData} from '../model/taxiChatViewData';

type TaxiChatNavigationProp = NativeStackNavigationProp<TaxiStackParamList, 'Chat'>

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const ChatScreen = () => {
  useScreenView();

  const navigation = useNavigation<TaxiChatNavigationProp>();
  const route =
    useRoute<NativeStackScreenProps<TaxiStackParamList, 'Chat'>['route']>();
  const insets = useSafeAreaInsets();
  const screenAnimatedStyle = useScreenEnterAnimation();
  const {
    actionInFlightId,
    closeParty,
    confirmSettlement,
    data,
    endParty,
    error,
    kickMember,
    leaveParty,
    loading,
    reload,
    reopenParty,
    sendMessage,
    startSettlement,
    toggleNotification,
  } = useTaxiChatDetailData(route.params?.partyId);
  const [composerValue, setComposerValue] = React.useState('');
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [arrivalEditorVisible, setArrivalEditorVisible] = React.useState(false);
  const [arrivalFareInput, setArrivalFareInput] = React.useState('');

  React.useEffect(() => {
    const canArrive =
      data?.summary.management.primaryActions.some(
        action => action.id === 'arrive',
      ) ?? false;

    if (!canArrive && arrivalEditorVisible) {
      setArrivalEditorVisible(false);
      setArrivalFareInput('');
    }
  }, [arrivalEditorVisible, data]);

  const handlePressBack = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('TaxiMain');
  }, [navigation]);

  const runAction = React.useCallback(
    async ({
      fallbackMessage,
      onSuccess,
      task,
      title,
    }: {
      fallbackMessage: string;
      onSuccess?: () => void;
      task: () => Promise<void>;
      title: string;
    }) => {
      try {
        await task();
        onSuccess?.();
      } catch (actionError) {
        Alert.alert(title, getErrorMessage(actionError, fallbackMessage));
      }
    },
    [],
  );

  const handleLeaveParty = React.useCallback(() => {
    Alert.alert('파티 나가기', '현재 파티에서 나갈까요?', [
      {text: '취소', style: 'cancel'},
      {
        text: '나가기',
        style: 'destructive',
        onPress: () => {
          runAction({
            fallbackMessage: '파티를 나가지 못했습니다.',
            onSuccess: () => {
              navigation.navigate('TaxiMain');
            },
            task: async () => {
              await leaveParty();
            },
            title: '파티 나가기 실패',
          }).catch(() => undefined);
        },
      },
    ]);
  }, [leaveParty, navigation, runAction]);

  const handlePressLeaderAction = React.useCallback(
    (actionId: 'close' | 'reopen' | 'arrive' | 'end') => {
      setMenuVisible(false);

      if (actionId === 'arrive') {
        setArrivalEditorVisible(true);
        return;
      }

      const actionConfig = {
        close: {
          confirmMessage: '새 동승 요청을 받지 않도록 모집을 마감할까요?',
          fallbackMessage: '모집 마감에 실패했습니다.',
          task: closeParty,
          title: '모집 마감',
        },
        end: {
          confirmMessage: '도착 정산을 마치고 파티를 종료할까요?',
          fallbackMessage: '파티 종료에 실패했습니다.',
          onSuccess: () => {
            navigation.navigate('TaxiMain');
          },
          task: endParty,
          title: '파티 종료',
        },
        reopen: {
          confirmMessage: '다시 동승 요청을 받을 수 있도록 모집을 재개할까요?',
          fallbackMessage: '모집 재개에 실패했습니다.',
          task: reopenParty,
          title: '모집 재개',
        },
      }[actionId];

      Alert.alert(actionConfig.title, actionConfig.confirmMessage, [
        {text: '취소', style: 'cancel'},
        {
          text: '확인',
          onPress: () => {
            runAction({
              fallbackMessage: actionConfig.fallbackMessage,
              onSuccess: actionConfig.onSuccess,
              task: async () => {
                await actionConfig.task();
              },
              title: `${actionConfig.title} 실패`,
            }).catch(() => undefined);
          },
        },
      ]);
    },
    [closeParty, endParty, navigation, reopenParty, runAction],
  );

  const handlePressMemberAction = React.useCallback(
    (memberAction: TaxiChatSummaryMemberActionViewData) => {
      if (memberAction.actionId === 'kick') {
        Alert.alert(
          '멤버 내보내기',
          `${memberAction.label}님을 파티에서 내보낼까요?`,
          [
            {text: '취소', style: 'cancel'},
            {
              text: '내보내기',
              style: 'destructive',
              onPress: () => {
                runAction({
                  fallbackMessage: '멤버를 내보내지 못했습니다.',
                  task: async () => {
                    await kickMember(memberAction.id);
                  },
                  title: '멤버 내보내기 실패',
                }).catch(() => undefined);
              },
            },
          ],
        );
        return;
      }

      if (memberAction.actionId === 'confirmSettlement') {
        Alert.alert(
          '정산 확인',
          `${memberAction.label}님의 정산 완료를 확인할까요?`,
          [
            {text: '취소', style: 'cancel'},
            {
              text: '확인',
              onPress: () => {
                runAction({
                  fallbackMessage: '정산 확인에 실패했습니다.',
                  task: async () => {
                    await confirmSettlement(memberAction.id);
                  },
                  title: '정산 확인 실패',
                }).catch(() => undefined);
              },
            },
          ],
        );
      }
    },
    [confirmSettlement, kickMember, runAction],
  );

  const handleSubmitArrivalFare = React.useCallback(() => {
    const parsedTaxiFare = Number(arrivalFareInput.replace(/,/g, '').trim());

    runAction({
      fallbackMessage: '도착 처리에 실패했습니다.',
      onSuccess: () => {
        setArrivalEditorVisible(false);
        setArrivalFareInput('');
      },
      task: async () => {
        await startSettlement(parsedTaxiFare);
      },
      title: '도착 처리 실패',
    }).catch(() => undefined);
  }, [arrivalFareInput, runAction, startSettlement]);

  const handleSend = React.useCallback(
    async (messageText: string) => {
      await sendMessage(messageText);
      setComposerValue('');
    },
    [sendMessage],
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Animated.View style={[styles.screen, screenAnimatedStyle]}>
        {data ? (
          <ChatHeader
            header={data.header}
            onPressBack={handlePressBack}
            onPressMenu={() => setMenuVisible(previousValue => !previousValue)}
          />
        ) : (
          <View style={[styles.headerPlaceholder, {paddingTop: insets.top}]} />
        )}

        {loading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator color={COLORS.brand.primary} size="large" />
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
              title="파티 채팅을 불러오지 못했습니다"
            />
          </View>
        ) : data ? (
          <>
            <View style={styles.threadWrap}>
              <ChatMessageList
                contentContainerStyle={styles.threadContent}
                headerContent={
                  <TaxiChatSummaryCard
                    arrivalEditorVisible={arrivalEditorVisible}
                    arrivalFareInput={arrivalFareInput}
                    loadingActionId={actionInFlightId}
                    summary={data.summary}
                    onCancelArrivalEditor={() => {
                      setArrivalEditorVisible(false);
                      setArrivalFareInput('');
                    }}
                    onChangeArrivalFareInput={setArrivalFareInput}
                    onPressLeaderAction={handlePressLeaderAction}
                    onPressMemberAction={handlePressMemberAction}
                    onSubmitArrivalFare={handleSubmitArrivalFare}
                  />
                }
                items={data.items}
              />
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              keyboardVerticalOffset={0}>
              <DetailComposer
                leadingActionAccessibilityLabel="첨부 메뉴"
                leadingIconName="add-outline"
                onChangeText={setComposerValue}
                onPressLeadingAction={() => {
                  Alert.alert('준비 중', '첨부 기능은 다음 단계에서 연결할 예정입니다.');
                }}
                onSend={handleSend}
                placeholder={data.composerPlaceholder}
                sendAccessibilityLabel="메시지 전송"
                value={composerValue}
              />
            </KeyboardAvoidingView>
          </>
        ) : null}

        {data ? (
          <ChatPopupMenu
            leaveLabel={data.menu.leaveLabel}
            notificationEnabled={data.menu.notificationEnabled}
            onClose={() => setMenuVisible(false)}
            onLeave={data.menu.canLeave ? handleLeaveParty : undefined}
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
