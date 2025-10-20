// SKTaxi: FCM 포그라운드 메시지 처리 및 join 요청 수락/거절 유틸 추가
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import firestore, { collection, doc, serverTimestamp, setDoc, updateDoc, arrayUnion, getDoc } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import { sendSystemMessage } from '../hooks/useMessages';

export function initForegroundMessageHandler(
  showModal: (data: any) => void, 
  onPartyDeleted?: () => void,
  onNoticeReceived?: (noticeId: string, noticeTitle?: string, noticeCategory?: string) => void
) {
  console.log('🔔 포그라운드 메시지 핸들러 등록됨');
  
  messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    console.log('🔔 포그라운드에서 FCM 메시지 수신:', JSON.stringify(remoteMessage, null, 2));
    
    const data = remoteMessage.data || {};
    console.log('🔔 메시지 데이터:', data);
    
    if (data.type === 'join_request') {
      console.log('🔔 동승 요청 메시지 처리');
      showModal(data);
    } else if (data.type === 'party_deleted') {
      console.log('🔔 파티 삭제 메시지 처리');
      // SKTaxi: 파티 삭제 알림 처리
      if (onPartyDeleted) {
        onPartyDeleted();
      }
    } else if (data.type === 'notice') {
      console.log('🔔 공지사항 메시지 처리:', data.noticeId);
      // SKTaxi: 공지사항 알림 처리
      if (onNoticeReceived && data.noticeId && typeof data.noticeId === 'string') {
        const noticeTitle = typeof data.title === 'string' ? data.title : '';
        const noticeCategory = typeof data.category === 'string' ? data.category : '일반';
        onNoticeReceived(data.noticeId, noticeTitle, noticeCategory);
      } else {
        console.log('🔔 공지사항 메시지 처리 실패:', {
          onNoticeReceived: !!onNoticeReceived,
          noticeId: data.noticeId,
          noticeIdType: typeof data.noticeId
        });
      }
    } else {
      console.log('🔔 알 수 없는 메시지 타입:', data.type);
    }
  });
}

export async function acceptJoin(requestId: string, partyId: string, requesterId: string) {
  // SKTaxi: joinRequests 상태를 accepted로 변경
  await updateDoc(doc(collection(firestore(getApp()), 'joinRequests'), requestId), { status: 'accepted' });
  
  // SKTaxi: parties 컬렉션의 members 배열에 requesterId 추가
  await updateDoc(doc(collection(firestore(getApp()), 'parties'), partyId), {
    members: arrayUnion(requesterId),
    updatedAt: serverTimestamp(),
  });

  // SKTaxi: 사용자 정보 조회하여 시스템 메시지 전송
  try {
    const userDoc = await getDoc(doc(collection(firestore(getApp()), 'users'), requesterId));
    const userData = userDoc.data();
    const displayName = userData?.displayName || '익명';
    
    await sendSystemMessage(partyId, `${displayName}님이 파티에 합류했어요.`);
  } catch (error) {
    console.error('SKTaxi acceptJoin: Error sending system message:', error);
    // 시스템 메시지 전송 실패해도 전체 프로세스는 계속 진행
  }
}

export async function declineJoin(requestId: string) {
  await updateDoc(doc(collection(firestore(getApp()), 'joinRequests'), requestId), { status: 'declined' });
}

// SKTaxi: 백그라운드 알림 처리
export function initBackgroundMessageHandler(
  onJoinRequestReceived?: (joinData: any) => void
) {
  messaging().setBackgroundMessageHandler(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    const data = remoteMessage.data || {};
    console.log('백그라운드에서 받은 알림:', data);
    
    if (data.type === 'notice') {
      // 백그라운드에서 공지사항 알림 처리
      console.log('백그라운드 공지사항 알림:', data.noticeId);
    } else if (data.type === 'join_request' && onJoinRequestReceived) {
      // 백그라운드에서 동승 요청 알림 처리
      console.log('백그라운드 동승 요청 알림:', data);
      onJoinRequestReceived(data);
    }
  });
}

// SKTaxi: 앱이 종료된 상태에서 알림을 클릭했을 때 처리
export function initNotificationOpenedAppHandler(
  navigation: any, 
  onJoinRequestReceived?: (joinData: any) => void
) {
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('알림을 통해 앱이 열렸습니다:', remoteMessage);
    
    const data = remoteMessage.data || {};
    if (data.type === 'notice' && data.noticeId) {
      // 공지사항 상세 페이지로 이동
      navigation.navigate('공지', { 
        screen: 'NoticeDetail', 
        params: { noticeId: data.noticeId } 
      });
    } else if (data.type === 'join_request' && onJoinRequestReceived) {
      // 동승 요청 모달 표시
      console.log('알림을 통해 동승 요청 수신:', data);
      onJoinRequestReceived(data);
    }
  });
}

// SKTaxi: 앱이 완전히 종료된 상태에서 알림을 클릭했을 때 처리
export async function checkInitialNotification(
  navigation: any, 
  onJoinRequestReceived?: (joinData: any) => void
) {
  const remoteMessage = await messaging().getInitialNotification();
  
  if (remoteMessage) {
    console.log('앱 종료 상태에서 알림을 통해 앱이 열렸습니다:', remoteMessage);
    
    const data = remoteMessage.data || {};
    if (data.type === 'notice' && data.noticeId) {
      // 공지사항 상세 페이지로 이동
      navigation.navigate('공지', { 
        screen: 'NoticeDetail', 
        params: { noticeId: data.noticeId } 
      });
    } else if (data.type === 'join_request' && onJoinRequestReceived) {
      // 동승 요청 모달 표시
      console.log('앱 종료 상태에서 동승 요청 수신:', data);
      onJoinRequestReceived(data);
    }
  }
}


