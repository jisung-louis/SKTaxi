// SKTaxi: FCM 포그라운드 메시지 처리 및 join 요청 수락/거절 유틸 추가
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import firestore, { collection, doc, serverTimestamp, setDoc, updateDoc, arrayUnion, getDoc, query, where, getDocs, writeBatch } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';
import { sendSystemMessage } from '../hooks/useMessages';

export function initForegroundMessageHandler(
  showModal: (data: any) => void, 
  onPartyDeleted?: () => void,
  onNoticeReceived?: (noticeId: string, noticeTitle?: string, noticeCategory?: string) => void,
  onAppNoticeNotificationReceived?: (data: { appNoticeId: string; title: string }) => void,
  onJoinRequestAccepted?: (partyId: string) => void,
  onJoinRequestRejected?: () => void,
      onChatMessageReceived?: (data: { senderName: string; messageText: string; partyId: string }) => void,
  getCurrentScreen?: () => string | undefined,
  onSettlementCompleted?: (partyId: string) => void,
  onMemberKicked?: () => void,
  onPartyCreated?: (data: { partyId: string; title: string; body: string }) => void,
  onBoardNotificationReceived?: (data: { postId: string; type: string; title: string; body: string }) => void,
  onNoticeNotificationReceived?: (data: { noticeId: string; type: string; title: string; body: string }) => void,
  onChatRoomMessageReceived?: (data: { chatRoomId: string; senderName: string; messageText: string }) => void
) {
  console.log('🔔 포그라운드 메시지 핸들러 등록됨');
  
  messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
    console.log('🔔 포그라운드에서 FCM 메시지 수신:', JSON.stringify(remoteMessage, null, 2));
    
    const data = remoteMessage.data || {};
    console.log('🔔 메시지 데이터:', data);
    
    if (data.type === 'join_request') {
      console.log('🔔 동승 요청 메시지 처리');
      showModal(data);
    } else if (data.type === 'party_join_accepted') {
      console.log('🔔 동승 요청 승인 메시지 처리');
      if (onJoinRequestAccepted && data.partyId && typeof data.partyId === 'string') {
        onJoinRequestAccepted(data.partyId);
      }
    } else if (data.type === 'party_join_rejected') {
      console.log('🔔 동승 요청 거절 메시지 처리');
      if (onJoinRequestRejected) {
        onJoinRequestRejected();
      }
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
    } else if (data.type === 'app_notice') {
      // 앱 공지(운영 공지)
      if (onAppNoticeNotificationReceived && data.appNoticeId && typeof data.appNoticeId === 'string') {
        const title = typeof data.title === 'string' ? data.title : '새 앱 공지';
        onAppNoticeNotificationReceived({ appNoticeId: data.appNoticeId, title });
      }
    } else if (data.type === 'chat_message') {
      console.log('🔔 채팅 메시지 처리:', data.partyId);
      // SKTaxi: 현재 화면이 Chat이면 알림 숨김
      const currentScreen = getCurrentScreen?.();
      if (currentScreen === 'Chat') {
        console.log('🔔 현재 Chat 화면이므로 알림 숨김');
        return;
      }
      
      if (onChatMessageReceived && data.partyId && data.senderId && typeof data.partyId === 'string') {
        const title = typeof remoteMessage.notification?.title === 'string' ? remoteMessage.notification.title : '';
        const senderName = title.replace('님의 메시지', '') || '익명';
        const messageText = typeof remoteMessage.notification?.body === 'string' ? remoteMessage.notification.body : '';
        onChatMessageReceived({
          senderName,
          messageText,
          partyId: data.partyId,
        });
      }
    } else if (data.type === 'chat_room_message') {
      console.log('🔔 채팅방 메시지 처리:', data.chatRoomId);
      // SKTaxi: 현재 화면이 ChatDetail이면 알림 숨김
      const currentScreen = getCurrentScreen?.();
      if (currentScreen === 'ChatDetail') {
        console.log('🔔 현재 ChatDetail 화면이므로 알림 숨김');
        return;
      }
      
      if (onChatRoomMessageReceived && data.chatRoomId && typeof data.chatRoomId === 'string') {
        const title = typeof remoteMessage.notification?.title === 'string' ? remoteMessage.notification.title : '';
        const body = typeof remoteMessage.notification?.body === 'string' ? remoteMessage.notification.body : '';
        // body 형식: "송신자명: 메시지 내용"
        const parts = body.split(': ');
        const senderName = parts.length > 1 ? parts[0] : '익명';
        const messageText = parts.length > 1 ? parts.slice(1).join(': ') : body;
        
        onChatRoomMessageReceived({
          chatRoomId: data.chatRoomId,
          senderName,
          messageText,
        });
      }
    } else if (data.type === 'settlement_completed') {
      console.log('🔔 정산 완료 알림 처리:', data.partyId);
      if (onSettlementCompleted && data.partyId && typeof data.partyId === 'string') {
        onSettlementCompleted(data.partyId);
      }
    } else if (data.type === 'member_kicked') {
      console.log('🔔 멤버 강퇴 알림 처리:', data.partyId);
      if (onMemberKicked) {
        onMemberKicked();
      }
    } else if (data.type === 'party_created') {
      console.log('🔔 새 파티 생성 알림 처리:', data.partyId);
      if (onPartyCreated && data.partyId && typeof data.partyId === 'string') {
        const title = typeof remoteMessage.notification?.title === 'string' ? remoteMessage.notification.title : '새로운 택시 파티가 등장했어요';
        const body = typeof remoteMessage.notification?.body === 'string' ? remoteMessage.notification.body : '지금 확인해보세요!';
        onPartyCreated({
          partyId: data.partyId,
          title,
          body,
        });
      }
    } else if (data.type === 'board_post_comment' || data.type === 'board_comment_reply' || data.type === 'board_post_like') {
      console.log('🔔 게시판 알림 처리:', data.type);
      if (onBoardNotificationReceived && data.postId && typeof data.postId === 'string') {
        const title = typeof remoteMessage.notification?.title === 'string' ? remoteMessage.notification.title : '';
        const body = typeof remoteMessage.notification?.body === 'string' ? remoteMessage.notification.body : '';
        onBoardNotificationReceived({
          postId: data.postId,
          type: data.type,
          title,
          body,
        });
      }
    } else if (data.type === 'notice_post_comment' || data.type === 'notice_comment_reply') {
      console.log('🔔 공지사항 알림 처리:', data.type);
      if (onNoticeNotificationReceived && data.noticeId && typeof data.noticeId === 'string') {
        const title = typeof remoteMessage.notification?.title === 'string' ? remoteMessage.notification.title : '';
        const body = typeof remoteMessage.notification?.body === 'string' ? remoteMessage.notification.body : '';
        onNoticeNotificationReceived({
          noticeId: data.noticeId,
          type: data.type,
          title,
          body,
        });
      }
    } else {
      console.log('🔔 알 수 없는 메시지 타입:', data.type);
    }
  });
}

