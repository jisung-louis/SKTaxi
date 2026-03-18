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

import type {CommunityStackParamList} from '@/app/navigation/types';
import {
  V2DetailComposer,
  V2DetailNotFoundState,
  V2StateCard,
} from '@/shared/design-system/components';
import {V2_COLORS, V2_SPACING} from '@/shared/design-system/tokens';
import {useScreenEnterAnimation, useScreenView} from '@/shared/hooks';
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
  const {data, error, loading, notFound, reload, sendMessage, toggleNotification} =
    useChatDetailData(route.params?.chatRoomId);
  const [composerValue, setComposerValue] = React.useState('');
  const [menuVisible, setMenuVisible] = React.useState(false);

  const handlePressBack = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('BoardMain');
  }, [navigation]);

  const handleSend = React.useCallback(
    async (messageText: string) => {
      await sendMessage(messageText);
      setComposerValue('');
    },
    [sendMessage],
  );

  const handleLeave = React.useCallback(() => {
    Alert.alert('채팅방 나가기', '채팅방에서 나갈까요?', [
      {text: '취소', style: 'cancel'},
      {
        text: '나가기',
        style: 'destructive',
        onPress: handlePressBack,
      },
    ]);
  }, [handlePressBack]);

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
            onPressMenu={() => setMenuVisible(previousValue => !previousValue)}
          />
        ) : (
          <View style={[styles.headerPlaceholder, {paddingTop: insets.top}]} />
        )}

        {loading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator color={V2_COLORS.brand.primary} size="large" />
          </View>
        ) : notFound ? (
          <View style={styles.centeredState}>
            <V2DetailNotFoundState
              actionLabel="목록으로 돌아가기"
              onPressAction={handlePressBack}
              title="채팅방을 찾을 수 없어요"
            />
          </View>
        ) : error ? (
          <View style={styles.centeredState}>
            <V2StateCard
              actionLabel="다시 시도"
              description={error}
              icon={
                <Icon
                  color={V2_COLORS.accent.orange}
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
              <V2DetailComposer
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
            canReport={data.menu.canReport}
            leaveLabel={data.menu.leaveLabel}
            notificationEnabled={data.menu.notificationEnabled}
            onClose={() => setMenuVisible(false)}
            onLeave={handleLeave}
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
    paddingHorizontal: V2_SPACING.lg,
  },
  container: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  headerPlaceholder: {
    borderBottomColor: V2_COLORS.border.subtle,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  screen: {
    flex: 1,
  },
  threadContent: {
    paddingBottom: V2_SPACING.md,
  },
  threadWrap: {
    flex: 1,
  },
});
