import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
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

import {useAccountInfo, type AccountInfo} from '@/features/user/hooks/useAccountInfo';
import {StateCard} from '@/shared/design-system/components';
import {COLORS, SPACING} from '@/shared/design-system/tokens';
import {
  useKeyboardInset,
  useScreenEnterAnimation,
  useScreenView,
} from '@/shared/hooks';
import {ChatHeader} from '@/shared/ui/chat';

import {TaxiAccountSheet} from '../components/TaxiAccountSheet';
import {TaxiArriveSettlementSheet} from '../components/TaxiArriveSettlementSheet';
import {
  TAXI_CHAT_COMPOSER_BAR_HEIGHT,
  TaxiChatComposer,
} from '../components/TaxiChatComposer';
import {TaxiChatHeaderMenu} from '../components/TaxiChatHeaderMenu';
import {TaxiChatMessageList} from '../components/TaxiChatMessageList';
import {TaxiChatSummaryCard} from '../components/TaxiChatSummaryCard';
import {TaxiPartyEditSheet} from '../components/TaxiPartyEditSheet';
import {TaxiSettlementStatusSheet} from '../components/TaxiSettlementStatusSheet';
import {
  TaxiTaxiCallSheet,
  type TaxiCallProvider,
} from '../components/TaxiTaxiCallSheet';
import {useTaxiChatDetailData} from '../hooks/useTaxiChatDetailData';
import type {TaxiStackParamList} from '../model/navigation';
import type {TaxiChatActionTrayActionId} from '../model/taxiChatViewData';

type TaxiChatNavigationProp = NativeStackNavigationProp<TaxiStackParamList, 'Chat'>;

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

const getTaxiCallUrl = ({
  destinationLat,
  destinationLng,
  provider,
}: {
  destinationLat: number;
  destinationLng: number;
  provider: TaxiCallProvider;
}) => {
  switch (provider) {
    case 'kakaoT':
      return `kakaot://taxi?&dest_lat=${destinationLat}&dest_lng=${destinationLng}`;
    case 'tmoneyGo':
      return 'tmoneygo://';
    case 'uber':
    default:
      return 'uber://';
  }
};

const getTaxiCallProviderLabel = (provider: TaxiCallProvider) => {
  switch (provider) {
    case 'kakaoT':
      return '카카오T';
    case 'tmoneyGo':
      return '티머니GO';
    case 'uber':
    default:
      return 'Uber';
  }
};

