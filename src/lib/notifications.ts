// SKTaxi: FCM 포그라운드 메시지 처리 및 join 요청 수락/거절 유틸 추가
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import firestore, { collection, doc, serverTimestamp, setDoc, updateDoc, arrayUnion, getDoc } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import { sendSystemMessage } from '../hooks/useMessages';

export function initForegroundMessageHandler(showModal: (data: any) => void, onPartyDeleted?: () => void) {
  messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    const data = remoteMessage.data || {};
    if (data.type === 'join_request') {
      showModal(data);
    } else if (data.type === 'party_deleted') {
      // SKTaxi: 파티 삭제 알림 처리
      if (onPartyDeleted) {
        onPartyDeleted();
      }
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


