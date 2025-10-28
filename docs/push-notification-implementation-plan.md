# SKTaxi Push 알림 구현 계획

## 1. 현재 구현 상태

### ✅ 이미 구현된 기능
- **동승 요청 알림** (joinRequests 생성 시 → 리더에게)
- **파티 삭제 알림** (parties 삭제 시 → 멤버들에게)
- **새 공지사항 알림** (notices 생성 시 → 설정 활성화된 사용자들에게)

### ❌ 누락된 기능
- **동승 요청 승인/거절 알림** (joinRequests status 변경 시)
- **userNotifications 컬렉션 생성** (알림 내역 저장)
- **알림 읽음 처리**
- **알림 상세 화면**

---

## 2. 데이터 구조 설계

### 2.1 Firestore 컬렉션 구조

```
users/{userId}
  ├── fcmTokens: string[]
  └── notificationSettings: {
        allNotifications: boolean,
        noticeNotifications: boolean,
        partyNotifications: boolean,
        chatNotifications: boolean
      }

userNotifications/{userId}/notifications/{notificationId}
  ├── id: string
  ├── type: 'notice' | 'party_join_request' | 'party_join_accepted' | 'party_join_rejected' | 'party_deleted'
  ├── title: string
  ├── message: string
  ├── data: { partyId?, requestId?, requesterId?, noticeId?, category? }
  ├── isRead: boolean
  ├── readAt: Timestamp?
  ├── createdAt: Timestamp
  └── icon?: string
      iconColor?: string

joinRequests/{requestId}
  ├── partyId: string
  ├── leaderId: string
  ├── requesterId: string
  ├── status: 'pending' | 'accepted' | 'declined'
  └── createdAt: Timestamp
```

### 2.2 알림 타입별 상세 정보

#### 1) `party_join_request` (이미 구현됨)
- **트리거**: `joinRequests` 문서 생성
- **수신자**: 리더
- **제목**: "동승 요청이 도착했어요"
- **내용**: "앱에서 확인하고 수락/거절을 선택해주세요."
- **액션**: TaxiMain → ChatScreen 이동

#### 2) `party_join_accepted` (신규 구현 필요)
- **트리거**: `joinRequests.status` → `'accepted'` 변경
- **수신자**: 요청자
- **제목**: "동승 요청이 승인되었어요"
- **내용**: "파티에 합류하세요!"
- **액션**: TaxiMain → ChatScreen 이동

#### 3) `party_join_rejected` (신규 구현 필요)
- **트리거**: `joinRequests.status` → `'declined'` 변경
- **수신자**: 요청자
- **제목**: "동승 요청이 거절되었어요"
- **내용**: "다른 파티를 찾아보세요."
- **액션**: TaxiMain 이동

#### 4) `party_deleted` (이미 구현됨)
- **트리거**: `parties` 문서 삭제
- **수신자**: 멤버들 (리더 제외)
- **제목**: "파티가 해체되었어요"
- **내용**: "리더가 파티를 해체했습니다."
- **액션**: TaxiMain 이동

#### 5) `notice` (이미 구현됨)
- **트리거**: `notices` 문서 생성
- **수신자**: 알림 설정 활성화 사용자
- **제목**: "📢 새 성결대 [카테고리] 공지"
- **내용**: "[공지사항 제목]"
- **액션**: NoticeDetailWebViewScreen 이동

---

## 3. 구현 순서

### Phase 1: Cloud Functions 수정 및 추가

#### 3.1 동승 요청 승인/거절 알림 추가

**파일**: `functions/src/index.ts`

```typescript
// joinRequests 업데이트 감지
export const onJoinRequestUpdate = onDocumentUpdated(
  'joinRequests/{requestId}',
  async (event) => {
    const beforeData = event.data.before.data();
    const afterData = event.data.after.data();
    
    // status가 변경된 경우에만 처리
    if (beforeData.status === afterData.status) return;
    
    const status = afterData.status;
    const requesterId = afterData.requesterId;
    
    // requester의 FCM 토큰 가져오기
    const userDoc = await db.doc(`users/${requesterId}`).get();
    const tokens = userDoc.get('fcmTokens') || [];
    
    if (tokens.length === 0) return;
    
    let notification;
    if (status === 'accepted') {
      notification = {
        title: '동승 요청이 승인되었어요',
        body: '파티에 합류하세요!',
        type: 'party_join_accepted'
      };
    } else if (status === 'declined') {
      notification = {
        title: '동승 요청이 거절되었어요',
        body: '다른 파티를 찾아보세요.',
        type: 'party_join_rejected'
      };
    } else return;
    
    const message = {
      tokens,
      notification,
      data: {
        type: notification.type,
        partyId: afterData.partyId,
        requestId: event.params.requestId,
      },
      apns: { payload: { aps: { sound: 'default' } } },
      android: { priority: 'high' as const },
    };
    
    await fcm.sendEachForMulticast(message);
  }
);
```

#### 3.2 userNotifications 생성 로직 추가

**파일**: `functions/src/index.ts`

각 알림 트리거 함수에 다음 로직 추가:

```typescript
// userNotifications 생성 헬퍼 함수
async function createUserNotification(userId: string, notificationData: {
  type: string;
  title: string;
  message: string;
  data?: any;
}) {
  const notificationRef = db.collection('userNotifications')
    .doc(userId)
    .collection('notifications')
    .doc();
  
  await notificationRef.set({
    id: notificationRef.id,
    type: notificationData.type,
    title: notificationData.title,
    message: notificationData.message,
    data: notificationData.data || {},
    isRead: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
}
```

