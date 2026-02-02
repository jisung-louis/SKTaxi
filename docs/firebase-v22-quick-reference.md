# Firebase v22 Quick Reference (빠른 참조 가이드)

> 실무에서 바로 사용할 수 있는 코드 스니펫 모음

---

## 🚀 Service별 Quick Snippets

### Auth
```typescript
// Import
import { 
  getAuth, 
  onAuthStateChanged, 
  signOut,
  signInWithCredential,
  GoogleAuthProvider 
} from '@react-native-firebase/auth';

// 인스턴스
const auth = getAuth();

// 현재 유저
auth.currentUser

// Auth 상태 변화 감지
onAuthStateChanged(auth, (user) => {
  if (user) console.log('Logged in:', user.uid);
});

// 로그아웃
await signOut(auth);

// Google 로그인
const googleCredential = GoogleAuthProvider.credential(idToken);
await signInWithCredential(auth, googleCredential);
```

---

### Firestore
```typescript
// Import
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  increment
} from '@react-native-firebase/firestore';

// 인스턴스
const db = getFirestore();

// 문서 읽기
const docRef = doc(db, 'users', 'userId');
const docSnap = await getDoc(docRef);
const data = docSnap.data();

// 문서 쓰기
await setDoc(docRef, { name: 'John', age: 30 });

// 문서 업데이트
await updateDoc(docRef, { age: 31 });

// 문서 삭제
await deleteDoc(docRef);

// 컬렉션에 추가 (자동 ID)
const colRef = collection(db, 'users');
const newDocRef = await addDoc(colRef, { name: 'Jane' });

// 쿼리
const q = query(
  collection(db, 'users'),
  where('age', '>', 18),
  orderBy('age', 'desc'),
  limit(10)
);
const querySnapshot = await getDocs(q);
querySnapshot.forEach(doc => {
  console.log(doc.id, doc.data());
});

// 실시간 구독
const unsubscribe = onSnapshot(docRef, (doc) => {
  console.log('Current data:', doc.data());
});

// Timestamp
timestamp: serverTimestamp()

// Increment
count: increment(1)
```

---

### Storage
```typescript
// Import
import {
  getStorage,
  ref,
  getDownloadURL,
  deleteObject
} from '@react-native-firebase/storage';

// 인스턴스
const storage = getStorage();

// 참조 생성
const storageRef = ref(storage, 'images/photo.jpg');

// 파일 업로드 (putFile은 ref 메서드)
await storageRef.putFile(localUri);

// 다운로드 URL 가져오기
const url = await getDownloadURL(storageRef);

// 파일 삭제
await deleteObject(storageRef);
```

---

### Messaging (FCM)
```typescript
// Import
import {
  getMessaging,
  getToken,
  hasPermission,
  requestPermission,
  onMessage,
  onTokenRefresh,
  setBackgroundMessageHandler,
  onNotificationOpenedApp,
  getInitialNotification
} from '@react-native-firebase/messaging';

// 인스턴스
const messaging = getMessaging();

// FCM 토큰 가져오기
const token = await getToken(messaging);

// 권한 확인
const authStatus = await hasPermission(messaging);

// 권한 요청
await requestPermission(messaging);

// 포그라운드 메시지 수신
const unsubscribe = onMessage(messaging, (message) => {
  console.log('Message:', message);
});

// 토큰 갱신 감지
onTokenRefresh(messaging, (token) => {
  console.log('New token:', token);
});

// 백그라운드 핸들러
setBackgroundMessageHandler(messaging, async (message) => {
  console.log('Background message:', message);
});

// 알림으로 앱 열림
onNotificationOpenedApp(messaging, (message) => {
  console.log('App opened from notification:', message);
});

// 종료 상태에서 알림으로 열림
const initialMessage = await getInitialNotification(messaging);
```

---

### Crashlytics
```typescript
// Import
import {
  getCrashlytics,
  log,
  recordError,
  setUserId,
  setAttribute,
  setAttributes,
  crash
} from '@react-native-firebase/crashlytics';

// 인스턴스
const crashlytics = getCrashlytics();

// 로그 기록
log(crashlytics, 'User performed action');

// 에러 기록
try {
  // code
} catch (error) {
  recordError(crashlytics, error);
}

// 사용자 ID 설정
await setUserId(crashlytics, 'user123');

// 속성 설정 (단일)
await setAttribute(crashlytics, 'role', 'admin');

// 속성 설정 (다중)
await setAttributes(crashlytics, {
  role: 'admin',
  plan: 'premium'
});

// 강제 크래시 (테스트용)
crash(crashlytics);
```

---

### Analytics
```typescript
// Import
import {
  getAnalytics,
  logEvent,
  setUserId,
  setUserProperties,
  logScreenView
} from '@react-native-firebase/analytics';

// 인스턴스
const analytics = getAnalytics();

// 이벤트 로깅
await logEvent(analytics, 'select_content', {
  content_type: 'product',
  item_id: 'P12345'
});

// 사용자 ID 설정
await setUserId(analytics, 'user123');

// 사용자 속성 설정
await setUserProperties(analytics, {
  age: '25-34',
  gender: 'male'
});

// 화면 조회 로깅
await logScreenView(analytics, {
  screen_name: 'HomeScreen',
  screen_class: 'HomeScreen'
});
```