export const ChatScreen = () => {
  useScreenView();

  const navigation = useNavigation<TaxiChatNavigationProp>();
  const route =
    useRoute<NativeStackScreenProps<TaxiStackParamList, 'Chat'>['route']>();
  const insets = useSafeAreaInsets();
  const {isVisible: keyboardVisible} = useKeyboardInset();
  const screenAnimatedStyle = useScreenEnterAnimation();
  const {accountInfo} = useAccountInfo();
  const {
    actionInFlightId,
    cancelParty,
    closeParty,
    confirmSettlement,
    data,
    endParty,
    error,
    leaveParty,
    loading,
    reload,
    reopenParty,
    sendAccountMessage,
    sendMessage,
    startSettlement,
    toggleNotification,
    updateParty,
  } = useTaxiChatDetailData(route.params?.partyId);
  const [composerValue, setComposerValue] = React.useState('');
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [actionTrayVisible, setActionTrayVisible] = React.useState(false);
  const [settlementNoticeExpanded, setSettlementNoticeExpanded] =
    React.useState(false);
  const [taxiCallSheetVisible, setTaxiCallSheetVisible] = React.useState(false);
  const [accountSheetVisible, setAccountSheetVisible] = React.useState(false);
  const [editSheetVisible, setEditSheetVisible] = React.useState(false);
  const [arriveSheetVisible, setArriveSheetVisible] = React.useState(false);
  const [settlementSheetVisible, setSettlementSheetVisible] =
    React.useState(false);
  const [sessionAccountInfo, setSessionAccountInfo] =
    React.useState<AccountInfo | null>(null);
  const [sendingAccount, setSendingAccount] = React.useState(false);

  const snapshotAccountInfo = React.useMemo<AccountInfo | null>(() => {
    const nextAccountInfo = data?.summary.settlementNotice?.accountData;

    if (!nextAccountInfo) {
      return null;
    }

    return {
      accountHolder: nextAccountInfo.accountHolder,
      accountNumber: nextAccountInfo.accountNumber,
      bankName: nextAccountInfo.bankName,
      hideName: nextAccountInfo.hideName,
    };
  }, [data?.summary.settlementNotice?.accountData]);

  const resolvedAccountInfo =
    sessionAccountInfo ?? snapshotAccountInfo ?? accountInfo;

  React.useEffect(() => {
    if ((data?.actionTrayActions.length ?? 0) === 0 && actionTrayVisible) {
      setActionTrayVisible(false);
    }
  }, [actionTrayVisible, data?.actionTrayActions.length]);

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

  const handleCancelParty = React.useCallback(() => {
    Alert.alert('파티 없애기', '파티를 취소하고 채팅을 종료할까요?', [
      {text: '취소', style: 'cancel'},
      {
        text: '파티 없애기',
        style: 'destructive',
        onPress: () => {
          runAction({
            fallbackMessage: '파티를 취소하지 못했습니다.',
            onSuccess: () => {
              navigation.navigate('TaxiMain');
            },
            task: async () => {
              await cancelParty();
            },
            title: '파티 취소 실패',
          }).catch(() => undefined);
        },
      },
    ]);
  }, [cancelParty, navigation, runAction]);

  const handleActionTrayAction = React.useCallback(
    (actionId: TaxiChatActionTrayActionId) => {
      setActionTrayVisible(false);

      if (actionId === 'callTaxi') {
        setTaxiCallSheetVisible(true);
        return;
      }

      if (actionId === 'sendAccount') {
        setAccountSheetVisible(true);
        return;
      }

      if (actionId === 'arrive') {
        setArriveSheetVisible(true);
        return;
      }

      if (actionId === 'settlementStatus') {
        setSettlementSheetVisible(true);
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
          confirmMessage: '정산을 마무리하고 파티를 종료할까요?',
          fallbackMessage: '파티 종료에 실패했습니다.',
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

      if (!actionConfig) {
        return;
      }

      Alert.alert(actionConfig.title, actionConfig.confirmMessage, [
        {text: '취소', style: 'cancel'},
        {
          text: '확인',
          onPress: () => {
            runAction({
              fallbackMessage: actionConfig.fallbackMessage,
              task: async () => {
                await actionConfig.task();
              },
              title: `${actionConfig.title} 실패`,
            }).catch(() => undefined);
          },
        },
      ]);
    },
    [closeParty, endParty, reopenParty, runAction],
  );

  const handleSubmitArrive = React.useCallback(
    (payload: {
      account: AccountInfo;
      settlementTargetMemberIds: string[];
      taxiFare: number;
    }) => {
      runAction({
        fallbackMessage: '도착 처리에 실패했습니다.',
        onSuccess: () => {
          setArriveSheetVisible(false);
          setSettlementNoticeExpanded(true);
        },
        task: async () => {
          setSessionAccountInfo(payload.account);
          await startSettlement(payload);
        },
        title: '도착 처리 실패',
      }).catch(() => undefined);
    },
    [runAction, startSettlement],
  );

  const handleSend = React.useCallback(
    async (messageText: string) => {
      try {
        await sendMessage(messageText);
        setComposerValue('');
      } catch (sendError) {
        Alert.alert(
          '메시지 전송 실패',
          getErrorMessage(sendError, '메시지를 전송하지 못했습니다.'),
        );
      }
    },
    [sendMessage],
  );

  const handleSelectTaxiCallProvider = React.useCallback(
    async (provider: TaxiCallProvider) => {
      if (!data) {
        return;
      }

      const url = getTaxiCallUrl({
        destinationLat: data.summary.destinationLocation.lat,
        destinationLng: data.summary.destinationLocation.lng,
        provider,
      });
      const providerLabel = getTaxiCallProviderLabel(provider);

      try {
        const canOpen = await Linking.canOpenURL(url);

        if (!canOpen) {
          Alert.alert(
            '앱 실행 불가',
            `${providerLabel} 앱을 열 수 없습니다. 설치 여부와 딥링크 설정을 확인해주세요.`,
          );
          return;
        }

        await Linking.openURL(url);
        setTaxiCallSheetVisible(false);
      } catch (linkError) {
        Alert.alert(
          '택시 호출 실패',
          getErrorMessage(
            linkError,
            `${providerLabel} 앱을 열지 못했습니다. 다시 시도해주세요.`,
          ),
        );
      }
    },
    [data],
  );

  const handleSubmitAccount = React.useCallback(
    async ({
      accountHolder,
      accountNumber,
      bankName,
      hideName,
      remember,
    }: {
      accountHolder: string;
      accountNumber: string;
      bankName: string;
      hideName: boolean;
      remember: boolean;
    }) => {
      const nextAccountInfo: AccountInfo = {
        accountHolder,
        accountNumber,
        bankName,
        hideName,
      };

      setSendingAccount(true);

      try {
        await sendAccountMessage({
          ...nextAccountInfo,
          remember,
        });
        setSessionAccountInfo(nextAccountInfo);
        setAccountSheetVisible(false);
      } catch (submitError) {
        Alert.alert(
          '계좌 전송 실패',
          getErrorMessage(submitError, '계좌 정보를 전송하지 못했습니다.'),
        );
      } finally {
        setSendingAccount(false);
      }
    },
    [sendAccountMessage],
  );

  const settlementMembers = data?.summary.members ?? [];
  const threadBottomPadding =
    TAXI_CHAT_COMPOSER_BAR_HEIGHT + insets.bottom + SPACING.md;

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
              <TaxiChatMessageList
                contentContainerStyle={[
                  styles.threadContent,
                  {
                    paddingBottom: threadBottomPadding,
                  },
                ]}
                headerContent={
                  <TaxiChatSummaryCard
                    settlementNoticeExpanded={settlementNoticeExpanded}
                    summary={data.summary}
                    onToggleSettlementNotice={() => {
                      setSettlementNoticeExpanded(current => !current);
                    }}
                  />
                }
                items={data.items}
              />
            </View>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'position' : 'height'}
              keyboardVerticalOffset={0}
              pointerEvents="box-none"
              style={styles.composerOverlay}>
              <TaxiChatComposer
                actionTrayActions={data.actionTrayActions}
                actionTrayVisible={actionTrayVisible}
                keyboardVisible={keyboardVisible}
                onChangeText={setComposerValue}
                onPressAction={handleActionTrayAction}
                onPressToggleTray={() => {
                  setActionTrayVisible(current => !current);
                }}
                onSend={handleSend}
                placeholder={data.composerPlaceholder}
                value={composerValue}
              />
            </KeyboardAvoidingView>
          </>
        ) : null}

        {data ? (
          <TaxiChatHeaderMenu
            canCancelParty={data.menu.canCancelParty}
            canEditParty={data.menu.canEditParty}
            canLeave={Boolean(data.menu.canLeave)}
            notificationEnabled={data.menu.notificationEnabled}
            onCancelParty={handleCancelParty}
            onClose={() => setMenuVisible(false)}
            onEditParty={() => {
              if (!data.menu.canEditParty) {
                Alert.alert('수정 불가', '모집 중 또는 모집 마감 상태에서만 수정할 수 있습니다.');
                return;
              }

              setEditSheetVisible(true);
            }}
            onLeaveParty={handleLeaveParty}
            onToggleNotification={() => {
              toggleNotification().catch(toggleError => {
                Alert.alert(
                  '알림 설정 실패',
                  getErrorMessage(toggleError, '알림 설정을 변경하지 못했습니다.'),
                );
              });
            }}
            visible={menuVisible}
          />
        ) : null}

        {data ? (
          <>
            <TaxiTaxiCallSheet
              onClose={() => {
                setTaxiCallSheetVisible(false);
              }}
              onSelectProvider={provider => {
                handleSelectTaxiCallProvider(provider).catch(() => undefined);
              }}
              visible={taxiCallSheetVisible}
            />

            <TaxiAccountSheet
              initialAccountInfo={resolvedAccountInfo}
              loading={sendingAccount}
              onClose={() => {
                setAccountSheetVisible(false);
              }}
              onSubmit={payload => {
                handleSubmitAccount(payload).catch(() => undefined);
              }}
              visible={accountSheetVisible}
            />

            <TaxiPartyEditSheet
              initialDepartureTimeISO={data.summary.departureTimeISO}
              initialDetail={data.summary.detail}
              loading={actionInFlightId === 'edit'}
              onClose={() => {
                setEditSheetVisible(false);
              }}
              onSubmit={payload => {
                runAction({
                  fallbackMessage: '파티 수정에 실패했습니다.',
                  onSuccess: () => {
                    setEditSheetVisible(false);
                  },
                  task: async () => {
                    await updateParty(payload);
                  },
                  title: '파티 수정 실패',
                }).catch(() => undefined);
              }}
              visible={editSheetVisible}
            />

            <TaxiArriveSettlementSheet
              initialAccountInfo={resolvedAccountInfo}
              loading={actionInFlightId === 'arrive'}
              members={settlementMembers}
              onClose={() => {
                setArriveSheetVisible(false);
              }}
              onSubmit={handleSubmitArrive}
              visible={arriveSheetVisible}
            />

            <TaxiSettlementStatusSheet
              isLeader={data.summary.management.isLeader}
              loadingActionId={actionInFlightId}
              notice={data.summary.settlementNotice}
              onClose={() => {
                setSettlementSheetVisible(false);
              }}
              onConfirmMember={memberId => {
                runAction({
                  fallbackMessage: '정산 확인에 실패했습니다.',
                  task: async () => {
                    await confirmSettlement(memberId);
                  },
                  title: '정산 확인 실패',
                }).catch(() => undefined);
              }}
              visible={settlementSheetVisible}
            />
          </>
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
  composerOverlay: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
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