---

### Phase 2: useNotifications 훅 생성

**파일**: `src/hooks/useNotifications.ts`

```typescript
import { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, limit, onSnapshot, doc, updateDoc } from '@react-native-firebase/firestore';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  readAt?: any;
  createdAt: any;
  icon?: string;
  iconColor?: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const notificationsRef = collection(db, 'userNotifications', user.uid, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        setNotifications(notificationsData);
        setLoading(false);
      },
      (err) => {
        console.error('알림 로드 실패:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const db = getFirestore();
      const notificationRef = doc(
        db, 
        'userNotifications', 
        user.uid, 
        'notifications', 
        notificationId
      );
      
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: getFirestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    const unreadNotifications = notifications.filter(n => !n.isRead);
    await Promise.all(unreadNotifications.map(n => markAsRead(n.id)));
  };

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    unreadCount: notifications.filter(n => !n.isRead).length,
  };
};
```

---

### Phase 3: NotificationScreen 수정

**파일**: `src/screens/HomeTab/NotificationScreen.tsx`

```typescript
import { useNotifications } from '../../hooks/useNotifications';

export const NotificationScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  const handleNotificationPress = async (notification: Notification) => {
    // 읽음 처리
    await markAsRead(notification.id);
    
    // 알림 타입에 따른 네비게이션
    switch (notification.type) {
      case 'party_join_request':
      case 'party_join_accepted':
      case 'party_deleted':
        // 택시 탭으로 이동
        navigation.navigate('택시');
        if (notification.data.partyId) {
          // 채팅 화면으로 이동
          navigation.navigate('Chat', { partyId: notification.data.partyId });
        }
        break;
      case 'notice':
        // 공지사항 상세 화면으로 이동
        navigation.navigate('NoticeDetailWebView', {
          noticeId: notification.data.noticeId,
          url: notification.data.url,
        });
        break;
      default:
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Notification 아이템 렌더링 (기존 로직 유지)
  const renderNotificationItem = (notification: Notification) => {
    const iconMap = {
      'party_join_request': { icon: 'person-add', color: COLORS.accent.blue },
      'party_join_accepted': { icon: 'checkmark-circle', color: COLORS.accent.green },
      'party_join_rejected': { icon: 'close-circle', color: COLORS.accent.red },
      'party_deleted': { icon: 'car', color: COLORS.text.secondary },
      'notice': { icon: 'notifications', color: COLORS.accent.green },
    };
    
    const { icon, color } = iconMap[notification.type] || { icon: 'notifications', color: COLORS.text.secondary };
    
    return (
      <TouchableOpacity
        key={notification.id}
        style={[
          styles.notificationItem,
          !notification.isRead && styles.unreadNotification
        ]}
        onPress={() => handleNotificationPress(notification)}
      >
        {/* 기존 렌더링 로직 */}
      </TouchableOpacity>
    );
  };

  // 나머지 렌더링 로직은 기존과 동일
};
```

---

## 4. 시퀀스 다이어그램

### 4.1 동승 요청 플로우
```
User A (요청자)         Server        User B (리더)
     |                    |              |
     |-- 동승 요청 생성 -->|              |
     |                    |-- push -->--|
     |                    |              |
     |                    |<- 승인 -------|
     |<-- push (승인) ---|
```

### 4.2 공지사항 알림 플로우
```
Server                  Firestore           Users
  |                         |                 |
  |-- RSS 파싱 (10분마다) --|                 |
  |                         |                 |
  |-- 새 공지 저장 --------->|                 |
  |                         |-- 트리거 ------>|
  |                         |                 |
  |<---- FCM push ---------------------------|
```

---

## 5. 구현 체크리스트

### Cloud Functions
- [ ] `onJoinRequestUpdate` 함수 추가 (승인/거절 알림)
- [ ] `onNoticeCreated`에 userNotifications 생성 로직 추가
- [ ] `onJoinRequestCreate`에 userNotifications 생성 로직 추가
- [ ] `onPartyDelete`에 userNotifications 생성 로직 추가

### React Native
- [ ] `useNotifications` 훅 생성
- [ ] `NotificationScreen` 수정
- [ ] 알림 타입별 아이콘 매핑
- [ ] 알림 읽음 처리
- [ ] 전체 읽음 처리
- [ ] 알림 타입별 네비게이션

---

## 6. 테스트 시나리오

### 6.1 동승 요청 플로우
1. User A가 파티에 동승 요청
2. ✅ User B(리더)에게 "동승 요청" push
3. ✅ User B가 수락
4. ✅ User A에게 "승인됨" push
5. ✅ userNotifications에 두 알림 저장

### 6.2 공지사항 알림
1. RSS 파서가 새 공지 감지
2. ✅ notices 컬렉션에 저장
3. ✅ onNoticeCreated 트리거
4. ✅ 설정 활성화 사용자들에게 push
5. ✅ userNotifications에 알림 저장

---

## 7. 참고사항

- **성능**: userNotifications는 최신 50개만 로드
- **보안**: 사용자는 본인 알림만 조회 가능
- **확장성**: 향후 채팅 알림, 결제 알림 등 추가 용이
