import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { COLORS } from '../../../constants/colors';
import PageHeader from '../../../components/common/PageHeader';
import { useScreenView } from '../../../hooks/useScreenView';
import { useChatScreenPresenter } from '../hooks/useChatScreenPresenter';

import { ChatMessageList, ChatMessageListRef } from './ChatMessageList';
import { ChatInput } from './ChatInput';
import { ChatMenu } from './ChatMenu';
import { JoinRequestSection } from './JoinRequestSection';
import { SettlementBar } from './SettlementBar';
import { SideMenu } from './SideMenu';
import { AccountModal, ArrivalModal, SettlementModal, TaxiAppModal } from './ChatModals';

export const ChatScreen = () => {
  useScreenView();
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  const messageListRef = useRef<ChatMessageListRef>(null);

  const {
    // 기본 정보
    partyId,
    currentParty,
    currentUser,
    isLeader,
    memberUids,
    displayNameMap,
    navigation,

    // 메시지 관련
    messages,
    messagesLoading,
    messagesError,
    message,
    setMessage,
    handleSend,

    // 파티 정보
    partyTitle,
    leaderName,

    // UI 상태
    showMenu,
    setShowMenu,
    showSideMenu,
    setShowSideMenu,
    showTaxiAppModal,
    setShowTaxiAppModal,
    isPartyEnded,

    // 동승 요청
    joinRequests,
    showJoinRequests,
    setShowJoinRequests,
    handleAcceptJoin,
    handleDeclineJoin,

    // 채팅 알림
    isChatMuted,
    handleToggleMute,

    // 계좌 정보 모달
    showAccountModal,
    setShowAccountModal,
    userAccount,
    accountLoading,
    editingAccountInline,
    setEditingAccountInline,
    tempBankName,
    setTempBankName,
    tempAccountNumber,
    setTempAccountNumber,
    tempAccountHolder,
    setTempAccountHolder,
    tempHideName,
    setTempHideName,
    rememberAccount,
    setRememberAccount,
    showBankDropdown,
    setShowBankDropdown,
    sendAccountInfo,

    // 도착 모달
    showArrivalModal,
    setShowArrivalModal,
    taxiFare,
    setTaxiFare,
    selectedMembers,
    toggleMemberSelection,
    arrivalBankName,
    setArrivalBankName,
    arrivalAccountNumber,
    setArrivalAccountNumber,
    arrivalAccountHolder,
    setArrivalAccountHolder,
    arrivalHideName,
    setArrivalHideName,
    showArrivalBankDropdown,
    setShowArrivalBankDropdown,
    rememberArrivalAccount,
    setRememberArrivalAccount,
    handleArrivalSubmit,

    // 정산 현황
    settlementStatus,
    showSettlementModal,
    setShowSettlementModal,
    isNoticeBarMinimized,
    setIsNoticeBarMinimized,
    perPersonAmount,
    handleSettlementComplete,
    calculateNoticeBarHeight,

    // 멤버 관리
    handleKick,
    showMemberLeaveModal,
    showDeletePartyModal,
    handleShareParty,

    // 메뉴 핸들러
    handleMenuPress,
    copyAccountInfo,

    // 애니메이션
    menuTranslateY,
    menuOpacity,
    sideMenuTranslateX,
    sideMenuOpacity,
    overlayOpacity,
    noticeBarHeight,
    settlementListOpacity,

    // Refs
    contentHeightRef,
  } = useChatScreenPresenter();

  // 화면 포커스 애니메이션
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    translateY.value = withTiming(isFocused ? 0 : 10, { duration: 200 });
  }, [isFocused]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // 메뉴 애니메이션
  const menuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: menuOpacity.value,
    transform: [{ translateY: menuTranslateY.value }],
  }));

  // 사이드 메뉴 애니메이션
  const sideMenuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sideMenuOpacity.value,
    transform: [{ translateX: sideMenuTranslateX.value }],
  }));

  // 오버레이 애니메이션
  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  // 정산 현황 바 애니메이션
  const animatedNoticeBarStyle = useAnimatedStyle(() => ({
    height: noticeBarHeight.value,
  }));

  const animatedSettlementListStyle = useAnimatedStyle(() => ({
    opacity: settlementListOpacity.value,
  }));

  // 스크롤 핸들러
  const scrollToEndWithPadding = (animated = true) => {
    const paddingBottom = 16;
    if (contentHeightRef.current > 0) {
      messageListRef.current?.scrollToOffset(contentHeightRef.current + paddingBottom, animated);
    } else {
      messageListRef.current?.scrollToEnd(animated);
    }
  };

  // 입력 포커스 시 스크롤
  const handleInputFocus = () => {
    setTimeout(() => {
      scrollToEndWithPadding(true);
    }, 300);
  };

  // 플러스 버튼 핸들러
  const handlePlusPress = () => {
    const newShowMenu = !showMenu;
    setShowMenu(newShowMenu);

    if (newShowMenu) {
      menuTranslateY.value = withTiming(0, { duration: 300 });
      menuOpacity.value = withTiming(1, { duration: 300 });
    } else {
      menuTranslateY.value = withTiming(100, { duration: 300 });
      menuOpacity.value = withTiming(0, { duration: 300 });
    }

    setTimeout(() => {
      scrollToEndWithPadding(true);
    }, 100);
  };

  // 사이드 메뉴 핸들러
  const handleDotMenuPress = () => {
    const newShowSideMenu = !showSideMenu;

    if (newShowSideMenu) {
      setShowSideMenu(true);
      sideMenuTranslateX.value = withTiming(0, { duration: 300 });
      sideMenuOpacity.value = withTiming(1, { duration: 300 });
      overlayOpacity.value = withTiming(1, { duration: 300 });
    } else {
      closeSideMenu();
    }
  };

  const closeSideMenu = () => {
    sideMenuTranslateX.value = withTiming(400, { duration: 300 });
    sideMenuOpacity.value = withTiming(0, { duration: 300 });
    overlayOpacity.value = withTiming(0, { duration: 300 });
    setTimeout(() => {
      setShowSideMenu(false);
    }, 300);
  };

  // 정산 현황 바 토글
  const handleToggleNoticeBar = () => {
    const newMinimized = !isNoticeBarMinimized;
    setIsNoticeBarMinimized(newMinimized);

    const memberCount = Object.keys(settlementStatus).length;
    if (newMinimized) {
      noticeBarHeight.value = withTiming(52, { duration: 300 });
      settlementListOpacity.value = withTiming(0, { duration: 300 });
    } else {
      const dynamicHeight = calculateNoticeBarHeight(memberCount);
      noticeBarHeight.value = withTiming(dynamicHeight, { duration: 300 });
      settlementListOpacity.value = withTiming(1, { duration: 300 });
    }
  };

  // 메시지 추가 시 스크롤
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToEndWithPadding(true);
      }, 1000);
    }
  }, [messages.length]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <PageHeader
        title={partyTitle || '채팅'}
        onBack={() => navigation.popToTop()}
        titleStyle={styles.title}
        subTitle={leaderName ? `리더 : ${leaderName} 님` : undefined}
        rightButton
        borderBottom
        onRightButtonPress={handleDotMenuPress}
      />

      {/* 사이드 메뉴 */}
      <SideMenu
        visible={showSideMenu}
        insets={insets}
        memberUids={memberUids}
        displayNameMap={displayNameMap}
        currentUserId={currentUser?.uid}
        leaderId={currentParty?.leaderId}
        partyStatus={currentParty?.status}
        isLeader={isLeader}
        isPartyEnded={isPartyEnded}
        isChatMuted={isChatMuted}
        overlayAnimatedStyle={overlayAnimatedStyle}
        sideMenuAnimatedStyle={sideMenuAnimatedStyle}
        onClose={closeSideMenu}
        onToggleMute={handleToggleMute}
        onShare={handleShareParty}
        onKick={handleKick}
        onLeave={showMemberLeaveModal}
        onDeleteParty={showDeletePartyModal}
      />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Animated.View style={[styles.container, screenAnimatedStyle]}>
          {/* 정산 현황 바 */}
          {currentParty?.status === 'arrived' && (
            <SettlementBar
              settlementStatus={settlementStatus}
              displayNameMap={displayNameMap}
              currentUserId={currentUser?.uid}
              leaderId={currentParty?.leaderId}
              perPersonAmount={perPersonAmount}
              isMinimized={isNoticeBarMinimized}
              animatedBarStyle={animatedNoticeBarStyle}
              animatedListStyle={animatedSettlementListStyle}
              onToggleMinimize={handleToggleNoticeBar}
              onPressBar={() => setShowSettlementModal(true)}
            />
          )}

          {messagesLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>메시지를 불러오는 중...</Text>
            </View>
          ) : messagesError ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>메시지를 불러올 수 없습니다.</Text>
            </View>
          ) : (
            <>
              {/* 동승 요청 섹션 (리더만) */}
              {isLeader && joinRequests.length > 0 && (
                <JoinRequestSection
                  joinRequests={joinRequests}
                  displayNameMap={displayNameMap}
                  showJoinRequests={showJoinRequests}
                  onToggleShow={() => setShowJoinRequests(!showJoinRequests)}
                  onAccept={handleAcceptJoin}
                  onDecline={handleDeclineJoin}
                />
              )}

              {/* 메시지 목록 */}
              <ChatMessageList
                ref={messageListRef}
                messages={messages}
                currentUserId={currentUser?.uid}
                onCopyAccountInfo={copyAccountInfo}
                onLeaveRoom={() => navigation.popToTop()}
                onContentSizeChange={(width, height) => {
                  contentHeightRef.current = height;
                  scrollToEndWithPadding(true);
                }}
              />
            </>
          )}

          {/* 메뉴 */}
          {showMenu && (
            <ChatMenu
              isLeader={isLeader}
              partyStatus={currentParty?.status}
              animatedStyle={menuAnimatedStyle}
              onMenuPress={handleMenuPress}
            />
          )}

          {/* 입력 */}
          <ChatInput
            message={message}
            onMessageChange={setMessage}
            onSend={handleSend}
            onPlusPress={handlePlusPress}
            onInputFocus={handleInputFocus}
            showMenu={showMenu}
            isPartyEnded={isPartyEnded}
          />
        </Animated.View>
      </KeyboardAvoidingView>

      {/* 모달들 */}
      <AccountModal
        visible={showAccountModal}
        onClose={() => setShowAccountModal(false)}
        accountLoading={accountLoading}
        userAccount={userAccount}
        editingAccountInline={editingAccountInline}
        setEditingAccountInline={setEditingAccountInline}
        tempBankName={tempBankName}
        setTempBankName={setTempBankName}
        tempAccountNumber={tempAccountNumber}
        setTempAccountNumber={setTempAccountNumber}
        tempAccountHolder={tempAccountHolder}
        setTempAccountHolder={setTempAccountHolder}
        tempHideName={tempHideName}
        setTempHideName={setTempHideName}
        rememberAccount={rememberAccount}
        setRememberAccount={setRememberAccount}
        showBankDropdown={showBankDropdown}
        setShowBankDropdown={setShowBankDropdown}
        onSendAccountInfo={sendAccountInfo}
      />

      <ArrivalModal
        visible={showArrivalModal}
        onClose={() => setShowArrivalModal(false)}
        taxiFare={taxiFare}
        setTaxiFare={setTaxiFare}
        memberUids={memberUids}
        selectedMembers={selectedMembers}
        displayNameMap={displayNameMap}
        currentUserId={currentUser?.uid}
        toggleMemberSelection={toggleMemberSelection}
        arrivalBankName={arrivalBankName}
        setArrivalBankName={setArrivalBankName}
        arrivalAccountNumber={arrivalAccountNumber}
        setArrivalAccountNumber={setArrivalAccountNumber}
        arrivalAccountHolder={arrivalAccountHolder}
        setArrivalAccountHolder={setArrivalAccountHolder}
        arrivalHideName={arrivalHideName}
        setArrivalHideName={setArrivalHideName}
        showArrivalBankDropdown={showArrivalBankDropdown}
        setShowArrivalBankDropdown={setShowArrivalBankDropdown}
        rememberArrivalAccount={rememberArrivalAccount}
        setRememberArrivalAccount={setRememberArrivalAccount}
        onSubmit={handleArrivalSubmit}
      />

      <SettlementModal
        visible={showSettlementModal}
        onClose={() => setShowSettlementModal(false)}
        settlementStatus={settlementStatus}
        displayNameMap={displayNameMap}
        currentUserId={currentUser?.uid}
        leaderId={currentParty?.leaderId}
        perPersonAmount={perPersonAmount}
        onSettlementComplete={handleSettlementComplete}
      />

      <TaxiAppModal
        visible={showTaxiAppModal}
        onClose={() => setShowTaxiAppModal(false)}
        currentParty={currentParty}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: COLORS.accent.red,
  },
});

export default ChatScreen;