export async function acceptJoin(requestId: string, partyId: string, requesterId: string) {
  try {
    // SKTaxi: 현재 요청 상태 확인
    const requestDoc = await getDoc(doc(collection(firestore(getApp()), 'joinRequests'), requestId));
    const requestData = requestDoc.data() as { status?: string } | undefined;
    
    // SKTaxi: 이미 취소되었거나 처리된 요청은 무시
    if (requestData?.status !== 'pending') {
      console.log('이미 처리된 요청:', requestData?.status);
      return;
    }

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
      const userData = userDoc.data() as { displayName?: string | null } | undefined;
      const displayName = userData?.displayName || '익명';
      
      await sendSystemMessage(partyId, `${displayName}님이 파티에 합류했어요.`);
    } catch (error) {
      console.error('SKTaxi acceptJoin: Error sending system message:', error);
      // 시스템 메시지 전송 실패해도 전체 프로세스는 계속 진행
    }
  } catch (error) {
    console.error('acceptJoin 실패:', error);
  }
}

export async function declineJoin(requestId: string) {
  try {
    // SKTaxi: 현재 요청 상태 확인
    const requestDoc = await getDoc(doc(collection(firestore(getApp()), 'joinRequests'), requestId));
    const requestData = requestDoc.data() as { status?: string } | undefined;
    
    // SKTaxi: 이미 취소되었거나 처리된 요청은 무시
    if (requestData?.status !== 'pending') {
      console.log('이미 처리된 요청:', requestData?.status);
      return;
    }

    await updateDoc(doc(collection(firestore(getApp()), 'joinRequests'), requestId), { status: 'declined' });
  } catch (error) {
    console.error('declineJoin 실패:', error);
  }
}