---

### Realtime Database
```typescript
// Import
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
  push,
  onValue,
  off
} from '@react-native-firebase/database';

// 인스턴스
const db = getDatabase();

// 참조 생성
const dbRef = ref(db, 'users/userId');

// 한 번 읽기
const snapshot = await get(dbRef);
const data = snapshot.val();

// 쓰기
await set(dbRef, { name: 'John', age: 30 });

// 업데이트
await update(dbRef, { age: 31 });

// 삭제
await remove(dbRef);

// 자동 ID로 추가
const newRef = push(ref(db, 'messages'));
await set(newRef, { text: 'Hello' });

// 실시간 구독
const unsubscribe = onValue(dbRef, (snapshot) => {
  console.log('Data:', snapshot.val());
});

// 구독 해제
unsubscribe();
```

---

## 🔄 자주 사용하는 패턴

### 1. 현재 유저 정보 가져오기
```typescript
import { getAuth } from '@react-native-firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  console.log('User ID:', user.uid);
  console.log('Email:', user.email);
  console.log('Display Name:', user.displayName);
}
```

---

### 2. Firestore 실시간 구독 (Hook)
```typescript
import { getFirestore, doc, onSnapshot } from '@react-native-firebase/firestore';
import { useState, useEffect } from 'react';

export const useDocument = (path: string, docId: string) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getFirestore();
    const docRef = doc(db, path, docId);
    
    const unsubscribe = onSnapshot(docRef, (doc) => {
      setData(doc.data());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [path, docId]);

  return { data, loading };
};
```

---

### 3. FCM 토큰 저장 (로그인 시)
```typescript
import { getAuth } from '@react-native-firebase/auth';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { getFirestore, doc, setDoc } from '@react-native-firebase/firestore';

const saveFcmToken = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) return;

  const messaging = getMessaging();
  const token = await getToken(messaging);
  
  const db = getFirestore();
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, { fcmToken: token }, { merge: true });
};
```

---

### 4. 이미지 업로드 및 URL 저장
```typescript
import { getStorage, ref, getDownloadURL } from '@react-native-firebase/storage';
import { getFirestore, doc, updateDoc } from '@react-native-firebase/firestore';

const uploadProfileImage = async (userId: string, imageUri: string) => {
  // Storage에 업로드
  const storage = getStorage();
  const storageRef = ref(storage, `profiles/${userId}.jpg`);
  await storageRef.putFile(imageUri);
  
  // URL 가져오기
  const url = await getDownloadURL(storageRef);
  
  // Firestore에 URL 저장
  const db = getFirestore();
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { photoURL: url });
  
  return url;
};
```

---

### 5. 배치 쓰기 (Transaction 대체)
```typescript
import { 
  getFirestore, 
  writeBatch, 
  doc 
} from '@react-native-firebase/firestore';

const batchUpdate = async () => {
  const db = getFirestore();
  const batch = writeBatch(db);
  
  const ref1 = doc(db, 'collection', 'doc1');
  batch.set(ref1, { field: 'value1' });
  
  const ref2 = doc(db, 'collection', 'doc2');
  batch.update(ref2, { field: 'value2' });
  
  const ref3 = doc(db, 'collection', 'doc3');
  batch.delete(ref3);
  
  await batch.commit();
};
```

---

## 🐛 디버깅 팁

### Warning 확인
```bash
# Metro bundler 로그에서 확인
yarn start

# iOS
yarn ios

# Android
yarn android

# Console에서 "deprecated" 키워드 검색
```

### 특정 파일의 deprecated API 찾기
```bash
grep -n "auth()\|firestore()\|storage()\|messaging()\|crashlytics()\|database()" <파일경로>
```

### 전체 프로젝트 스캔
```bash
# Default import 사용하는 파일 찾기
grep -r "import auth from\|import firestore from\|import storage from" src/ App.tsx
```

---

## 📝 체크리스트

### Import 변환
- [ ] `import auth from` → `import { getAuth } from`
- [ ] `import firestore from` → `import { getFirestore } from`
- [ ] `import storage from` → `import { getStorage } from`
- [ ] `import messaging from` → `import { getMessaging } from`
- [ ] `import crashlytics from` → `import { getCrashlytics } from`
- [ ] `import database from` → `import { getDatabase } from`

### 메서드 호출 변환
- [ ] `auth()` → `getAuth()`
- [ ] `firestore()` → `getFirestore()`
- [ ] `auth().method()` → `method(getAuth())`
- [ ] `firestore().collection()` → `collection(getFirestore())`

### 기타
- [ ] `getApp()` 제거 (대부분 불필요)
- [ ] Mixed import 정리
- [ ] Type import는 유지

---

**문서 버전**: 1.0  
**최종 수정**: 2026-02-02
