import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Modal, ScrollView, Clipboard, TouchableWithoutFeedback, Keyboard, Linking, Image } from 'react-native';
//import { Text } from '../components/common/Text';
import { COLORS } from '../../constants/colors';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useIsFocused, useRoute, RouteProp } from '@react-navigation/native';
import PageHeader from '../../components/common/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TaxiStackParamList } from '../../navigations/types';
import firestore, { collection, doc, getDoc, setDoc, updateDoc, deleteDoc, arrayRemove, arrayUnion, query, where, getDocs, onSnapshot, orderBy, writeBatch } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { useMessages, sendMessage, sendSystemMessage, sendAccountMessage, sendArrivedMessage, sendEndMessage } from '../../hooks/useMessages';
import { useParties } from '../../hooks/party';
import { useUserDisplayNames } from '../../hooks/useUserDisplayNames';
import { Message } from '../../types/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from '../../components/common/Button';
import Surface from '../../components/common/Surface';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { useScreenView } from '../../hooks/useScreenView';
import { logEvent } from '../../lib/analytics';

type ChatScreenNavigationProp = NativeStackNavigationProp<TaxiStackParamList, 'Chat'>;

export const ChatScreen = () => {
  useScreenView();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const route = useRoute<RouteProp<TaxiStackParamList, 'Chat'>>();
  const [message, setMessage] = useState('');
  const partyId = route.params?.partyId;
  const flatListRef = useRef<FlatList>(null);
  const contentHeightRef = useRef<number>(0); // SKTaxi: FlatList content 높이 추적
  const kickHandledRef = useRef<boolean>(false);
  const deleteHandledRef = useRef<boolean>(false);
  const seenPartyRef = useRef<boolean>(false); // SKTaxi: 해당 파티가 한번이라도 존재했는지
  const selfLeaveRef = useRef<boolean>(false); // SKTaxi: 사용자가 직접 나간 경우
  
  // SKTaxi: 동승 요청 관련 상태
  const [joinRequests, setJoinRequests] = useState<any[]>([]);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [joinRequestsLoading, setJoinRequestsLoading] = useState(false);
  
  // SKTaxi: 채팅방 알림 음소거 상태
  const [isChatMuted, setIsChatMuted] = useState(false);
  
  // SKTaxi: 실시간 메시지 구독
  const { messages, loading: messagesLoading, error: messagesError } = useMessages(partyId);
  
  // SKTaxi: 파티 정보 구독
  const { parties } = useParties();
  const currentParty = parties.find(p => p.id === partyId);
  const memberUids = currentParty?.members || [];
  
  // SKTaxi: 동승 요청자들의 ID 추출
  const requesterIds = joinRequests.map(request => request.requesterId).filter(Boolean);
  
  // SKTaxi: 멤버들과 동승 요청자들의 displayName 가져오기
  const allUserIds = [...memberUids, ...requesterIds];
  const { displayNameMap } = useUserDisplayNames(allUserIds);

  // SKURI: 택시 호출 앱 모달
  const [showTaxiAppModal, setShowTaxiAppModal] = useState(false);
  const taxiApps = [
    {
      id: 'kakaot',
      name: '카카오 T',
      scheme: (party: any) => {
        const lat = party?.destination?.lat;
        const lng = party?.destination?.lng;
        const name = party?.destination?.name;
        if (lat && lng) {
          let url = `kakaot://taxi?&dest_lat=${lat}&dest_lng=${lng}`;
          if (name) url += `&dest_name=${encodeURIComponent(name)}`;
          return url;
        }
        return 'kakaot://taxi';
      },
      iosStore: 'https://apps.apple.com/app/id981110422',
      androidStore: 'market://details?id=com.kakao.taxi',
      icon: require('../../../assets/images/kakaot_icon.png'),
    },
    {
      id: 'tmoneygo',
      name: '티머니 GO',
      scheme: () => 'tmoneygo://',
      iosStore: 'https://apps.apple.com/app/id1483433931',
      androidStore: 'market://details?id=com.tmoney.tmoneygo',
      icon: require('../../../assets/images/tmoneygo_icon.png'),
    },
    {
      id: 'uber',
      name: 'Uber',
      scheme: () => 'uber://',
      iosStore: 'https://apps.apple.com/app/id368677368',
      androidStore: 'market://details?id=com.ubercab',
      icon: require('../../../assets/images/uber_icon.png'),
    },
  ] as const;

  const openExternalApp = async (
    urlBuilder: (party?: any) => string,
    iosStore: string,
    androidStore: string
  ) => {
    const scheme = urlBuilder(currentParty);
    try {
      const canOpen = await Linking.canOpenURL(scheme);
      if (canOpen) {
        await Linking.openURL(scheme);
      } else {
        const storeUrl = Platform.OS === 'ios' ? iosStore : androidStore;
        await Linking.openURL(storeUrl);
      }
    } catch (e) {
      const storeUrl = Platform.OS === 'ios' ? iosStore : androidStore;
      Alert.alert('안내', '앱을 열 수 없어요. 스토어로 이동합니다.');
      Linking.openURL(storeUrl).catch(() => {});
    }
  };

  // SKTaxi: 현재 사용자가 리더인지 확인
  const currentUser = auth(getApp()).currentUser;
  const isLeader = currentParty?.leaderId === currentUser?.uid;
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  
  // SKTaxi: 계좌 정보 모달 관련 상태
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [userAccount, setUserAccount] = useState<any>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [editingAccountInline, setEditingAccountInline] = useState(false);
  
  // SKTaxi: 도착 모달 관련 상태
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [taxiFare, setTaxiFare] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  
  // SKTaxi: 도착 모달용 계좌정보 상태 (기존 계좌 모달과 분리)
  const [arrivalBankName, setArrivalBankName] = useState('');
  const [arrivalAccountNumber, setArrivalAccountNumber] = useState('');
  const [arrivalAccountHolder, setArrivalAccountHolder] = useState('');
  const [arrivalHideName, setArrivalHideName] = useState(false);
  const [showArrivalBankDropdown, setShowArrivalBankDropdown] = useState(false);
  const [rememberArrivalAccount, setRememberArrivalAccount] = useState(false);
  const arrivalTaxiFareRef = useRef<TextInput>(null);
  
  // SKTaxi: 정산 현황 관련 상태
  const [settlementStatus, setSettlementStatus] = useState<{[key: string]: boolean}>({});
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [isNoticeBarMinimized, setIsNoticeBarMinimized] = useState(false);
  const [perPersonAmount, setPerPersonAmount] = useState<number>(0);
  const [isPartyEnded, setIsPartyEnded] = useState(false);
  
  // SKTaxi: 정산 현황 바 애니메이션
  const noticeBarHeight = useSharedValue(52);
  const settlementListOpacity = useSharedValue(1);
  
  // SKTaxi: 동적 높이 계산 (N빵 인원 수 * 22 + 헤더 높이)
  const calculateNoticeBarHeight = (memberCount: number) => {
    return Math.max(52, memberCount * 22 + 52); // 최소 52px, 헤더 52px + 멤버당 22px
  };

  // SKTaxi: 정산 현황 바 애니메이션 스타일
  const animatedNoticeBarStyle = useAnimatedStyle(() => {
    return {
      height: noticeBarHeight.value,
    };
  });

  const animatedSettlementListStyle = useAnimatedStyle(() => {
    return {
      opacity: settlementListOpacity.value,
    };
  });
  
  // SKTaxi: 계좌 정보 입력 상태 (등록되지 않은 경우)
  const [tempBankName, setTempBankName] = useState('');
  const [tempAccountNumber, setTempAccountNumber] = useState('');
  const [tempAccountHolder, setTempAccountHolder] = useState('');
  const [tempHideName, setTempHideName] = useState(false);
  const [rememberAccount, setRememberAccount] = useState(false);
  const [showBankDropdown, setShowBankDropdown] = useState(false);
  
  const BANKS = [
    '신한','KB국민','카카오','토스뱅크','IBK기업','NH농협','케이뱅크','하나','우리','수협','SC제일','한국씨티',
    '부산은행','대구은행','광주은행','제주은행','전북은행','경남은행','새마을금고','우체국','신협'
  ];

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

  // SKTaxi: 채팅방 알림 음소거 상태 로드
  useEffect(() => {
    if (!partyId || !currentUser?.uid) return;
    
    const loadNotificationSettings = async () => {
      try {
        const settingsDoc = await getDoc(
          doc(collection(firestore(getApp()), 'chats', partyId, 'notificationSettings'), currentUser.uid)
        );
        
        if (settingsDoc.exists()) {
          const data = settingsDoc.data() as { muted?: boolean } | undefined;
          setIsChatMuted(!!data?.muted);
        }
      } catch (error) {
        console.error('알림 설정 로드 실패:', error);
      }
    };
    
    loadNotificationSettings();
  }, [partyId, currentUser?.uid]);

  // SKTaxi: 알림 음소거 토글
  const handleToggleMute = async () => {
    if (!partyId || !currentUser?.uid) return;
    
    try {
      const settingsRef = doc(collection(firestore(getApp()), 'chats', partyId, 'notificationSettings'), currentUser.uid);
      const newMutedState = !isChatMuted;
      
      await setDoc(settingsRef, {
        muted: newMutedState,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      
      setIsChatMuted(newMutedState);
    } catch (error) {
      console.error('알림 설정 업데이트 실패:', error);
      Alert.alert('오류', '알림 설정 변경에 실패했습니다.');
    }
  };

  // SKTaxi: 파티 상태가 "arrived"일 때 정산 현황 초기화
  useEffect(() => {
    if (currentParty?.status === 'arrived' && memberUids.length > 0) {
      if (currentParty.settlement) {
        // SKTaxi: 서버에서 정산 현황 가져오기
        const serverSettlementStatus: {[key: string]: boolean} = {};
        Object.keys(currentParty.settlement.members).forEach(memberId => {
          serverSettlementStatus[memberId] = currentParty.settlement!.members[memberId].settled;
        });
        setSettlementStatus(serverSettlementStatus);
        setPerPersonAmount(currentParty.settlement.perPersonAmount);
      } else {
        // SKTaxi: 정산 현황이 없으면 초기화 (모든 멤버를 정산 중으로 설정, 리더는 정산자로 true 설정)
        const initialSettlementStatus: {[key: string]: boolean} = {};
        memberUids.forEach(memberId => {
          // SKTaxi: 리더이면서 N빵 인원에 포함된 경우 정산 완료로 처리
          const isLeader = memberId === currentParty?.leaderId;
          initialSettlementStatus[memberId] = isLeader;
        });
        setSettlementStatus(initialSettlementStatus);
      }
      setIsNoticeBarMinimized(false);
      
      // SKTaxi: 정산 현황 바 애니메이션 초기화
      noticeBarHeight.value = withTiming(52, { duration: 300 });
      settlementListOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [currentParty?.status, currentParty?.settlement, memberUids, currentParty?.leaderId]);

  // SKTaxi: settlementStatus가 변경될 때마다 높이 업데이트
  useEffect(() => {
    if (currentParty?.status === 'arrived' && Object.keys(settlementStatus).length > 0) {
      const memberCount = Object.keys(settlementStatus).length;
      const dynamicHeight = calculateNoticeBarHeight(memberCount);
      noticeBarHeight.value = withTiming(dynamicHeight, { duration: 300 });
    }
  }, [settlementStatus, currentParty?.status]);

  // SKTaxi: end 메시지가 있는지 확인하여 동승 종료 상태 설정
  useEffect(() => {
    const hasEndMessage = messages.some(message => message.type === 'end');
    setIsPartyEnded(hasEndMessage);
  }, [messages]);

  // SKTaxi: paddingBottom을 포함한 스크롤 함수
  const scrollToEndWithPadding = (animated: boolean = true) => {
    const paddingBottom = 16; // messageList의 paddingBottom 값
    if (contentHeightRef.current > 0) {
      flatListRef.current?.scrollToOffset({
        offset: contentHeightRef.current + paddingBottom,
        animated,
      });
    } else {
      // contentHeight가 아직 측정되지 않았으면 fallback으로 scrollToEnd 사용
      flatListRef.current?.scrollToEnd({ animated });
    }
  };

  // SKTaxi: 메시지가 추가될 때마다 스크롤을 맨 아래로
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        scrollToEndWithPadding(true);
      }, 1000);
    }
  }, [messages.length]);

  // SKTaxi: 강퇴 클라이언트 감지 - 내 uid가 members에서 사라지면 방에서 나가기
  useEffect(() => {
    if (!currentParty || !currentUser?.uid) return;
    
    // SKTaxi: 파티가 한 번도 보인 적이 없으면 (초기 로딩) 체크하지 않음
    if (!seenPartyRef.current) return;
    
    const members: string[] = Array.isArray(currentParty.members) ? currentParty.members : [];
    const stillMember = members.includes(currentUser.uid);
    if (!stillMember && !kickHandledRef.current && !selfLeaveRef.current) {
      kickHandledRef.current = true;
      Alert.alert('알림', '리더가 나를 강퇴했어요.');
      navigation.popToTop();
    }
  }, [currentParty?.members, currentUser?.uid]);

  // SKTaxi: 파티 존재 감지 (한 번이라도 파티가 렌더되면 플래그 세팅)
  useEffect(() => {
    if (currentParty) {
      seenPartyRef.current = true;
    }
  }, [currentParty]);

  // SKTaxi: 동승 요청 목록 로드 (리더만)
  useEffect(() => {
    if (!isLeader || !partyId) return;
    
    const unsubscribe = loadJoinRequests();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isLeader, partyId]);

