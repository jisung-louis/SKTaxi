// SKTaxi: 택시 채팅 화면 훅
// DIP 준수: Repository 패턴을 통한 데이터 접근

import { useEffect, useState, useRef, useCallback } from 'react';
import { Alert, Clipboard } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { TaxiStackParamList } from '../../../navigations/types';
import { useMessages, sendMessage, sendSystemMessage, sendAccountMessage, sendArrivedMessage, sendEndMessage } from '../../../hooks/chat';
import { useParties } from '../../../hooks/party';
import { useUserDisplayNames } from '../../../hooks/user';
import { useAuth } from '../../../hooks/auth';
import { usePartyRepository, useUserRepository, useNotificationRepository } from '../../../di/useRepository';
import { logEvent } from '../../../lib/analytics';
import { JoinRequest, SettlementData } from '../../../repositories/interfaces/IPartyRepository';

type ChatScreenNavigationProp = NativeStackNavigationProp<TaxiStackParamList, 'Chat'>;

const BANKS = [
  '신한','KB국민','카카오','토스뱅크','IBK기업','NH농협','케이뱅크','하나','우리','수협','SC제일','한국씨티',
  '부산은행','대구은행','광주은행','제주은행','전북은행','경남은행','새마을금고','우체국','신협'
];

export const useChatScreenPresenter = () => {
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const route = useRoute<RouteProp<TaxiStackParamList, 'Chat'>>();
  const partyId = route.params?.partyId;

  // Repository 훅
  const partyRepository = usePartyRepository();
  const userRepository = useUserRepository();
  const notificationRepository = useNotificationRepository();

  // Auth 훅
  const { user: authUser } = useAuth();

  // Refs
  const kickHandledRef = useRef<boolean>(false);
  const deleteHandledRef = useRef<boolean>(false);
  const seenPartyRef = useRef<boolean>(false);
  const selfLeaveRef = useRef<boolean>(false);
  const contentHeightRef = useRef<number>(0);

  // 메시지 상태
  const [message, setMessage] = useState('');
  const { messages, loading: messagesLoading, error: messagesError } = useMessages(partyId);

  // 파티 정보
  const { parties } = useParties();
  const currentParty = parties.find(p => p.id === partyId);
  const memberUids = currentParty?.members || [];

  // 현재 사용자 (Repository 패턴 적용)
  const currentUser = authUser ? { uid: authUser.uid, displayName: authUser.displayName } : null;
  const isLeader = currentParty?.leaderId === currentUser?.uid;

  // 동승 요청 상태 (Repository 패턴 적용)
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [showJoinRequests, setShowJoinRequests] = useState(false);
  const [joinRequestsLoading, setJoinRequestsLoading] = useState(false);
  const requesterIds = joinRequests.map(request => request.requesterId).filter(Boolean);

  // 사용자 이름 매핑
  const allUserIds = [...memberUids, ...requesterIds];
  const { displayNameMap } = useUserDisplayNames(allUserIds);

  // 채팅방 음소거 상태
  const [isChatMuted, setIsChatMuted] = useState(false);

  // UI 상태
  const [partyTitle, setPartyTitle] = useState<string>('');
  const [leaderName, setLeaderName] = useState<string>('');
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [showSideMenu, setShowSideMenu] = useState<boolean>(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showTaxiAppModal, setShowTaxiAppModal] = useState(false);

  // 계좌 정보 모달 상태
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [userAccount, setUserAccount] = useState<any>(null);
  const [accountLoading, setAccountLoading] = useState(false);
  const [editingAccountInline, setEditingAccountInline] = useState(false);
  const [tempBankName, setTempBankName] = useState('');
  const [tempAccountNumber, setTempAccountNumber] = useState('');
  const [tempAccountHolder, setTempAccountHolder] = useState('');
  const [tempHideName, setTempHideName] = useState(false);
  const [rememberAccount, setRememberAccount] = useState(false);
  const [showBankDropdown, setShowBankDropdown] = useState(false);

  // 도착 모달 상태
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [taxiFare, setTaxiFare] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [arrivalBankName, setArrivalBankName] = useState('');
  const [arrivalAccountNumber, setArrivalAccountNumber] = useState('');
  const [arrivalAccountHolder, setArrivalAccountHolder] = useState('');
  const [arrivalHideName, setArrivalHideName] = useState(false);
  const [showArrivalBankDropdown, setShowArrivalBankDropdown] = useState(false);
  const [rememberArrivalAccount, setRememberArrivalAccount] = useState(false);

  // 정산 현황 상태
  const [settlementStatus, setSettlementStatus] = useState<{[key: string]: boolean}>({});
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [isNoticeBarMinimized, setIsNoticeBarMinimized] = useState(false);
  const [perPersonAmount, setPerPersonAmount] = useState<number>(0);
  const [isPartyEnded, setIsPartyEnded] = useState(false);

  // 애니메이션 값
  const menuTranslateY = useSharedValue(100);
  const menuOpacity = useSharedValue(0);
  const sideMenuTranslateX = useSharedValue(400);
  const sideMenuOpacity = useSharedValue(0);
  const overlayOpacity = useSharedValue(0);
  const noticeBarHeight = useSharedValue(52);
  const settlementListOpacity = useSharedValue(1);

  // 높이 계산 함수
  const calculateNoticeBarHeight = useCallback((memberCount: number) => {
    return Math.max(52, memberCount * 22 + 52);
  }, []);

  // 파티 정보 로드 (Repository 패턴 적용)
  useEffect(() => {
    const pid = route.params?.partyId;
    if (!pid) return;
    (async () => {
      try {
        const party = await partyRepository.getParty(pid);
        if (!party) {
          setPartyTitle('채팅');
          setLeaderName('');
          return;
        }
        const dep = party.departure?.name;
        const dst = party.destination?.name;
        const leaderId = party.leaderId;
        if (dep && dst) {
          setPartyTitle(`${dep} → ${dst} 택시 파티`);
        } else {
          setPartyTitle('채팅');
        }
        if (leaderId) {
          try {
            const leaderProfile = await userRepository.getUserProfile(leaderId);
            setLeaderName(leaderProfile?.displayName || '익명');
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
  }, [route.params?.partyId, partyRepository, userRepository]);

  // 채팅방 알림 음소거 상태 로드 (Repository 패턴 적용)
  useEffect(() => {
    if (!partyId || !currentUser?.uid) return;

    const loadNotificationSettings = async () => {
      try {
        const muted = await partyRepository.getPartyChatMuted(partyId, currentUser.uid);
        setIsChatMuted(muted);
      } catch (error) {
        console.error('알림 설정 로드 실패:', error);
      }
    };

    loadNotificationSettings();
  }, [partyId, currentUser?.uid, partyRepository]);

  // 정산 현황 초기화
  useEffect(() => {
    if (currentParty?.status === 'arrived' && memberUids.length > 0) {
      if (currentParty.settlement) {
        const serverSettlementStatus: {[key: string]: boolean} = {};
        Object.keys(currentParty.settlement.members).forEach(memberId => {
          serverSettlementStatus[memberId] = currentParty.settlement!.members[memberId].settled;
        });
        setSettlementStatus(serverSettlementStatus);
        setPerPersonAmount(currentParty.settlement.perPersonAmount);
      } else {
        const initialSettlementStatus: {[key: string]: boolean} = {};
        memberUids.forEach(memberId => {
          const isLeaderMember = memberId === currentParty?.leaderId;
          initialSettlementStatus[memberId] = isLeaderMember;
        });
        setSettlementStatus(initialSettlementStatus);
      }
      setIsNoticeBarMinimized(false);
      noticeBarHeight.value = withTiming(52, { duration: 300 });
      settlementListOpacity.value = withTiming(1, { duration: 300 });
    }
  }, [currentParty?.status, currentParty?.settlement, memberUids, currentParty?.leaderId]);

  // settlementStatus 변경 시 높이 업데이트
  useEffect(() => {
    if (currentParty?.status === 'arrived' && Object.keys(settlementStatus).length > 0) {
      const memberCount = Object.keys(settlementStatus).length;
      const dynamicHeight = calculateNoticeBarHeight(memberCount);
      noticeBarHeight.value = withTiming(dynamicHeight, { duration: 300 });
    }
  }, [settlementStatus, currentParty?.status, calculateNoticeBarHeight]);

  // 동승 종료 상태 확인
  useEffect(() => {
    const hasEndMessage = messages.some(msg => msg.type === 'end');
    setIsPartyEnded(hasEndMessage);
  }, [messages]);

  // 강퇴 감지
  useEffect(() => {
    if (!currentParty || !currentUser?.uid) return;
    if (!seenPartyRef.current) return;

    const members: string[] = Array.isArray(currentParty.members) ? currentParty.members : [];
    const stillMember = members.includes(currentUser.uid);
    if (!stillMember && !kickHandledRef.current && !selfLeaveRef.current) {
      kickHandledRef.current = true;
      Alert.alert('알림', '리더가 나를 강퇴했어요.');
      navigation.popToTop();
    }
  }, [currentParty?.members, currentUser?.uid, navigation]);

  // 파티 존재 감지
  useEffect(() => {
    if (currentParty) {
      seenPartyRef.current = true;
    }
  }, [currentParty]);

  // 동승 요청 로드 (리더만)
  useEffect(() => {
    if (!isLeader || !partyId) return;

    const unsubscribe = loadJoinRequests();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isLeader, partyId]);

  // 동승 요청 로드 함수 (Repository 패턴 적용)
  const loadJoinRequests = useCallback(() => {
    if (!partyId || !isLeader) return;

    setJoinRequestsLoading(true);
    try {
      const unsubscribe = partyRepository.subscribeToJoinRequests(partyId, {
        onData: (requests) => {
          setJoinRequests(requests);
          setJoinRequestsLoading(false);
        },
        onError: (error) => {
          console.error('동승 요청 구독 실패:', error);
          setJoinRequests([]);
          setJoinRequestsLoading(false);
        },
      });

      return unsubscribe;
    } catch (error) {
      console.error('동승 요청 목록 로드 실패:', error);
      setJoinRequestsLoading(false);
    }
  }, [partyId, isLeader, partyRepository]);

  // 알림 음소거 토글 (Repository 패턴 적용)
  const handleToggleMute = useCallback(async () => {
    if (!partyId || !currentUser?.uid) return;

    try {
      const newMutedState = !isChatMuted;
      await partyRepository.setPartyChatMuted(partyId, currentUser.uid, newMutedState);
      setIsChatMuted(newMutedState);
    } catch (error) {
      console.error('알림 설정 업데이트 실패:', error);
      Alert.alert('오류', '알림 설정 변경에 실패했습니다.');
    }
  }, [partyId, currentUser?.uid, isChatMuted, partyRepository]);

  // 멤버 강퇴 처리 (Repository 패턴 적용)
  const handleKick = useCallback(async (memberId: string, displayName: string) => {
    if (!partyId || !currentParty || !isLeader) return;
    if (memberId === currentParty.leaderId) return;
    Alert.alert(
      '멤버 강퇴',
      `${displayName}님을 강퇴할까요?`,
      [
        { text: '취소', style: 'cancel' },
        { text: '강퇴', style: 'destructive', onPress: async () => {
            try {
              await partyRepository.removeMember(partyId, memberId);
              await sendSystemMessage(partyId, `${displayName}님이 강퇴되었어요.`);
            } catch (error) {
              console.error('멤버 강퇴 실패:', error);
              Alert.alert('오류', '멤버 강퇴에 실패했어요.');
            }
          } },
      ]
    );
  }, [partyId, currentParty, isLeader, partyRepository]);

  // 메시지 전송
  const handleSend = useCallback(async () => {
    if (!message.trim() || !partyId) return;

    try {
      await sendMessage(partyId, message.trim());
      setMessage('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      Alert.alert('오류', '메시지 전송에 실패했습니다.');
    }
  }, [message, partyId]);

  // 동승 요청 승인 (Repository 패턴 적용)
  const handleAcceptJoin = useCallback(async (requestId: string, requesterId: string) => {
    if (!partyId) return;
    try {
      await partyRepository.acceptJoinRequest(requestId, partyId, requesterId);

      await logEvent('party_join_accepted', {
        party_id: partyId,
        request_id: requestId,
      });

      const requesterName = displayNameMap[requesterId] || '익명';
      await sendSystemMessage(partyId, `${requesterName}님이 파티에 합류했어요.`);

      Alert.alert('성공', '동승 요청을 승인했습니다.');
    } catch (error) {
      console.error('동승 요청 승인 실패:', error);
      Alert.alert('오류', '동승 요청 승인에 실패했습니다.');
    }
  }, [partyId, displayNameMap, partyRepository]);

  // 동승 요청 거절 (Repository 패턴 적용)
  const handleDeclineJoin = useCallback(async (requestId: string) => {
    try {
      await partyRepository.declineJoinRequest(requestId);
      Alert.alert('성공', '동승 요청을 거절했습니다.');
    } catch (error) {
      console.error('동승 요청 거절 실패:', error);
      Alert.alert('오류', '동승 요청 거절에 실패했습니다.');
    }
  }, [partyRepository]);

  // 계좌 정보 로드 (Repository 패턴 적용)
  const loadUserAccount = useCallback(async () => {
    if (!currentUser?.uid) return;

    setAccountLoading(true);
    try {
      const userProfile = await userRepository.getUserProfile(currentUser.uid);
      const account = userProfile?.accountInfo;

      if (account && (account.bankName || account.accountNumber || account.accountHolder)) {
        setUserAccount(account);
        setTempBankName(account.bankName || '');
        setTempAccountNumber(account.accountNumber || '');
        setTempAccountHolder(account.accountHolder || '');
        setTempHideName(account.hideName || false);
        setRememberAccount(true);
      } else {
        setUserAccount(null);
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
  }, [currentUser?.uid, userRepository]);

  // 계좌 정보 전송 (Repository 패턴 적용)
  const sendAccountInfo = useCallback(async () => {
    if (!currentUser?.uid || !partyId) return;

    let bankName = '';
    let accountNumber = '';
    let accountHolder = '';
    let hideName = false;

    if (userAccount && !editingAccountInline) {
      bankName = userAccount.bankName;
      accountNumber = userAccount.accountNumber;
      accountHolder = userAccount.accountHolder || '';
      hideName = userAccount.hideName || false;
    } else {
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
      await sendAccountMessage(partyId, {
        bankName,
        accountNumber,
        accountHolder,
        hideName,
      });

      setShowAccountModal(false);

      // 계좌 정보 저장 (Repository 패턴)
      if (rememberAccount && tempBankName && tempAccountNumber) {
        await userRepository.updateUserProfile(currentUser.uid, {
          accountInfo: {
            bankName: tempBankName,
            accountNumber: tempAccountNumber,
            accountHolder: tempAccountHolder || '',
            hideName: tempHideName,
          }
        });
      }
    } catch (error) {
      console.error('계좌 정보 전송 실패:', error);
      Alert.alert('오류', '계좌 정보 전송에 실패했습니다.');
    }
  }, [currentUser?.uid, partyId, userAccount, editingAccountInline, tempBankName, tempAccountNumber, tempAccountHolder, tempHideName, rememberAccount, userRepository]);

  // 도착 확인 (Repository 패턴 적용)
  const handleArrivalConfirm = useCallback(() => {
    Alert.alert(
      '도착 확인',
      '택시가 목적지에 도착했나요?',
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '예',
          onPress: async () => {
            try {
              if (!currentUser?.uid) return;

              const userProfile = await userRepository.getUserProfile(currentUser.uid);
              const account = userProfile?.accountInfo;

              if (account) {
                setArrivalBankName(account.bankName || '');
                setArrivalAccountNumber(account.accountNumber || '');
                setArrivalAccountHolder(account.accountHolder || '');
                setArrivalHideName(account.hideName || false);
                setRememberArrivalAccount(true);
              } else {
                setArrivalBankName('');
                setArrivalAccountNumber('');
                setArrivalAccountHolder('');
                setArrivalHideName(false);
                setRememberArrivalAccount(false);
              }

              setSelectedMembers(memberUids);
              setShowArrivalModal(true);
            } catch (error) {
              console.error('계좌 정보 로드 중 오류:', error);
              setShowArrivalModal(true);
            }
          }
        }
      ]
    );
  }, [memberUids, currentUser?.uid, userRepository]);

  // 도착 확정 (Repository 패턴 적용)
  const handleArrivalSubmit = useCallback(async () => {
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

    try {
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

      // 계좌 정보 저장 (Repository 패턴)
      if (rememberArrivalAccount && arrivalBankName && arrivalAccountNumber && arrivalAccountHolder) {
        try {
          await userRepository.updateUserProfile(currentUser.uid, {
            accountInfo: {
              bankName: arrivalBankName,
              accountNumber: arrivalAccountNumber,
              accountHolder: arrivalAccountHolder,
              hideName: arrivalHideName,
            }
          });
        } catch (error) {
          console.error('계좌 정보 저장 중 오류:', error);
        }
      }

      // 정산 데이터 구성
      const initialSettlementStatus: {[key: string]: boolean} = {};
      const settlementMembers: SettlementData['members'] = {};

      selectedMembers.forEach(memberId => {
        const isLeaderMember = memberId === currentParty?.leaderId;
        initialSettlementStatus[memberId] = isLeaderMember;
        settlementMembers[memberId] = {
          settled: isLeaderMember,
        };
      });

      // 정산 시작 (Repository 패턴)
      await partyRepository.startSettlement(partyId, {
        perPersonAmount: perPerson,
        members: settlementMembers,
      });

      setSettlementStatus(initialSettlementStatus);
      setIsNoticeBarMinimized(false);

      const dynamicHeight = calculateNoticeBarHeight(selectedMembers.length);
      noticeBarHeight.value = withTiming(dynamicHeight, { duration: 300 });
      settlementListOpacity.value = withTiming(1, { duration: 300 });

      setShowArrivalModal(false);
      setTaxiFare('');
      setSelectedMembers([]);
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
  }, [currentUser?.uid, partyId, taxiFare, selectedMembers, arrivalBankName, arrivalAccountNumber, arrivalAccountHolder, arrivalHideName, rememberArrivalAccount, currentParty?.leaderId, calculateNoticeBarHeight, userRepository, partyRepository]);

  // 멤버 선택 토글
  const toggleMemberSelection = useCallback((memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  }, []);

  // 정산 완료 처리 (Repository 패턴 적용)
  const handleSettlementComplete = useCallback(async (memberId: string, memberName: string) => {
    if (!partyId) return;
    Alert.alert(
      '정산 확인',
      `${memberName}님이 돈을 송금했나요?`,
      [
        { text: '아니오', style: 'cancel' },
        {
          text: '예',
          onPress: async () => {
            try {
              await partyRepository.markMemberSettled(partyId, memberId);

              setSettlementStatus(prev => ({
                ...prev,
                [memberId]: true
              }));
            } catch (error) {
              console.error('정산 완료 처리 중 오류:', error);
              Alert.alert('오류', '정산 완료 처리 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  }, [partyId, partyRepository]);

  // 동승 종료 처리 (Repository 패턴 적용)
  const handlePartyEnd = useCallback(async () => {
    if (!partyId) return;
    const allSettled = Object.values(settlementStatus).every(status => status);
    const unsettledMembers = Object.keys(settlementStatus).filter(memberId => !settlementStatus[memberId]);

    const endParty = async () => {
      try {
        await partyRepository.completeSettlement(partyId);
        setIsPartyEnded(true);
        setShowMenu(false);
        await sendEndMessage(partyId, true);
      } catch (error) {
        console.error('정산 상태 업데이트 중 오류:', error);
        Alert.alert('오류', '정산 상태 업데이트 중 오류가 발생했습니다.');
      }
    };

    if (allSettled) {
      Alert.alert(
        '동승 종료',
        '동승 파티를 종료할까요?',
        [
          { text: '아니오', style: 'cancel' },
          { text: '예', onPress: endParty }
        ]
      );
    } else {
      const unsettledNames = unsettledMembers.map(memberId => displayNameMap[memberId] || '익명').join(', ');
      Alert.alert(
        '동승 종료',
        `${unsettledNames}님이 아직 정산을 안한 것 같아요. 그래도 동승 파티를 종료할까요?`,
        [
          { text: '아니오', style: 'cancel' },
          { text: '예', onPress: endParty }
        ]
      );
    }
  }, [settlementStatus, displayNameMap, partyId, partyRepository]);

  // 메뉴 핸들러 (Repository 패턴 적용)
  const handleMenuPress = useCallback(async (type: string) => {
    try {
      if (type === 'account') {
        setEditingAccountInline(false);
        await loadUserAccount();
        setShowAccountModal(true);
      } else if (type === 'taxi') {
        setShowTaxiAppModal(true);
      } else if (type === 'arrive') {
        handleArrivalConfirm();
      } else if (type === 'settlement') {
        setShowSettlementModal(true);
      } else if (type === 'endParty') {
        handlePartyEnd();
      } else if (type === 'close') {
        if (!partyId || !currentUser?.uid || !currentParty) return;

        if (!isLeader) {
          Alert.alert('알림', '방장만 모집 상태를 변경할 수 있어요.');
          return;
        }

        const nextStatus = currentParty.status === 'closed' ? 'open' : 'closed';
        await partyRepository.updateParty(partyId, { status: nextStatus });

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
  }, [loadUserAccount, handleArrivalConfirm, handlePartyEnd, partyId, currentUser?.uid, currentParty, isLeader, partyRepository]);

  // 계좌 정보 복사
  const copyAccountInfo = useCallback((bankName: string, accountNumber: string) => {
    const accountText = `${bankName} ${accountNumber}`;
    Clipboard.setString(accountText);
    Alert.alert('복사 완료', '계좌 정보가 클립보드에 복사되었습니다.');
  }, []);

  // 멤버 나가기 (Repository 패턴 적용)
  const handleMemberLeave = useCallback(async () => {
    if (!partyId || !currentUser?.uid) return;

    try {
      selfLeaveRef.current = true;

      // 사용자 이름 조회 (Repository 패턴)
      const userProfile = await userRepository.getUserProfile(currentUser.uid);
      const displayName = userProfile?.displayName || '익명';

      await sendSystemMessage(partyId, `${displayName}님이 파티를 나갔어요.`);

      // 멤버 제거 (Repository 패턴)
      await partyRepository.removeMember(partyId, currentUser.uid);

      // 파티 관련 알림 삭제 (Repository 패턴)
      try {
        await notificationRepository.deleteNotificationsByPartyId(currentUser.uid, partyId);
      } catch (error) {
        console.error('파티 관련 알림 삭제 실패:', error);
      }

      Alert.alert('알림', '파티에서 나갔습니다.');
      navigation.popToTop();
    } catch (error) {
      console.error('파티 나가기 실패:', error);
      Alert.alert('오류', '파티 나가기에 실패했습니다.');
    }
  }, [partyId, currentUser?.uid, navigation, userRepository, partyRepository, notificationRepository]);

  // 멤버 나가기 확인
  const showMemberLeaveModal = useCallback(() => {
    Alert.alert(
      '파티 나가기',
      '파티에서 나가시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        { text: '나가기', style: 'destructive', onPress: handleMemberLeave },
      ]
    );
  }, [handleMemberLeave]);

  // 리더 파티 삭제 (Repository 패턴 적용)
  const handleLeaderDeleteParty = useCallback(async (isPartyArrived = false) => {
    if (!partyId || !isLeader || deleteHandledRef.current) return;

    deleteHandledRef.current = true; // 중복 방지 플래그

    try {
      // 파티 삭제 (Repository 패턴) - 동승 요청 정리는 Repository 내부에서 처리 가능
      const endReason = isPartyArrived ? 'arrived' : 'cancelled';
      await partyRepository.deleteParty(partyId, endReason);

      setIsPartyEnded(true);
      setShowMenu(false);
      await sendEndMessage(partyId, isPartyArrived);
      if (!isPartyArrived) {
        setShowSideMenu(false);
        Alert.alert('알림', '파티가 삭제되었습니다.');
      }
    } catch (error) {
      deleteHandledRef.current = false; // 실패 시 리셋
      console.error('파티 삭제 실패:', error);
      Alert.alert('오류', '파티 삭제에 실패했습니다.');
    }
  }, [partyId, isLeader, partyRepository]);

  // 파티 삭제 확인
  const showDeletePartyModal = useCallback(() => {
    const memberCount = memberUids.length;
    const title = memberCount <= 1 ? '파티 모집 취소' : '파티 삭제';
    const message = memberCount <= 1
      ? '파티 모집을 취소할까요?'
      : '현재 파티원이 있어요. 정말 파티를 없애시겠어요?';

    Alert.alert(
      title,
      message,
      [
        { text: '취소', style: 'cancel' },
        { text: memberCount <= 1 ? '취소하기' : '예', style: 'destructive', onPress: () => handleLeaderDeleteParty(false) },
      ]
    );
  }, [memberUids.length, handleLeaderDeleteParty]);

  // 파티 공유 (미구현)
  const handleShareParty = useCallback(() => {
    Alert.alert('아직 못해 ㅠ', '파티 공유 기능은 준비중이에요');
  }, []);

  return {
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
    selectedMemberId,
    setSelectedMemberId,
    isPartyEnded,

    // 동승 요청
    joinRequests,
    showJoinRequests,
    setShowJoinRequests,
    joinRequestsLoading,
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
    loadUserAccount,

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
    handlePartyEnd,
    calculateNoticeBarHeight,

    // 멤버 관리
    handleKick,
    handleMemberLeave,
    showMemberLeaveModal,
    handleLeaderDeleteParty,
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

    // 상수
    BANKS,
  };
};