// SKTaxi: 동승 요청 알림 삭제
export async function deleteJoinRequestNotifications(requesterId: string, partyId: string) {
  try {
    const notificationsRef = collection(firestore(getApp()), 'userNotifications', requesterId, 'notifications');
    const q = query(notificationsRef, where('type', '==', 'party_join_request'), where('data.partyId', '==', partyId));
    const snapshot = await getDocs(q);
    
    // 배치 삭제
    const batch = writeBatch(firestore(getApp()));
    snapshot.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
      batch.delete(docSnap.ref);
    });
    await batch.commit();
    console.log(`✅ 요청자(${requesterId})의 동승 요청 알림 ${snapshot.size}개 삭제 완료`);
  } catch (error) {
    console.error('동승 요청 알림 삭제 실패:', error);
  }
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
    } else if (data.type === 'party_join_accepted' || data.type === 'party_join_rejected' || data.type === 'party_deleted') {
      // SKTaxi: 이런 알림은 포그라운드에서만 처리됨
      console.log('백그라운드 알림:', data.type);
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
    } else if (data.type === 'app_notice' && data.appNoticeId) {
      // 앱 공지 상세 페이지로 이동 (홈 스택의 AppNoticeDetail)
      navigation.navigate('홈', {
        screen: 'AppNoticeDetail',
        params: { noticeId: data.appNoticeId },
      });
    } else if (data.type === 'join_request' && onJoinRequestReceived) {
      // 동승 요청 모달 표시
      console.log('알림을 통해 동승 요청 수신:', data);
      onJoinRequestReceived(data);
    } else if (data.type === 'party_join_accepted' && data.partyId) {
      // 동승 요청 승인 - 채팅 화면으로 이동
      navigation.navigate('택시', { 
        screen: 'Chat', 
        params: { partyId: data.partyId } 
      });
    } else if (data.type === 'party_join_rejected') {
      // 동승 요청 거절 - 이전 화면으로 이동
      navigation.goBack();
    } else if (data.type === 'party_deleted') {
      // 파티 삭제 - 메인 화면으로 이동
      navigation.navigate('택시');
    } else if (data.type === 'chat_message' && data.partyId) {
      // 채팅 메시지 - 채팅 화면으로 이동
      navigation.navigate('Main', {
        screen: '택시',
        params: { 
          screen: 'Chat', 
          params: { partyId: data.partyId } 
        }
      });
    } else if (data.type === 'chat_room_message' && data.chatRoomId) {
      // 채팅방 메시지 - 채팅방 상세 화면으로 이동
      navigation.navigate('Main', {
        screen: '채팅',
        params: {
          screen: 'ChatDetail',
          params: { chatRoomId: data.chatRoomId }
        }
      });
    } else if (data.type === 'party_closed' && data.partyId) {
      // 파티 모집 마감 - 채팅 화면으로 이동
      navigation.navigate('Main', {
        screen: '택시',
        params: { 
          screen: 'Chat', 
          params: { partyId: data.partyId } 
        }
      });
    } else if (data.type === 'party_arrived' && data.partyId) {
      // 파티 도착 - 채팅 화면으로 이동
      navigation.navigate('Main', {
        screen: '택시',
        params: { 
          screen: 'Chat', 
          params: { partyId: data.partyId } 
        }
      });
    } else if (data.type === 'board_post_comment' || data.type === 'board_comment_reply' || data.type === 'board_post_like') {
      // 게시판 알림 - 게시판 상세 화면으로 이동
      if (data.postId) {
        navigation.navigate('Main', {
          screen: '게시판',
          params: {
            screen: 'BoardDetail',
            params: { postId: data.postId }
          }
        });
      }
    } else if (data.type === 'notice_post_comment' || data.type === 'notice_comment_reply') {
      // 공지사항 알림 - 공지사항 상세 화면으로 이동
      if (data.noticeId) {
        navigation.navigate('Main', {
          screen: '공지',
          params: {
            screen: 'NoticeDetail',
            params: { noticeId: data.noticeId }
          }
        });
      }
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
    } else if (data.type === 'app_notice' && data.appNoticeId) {
      navigation.navigate('홈', {
        screen: 'AppNoticeDetail',
        params: { noticeId: data.appNoticeId }
      });
    } else if (data.type === 'join_request' && onJoinRequestReceived) {
      // 동승 요청 모달 표시
      console.log('앱 종료 상태에서 동승 요청 수신:', data);
      onJoinRequestReceived(data);
    } else if (data.type === 'party_join_accepted' && data.partyId) {
      // 동승 요청 승인 - 채팅 화면으로 이동
      navigation.navigate('택시', { 
        screen: 'Chat', 
        params: { partyId: data.partyId } 
      });
    } else if (data.type === 'party_join_rejected') {
      // 동승 요청 거절 - 이전 화면으로 이동
      navigation.goBack();
    } else if (data.type === 'party_deleted') {
      // 파티 삭제 - 메인 화면으로 이동
      navigation.navigate('택시');
    } else if (data.type === 'chat_message' && data.partyId) {
      // 채팅 메시지 - 채팅 화면으로 이동
      navigation.navigate('Main', {
        screen: '택시',
        params: { 
          screen: 'Chat', 
          params: { partyId: data.partyId } 
        }
      });
    } else if (data.type === 'chat_room_message' && data.chatRoomId) {
      // 채팅방 메시지 - 채팅방 상세 화면으로 이동
      navigation.navigate('Main', {
        screen: '채팅',
        params: {
          screen: 'ChatDetail',
          params: { chatRoomId: data.chatRoomId }
        }
      });
    } else if (data.type === 'party_closed' && data.partyId) {
      // 파티 모집 마감 - 채팅 화면으로 이동
      navigation.navigate('Main', {
        screen: '택시',
        params: { 
          screen: 'Chat', 
          params: { partyId: data.partyId } 
        }
      });
    } else if (data.type === 'party_arrived' && data.partyId) {
      // 파티 도착 - 채팅 화면으로 이동
      navigation.navigate('Main', {
        screen: '택시',
        params: { 
          screen: 'Chat', 
          params: { partyId: data.partyId } 
        }
      });
    } else if (data.type === 'board_post_comment' || data.type === 'board_comment_reply' || data.type === 'board_post_like') {
      // 게시판 알림 - 게시판 상세 화면으로 이동
      if (data.postId) {
        navigation.navigate('Main', {
          screen: '게시판',
          params: {
            screen: 'BoardDetail',
            params: { postId: data.postId }
          }
        });
      }
    } else if (data.type === 'notice_post_comment' || data.type === 'notice_comment_reply') {
      // 공지사항 알림 - 공지사항 상세 화면으로 이동
      if (data.noticeId) {
        navigation.navigate('Main', {
          screen: '공지',
          params: {
            screen: 'NoticeDetail',
            params: { noticeId: data.noticeId }
          }
        });
      }
    }
  }
}