//   // SKTaxi: 파티 삭제 클라이언트 감지 - 이전에 존재했던 파티가 사라지면(리더가 아닌 경우) 방에서 나가기
//   useEffect(() => {
//     if (currentParty) { deleteHandledRef.current = false; return; }
//     if (!currentUser?.uid) return;
//     // 리더는 삭제 트리거를 직접 실행하므로 중복 알림 방지
//     if (isLeader) return;
//     // 파티가 한 번도 보인 적이 없다면(초기 로딩) 알림 금지
//     if (!seenPartyRef.current) return;
//     if (!deleteHandledRef.current) {
//       deleteHandledRef.current = true;
//       Alert.alert('알림', '리더가 파티를 해체했어요!');
//       //navigation.popToTop();
//     }
//   }, [currentParty, isLeader, currentUser?.uid]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // SKTaxi: 멤버 강퇴 처리
  const handleKick = async (memberId: string, displayName: string) => {
    if (!partyId || !currentParty || !isLeader) return;
    if (memberId === currentParty.leaderId) return;
    Alert.alert(
      '멤버 강퇴',
      `${displayName}님을 강퇴할까요?`,
      [
        { text: '취소', style: 'cancel' },
        { text: '강퇴', style: 'destructive', onPress: async () => {
            try {
              await updateDoc(doc(collection(firestore(getApp()), 'parties'), partyId), {
                members: arrayRemove(memberId),
                updatedAt: firestore.FieldValue.serverTimestamp(),
              });
              await sendSystemMessage(partyId, `${displayName}님이 강퇴되었어요.`);
            } catch (error) {
              console.error('멤버 강퇴 실패:', error);
              Alert.alert('오류', '멤버 강퇴에 실패했어요.');
            }
          } },
      ]
    );
  };

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

  // SKTaxi: 동승 요청 목록 가져오기
  const loadJoinRequests = () => {
    if (!partyId || !isLeader) return;
    
    setJoinRequestsLoading(true);
    try {
      const joinRequestsQuery = query(
        collection(firestore(getApp()), 'joinRequests'),
        where('partyId', '==', partyId),
        where('status', '==', 'pending'),
        orderBy('createdAt', 'desc')
      );
      
      const unsubscribe = onSnapshot(joinRequestsQuery, (snapshot: any) => {
        try {
          if (snapshot) {
            const requests = snapshot.docs.map((docSnap: any) => ({
              id: docSnap.id,
              ...docSnap.data()
            }));
            setJoinRequests(requests);
          } else {
            setJoinRequests([]);
          }
        } catch (error) {
          console.error('동승 요청 데이터 처리 실패:', error);
          setJoinRequests([]);
        }
        setJoinRequestsLoading(false);
      }, (error) => {
        console.error('동승 요청 구독 실패:', error);
        setJoinRequests([]);
        setJoinRequestsLoading(false);
      });
      
      return unsubscribe;
    } catch (error) {
      console.error('동승 요청 목록 로드 실패:', error);
      setJoinRequestsLoading(false);
    }
  };

  // SKTaxi: 동승 요청 승인
  const handleAcceptJoin = async (requestId: string, requesterId: string) => {
    try {
      // joinRequests 상태를 accepted로 변경
      await updateDoc(doc(collection(firestore(getApp()), 'joinRequests'), requestId), { 
        status: 'accepted' 
      });
      
      // parties 컬렉션의 members 배열에 requesterId 추가
      await updateDoc(doc(collection(firestore(getApp()), 'parties'), partyId), {
        members: arrayUnion(requesterId),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // Analytics: 동승 요청 승인 이벤트 로깅
      await logEvent('party_join_accepted', {
        party_id: partyId,
        request_id: requestId,
      });

      // 시스템 메시지 전송
      const requesterName = displayNameMap[requesterId] || '익명';
      await sendSystemMessage(partyId, `${requesterName}님이 파티에 합류했어요.`);
      
      Alert.alert('성공', '동승 요청을 승인했습니다.');
    } catch (error) {
      console.error('동승 요청 승인 실패:', error);
      Alert.alert('오류', '동승 요청 승인에 실패했습니다.');
    }
  };

  // SKTaxi: 동승 요청 거절
  const handleDeclineJoin = async (requestId: string) => {
    try {
      await updateDoc(doc(collection(firestore(getApp()), 'joinRequests'), requestId), { 
        status: 'declined' 
      });
      
      Alert.alert('성공', '동승 요청을 거절했습니다.');
    } catch (error) {
      console.error('동승 요청 거절 실패:', error);
      Alert.alert('오류', '동승 요청 거절에 실패했습니다.');
    }
  };

  // SKTaxi: 텍스트 입력 뷰 클릭 시 스크롤을 맨 아래로
  const handleInputFocus = () => {
    setTimeout(() => {
      scrollToEndWithPadding(true);
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
      scrollToEndWithPadding(true);
    }, 100);
  };

  // SKTaxi: 계좌 정보 로드
  const loadUserAccount = async () => {
    if (!currentUser?.uid) return;
    
    setAccountLoading(true);
    try {
      const userDoc = await getDoc(doc(collection(firestore(getApp()), 'users'), currentUser.uid));
      const userData = userDoc.data() as { account?: any } | undefined;
      const account = userData?.account;
      
      if (account && (account.bankName || account.accountNumber || account.accountHolder)) {
        setUserAccount(account);
        // SKTaxi: 수정 폼 기본값 초기화
        setTempBankName(account.bankName || '');
        setTempAccountNumber(account.accountNumber || '');
        setTempAccountHolder(account.accountHolder || '');
        setTempHideName(account.hideName || false);
        setRememberAccount(true);
      } else {
        setUserAccount(null);
        // 비등록 상태 초기화
        setTempBankName('');
        setTempAccountNumber('');
        setTempAccountHolder('');
        setTempHideName(false);
        setRememberAccount(false);
      }
    } catch (error) {
      console.error('계좌 정보 로드 실패:', error);
      setUserAccount(null);
    } finally {
      setAccountLoading(false);
    }
  };

  // SKTaxi: 계좌 정보 전송
  const sendAccountInfo = async () => {
    if (!currentUser?.uid || !partyId) return;
    
    let bankName = '';
    let accountNumber = '';
    let accountHolder = '';
    let hideName = false;
    
    if (userAccount && !editingAccountInline) {
      // 등록된 계좌 정보가 있는 경우
      bankName = userAccount.bankName;
      accountNumber = userAccount.accountNumber;
      accountHolder = userAccount.accountHolder || '';
      hideName = userAccount.hideName || false;
    } else {
      // 임시 입력된 계좌 정보
      if (!tempBankName || !tempAccountNumber || !tempAccountHolder) {
        Alert.alert('알림', '은행명, 계좌번호, 예금주명을 입력해주세요.');
        return;
      }
      bankName = tempBankName;
      accountNumber = tempAccountNumber;
      accountHolder = tempAccountHolder || '';
      hideName = tempHideName;
    }
    
    try {
      // useMessages의 sendAccountMessage 함수 사용
      await sendAccountMessage(partyId, {
        bankName,
        accountNumber,
        accountHolder,
        hideName,
      });
      
      setShowAccountModal(false);
      
      // 기억하기 체크박스가 체크된 경우 Firestore에 저장/업데이트
      if (rememberAccount && tempBankName && tempAccountNumber) {
        firestore(getApp()).collection('users').doc(currentUser.uid).set({
          account: {
            bankName: tempBankName,
            accountNumber: tempAccountNumber,
            accountHolder: tempAccountHolder || '',
            hideName: tempHideName,
          }
        }, { merge: true });
      }
    } catch (error) {
      console.error('계좌 정보 전송 실패:', error);
      Alert.alert('오류', '계좌 정보 전송에 실패했습니다.');
    }
  };

  // SKTaxi: 도착 확인 함수
  const handleArrivalConfirm = () => {
    Alert.alert(
      '도착 확인',
      '택시가 목적지에 도착했나요?',
      [
        { text: '아니오', style: 'cancel' },
        { 
          text: '예', 
          onPress: async () => {
            try {
              // SKTaxi: 사용자 계좌 정보 로드
              const user = auth(getApp()).currentUser;
              if (!user) return;

              const userDoc = await firestore(getApp()).collection('users').doc(user.uid).get();
              const userData = userDoc.data();
              
              // SKTaxi: 도착 모달용 계좌정보 초기화
              if (userData?.account) {
                setArrivalBankName(userData.account.bankName || '');
                setArrivalAccountNumber(userData.account.accountNumber || '');
                setArrivalAccountHolder(userData.account.accountHolder || '');
                setArrivalHideName(userData.account.hideName || false);
                setRememberArrivalAccount(true); // 기존 계좌정보가 있으면 기억하기 체크
              } else {
                setArrivalBankName('');
                setArrivalAccountNumber('');
                setArrivalAccountHolder('');
                setArrivalHideName(false);
                setRememberArrivalAccount(false); // 기존 계좌정보가 없으면 기억하기 해제
              }

              // SKTaxi: N빵할 사람 초기값을 모든 멤버로 설정
              setSelectedMembers(memberUids);

              setShowArrivalModal(true);
              
              // SKTaxi: 모달이 열린 후 택시비 입력에 포커스
              setTimeout(() => {
                arrivalTaxiFareRef.current?.focus();
              }, 300); // 모달 애니메이션 완료 후 포커스
            } catch (error) {
              console.error('SKTaxi: 계좌 정보 로드 중 오류:', error);
              setShowArrivalModal(true);
              
              // SKTaxi: 에러 케이스에서도 포커스
              setTimeout(() => {
                arrivalTaxiFareRef.current?.focus();
              }, 300);
            }
          }
        }
      ]
    );
  };

  // SKTaxi: 도착 확정 함수
  const handleArrivalSubmit = async () => {
    if (!currentUser?.uid || !partyId || !taxiFare || selectedMembers.length === 0) {
      Alert.alert('알림', '택시비와 N빵할 사람을 모두 입력해주세요.');
      return;
    }

    const fare = parseInt(taxiFare);
    if (isNaN(fare) || fare <= 0) {
      Alert.alert('알림', '올바른 택시비를 입력해주세요.');
      return;
    }

    const perPerson = Math.floor(fare / selectedMembers.length);
    const leaderName = currentUser.displayName || '리더';

    try {
      // 도착 메시지 전송
      const arrivalMessageData = {
        taxiFare: fare,
        perPerson,
        memberCount: selectedMembers.length,
        bankName: arrivalBankName,
        accountNumber: arrivalAccountNumber,
        accountHolder: arrivalAccountHolder,
        hideName: arrivalHideName,
      };

      await sendArrivedMessage(partyId, arrivalMessageData);

      // SKTaxi: 계좌 정보를 기억하기가 체크되어 있으면 서버에 저장
      if (rememberArrivalAccount && arrivalBankName && arrivalAccountNumber && arrivalAccountHolder) {
        try {
          await firestore(getApp()).collection('users').doc(currentUser.uid).set({
            account: {
              bankName: arrivalBankName,
              accountNumber: arrivalAccountNumber,
              accountHolder: arrivalAccountHolder,
              hideName: arrivalHideName,
            }
          }, { merge: true });
        } catch (error) {
          console.error('SKTaxi: 계좌 정보 저장 중 오류:', error);
        }
      }

      // SKTaxi: 정산 현황 초기화 (리더는 자동으로 정산 완료 처리)
      const initialSettlementStatus: {[key: string]: boolean} = {};
      const settlementMembers: {[key: string]: {settled: boolean; settledAt?: any}} = {};
      
      selectedMembers.forEach(memberId => {
        // SKTaxi: 리더이면서 N빵 인원에 포함된 경우 정산 완료로 처리
        const isLeader = memberId === currentParty?.leaderId;
        initialSettlementStatus[memberId] = isLeader;
        
        // SKTaxi: settledAt은 settled가 true일 때만 포함
        const memberData: {settled: boolean; settledAt?: any} = {
          settled: isLeader
        };
        if (isLeader) {
          memberData.settledAt = firestore.FieldValue.serverTimestamp();
        }
        settlementMembers[memberId] = memberData;
      });

      // SKTaxi: 파티 상태를 "arrived"로 변경하고 정산 현황 저장 (merge로 전체 구조 안전 갱신)
      await setDoc(doc(collection(firestore(getApp()), 'parties'), partyId), {
        status: 'arrived',
        settlement: {
          status: 'pending',
          perPersonAmount: perPerson,
          members: settlementMembers
        },
        updatedAt: firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

        setSettlementStatus(initialSettlementStatus);
        setIsNoticeBarMinimized(false);
        
        // SKTaxi: 정산 현황 바 애니메이션 초기화 (동적 높이 계산)
        const dynamicHeight = calculateNoticeBarHeight(selectedMembers.length);
        noticeBarHeight.value = withTiming(dynamicHeight, { duration: 300 });
        settlementListOpacity.value = withTiming(1, { duration: 300 });

      setShowArrivalModal(false);
      setTaxiFare('');
      setSelectedMembers([]);
      
      // SKTaxi: 도착 모달용 계좌정보 상태 초기화
      setArrivalBankName('');
      setArrivalAccountNumber('');
      setArrivalAccountHolder('');
      setArrivalHideName(false);
      setShowArrivalBankDropdown(false);
      setRememberArrivalAccount(false);
    } catch (error) {
      console.error('도착 메시지 전송 실패:', error);
      Alert.alert('오류', '도착 메시지 전송에 실패했습니다.');
    }
  };

  // SKTaxi: 멤버 선택 토글
  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  // SKTaxi: 정산 완료 처리
  const handleSettlementComplete = async (memberId: string, memberName: string) => {
    Alert.alert(
      '정산 확인',
      `${memberName}님이 돈을 송금했나요?`,
      [
        { text: '아니오', style: 'cancel' },
        { 
          text: '예', 
          onPress: async () => {
            try {
              // SKTaxi: 서버에 정산 완료 상태 업데이트
              const partyRef = doc(collection(firestore(getApp()), 'parties'), partyId);
              await updateDoc(partyRef, {
                [`settlement.members.${memberId}.settled`]: true,
                [`settlement.members.${memberId}.settledAt`]: firestore.FieldValue.serverTimestamp(),
                updatedAt: firestore.FieldValue.serverTimestamp(),
              });

              // SKTaxi: 로컬 상태 업데이트
              setSettlementStatus(prev => ({
                ...prev,
                [memberId]: true
              }));
            } catch (error) {
              console.error('SKTaxi: 정산 완료 처리 중 오류:', error);
              Alert.alert('오류', '정산 완료 처리 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  };

  // SKTaxi: 동승 종료 처리
  const handlePartyEnd = async () => {
    const allSettled = Object.values(settlementStatus).every(status => status);
    const unsettledMembers = Object.keys(settlementStatus).filter(memberId => !settlementStatus[memberId]);
    
    if (allSettled) {
      Alert.alert(
        '동승 종료',
        '동승 파티를 종료할까요?',
        [
          { text: '아니오', style: 'cancel' },
          { 
            text: '예', 
            onPress: async () => {
              try {
                // SKTaxi: 정산 상태를 완료로 업데이트
                const partyRef = doc(collection(firestore(getApp()), 'parties'), partyId);
                await updateDoc(partyRef, {
                  'settlement.status': 'completed',
                  updatedAt: firestore.FieldValue.serverTimestamp(),
                });
                
                // SKTaxi: 정산 완료 후 파티를 종료 상태로 전환 (하드 삭제 대신 소프트 삭제)
                await updateDoc(partyRef, {
                  status: 'ended',
                  endReason: 'arrived',
                  endedAt: firestore.FieldValue.serverTimestamp(),
                  updatedAt: firestore.FieldValue.serverTimestamp(),
                });
                setIsPartyEnded(true);
                setShowMenu(false);
                await sendEndMessage(partyId, true);
              } catch (error) {
                console.error('SKTaxi: 정산 상태 업데이트 중 오류:', error);
                Alert.alert('오류', '정산 상태 업데이트 중 오류가 발생했습니다.');
              }
            }
          }
        ]
      );
    } else {
      const unsettledNames = unsettledMembers.map(memberId => displayNameMap[memberId] || '익명').join(', ');
      Alert.alert(
        '동승 종료',
        `${unsettledNames}님이 아직 정산을 안한 것 같아요. 그래도 동승 파티를 종료할까요?`,
        [
          { text: '아니오', style: 'cancel' },
          { 
            text: '예', 
            onPress: async () => {
              try {
                // SKTaxi: 정산 상태를 완료로 업데이트
                const partyRef = doc(collection(firestore(getApp()), 'parties'), partyId);
                await updateDoc(partyRef, {
                  'settlement.status': 'completed',
                  updatedAt: firestore.FieldValue.serverTimestamp(),
                });
                
                // SKTaxi: 일부 미정산 인원이 있어도 파티를 종료 상태로 전환
                await updateDoc(partyRef, {
                  status: 'ended',
                  endReason: 'arrived',
                  endedAt: firestore.FieldValue.serverTimestamp(),
                  updatedAt: firestore.FieldValue.serverTimestamp(),
                });
                setIsPartyEnded(true);
                setShowMenu(false);
                await sendEndMessage(partyId, true);
              } catch (error) {
                console.error('SKTaxi: 정산 상태 업데이트 중 오류:', error);
                Alert.alert('오류', '정산 상태 업데이트 중 오류가 발생했습니다.');
              }
            }
          }
        ]
      );
    }
  };

  // SKTaxi: 메뉴 아이템 클릭 핸들러
  const handleMenuPress = async (type: string) => {
    // console.log(`${type} 선택됨`);
    // setShowMenu(false);

    // // SKTaxi: 메뉴 닫기 애니메이션
    // menuTranslateY.value = withTiming(100, { duration: 300 });
    // menuOpacity.value = withTiming(0, { duration: 300 });

    // SKTaxi: 각 메뉴 아이템별 기능 구현
    try {
      if (type === 'account') {
        // 계좌 정보 모달 열기
        setEditingAccountInline(false); // SKTaxi: 모달 열 때 상태 초기화
        await loadUserAccount();
        setShowAccountModal(true);
      } else if (type === 'taxi') {
        setShowTaxiAppModal(true);
      } else if (type === 'arrive') {
        // 도착 확인
        handleArrivalConfirm();
      } else if (type === 'settlement') {
        // 정산 현황 모달 열기
        setShowSettlementModal(true);
      } else if (type === 'endParty') {
        // 동승 종료
        handlePartyEnd();
      } else if (type === 'close') {
        if (!partyId || !currentUser?.uid || !currentParty) return;

        const isLeader = currentParty.leaderId === currentUser.uid;
        if (!isLeader) {
          Alert.alert('알림', '방장만 모집 상태를 변경할 수 있어요.');
          return;
        }

        // SKTaxi: 상태 토글 (open <-> closed)
        const nextStatus = currentParty.status === 'closed' ? 'open' : 'closed';
        await updateDoc(doc(collection(firestore(getApp()), 'parties'), partyId), {
          status: nextStatus,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

        if (nextStatus === 'closed') {
          await sendSystemMessage(partyId, '파티 모집이 마감되었어요!');
        } else {
          await sendSystemMessage(partyId, '모집을 재개했어요!');
        }
      }
    } catch (error) {
      console.error('handleMenuPress error:', error);
      Alert.alert('오류', '작업 처리 중 문제가 발생했어요.');
    }
  };

  // SKTaxi: 계좌 정보 복사 함수
  const copyAccountInfo = (bankName: string, accountNumber: string) => {
    const accountText = `${bankName} ${accountNumber}`;
    Clipboard.setString(accountText);
    Alert.alert('복사 완료', '계좌 정보가 클립보드에 복사되었습니다.');
  };

  // SKTaxi: 계좌 정보 메시지 렌더링
  const renderAccountMessage = (item: Message) => {
    if (!item.accountData) return null;
    
    const { bankName, accountNumber, accountHolder, hideName } = item.accountData;
    const isMyMessage = item.senderId === currentUser?.uid;
    
    // 예금주명 처리 (hideName이 true면 마스킹)
    const displayName = hideName && accountHolder 
      ? accountHolder.charAt(0) + '*'.repeat(accountHolder.length - 1)
      : accountHolder;
    
    return (
    <View style={[
      styles.messageContainer,
        {outlineWidth: 1, outlineColor: COLORS.accent.green},
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
              onPress={() => copyAccountInfo(bankName, accountNumber)}
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

  // SKTaxi: 동승 종료 메시지 렌더링
  const renderEndMessage = (item: Message) => {
    return (
      <View style={styles.endMessageContainer}>
        <View style={styles.endMessageContent}>
          <Icon name="checkmark-circle" size={20} color={COLORS.accent.green} />
          <Text style={styles.endMessageText}>{item.text}</Text>
        </View>
        <TouchableOpacity 
          style={styles.leaveRoomButton}
          onPress={() => navigation.popToTop()}
        >
          <Text style={styles.leaveRoomButtonText}>방 나가기</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // SKTaxi: 도착 메시지 렌더링
  const renderArrivalMessage = (item: Message) => {
    if (!item.arrivalData) return null;
    
    const { taxiFare, perPerson, memberCount, bankName, accountNumber, accountHolder, hideName } = item.arrivalData;
    const isMyMessage = item.senderId === currentUser?.uid;
    
    // 예금주명 처리 (hideName이 true면 마스킹)
    const displayName = hideName && accountHolder 
      ? accountHolder.charAt(0) + '*'.repeat(accountHolder.length - 1)
      : accountHolder;
    
    return (
      <View style={[
        styles.messageContainer,
        {outlineWidth: 1, outlineColor: COLORS.accent.green},
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
                onPress={() => copyAccountInfo(bankName, accountNumber)}
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

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isMyMessage = item.senderId === currentUser?.uid;
    const isSystemMessage = item.type === 'system';
    const isAccountMessage = item.type === 'account';
    const isArrivalMessage = item.type === 'arrived';
    const isEndMessage = item.type === 'end';
    
    // SKTaxi: 동승 종료 메시지 렌더링
    if (isEndMessage) {
      return renderEndMessage(item);
    }
    
    // SKTaxi: 시스템 메시지 렌더링
    if (isSystemMessage) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      );
    }
    
    // SKTaxi: 계좌 정보 메시지 렌더링
    if (isAccountMessage) {
      return renderAccountMessage(item);
    }
    
    // SKTaxi: 도착 메시지 렌더링
    if (isArrivalMessage) {
      return renderArrivalMessage(item);
    }
    
    // SKTaxi: 일반 메시지 렌더링
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
      
      // 이전 일반 메시지의 인덱스 찾기
      let prevNormalIndex = -1;
      for (let i = index - 1; i >= 0; i--) {
        const msg = messages[i];
        if (msg && msg.id === prevNormalMessage.id) {
          prevNormalIndex = i;
          break;
        }
      }
      
      if (prevNormalIndex === -1) return false;
      
      // 이전 일반 메시지와 현재 메시지 사이에 특수 메시지가 있는지 확인
      for (let i = prevNormalIndex + 1; i < index; i++) {
        const msg = messages[i];
        if (!msg) continue;
        
        // 같은 분이 아니면 더 이상 확인할 필요 없음
        if (!isSameMinute(msg.createdAt, item.createdAt)) {
          break;
        }
        
        // 특수 메시지가 있으면 true
        if (msg.type === 'system' || msg.type === 'account' || msg.type === 'arrived' || msg.type === 'end') {
          return true;
        }
      }
      return false;
    })();
    
    // 그룹의 첫 번째 메시지인지 확인 (같은 사람, 같은 분, 중간에 특수 메시지 없음)
    const isGroupStart = !prevNormalMessage || 
      prevNormalMessage.senderId !== item.senderId || 
      !isSameMinute(prevNormalMessage.createdAt, item.createdAt) ||
      hasSpecialMessageBetween;
    
    // 다음 일반 메시지와 현재 메시지 사이에 특수 메시지가 있는지 확인
    const hasSpecialMessageAfter = (() => {
      if (!nextNormalMessage) return false;
      
      // 다음 일반 메시지의 인덱스 찾기
      let nextNormalIndex = -1;
      for (let i = index + 1; i < messages.length; i++) {
        const msg = messages[i];
        if (msg && msg.id === nextNormalMessage.id) {
          nextNormalIndex = i;
          break;
        }
      }
      
      if (nextNormalIndex === -1) return false;
      
      // 현재 메시지와 다음 일반 메시지 사이에 특수 메시지가 있는지 확인
      for (let i = index + 1; i < nextNormalIndex; i++) {
        const msg = messages[i];
        if (!msg) continue;
        
        // 같은 분이 아니면 더 이상 확인할 필요 없음
        if (!isSameMinute(msg.createdAt, item.createdAt)) {
          break;
        }
        
        // 특수 메시지가 있으면 true
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
    
    // 아바타 텍스트 생성 (이름 첫 글자)
    const avatarText = item.senderName?.[0] || '?';
    
    return (
      <View style={[
        styles.messageWrapper,
        isMyMessage ? styles.myMessageWrapper : styles.otherMessageWrapper,
        !isGroupStart && styles.messageWrapperInGroup // 그룹 내 메시지는 위쪽 간격 축소
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
      // SKTaxi: 직접 나가기 플래그 설정 (강퇴 감지 방지)
      selfLeaveRef.current = true;

      // SKTaxi: 사용자 정보 조회하여 시스템 메시지 전송
      const userDoc = await getDoc(doc(collection(firestore(getApp()), 'users'), currentUser.uid));
      const userData = userDoc.data() as { displayName?: string | null } | undefined;
      const displayName = userData?.displayName || '익명';

      // SKTaxi: 시스템 메시지 전송 (나가기 전에 전송)
      await sendSystemMessage(partyId, `${displayName}님이 파티를 나갔어요.`);

      // SKTaxi: parties.members 배열에서 현재 사용자 제거
      // 자가 나가기 표시를 위한 임시 플래그 추가
      await updateDoc(doc(collection(firestore(getApp()), 'parties'), partyId), {
        members: arrayRemove(currentUser.uid),
        _selfLeaveMemberId: currentUser.uid,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      
      // 플래그 즉시 제거 (Cloud Function 트리거 전에)
      setTimeout(async () => {
        try {
          await updateDoc(doc(collection(firestore(getApp()), 'parties'), partyId), {
            _selfLeaveMemberId: firestore.FieldValue.delete(),
          });
        } catch (error) {
          console.error('자가 나가기 플래그 제거 실패:', error);
        }
      }, 1000);

      // SKTaxi: 해당 파티와 관련된 userNotifications 삭제
      try {
        const notificationsRef = collection(firestore(getApp()), 'userNotifications', currentUser.uid, 'notifications');
        const q = query(notificationsRef, where('data.partyId', '==', partyId));
        const snapshot = await getDocs(q);
        
        // 배치 삭제
        const batch = writeBatch(firestore(getApp()));
        snapshot.forEach((docSnap: any) => {
          batch.delete(docSnap.ref);
        });
        await batch.commit();
      } catch (error) {
        console.error('파티 관련 알림 삭제 실패:', error);
      }

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

  // SKTaxi: 리더 파티 삭제 함수 (소프트 삭제로 변경)
  const handleLeaderDeleteParty = async (isPartyArrived = false) => {
    if (!partyId || !isLeader) return;

    try {
      // SKTaxi: 관련 joinRequests 삭제
      const joinRequestsQuery = query(
        collection(firestore(getApp()), 'joinRequests'),
        where('partyId', '==', partyId)
      );
      const joinRequestsSnapshot = await getDocs(joinRequestsQuery);
      
      // SKTaxi: 모든 관련 joinRequests 삭제
      const deletePromises = joinRequestsSnapshot.docs.map((docSnap: any) => deleteDoc(docSnap.ref));
      await Promise.all(deletePromises);

      // SKTaxi: 파티를 하드 삭제 대신 소프트 삭제로 전환
      const partyRef = doc(collection(firestore(getApp()), 'parties'), partyId);
      await updateDoc(partyRef, {
        status: 'ended',
        endReason: isPartyArrived ? 'arrived' : 'cancelled',
        endedAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });

      // SKTaxi: 동승 종료 메시지 전송
      setIsPartyEnded(true);
      setShowMenu(false);
      await sendEndMessage(partyId, isPartyArrived);
      if (!isPartyArrived) {
        // SKTaxi: 파티 삭제
        setShowSideMenu(false);
        Alert.alert('알림', '파티가 삭제되었습니다.');
      }
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
            onPress: () => handleLeaderDeleteParty(false),
        },
      ]
    );
  };

  const handleShareParty = () => {
    Alert.alert('아직 못해 ㅠ', '파티 공유 기능은 준비중이에요')
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
            {!isPartyEnded ? (
            <View style={styles.sideMenuContent}>
              <View style={styles.memberSection}>
                <Text style={styles.sectionTitle}>참여 멤버 ({memberUids.length}명)</Text>
                <View style={styles.memberList}>
                  {!currentParty ? (
                    <Text style={styles.loadingText}>파티 정보를 불러오는 중...</Text>
                  ) : (
                    memberUids.map((uid) => {
                      const displayName = displayNameMap[uid] || '익명';
                      const isMe = uid === currentUser?.uid;
                      const isLeader = currentParty.leaderId === uid;
                      const initial = displayName.charAt(0).toUpperCase();
                      
                      return (
                        <TouchableOpacity key={uid} style={styles.memberItem} onPress={() => setSelectedMemberId(uid)}>
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
                                {isMe ? 
                                isLeader ? '리더(나)' : '멤버(나)'
                                :
                                isLeader ? '리더' : '멤버'
                                }
                            </Text>
                          </View>
                          {(uid !== currentUser?.uid) && (
                            <View style={{ gap: 8, alignItems: 'flex-start' }}>
                              {/* 모든 사용자에게 노출 (본인 제외) */}
                              <TouchableOpacity style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }} onPress={() => Alert.alert('멤버 정보', displayName)}>
                                <Icon name="information-circle-outline" size={18} color={COLORS.text.secondary} />
                                <Text style={styles.memberRole}>정보보기</Text>
                              </TouchableOpacity>
                              {/* 리더에게만 노출 (리더 본인 제외, 정산 중이 아닐 때만) */}
                              {currentParty.leaderId === currentUser?.uid && currentParty.status !== 'arrived' && (
                                <TouchableOpacity style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }} onPress={() => handleKick(uid, displayName)}>
                                  <Icon name="remove-circle" size={18} color="#FF6B6B" />
                                  <Text style={[styles.memberRole, { color: '#FF6B6B' }]}>강퇴</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          )}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </View>
              <Surface color={COLORS.background.card} height={1} margin={16} />
              <View style={styles.actionSection}>
                {/* SKTaxi: 채팅 알림 토글 */}
                <TouchableOpacity style={styles.actionButton} onPress={handleToggleMute}>
                  <Icon 
                    name={isChatMuted ? "notifications-off" : "notifications"} 
                    size={20} 
                    color={isChatMuted ? COLORS.text.secondary : COLORS.accent.green} 
                  />
                  <Text style={[styles.actionButtonText, isChatMuted && styles.mutedText]}>
                    채팅 알림 {isChatMuted ? '해제됨' : '켜기'}
                  </Text>
                </TouchableOpacity>
                {/* 동승요청 온 내역 볼 수 있는 기능 */}
                <TouchableOpacity style={styles.actionButton} onPress={() => handleShareParty()}>
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
            ) : (
                <TouchableOpacity 
                    style={[styles.actionButton, { margin: 20 }]}
                    onPress={() => navigation.popToTop()}
                >
                    <Icon name="exit" size={20} color="#FF6B6B" />
                    <Text style={[styles.actionButtonText, { color: '#FF6B6B' }]}>나가기</Text>
                </TouchableOpacity>
            )}
          </Animated.View>
        )}
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
        
      <Animated.View style={[styles.container, screenAnimatedStyle]}>
       {currentParty?.status === 'arrived' && (
         <Animated.View style={[styles.topNoticeBar, animatedNoticeBarStyle]}>
           <TouchableOpacity style={styles.noticeBarContent} onPress={() => setShowSettlementModal(true)}>
             <Text style={styles.noticeBarTitle}>정산 현황</Text>
             <Animated.View style={[styles.settlementList, animatedSettlementListStyle]}>
              {Object.keys(settlementStatus)
                .sort((a, b) => {
                  // SKTaxi: 리더를 맨 앞에, 나머지는 이름순 정렬
                  const aIsLeader = a === currentParty?.leaderId;
                  const bIsLeader = b === currentParty?.leaderId;
                  
                  if (aIsLeader && !bIsLeader) return -1;
                  if (!aIsLeader && bIsLeader) return 1;
                  
                  // 리더가 아닌 경우 이름순 정렬
                  const aName = displayNameMap[a] || '익명';
                  const bName = displayNameMap[b] || '익명';
                  return aName.localeCompare(bName);
                })
                .map((memberId) => {
                const displayName = displayNameMap[memberId] || '익명';
                const isSettled = settlementStatus[memberId];
                const isMe = memberId === currentUser?.uid;
                const isLeader = memberId === currentParty?.leaderId;
                
                return (
                  <View key={memberId} style={styles.settlementItem}>
                    <Icon 
                      name={isLeader ? "flag" : (isSettled ? "checkbox" : "square-outline")} 
                      size={16} 
                      color={isLeader ? COLORS.accent.green : (isSettled ? COLORS.accent.green : COLORS.text.secondary)} 
                    />
                    <Text style={[styles.settlementText, isSettled && styles.settlementTextCompleted, isMe && {fontWeight: '700'}]}>
                      {displayName}님 {isLeader ? '정산자' : `${perPersonAmount.toLocaleString()}원 ${isSettled ? '송금완료' : '송금 중'}`}{isMe && ' (나)'}
                    </Text>
                  </View>
                );
              })}
             </Animated.View>
           </TouchableOpacity>
           <TouchableOpacity 
             style={styles.noticeBarToggle}
             onPress={() => {
               const newMinimized = !isNoticeBarMinimized;
               setIsNoticeBarMinimized(newMinimized);
               
               // SKTaxi: 애니메이션 적용 (동적 높이 계산)
               const memberCount = Object.keys(settlementStatus).length;
               if (newMinimized) {
                 noticeBarHeight.value = withTiming(52, { duration: 300 });
                 settlementListOpacity.value = withTiming(0, { duration: 300 });
               } else {
                 const dynamicHeight = calculateNoticeBarHeight(memberCount);
                 noticeBarHeight.value = withTiming(dynamicHeight, { duration: 300 });
                 settlementListOpacity.value = withTiming(1, { duration: 300 });
               }
             }}
           >
             <Icon 
               name={isNoticeBarMinimized ? "chevron-down" : "chevron-up"} 
               size={20} 
               color={COLORS.text.secondary} 
             />
           </TouchableOpacity>
         </Animated.View>
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
            {/* SKTaxi: 동승 요청 섹션 (리더만) */}
            {isLeader && joinRequests.length > 0 && (
              <View style={styles.joinRequestsSection}>
                <TouchableOpacity 
                  style={styles.joinRequestsHeader}
                  onPress={() => setShowJoinRequests(!showJoinRequests)}
                >
                  <View style={styles.joinRequestsHeaderLeft}>
                    <Icon name="people" size={20} color={COLORS.accent.blue} />
                    <Text style={styles.joinRequestsTitle}>
                      동승 요청 ({joinRequests.length})
                    </Text>
                  </View>
                  <Icon 
                    name={showJoinRequests ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color={COLORS.text.secondary} 
                  />
                </TouchableOpacity>
                
                {showJoinRequests && (
                  <View style={styles.joinRequestsList}>
                    {joinRequests.map((request) => {
                      const requesterName = displayNameMap[request.requesterId] || '익명';
                      return (
                        <View key={request.id} style={styles.joinRequestItem}>
                          <View style={styles.joinRequestInfo}>
                            <Text style={styles.joinRequestName}>{requesterName} 님</Text>
                            <Text style={styles.joinRequestTime}>
                              {request.createdAt?.toDate?.()?.toLocaleString() || '방금 전'}
                            </Text>
                          </View>
                          <View style={styles.joinRequestActions}>
                            <TouchableOpacity
                              style={[styles.joinRequestButton, styles.acceptButton]}
                              onPress={() => handleAcceptJoin(request.id, request.requesterId)}
                            >
                              <Text style={styles.acceptButtonText}>승인</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[styles.joinRequestButton, styles.declineButton]}
                              onPress={() => handleDeclineJoin(request.id)}
                            >
                              <Text style={styles.declineButtonText}>거절</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            )}
            
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={item => item.id || ''}
              contentContainerStyle={styles.messageList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={(width, height) => {
                contentHeightRef.current = height;
                scrollToEndWithPadding(true);
              }}
            />
          </>
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
                    {isLeader && (
                        <>
                    {currentParty?.status !== 'arrived' ? (
                      <View style={styles.menuItemWrapper}>
                        <TouchableOpacity 
                          style={styles.menuItem} 
                          onPress={() => handleMenuPress('close')}
                        >
                          <Icon name={currentParty?.status === 'closed' ? 'refresh-circle' : 'close-circle'} size={32} color={COLORS.accent.green} />
                        </TouchableOpacity>
                        <Text style={styles.menuItemText}>{currentParty?.status === 'closed' ? '모집재개' : '모집마감'}</Text>
                      </View>
                    ) : (
                      <View style={styles.menuItemWrapper}>
                        <TouchableOpacity 
                          style={styles.menuItem} 
                          onPress={() => handleMenuPress('settlement')}
                        >
                          <Icon name="receipt" size={32} color={COLORS.accent.blue} />
                        </TouchableOpacity>
                        <Text style={styles.menuItemText}>정산현황</Text>
                      </View>
                    )}
                    <View style={styles.menuItemWrapper}>
                      <TouchableOpacity 
                        style={styles.menuItem} 
                        onPress={() => handleMenuPress(currentParty?.status === 'arrived' ? 'endParty' : 'arrive')}
                      >
                        <Icon name={currentParty?.status === 'arrived' ? "log-out" : "checkmark-circle"} size={32} color={currentParty?.status === 'arrived' ? COLORS.accent.red : COLORS.accent.green} />
                      </TouchableOpacity>
                      <Text style={styles.menuItemText}>{currentParty?.status === 'arrived' ? '동승종료' : '도착'}</Text>
                    </View>
                    </>
                )}
                  </Animated.View>
                )}
      <View style={styles.inputContainer}>
                    {!isPartyEnded && (
                        <TouchableOpacity style={styles.plusButton} onPress={handlePlusPress}>
                            {showMenu ? (
                                <Icon name="close-outline" size={24} color={COLORS.text.primary} />
                            ) : (
                                <Icon name="add" size={24} color={COLORS.text.primary} />
                            )}
                        </TouchableOpacity>
                    )}
        <TextInput
          style={[styles.input, isPartyEnded && styles.disabledInput]}
          value={message}
          onChangeText={setMessage}
          placeholder={isPartyEnded ? "동승이 종료된 채팅방입니다" : "메시지를 입력하세요"}
          placeholderTextColor={COLORS.text.disabled}
          multiline
          editable={!isPartyEnded}
          onFocus={handleInputFocus}
        />
                    <Button 
                        title="전송" 
                        onPress={handleSend} 
                        disabled={isPartyEnded}
                        style={{
                            height: 40, 
                            borderRadius: 16,
                            opacity: isPartyEnded ? 0.5 : 1
                        }} 
                    />
      </View>
      </Animated.View>
    </KeyboardAvoidingView>
        
        {/* SKTaxi: 계좌 정보 모달 */}
        <Modal
          visible={showAccountModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowAccountModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
                <View style={styles.accountModalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>계좌 정보</Text>
                <TouchableOpacity onPress={() => setShowAccountModal(false)}>
                  <Icon name="close" size={24} color={COLORS.text.primary} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.modalBody}>
                {accountLoading ? (
                  <Text style={styles.loadingText}>계좌 정보를 불러오는 중...</Text>
                ) : (userAccount && !editingAccountInline) ? (
                  // 등록된 계좌 정보가 있고 수정 모드가 아닌 경우
                  <View>
                    <View style={styles.accountInfoItem}>
                      <Text style={styles.accountInfoLabel}>은행명</Text>
                      <Text style={styles.accountInfoValue}>{userAccount.bankName}</Text>
                    </View>
                    <View style={styles.accountInfoItem}>
                      <Text style={styles.accountInfoLabel}>계좌번호</Text>
                      <Text style={styles.accountInfoValue}>{userAccount.accountNumber}</Text>
                    </View>
                    {userAccount.hideName && userAccount.accountHolder && (
                      <View style={styles.accountInfoItem}>
                        <Text style={styles.accountInfoLabel}>예금주</Text>
                        <Text style={styles.accountInfoValue}>{userAccount.accountHolder}</Text>
                      </View>
                    )}
                    
                    <View style={styles.modalButtonContainer}>
                      <TouchableOpacity 
                        style={[styles.modalButton, styles.modalEditButton, {flex: 1}]}
                        onPress={() => {
                          // SKTaxi: 모달 내 인라인 수정 폼으로 전환 및 기본값 유지
                          setEditingAccountInline(true);
                          setRememberAccount(true);
                        }}
                      >
                        <Text style={styles.modalEditButtonText}>수정하기</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.modalButton, styles.modalSendButton, {flex: 1}]}
                        onPress={sendAccountInfo}
                      >
                        <Text style={styles.modalSendButtonText}>전송하기</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  // 계좌 정보가 등록되지 않았거나 수정 모드인 경우
                  <View>
                    <View style={styles.bankInputContainer}>
                      <View style={[styles.inputGroup, { flex: 3.33 }]}>
                        <Text style={styles.inputLabel}>은행명</Text>
                        <TouchableOpacity 
                          style={styles.bankSelectButton}
                          onPress={() => setShowBankDropdown(!showBankDropdown)}
                        >
                          <Text style={[styles.bankSelectText, !tempBankName && { color: COLORS.text.disabled }]}>
                            {tempBankName || '은행 선택'}
                          </Text>
                          <Icon name="chevron-down" size={18} color={COLORS.text.secondary} />
                        </TouchableOpacity>
                        {showBankDropdown && (
                          <ScrollView style={styles.bankDropdown}>
                            {BANKS.map((bank) => (
                              <TouchableOpacity
                                key={bank}
                                style={styles.bankOption}
                                onPress={() => {
                                  setTempBankName(bank);
                                  setShowBankDropdown(false);
                                }}
                              >
                                <Text style={styles.bankOptionText}>{bank}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )}
                      </View>
                      
                      <View style={[styles.inputGroup, { flex: 6.66 }]}>
                        <Text style={styles.inputLabel}>계좌번호</Text>
                        <TextInput
                          style={[styles.textInput, {...TYPOGRAPHY.body2}]}
                          value={tempAccountNumber}
                          onChangeText={(text) => setTempAccountNumber((text ?? '').replace(/[^0-9]/g, ''))}
                          placeholder="계좌번호를 입력하세요"
                          placeholderTextColor={COLORS.text.disabled}
                          keyboardType="number-pad"
                        />
                      </View>
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>예금주명 (이름)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={tempAccountHolder}
                        onChangeText={setTempAccountHolder}
                        placeholder="이름을 입력하세요"
                        placeholderTextColor={COLORS.text.disabled}
                      />
                    </View>
                    
                    <TouchableOpacity 
                      style={styles.checkboxContainer}
                      onPress={() => setTempHideName(!tempHideName)}
                    >
                      <Icon 
                        name={tempHideName ? "checkbox" : "square-outline"} 
                        size={20} 
                        color={tempHideName ? COLORS.accent.green : COLORS.text.secondary} 
                      />
                      <Text style={styles.checkboxText}>이름 일부만 공개</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.checkboxContainer}
                      onPress={() => setRememberAccount(!rememberAccount)}
                    >
                      <Icon 
                        name={rememberAccount ? "checkbox" : "square-outline"} 
                        size={20} 
                        color={rememberAccount ? COLORS.accent.green : COLORS.text.secondary} 
                      />
                      <Text style={styles.checkboxText}>계좌 정보를 기억하기</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.modalSendButton, styles.fullWidthButton]}
                      onPress={sendAccountInfo}
                    >
                      <Text style={styles.modalSendButtonText}>전송하기</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        
        {/* SKTaxi: 도착 모달 */}
        <Modal
          visible={showArrivalModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => {
            setShowArrivalModal(false);
            // SKTaxi: 도착 모달용 계좌정보 상태 초기화
            setArrivalBankName('');
            setArrivalAccountNumber('');
            setArrivalAccountHolder('');
            setArrivalHideName(false);
            setShowArrivalBankDropdown(false);
            setRememberArrivalAccount(false);
          }}
        >
          <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
                <View style={styles.accountModalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>도착 확정</Text>
                    <TouchableOpacity onPress={() => {
                      setShowArrivalModal(false);
                      // SKTaxi: 도착 모달용 계좌정보 상태 초기화
                      setArrivalBankName('');
                      setArrivalAccountNumber('');
                      setArrivalAccountHolder('');
                      setArrivalHideName(false);
                      setShowArrivalBankDropdown(false);
                      setRememberArrivalAccount(false);
                    }}>
                      <Icon name="close" size={24} color={COLORS.text.primary} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.modalBody}>
                    <View style={styles.rowContainer}>
                      <View style={[styles.inputGroup, { flex: 3.33 }]}>
                        <Text style={styles.inputLabel}>택시비 (원)</Text>
                        <TextInput
                          ref={arrivalTaxiFareRef}
                          style={styles.textInput}
                          value={taxiFare}
                          onChangeText={(text) => setTaxiFare((text ?? '').replace(/[^0-9]/g, ''))}
                          placeholder="택시비"
                          placeholderTextColor={COLORS.text.disabled}
                          keyboardType="number-pad"
                        />
                      </View>
                      <View style={{ flex: 0.66 }} />
                      
                      <View style={[styles.inputGroup, { flex: 6 }]}>
                        <Text style={styles.inputLabel}>N빵할 사람</Text>
                        <View style={styles.memberSelectionContainer}>
                          {memberUids.map((uid) => {
                            const displayName = displayNameMap[uid] || '익명';
                            const isSelected = selectedMembers.includes(uid);
                            const isMe = uid === currentUser?.uid;
                            
                            return (
                              <TouchableOpacity
                                key={uid}
                                style={[styles.memberSelectionItem, isSelected && styles.memberSelectionItemSelected]}
                                onPress={() => toggleMemberSelection(uid)}
                              >
                                <Icon 
                                  name={isSelected ? "checkbox" : "square-outline"} 
                                  size={16} 
                                  color={isSelected ? COLORS.accent.green : COLORS.text.secondary} 
                                />
                                <Text style={[styles.memberSelectionText, isSelected && styles.memberSelectionTextSelected]}>
                                  {displayName} {isMe && '(나)'}
                                </Text>
                              </TouchableOpacity>
                            );
                          })}
                        </View>
                      </View>
                    </View>
                    
                    {/* 계좌 정보 입력 폼 (기존 계좌 모달과 동일) */}
                    <View style={styles.bankInputContainer}>
                      <View style={[styles.inputGroup, { flex: 3.33 }]}>
                        <Text style={styles.inputLabel}>은행명</Text>
                        <TouchableOpacity 
                          style={styles.bankSelectButton}
                          onPress={() => setShowArrivalBankDropdown(!showArrivalBankDropdown)}
                        >
                          <Text style={[styles.bankSelectText, !arrivalBankName && { color: COLORS.text.disabled }]}>
                            {arrivalBankName || '은행 선택'}
                          </Text>
                          <Icon name="chevron-down" size={18} color={COLORS.text.secondary} />
                        </TouchableOpacity>
                        {showArrivalBankDropdown && (
                          <ScrollView style={styles.bankDropdown}>
                            {BANKS.map((bank) => (
                              <TouchableOpacity
                                key={bank}
                                style={styles.bankOption}
                                onPress={() => {
                                  setArrivalBankName(bank);
                                  setShowArrivalBankDropdown(false);
                                }}
                              >
                                <Text style={styles.bankOptionText}>{bank}</Text>
                              </TouchableOpacity>
                            ))}
                          </ScrollView>
                        )}
                      </View>
                      
                      <View style={[styles.inputGroup, { flex: 6.66 }]}>
                        <Text style={styles.inputLabel}>계좌번호</Text>
                        <TextInput
                          style={styles.textInput}
                          value={arrivalAccountNumber}
                          onChangeText={(text) => setArrivalAccountNumber((text ?? '').replace(/[^0-9]/g, ''))}
                          placeholder="계좌번호를 입력하세요"
                          placeholderTextColor={COLORS.text.disabled}
                          keyboardType="number-pad"
                        />
                      </View>
                    </View>
                    
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>예금주명 (이름)</Text>
                      <TextInput
                        style={styles.textInput}
                        value={arrivalAccountHolder}
                        onChangeText={setArrivalAccountHolder}
                        placeholder="이름을 입력하세요"
                        placeholderTextColor={COLORS.text.disabled}
                      />
                    </View>
                    
                    <TouchableOpacity 
                      style={[styles.checkboxContainer, { marginTop: 8 }]}
                      onPress={() => setArrivalHideName(!arrivalHideName)}
                    >
                      <Icon 
                        name={arrivalHideName ? "checkbox" : "square-outline"} 
                        size={20} 
                        color={arrivalHideName ? COLORS.accent.green : COLORS.text.secondary} 
                      />
                      <Text style={styles.checkboxText}>이름 일부만 공개</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.checkboxContainer}
                      onPress={() => setRememberArrivalAccount(!rememberArrivalAccount)}
                    >
                      <Icon 
                        name={rememberArrivalAccount ? "checkbox" : "square-outline"} 
                        size={20} 
                        color={rememberArrivalAccount ? COLORS.accent.green : COLORS.text.secondary} 
                      />
                      <Text style={styles.checkboxText}>계좌 정보를 기억하기</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                      style={[styles.modalButton, styles.modalSendButton, styles.fullWidthButton]}
                      onPress={handleArrivalSubmit}
                    >
                      <Text style={styles.modalSendButtonText}>도착 확정</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        
        {/* SKTaxi: 정산 현황 모달 */}
        <Modal
          visible={showSettlementModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSettlementModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowSettlementModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {Keyboard.dismiss()}}>
                <View style={styles.settlementModalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>정산 현황 업데이트</Text>
                    <TouchableOpacity onPress={() => setShowSettlementModal(false)}>
                      <Icon name="close" size={24} color={COLORS.text.primary} />
                    </TouchableOpacity>
                  </View>
                  
                  <ScrollView style={[styles.modalBody, {paddingTop: 0}]}>
                    {Object.keys(settlementStatus)
                      .sort((a, b) => {
                        // SKTaxi: 리더를 맨 앞에, 나머지는 이름순 정렬
                        const aIsLeader = a === currentParty?.leaderId;
                        const bIsLeader = b === currentParty?.leaderId;
                        
                        if (aIsLeader && !bIsLeader) return -1;
                        if (!aIsLeader && bIsLeader) return 1;
                        
                        // 리더가 아닌 경우 이름순 정렬
                        const aName = displayNameMap[a] || '익명';
                        const bName = displayNameMap[b] || '익명';
                        return aName.localeCompare(bName);
                      })
                      .map((memberId) => {
                      const displayName = displayNameMap[memberId] || '익명';
                      const isSettled = settlementStatus[memberId];
                      const isMe = memberId === currentUser?.uid;
                      const isLeader = memberId === currentParty?.leaderId;
                      
                      return (
                        <View key={memberId} style={styles.settlementModalItem}>
                          <View style={styles.settlementModalItemLeft}>
                            <Text style={styles.settlementModalName}>
                              {displayName}{isMe && ' (나)'}
                            </Text>
                            <Text style={styles.settlementAmount}>{perPersonAmount.toLocaleString()}원</Text>
                            <Text style={[styles.settlementModalStatus, isSettled && styles.settlementModalStatusCompleted]}>
                              {isLeader ? '정산자' : (isSettled ? '정산 완료' : '정산 중...')}
                            </Text>
                          </View>
                          {!isSettled && !isLeader && (
                            <TouchableOpacity 
                              style={styles.settlementCompleteButton}
                              onPress={() => handleSettlementComplete(memberId, displayName)}
                            >
                              <Text style={styles.settlementCompleteButtonText}>정산완료</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </ScrollView>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
        {/* SKURI: 택시 호출 앱 선택 모달 */}
        <Modal
          visible={showTaxiAppModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowTaxiAppModal(false)}
        >
          <TouchableWithoutFeedback onPress={() => setShowTaxiAppModal(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback onPress={() => {}}>
                <View style={styles.taxiModalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>택시 앱으로 이동</Text>
                    <TouchableOpacity onPress={() => setShowTaxiAppModal(false)}>
                      <Icon name="close" size={24} color={COLORS.text.primary} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.modalBody}>
                    <Text style={styles.taxiAppHint}>원하는 앱을 선택하면 해당 앱으로 이동해요</Text>
                    <View style={styles.taxiAppGrid}>
                      {taxiApps.map(app => (
                        <TouchableOpacity
                        key={app.id}
                        style={styles.taxiAppItem}
                        onPress={() =>
                          openExternalApp(app.scheme, app.iosStore, app.androidStore)
                        }
                        accessibilityLabel={`${app.name} 열기`}
                      >
                        <View style={styles.taxiAppIconContainer}>
                          <Image source={app.icon} style={styles.taxiAppIcon} />
                        </View>
                        <Text style={styles.taxiAppName}>{app.name}</Text>
                      </TouchableOpacity>
                      ))}
                    </View>
                    <TouchableOpacity style={[styles.modalButton, styles.fullWidthButton, styles.modalEditButton]} onPress={() => setShowTaxiAppModal(false)}>
                      <Text style={styles.modalEditButtonText}>취소</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  topNoticeBar: { 
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border.default,
    zIndex: 1000,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    minHeight: 52,
    overflow: 'hidden',
  },
  noticeBarContent: {
    marginVertical: 6,
    flex: 1,
  },
  noticeBarTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  settlementList: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  settlementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
    gap: 4,
  },
  settlementText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  settlementTextCompleted: {
    color: COLORS.accent.green,
    fontWeight: '600',
  },
  noticeBarToggle: {
    padding: 8,
  },
  // SKTaxi: 정산 현황 모달 스타일
  settlementModalContent: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    margin: 20,
    maxHeight: '50%',
    width: WINDOW_WIDTH - 80,
  },
  settlementModalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.dark,
  },
  settlementModalItemLeft: {
    flex: 1,
  },
  settlementModalName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  settlementAmount: {
    ...TYPOGRAPHY.body1,
    color: COLORS.accent.green + '90',
    fontWeight: '700',
    marginBottom: 4,
  },
  settlementModalStatus: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  settlementModalStatusCompleted: {
    color: COLORS.accent.green,
    fontWeight: '600',
  },
  settlementCompleteButton: {
    backgroundColor: COLORS.accent.green,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  settlementCompleteButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.background.primary,
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
  },
  messageList: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  messageWrapper: {
    marginTop: 12,
    width: '100%',
  },
  messageWrapperInGroup: {
    marginTop: 4, // 그룹 내 메시지는 위쪽 간격 축소
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
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    maxWidth: '85%',
    flex: 1,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  messageContainer: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginTop: 12,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.accent.green,
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.background.card,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  timestamp: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.secondary,
    marginHorizontal: 6,
    marginBottom: 2,
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
  // SKTaxi: 동승 종료 메시지 스타일
  endMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.card,
    marginVertical: 8,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  endMessageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  endMessageText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    marginLeft: 8,
  },
  leaveRoomButton: {
    backgroundColor: COLORS.accent.red,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  leaveRoomButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.background.white,
    fontWeight: '600',
  },
  disabledInput: {
    opacity: 0.5,
    backgroundColor: COLORS.background.card,
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
    width: '70%',
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
  },
  sectionTitle: {
    ...TYPOGRAPHY.title4,
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  memberList: {
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
  mutedText: {
    color: COLORS.text.secondary,
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginTop: 16,
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
  // SKTaxi: 계좌 정보 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  accountModalContent: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  modalTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
    maxHeight: WINDOW_HEIGHT - 80,
  },
  accountInfoItem: {
    marginBottom: 16,
  },
  accountInfoLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  accountInfoValue: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalEditButton: {
    backgroundColor: COLORS.background.card,
  },
  modalEditButtonText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  modalSendButton: {
    backgroundColor: COLORS.accent.green,
  },
  modalSendButtonText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.buttonText,
    fontWeight: '600',
  },
  taxiModalContent: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    width: '100%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  taxiAppHint: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: 24,
  },
  taxiAppGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  taxiAppItem: {
    width: (WINDOW_WIDTH - (20 * 4) - (12 * 2) ) / 3, // modalOverlay padding 좌우 20, modalbody padding 좌우 20, gap 12 기준 3열
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.background.card,
  },
  taxiAppIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    overflow: 'hidden',
  },
  taxiAppIcon: {
    width: '100%',
    height: '100%',
  },
  taxiAppName: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  fullWidthButton: {
    marginTop: 16,
  },
  inputGroup: {
    marginBottom: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
  },
  bankInputContainer: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  inputLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  bankSelectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: COLORS.background.card,
    position: 'relative',
    minHeight: 44,
  },
  bankSelectText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
  },
  bankDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 250,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 8,
    backgroundColor: COLORS.background.card,
    marginTop: 4,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bankOption: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.dark,
  },
  bankOptionText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: COLORS.background.card,
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    minHeight: 44,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  checkboxText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
  },
  // SKTaxi: 계좌 정보 메시지 스타일
  accountMessageContainer: {
    borderRadius: 12,
    padding: 0,
    marginVertical: 4,
  },
  accountMessageTitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: 12,
  },
  accountInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accountInfoTextContainer: {
    flex: 1,
  },
  accountInfo: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountHolder: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    marginLeft: 12,
  },
  // SKTaxi: 도착 메시지 스타일
  arrivalMessageContainer: {
    padding: 10,
  },
  arrivalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrivalMessageTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.accent.green,
    marginLeft: 8,
    fontWeight: '700',
  },
  arrivalInfoSection: {
    marginBottom: 16,
  },
  arrivalInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  arrivalInfoItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  arrivalInfoLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginBottom: 4,
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
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.accent.green + '10',
    borderRadius: 12,
  },
  arrivalCalculationText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    marginRight: 8,
  },
  arrivalPerPersonAmount: {
    ...TYPOGRAPHY.title2,
    color: COLORS.accent.green,
    fontWeight: '800',
  },
  arrivalInstructionText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  arrivalAccountSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    paddingTop: 16,
  },
  arrivalAccountSectionTitle: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: 12,
    fontWeight: '600',
  },
  arrivalAccountInfoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
  },
  arrivalAccountInfoTextContainer: {
    flex: 1,
  },
  arrivalAccountAmount: {
    ...TYPOGRAPHY.title3,
    color: COLORS.accent.green,
    fontWeight: '800',
    marginBottom: 6,
  },
  arrivalAccountInfo: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  arrivalAccountHolder: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  arrivalCopyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.accent.green + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.accent.green,
  },
  arrivalCopyButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent.green,
    marginLeft: 4,
    fontWeight: '600',
  },
  // SKTaxi: 멤버 선택 스타일
  memberSelectionContainer: {
    marginTop: 8,
  },
  memberSelectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: COLORS.background.card,
  },
  memberSelectionItemSelected: {
    backgroundColor: COLORS.accent.green + '20',
    outlineWidth: 1,
    outlineColor: COLORS.accent.green,
  },
  memberSelectionText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    marginLeft: 8,
  },
  memberSelectionTextSelected: {
    color: COLORS.accent.green,
    fontWeight: '600',
  },
  // SKTaxi: 동승 요청 섹션 스타일
  joinRequestsSection: {
    backgroundColor: COLORS.background.card,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  joinRequestsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  joinRequestsHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinRequestsTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginLeft: 8,
  },
  joinRequestsList: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
  },
  joinRequestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  joinRequestInfo: {
    flex: 1,
  },
  joinRequestName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  joinRequestTime: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  joinRequestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  joinRequestButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  acceptButton: {
    backgroundColor: COLORS.accent.green + '20',
    borderWidth: 1,
    borderColor: COLORS.accent.green,
  },
  acceptButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent.green,
    fontWeight: '600',
  },
  declineButton: {
    backgroundColor: COLORS.accent.red + '20',
    borderWidth: 1,
    borderColor: COLORS.accent.red,
  },
  declineButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent.red,
    fontWeight: '600',
  },
}); 