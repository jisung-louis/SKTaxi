import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
//import { Text } from '../components/common/Text';
import { COLORS } from '../../constants/colors';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useIsFocused, useRoute, RouteProp } from '@react-navigation/native';
import PageHeader from '../../components/common/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaxiStackParamList } from '../../navigations/types';
import firestore, { collection, doc, getDoc, updateDoc, deleteDoc, arrayRemove, query, where, getDocs } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { useMessages, sendMessage, sendSystemMessage } from '../../hooks/useMessages';
import { useParties } from '../../hooks/useParties';
import { useUserDisplayNames } from '../../hooks/useUserDisplayNames';
import { Message } from '../../types/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from '../../components/common/Button';

type ChatScreenNavigationProp = NativeStackNavigationProp<TaxiStackParamList, 'Chat'>;

export const ChatScreen = () => {
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const route = useRoute<RouteProp<TaxiStackParamList, 'Chat'>>();
  const [message, setMessage] = useState('');
  const partyId = route.params?.partyId;
  const flatListRef = useRef<FlatList>(null);
  
  // SKTaxi: 실시간 메시지 구독
  const { messages, loading: messagesLoading, error: messagesError } = useMessages(partyId);
  
  // SKTaxi: 파티 정보 구독
  const { parties } = useParties();
  const currentParty = parties.find(p => p.id === partyId);
  const memberUids = currentParty?.members || [];
  
  // SKTaxi: 멤버들의 displayName 가져오기
  const { displayNameMap } = useUserDisplayNames(memberUids);

  // SKTaxi: 현재 사용자가 리더인지 확인
  const currentUser = auth(getApp()).currentUser;
  const isLeader = currentParty?.leaderId === currentUser?.uid;

  const isFocused = useIsFocused();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const [partyTitle, setPartyTitle] = useState<string>('');
  const [leaderName, setLeaderName] = useState<string>('');
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showSideMenu, setShowSideMenu] = useState<boolean>(false);
  const menuTranslateY = useSharedValue(100);
  const menuOpacity = useSharedValue(0);
  const sideMenuTranslateX = useSharedValue(400);
  const sideMenuOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    translateY.value = withTiming(isFocused ? 0 : 10, { duration: 200 });
  }, [isFocused]);

  // SKTaxi: 파티 정보를 읽어 채팅방 타이틀 구성
  useEffect(() => {
    const pid = route.params?.partyId;
    if (!pid) return;
    (async () => {
      try {
        const snap = await getDoc(doc(collection(firestore(getApp()), 'parties'), pid));
        const data = snap.data() as any;
        const dep = data?.departure?.name;
        const dst = data?.destination?.name;
        const leaderId = data?.leaderId;
        if (dep && dst) {
          setPartyTitle(`${dep} → ${dst} 택시 파티`);
        } else {
          setPartyTitle('채팅');
        }
        if (leaderId) {
          try {
            const u = await getDoc(doc(collection(firestore(getApp()), 'users'), leaderId));
            setLeaderName(((u.data() as any)?.displayName) || '익명');
          } catch {
            setLeaderName('익명');
          }
        } else {
          setLeaderName('');
        }
      } catch {
        setPartyTitle('채팅');
        setLeaderName('');
      }
    })();
  }, [route.params?.partyId]);

  // SKTaxi: 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // SKTaxi: 메뉴 애니메이션 스타일
  const menuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: menuOpacity.value,
    transform: [{ translateY: menuTranslateY.value }],
  }));

  // SKTaxi: 사이드 메뉴 애니메이션 스타일
  const sideMenuAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sideMenuOpacity.value,
    transform: [{ translateX: sideMenuTranslateX.value }],
  }));

  // SKTaxi: 오버레이 애니메이션 스타일
  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const handleSend = async () => {
    if (!message.trim() || !partyId) return;

    try {
      await sendMessage(partyId, message.trim());
      setMessage('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      Alert.alert('오류', '메시지 전송에 실패했습니다.');
    }
  };

  // SKTaxi: 텍스트 입력 뷰 클릭 시 스크롤을 맨 아래로
  const handleInputFocus = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 300);
  };

  // SKTaxi: 플러스 버튼 클릭 시 메뉴 토글 및 스크롤
  const handlePlusPress = () => {
    const newShowMenu = !showMenu;
    setShowMenu(newShowMenu);
    
    // SKTaxi: 메뉴 애니메이션
    if (newShowMenu) {
      menuTranslateY.value = withTiming(0, { duration: 300 });
      menuOpacity.value = withTiming(1, { duration: 300 });
    } else {
      menuTranslateY.value = withTiming(100, { duration: 300 });
      menuOpacity.value = withTiming(0, { duration: 300 });
    }
    
    // SKTaxi: 메뉴가 열릴 때 스크롤을 맨 아래로
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // SKTaxi: 메뉴 아이템 클릭 핸들러
  const handleMenuPress = (type: string) => {
    console.log(`${type} 선택됨`);
    setShowMenu(false);
    
    // SKTaxi: 메뉴 닫기 애니메이션
    menuTranslateY.value = withTiming(100, { duration: 300 });
    menuOpacity.value = withTiming(0, { duration: 300 });
    
    // TODO: 각 메뉴 아이템별 기능 구현
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === currentUser?.uid;
    const isSystemMessage = item.type === 'system';
    
    // SKTaxi: 시스템 메시지 렌더링
    if (isSystemMessage) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }
    
    // SKTaxi: 일반 메시지 렌더링
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessage : styles.otherMessage
      ]}>
        {!isMyMessage && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>
          {item.createdAt?.toDate?.()?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 
           new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  const handleDotMenuPress = () => {
    const newShowSideMenu = !showSideMenu;
    
    // SKTaxi: 사이드 메뉴 애니메이션
    if (newShowSideMenu) {
      setShowSideMenu(true);
      sideMenuTranslateX.value = withTiming(0, { duration: 300 });
      sideMenuOpacity.value = withTiming(1, { duration: 300 });
      overlayOpacity.value = withTiming(1, { duration: 300 });
    } else {
      sideMenuTranslateX.value = withTiming(400, { duration: 300 });
      sideMenuOpacity.value = withTiming(0, { duration: 300 });
      overlayOpacity.value = withTiming(0, { duration: 300 });
      // 애니메이션 완료 후 상태 변경
      setTimeout(() => {
        setShowSideMenu(false);
      }, 300);
    }
  };

  const closeSideMenu = () => {
    sideMenuTranslateX.value = withTiming(400, { duration: 300 });
    sideMenuOpacity.value = withTiming(0, { duration: 300 });
    overlayOpacity.value = withTiming(0, { duration: 300 });
    // 애니메이션 완료 후 상태 변경
    setTimeout(() => {
      setShowSideMenu(false);
    }, 300);
  };

  // SKTaxi: 멤버 나가기 함수
  const handleMemberLeave = async () => {
    if (!partyId || !currentUser?.uid) return;

    try {
      // SKTaxi: 사용자 정보 조회하여 시스템 메시지 전송
      const userDoc = await getDoc(doc(collection(firestore(getApp()), 'users'), currentUser.uid));
      const userData = userDoc.data();
      const displayName = userData?.displayName || '익명';

      // SKTaxi: 시스템 메시지 전송 (나가기 전에 전송)
      await sendSystemMessage(partyId, `${displayName}님이 파티를 나갔어요.`);

      // SKTaxi: parties.members 배열에서 현재 사용자 제거
      await updateDoc(doc(collection(firestore(getApp()), 'parties'), partyId), {
        members: arrayRemove(currentUser.uid),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('알림', '파티에서 나갔습니다.');
      navigation.popToTop();
    } catch (error) {
      console.error('파티 나가기 실패:', error);
      Alert.alert('오류', '파티 나가기에 실패했습니다.');
    }
  };

  // SKTaxi: 멤버 나가기 확인 모달
  const showMemberLeaveModal = () => {
    Alert.alert(
      '파티 나가기',
      '파티에서 나가시겠어요?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '나가기',
          style: 'destructive',
          onPress: handleMemberLeave,
        },
      ]
    );
  };

  // SKTaxi: 리더 파티 삭제 함수
  const handleLeaderDeleteParty = async () => {
    if (!partyId || !isLeader) return;

    try {
      // SKTaxi: 관련 joinRequests 삭제
      const joinRequestsQuery = query(
        collection(firestore(getApp()), 'joinRequests'),
        where('partyId', '==', partyId)
      );
      const joinRequestsSnapshot = await getDocs(joinRequestsQuery);
      
      // SKTaxi: 모든 관련 joinRequests 삭제
      const deletePromises = joinRequestsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // SKTaxi: 파티 삭제
      await deleteDoc(doc(collection(firestore(getApp()), 'parties'), partyId));

      Alert.alert('알림', '파티가 삭제되었습니다.');
      navigation.popToTop();
    } catch (error) {
      console.error('파티 삭제 실패:', error);
      Alert.alert('오류', '파티 삭제에 실패했습니다.');
    }
  };

  // SKTaxi: 파티 삭제 확인 모달
  const showDeletePartyModal = () => {
    // SKTaxi: 파티원 수에 따라 다른 메시지 표시
    const memberCount = memberUids.length;
    const title = memberCount <= 1 ? '파티 모집 취소' : '파티 삭제';
    const message = memberCount <= 1 
      ? '파티 모집을 취소할까요?' 
      : '현재 파티원이 있어요. 정말 파티를 없애시겠어요?';

    Alert.alert(
      title,
      message,
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: memberCount <= 1 ? '취소하기' : '예',
          style: 'destructive',
          onPress: handleLeaderDeleteParty,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <PageHeader 
          title={partyTitle || '채팅'} 
          onBack={() => navigation.popToTop()} 
          titleStyle={styles.title} 
          subTitle={leaderName ? `리더 : ${leaderName} 님` : undefined}
          rightButton
          borderBottom
          onRightButtonPress={() => handleDotMenuPress()}
        />
        
        {/* SKTaxi: 사이드 메뉴 오버레이 */}
        {showSideMenu && (
          <Animated.View style={[styles.sideMenuOverlay, overlayAnimatedStyle]}>
            <TouchableOpacity 
              style={styles.overlayTouchable} 
              onPress={closeSideMenu}
              activeOpacity={1}
            />
          </Animated.View>
        )}
        
        {/* SKTaxi: 사이드 메뉴 */}
        {showSideMenu && (
          <Animated.View style={[styles.sideMenu, sideMenuAnimatedStyle]}>
            <View style={[styles.sideMenuHeader, { paddingTop: insets.top + 16 }]}>
              <Text style={styles.sideMenuTitle}>파티 정보</Text>
              <TouchableOpacity onPress={closeSideMenu}>
                <Icon name="close" size={24} color={COLORS.text.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.sideMenuContent}>
              <View style={styles.memberSection}>
                <Text style={styles.sectionTitle}>참여 멤버 ({memberUids.length}명)</Text>
                <View style={styles.memberList}>
                  {!currentParty ? (
                    <Text style={styles.loadingText}>파티 정보를 불러오는 중...</Text>
                  ) : (
                    memberUids.map((uid) => {
                      const displayName = displayNameMap[uid] || '익명';
                      const isLeader = currentParty.leaderId === uid;
                      const initial = displayName.charAt(0).toUpperCase();
                      
                      return (
                        <View key={uid} style={styles.memberItem}>
                          <View style={[
                            styles.memberAvatar,
                            isLeader && styles.leaderAvatar
                          ]}>
                            <Text style={styles.memberInitial}>{initial}</Text>
                          </View>
                          <View style={styles.memberInfo}>
                            <Text style={styles.memberName}>{displayName}</Text>
                            <Text style={[
                              styles.memberRole,
                              isLeader && styles.leaderRole
                            ]}>
                              {isLeader ? '리더' : '멤버'}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </View>
              
              <View style={styles.actionSection}>
                {/* SKTaxi: 리더만 설정 버튼 표시 */}
                {isLeader && (
                  <TouchableOpacity style={styles.actionButton}>
                    <Icon name="settings" size={20} color={COLORS.accent.green} />
                    <Text style={styles.actionButtonText}>설정</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.actionButton}>
                  <Icon name="share" size={20} color={COLORS.accent.green} />
                  <Text style={styles.actionButtonText}>공유</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={isLeader ? showDeletePartyModal : showMemberLeaveModal}
                >
                  <Icon name="exit" size={20} color="#FF6B6B" />
                  <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>
                    {isLeader ? '파티 없애기' : '나가기'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
        <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
        <Animated.View style={[styles.container, screenAnimatedStyle]}>
        {messagesLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>메시지를 불러오는 중...</Text>
          </View>
        ) : messagesError ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>메시지를 불러올 수 없습니다.</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={item => item.id || ''}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        )}
                {/* SKTaxi: 메뉴 표시 - 애니메이션 적용 */}
                {showMenu && (
                  <Animated.View style={[styles.menuContainer, menuAnimatedStyle]}>
                    <View style={styles.menuItemWrapper}>
                      <TouchableOpacity 
                        style={styles.menuItem} 
                        onPress={() => handleMenuPress('taxi')}
                      >
                        <Icon name="car" size={32} color={COLORS.accent.green} />
                      </TouchableOpacity>
                      <Text style={styles.menuItemText}>택시호출</Text>
                    </View>
                    <View style={styles.menuItemWrapper}>
                      <TouchableOpacity 
                        style={styles.menuItem} 
                        onPress={() => handleMenuPress('account')}
                      >
                        <Icon name="card" size={32} color={COLORS.accent.green} />
                      </TouchableOpacity>
                      <Text style={styles.menuItemText}>계좌전송</Text>
                    </View>
                    <View style={styles.menuItemWrapper}>
                      <TouchableOpacity 
                        style={styles.menuItem} 
                        onPress={() => handleMenuPress('close')}
                      >
                        <Icon name="close-circle" size={32} color={COLORS.accent.green} />
                      </TouchableOpacity>
                      <Text style={styles.menuItemText}>모집마감</Text>
                    </View>
                    <View style={styles.menuItemWrapper}>
                      <TouchableOpacity 
                        style={styles.menuItem} 
                        onPress={() => handleMenuPress('arrive')}
                      >
                        <Icon name="checkmark-circle" size={32} color={COLORS.accent.green} />
                      </TouchableOpacity>
                      <Text style={styles.menuItemText}>도착</Text>
                    </View>
                  </Animated.View>
                )}
                <View style={styles.inputContainer}>
                    <TouchableOpacity style={styles.plusButton} onPress={handlePlusPress}>
                        <Icon name="add" size={24} color={COLORS.text.primary} />
                    </TouchableOpacity>
                    <TextInput
                        style={styles.input}
                        value={message}
                        onChangeText={setMessage}
                        placeholder="메시지를 입력하세요"
                        placeholderTextColor={COLORS.text.disabled}
                        multiline
                        onFocus={handleInputFocus}
                    />
                    <Button title="전송" onPress={handleSend} style={{height: 40, borderRadius: 16}} />
                </View>
            </Animated.View>
        </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  title: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
  },
  messageList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.accent.green,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.background.card,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    backgroundColor: COLORS.background.primary,
    paddingBottom: 40,
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    color: COLORS.text.primary,
    minHeight: 40,
    maxHeight: 100,
  },
  senderName: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: COLORS.text.secondary,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 16,
  },
  plusButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  menuContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background.primary,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  menuItemWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  menuItem: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  menuItemText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '500',
  },
  sideMenuOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlayTouchable: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '60%',
    backgroundColor: COLORS.background.primary,
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  sideMenuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  sideMenuTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
  },
  sideMenuContent: {
    flex: 1,
    padding: 20,
  },
  memberSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title4,
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  memberList: {
    gap: 12,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitial: {
    color: COLORS.background.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  memberRole: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  leaderAvatar: {
    backgroundColor: COLORS.accent.green,
    borderWidth: 2,
    borderColor: COLORS.accent.green,
  },
  leaderRole: {
    color: COLORS.accent.green,
    fontWeight: '600',
  },
  actionSection: {
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: COLORS.background.card,
  },
  actionButtonText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    marginLeft: 12,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  systemMessageText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    backgroundColor: COLORS.background.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    textAlign: 'center',
  },
}); 