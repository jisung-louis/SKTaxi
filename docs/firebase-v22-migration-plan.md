# Firebase v22 Modular API 마이그레이션 계획

> 작성일: 2026-02-02  
> 목표: React Native Firebase v22 Deprecated Warning 완전 제거

## 📋 개요

React Native Firebase v22에서는 모든 namespaced API가 deprecated되었으며, Firebase Web SDK와 동일한 modular API 패턴으로 전환해야 합니다. 본 문서는 SKTaxi 프로젝트의 전체 코드베이스를 분석하여 수정이 필요한 모든 파일과 구체적인 수정 방법을 정리한 마이그레이션 가이드입니다.

---

## 🔍 현황 분석

### 전체 통계
- **총 파일 수**: 65개 (Firebase 관련)
- **수정 필요**: 31개 파일
- **이미 완료**: 34개 파일
- **예상 작업 시간**: 4-6시간

### 주요 Deprecated API 패턴
```typescript
// ❌ Deprecated
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import messaging from '@react-native-firebase/messaging';
import crashlytics from '@react-native-firebase/crashlytics';
import database from '@react-native-firebase/database';

auth().currentUser
firestore().collection('users')
storage().ref('path')
messaging().getToken()
crashlytics().log('message')
database().ref('path')
```

---

## 📂 수정 필요 파일 목록 (31개)

### 우선순위 1: Core 파일 (2개)
앱 시작 시 실행되는 핵심 파일들

#### 1. `App.tsx`
- **줄 번호**: 18-19, 32, 37
- **Deprecated API**: `auth`, `crashlytics`
- **현재 코드**:
  ```typescript
  import auth from '@react-native-firebase/auth';
  import crashlytics from '@react-native-firebase/crashlytics';
  
  crashlytics().log('App mounted');
  const unsubAuth = auth().onAuthStateChanged(() => {});
  ```
- **수정 후**:
  ```typescript
  import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
  import { getCrashlytics, log } from '@react-native-firebase/crashlytics';
  
  const crashlyticsInstance = getCrashlytics();
  log(crashlyticsInstance, 'App mounted');
  
  const authInstance = getAuth();
  const unsubAuth = onAuthStateChanged(authInstance, () => {});
  ```

#### 2. `src/navigations/MainNavigator.tsx`
- **Deprecated API**: `messaging`, `firestore` (mixed)
- **현재 코드**:
  ```typescript
  import messaging from '@react-native-firebase/messaging';
  import firestore, { collection, onSnapshot } from '@react-native-firebase/firestore';
  ```
- **수정 후**:
  ```typescript
  import { getMessaging } from '@react-native-firebase/messaging';
  import { getFirestore, collection, onSnapshot } from '@react-native-firebase/firestore';
  ```

---

### 우선순위 2: Screens (5개)
사용자가 직접 상호작용하는 화면들

#### 3. `src/screens/HomeTab/SettingScreen.tsx`
- **Deprecated API**: `crashlytics`
- **수정 방법**:
  ```typescript
  // Before
  import crashlytics from '@react-native-firebase/crashlytics';
  crashlytics().log('message');
  
  // After
  import { getCrashlytics, log } from '@react-native-firebase/crashlytics';
  const crashlyticsInstance = getCrashlytics();
  log(crashlyticsInstance, 'message');
  ```

#### 4. `src/screens/HomeTab/ProfileScreen.tsx`
- **Deprecated API**: `auth`
- **수정 방법**:
  ```typescript
  // Before
  import auth from '@react-native-firebase/auth';
  const user = auth().currentUser;
  
  // After
  import { getAuth } from '@react-native-firebase/auth';
  const authInstance = getAuth();
  const user = authInstance.currentUser;
  ```

#### 5-7. Minecraft/Chat Screens (3개)
- `src/screens/ChatTab/ChatDetailScreen.tsx`
- `src/screens/HomeTab/MinecraftDetailScreen.tsx`
- `src/screens/HomeTab/MinecraftMapDetailScreen.tsx`
- **Deprecated API**: `database`
- **수정 방법**:
  ```typescript
  // Before
  import database from '@react-native-firebase/database';
  database().ref('path');
  
  // After
  import { getDatabase, ref } from '@react-native-firebase/database';
  const db = getDatabase();
  ref(db, 'path');
  ```

---

### 우선순위 3: Repositories (5개)
데이터 접근 레이어

#### 8. `src/repositories/firestore/FirestoreAppConfigRepository.ts`
- **Deprecated API**: `firestore`
- **현재 코드**:
  ```typescript
  import firestore from '@react-native-firebase/firestore';
  ```
- **수정 후**:
  ```typescript
  import { getFirestore } from '@react-native-firebase/firestore';
  private db = getFirestore();
  ```

#### 9. `src/repositories/firestore/FirestoreBoardRepository.ts`
- **Deprecated API**: `storage`
- **수정 방법**:
  ```typescript
  // Before
  import storage from '@react-native-firebase/storage';
  
  // After  
  import { getStorage } from '@react-native-firebase/storage';
  private storage = getStorage();
  ```

#### 10. `src/repositories/firestore/FirestoreModerationRepository.ts`
- **Deprecated API**: `firestore`

#### 11-12. Mixed API Repositories (2개)
- `src/repositories/firestore/FirestoreAcademicRepository.ts`
- `src/repositories/firestore/FirestoreCafeteriaRepository.ts`
- **Deprecated API**: `firestore` (mixed - default + named imports)
- **수정 방법**:
  ```typescript
  // Before
  import firestore, { collection, getDocs } from '@react-native-firebase/firestore';
  const db = firestore(getApp());
  
  // After
  import { getFirestore, collection, getDocs } from '@react-native-firebase/firestore';
  const db = getFirestore();
  ```

---

### 우선순위 4: Hooks (2개)
현재 사용 중인 hooks

#### 13. `src/hooks/common/usePermissionStatus.ts`
- **Deprecated API**: `messaging`
- **수정 방법**:
  ```typescript
  // Before
  import messaging from '@react-native-firebase/messaging';
  const status = await messaging().hasPermission();
  
  // After
  import { getMessaging, hasPermission } from '@react-native-firebase/messaging';
  const messagingInstance = getMessaging();
  const status = await hasPermission(messagingInstance);
  ```

#### 14-15. Navigation Hooks (2개)
- `src/navigations/hooks/useForegroundNotification.ts`
- `src/navigations/hooks/useJoinRequestModal.ts`
- **Deprecated API**: `firestore` (mixed)

---

### 우선순위 5: Utilities (4개)
유틸리티 함수들

#### 16. `src/utils/chatRoomUtils.ts`
- **Deprecated API**: `firestore`

#### 17. `src/utils/chatUtils.ts`
- **Deprecated API**: `auth`

#### 18. `src/utils/partyMessageUtils.ts`
- **Deprecated API**: `auth`

#### 19. `src/lib/minecraftChat.ts`
- **Deprecated API**: `auth`, `firestore`

#### 20. `src/lib/moderation.ts`
- **Deprecated API**: `auth`

---

### 우선순위 6: Legacy Hooks (12개)
사용하지 않을 수 있는 레거시 코드 - 사용 여부 확인 필요

#### 21. `src/legacy/hooks-legacy/useAuth.ts`
- **Deprecated API**: `auth`, `firestore`, `messaging`

#### 22. `src/legacy/hooks-legacy/useChatMessages.ts`
- **Deprecated API**: `auth`

#### 23. `src/legacy/hooks-legacy/useChatRooms.ts`
- **Deprecated API**: `firestore` (mixed)

#### 24. `src/legacy/hooks-legacy/useImageUpload.ts`
- **Deprecated API**: `storage` (mixed)

#### 25. `src/legacy/hooks-legacy/useMessages.ts`
- **Deprecated API**: `firestore`, `auth` (mixed)

#### 26. `src/legacy/hooks-legacy/useMyParty.ts`
- **Deprecated API**: `auth`, `firestore` (mixed)

#### 27. `src/legacy/hooks-legacy/useParties.ts`
- **Deprecated API**: `firestore` (mixed)

#### 28. `src/legacy/hooks-legacy/usePendingJoinRequest.ts`
- **Deprecated API**: `auth`, `firestore` (mixed)

#### 29. `src/legacy/hooks-legacy/usePermissionStatus.ts`
- **Deprecated API**: `messaging`

#### 30. `src/legacy/hooks-legacy/useUserDisplayNames.ts`
- **Deprecated API**: `firestore` (mixed)

#### 31. `legacy/ChatScreen.legacy.tsx`
- **Deprecated API**: `firestore`, `auth` (mixed)

---

## 🔧 서비스별 마이그레이션 가이드

### 1. Auth (인증)

#### API 변환표
| Old (Deprecated) | New (Modular) |
|-----------------|---------------|
| `auth()` | `getAuth()` |
| `auth().currentUser` | `getAuth().currentUser` |
| `auth().onAuthStateChanged(callback)` | `onAuthStateChanged(getAuth(), callback)` |
| `auth().signInWithCredential(cred)` | `signInWithCredential(getAuth(), cred)` |
| `auth().signOut()` | `signOut(getAuth())` |

#### 전체 마이그레이션 예제
```typescript
// ❌ Before
import auth from '@react-native-firebase/auth';

const currentUser = auth().currentUser;
const unsubscribe = auth().onAuthStateChanged((user) => {
  console.log('User:', user);
});
await auth().signOut();

// ✅ After
import { getAuth, onAuthStateChanged, signOut } from '@react-native-firebase/auth';

const authInstance = getAuth();
const currentUser = authInstance.currentUser;
const unsubscribe = onAuthStateChanged(authInstance, (user) => {
  console.log('User:', user);
});
await signOut(authInstance);
```

---

### 2. Firestore (데이터베이스)

#### API 변환표
| Old (Deprecated) | New (Modular) |
|-----------------|---------------|
| `firestore()` | `getFirestore()` |
| `firestore().collection('users')` | `collection(getFirestore(), 'users')` |
| `.doc('id')` | `doc(getFirestore(), 'users', 'id')` |
| `.get()` | `getDoc(docRef)` 또는 `getDocs(queryRef)` |
| `.set(data)` | `setDoc(docRef, data)` |
| `.update(data)` | `updateDoc(docRef, data)` |
| `.delete()` | `deleteDoc(docRef)` |
| `.onSnapshot(callback)` | `onSnapshot(docRef, callback)` |

#### 전체 마이그레이션 예제
```typescript
// ❌ Before
import firestore from '@react-native-firebase/firestore';

const db = firestore();
const snapshot = await db.collection('users').doc('userId').get();
const data = snapshot.data();

await db.collection('users').doc('userId').set({ name: 'John' });
await db.collection('users').doc('userId').update({ age: 30 });

const unsubscribe = db.collection('users').doc('userId').onSnapshot((doc) => {
  console.log(doc.data());
});

// ✅ After
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  onSnapshot 
} from '@react-native-firebase/firestore';

const db = getFirestore();
const docRef = doc(db, 'users', 'userId');
const snapshot = await getDoc(docRef);
const data = snapshot.data();

await setDoc(docRef, { name: 'John' });
await updateDoc(docRef, { age: 30 });

const unsubscribe = onSnapshot(docRef, (doc) => {
  console.log(doc.data());
});
```

#### Mixed Import 패턴 수정
```typescript
// ❌ Before (Mixed)
import firestore, { collection, query, where } from '@react-native-firebase/firestore';

const db = firestore();
const q = query(collection(db, 'users'), where('age', '>', 18));

// ✅ After
import { getFirestore, collection, query, where } from '@react-native-firebase/firestore';

const db = getFirestore();
const q = query(collection(db, 'users'), where('age', '>', 18));
```

---

### 3. Storage (저장소)

#### API 변환표
| Old (Deprecated) | New (Modular) |
|-----------------|---------------|
| `storage()` | `getStorage()` |
| `storage().ref('path')` | `ref(getStorage(), 'path')` |
| `.putFile(uri)` | `ref.putFile(uri)` (ref는 modular ref) |
| `.getDownloadURL()` | `getDownloadURL(ref)` |
| `.delete()` | `deleteObject(ref)` |

#### 전체 마이그레이션 예제
```typescript
// ❌ Before
import storage from '@react-native-firebase/storage';

const reference = storage().ref('images/photo.jpg');
await reference.putFile(localUri);
const url = await reference.getDownloadURL();
await reference.delete();

// ✅ After
import { getStorage, ref, getDownloadURL, deleteObject } from '@react-native-firebase/storage';

const storageInstance = getStorage();
const reference = ref(storageInstance, 'images/photo.jpg');
await reference.putFile(localUri);  // putFile은 ref 객체의 메서드로 유지
const url = await getDownloadURL(reference);
await deleteObject(reference);
```

---

### 4. Messaging (푸시 알림)

#### API 변환표
| Old (Deprecated) | New (Modular) |
|-----------------|---------------|
| `messaging()` | `getMessaging()` |
| `messaging().getToken()` | `getToken(getMessaging())` |
| `messaging().hasPermission()` | `hasPermission(getMessaging())` |
| `messaging().requestPermission()` | `requestPermission(getMessaging())` |
| `messaging().onMessage(handler)` | `onMessage(getMessaging(), handler)` |
| `messaging().onTokenRefresh(handler)` | `onTokenRefresh(getMessaging(), handler)` |

#### 전체 마이그레이션 예제
```typescript
// ❌ Before
import messaging from '@react-native-firebase/messaging';

const token = await messaging().getToken();
const status = await messaging().hasPermission();
const unsubscribe = messaging().onMessage((message) => {
  console.log(message);
});

// ✅ After
import { 
  getMessaging, 
  getToken, 
  hasPermission,
  onMessage 
} from '@react-native-firebase/messaging';

const messagingInstance = getMessaging();
const token = await getToken(messagingInstance);
const status = await hasPermission(messagingInstance);
const unsubscribe = onMessage(messagingInstance, (message) => {
  console.log(message);
});
```

---

### 5. Crashlytics (충돌 보고)

#### API 변환표
| Old (Deprecated) | New (Modular) |
|-----------------|---------------|
| `crashlytics()` | `getCrashlytics()` |
| `crashlytics().log(message)` | `log(getCrashlytics(), message)` |
| `crashlytics().recordError(error)` | `recordError(getCrashlytics(), error)` |
| `crashlytics().setUserId(id)` | `setUserId(getCrashlytics(), id)` |
| `crashlytics().setAttribute(key, val)` | `setAttribute(getCrashlytics(), key, val)` |
| `crashlytics().crash()` | `crash(getCrashlytics())` |

#### 전체 마이그레이션 예제
```typescript
// ❌ Before
import crashlytics from '@react-native-firebase/crashlytics';

crashlytics().log('User action performed');
crashlytics().recordError(new Error('Test error'));
await crashlytics().setUserId('user123');
await crashlytics().setAttribute('role', 'admin');

// ✅ After
import { 
  getCrashlytics, 
  log, 
  recordError, 
  setUserId,
  setAttribute 
} from '@react-native-firebase/crashlytics';

const crashlyticsInstance = getCrashlytics();
log(crashlyticsInstance, 'User action performed');
recordError(crashlyticsInstance, new Error('Test error'));
await setUserId(crashlyticsInstance, 'user123');
await setAttribute(crashlyticsInstance, 'role', 'admin');
```

---

### 6. Realtime Database (실시간 데이터베이스)

#### API 변환표
| Old (Deprecated) | New (Modular) |
|-----------------|---------------|
| `database()` | `getDatabase()` |
| `database().ref('path')` | `ref(getDatabase(), 'path')` |
| `.once('value')` | `get(ref)` |
| `.on('value', callback)` | `onValue(ref, callback)` |
| `.set(data)` | `set(ref, data)` |
| `.update(data)` | `update(ref, data)` |
| `.remove()` | `remove(ref)` |
| `.push(data)` | `push(ref, data)` |

#### 전체 마이그레이션 예제
```typescript
// ❌ Before
import database from '@react-native-firebase/database';

const ref = database().ref('users/userId');
const snapshot = await ref.once('value');
const data = snapshot.val();

await ref.set({ name: 'John' });
await ref.update({ age: 30 });

const unsubscribe = ref.on('value', (snapshot) => {
  console.log(snapshot.val());
});

// ✅ After
import { 
  getDatabase, 
  ref, 
  get, 
  set, 
  update,
  onValue 
} from '@react-native-firebase/database';

const db = getDatabase();
const dbRef = ref(db, 'users/userId');
const snapshot = await get(dbRef);
const data = snapshot.val();

await set(dbRef, { name: 'John' });
await update(dbRef, { age: 30 });

const unsubscribe = onValue(dbRef, (snapshot) => {
  console.log(snapshot.val());
});
```

---

## ⚠️ 특수 케이스: getApp() 사용

많은 파일에서 `getApp()`을 사용하고 있습니다. 이것은 여전히 유효하지만, 대부분의 경우 필요하지 않습니다.

### 현재 패턴
```typescript
import { getApp } from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';

const db = firestore(getApp());  // ❌ Deprecated
```

### 수정 후
```typescript
import { getFirestore } from '@react-native-firebase/firestore';

const db = getFirestore();  // ✅ Default app 자동 사용
```

### getApp()이 필요한 경우
여러 Firebase 앱 인스턴스를 사용하는 경우에만 필요:
```typescript
import { getApp } from '@react-native-firebase/app';
import { getFirestore } from '@react-native-firebase/firestore';

const secondaryApp = getApp('secondary');
const db = getFirestore(secondaryApp);
```

---

## 📝 마이그레이션 체크리스트

### Phase 1: 우선순위 1 (Core) ✅
- [ ] App.tsx - auth, crashlytics 수정
- [ ] src/navigations/MainNavigator.tsx - messaging, firestore 수정

### Phase 2: 우선순위 2 (Screens) ✅
- [ ] src/screens/HomeTab/SettingScreen.tsx
- [ ] src/screens/HomeTab/ProfileScreen.tsx
- [ ] src/screens/ChatTab/ChatDetailScreen.tsx
- [ ] src/screens/HomeTab/MinecraftDetailScreen.tsx
- [ ] src/screens/HomeTab/MinecraftMapDetailScreen.tsx

### Phase 3: 우선순위 3 (Repositories) ✅
- [ ] src/repositories/firestore/FirestoreAppConfigRepository.ts
- [ ] src/repositories/firestore/FirestoreBoardRepository.ts
- [ ] src/repositories/firestore/FirestoreModerationRepository.ts
- [ ] src/repositories/firestore/FirestoreAcademicRepository.ts
- [ ] src/repositories/firestore/FirestoreCafeteriaRepository.ts

### Phase 4: 우선순위 4 (Hooks) ✅
- [ ] src/hooks/common/usePermissionStatus.ts
- [ ] src/navigations/hooks/useForegroundNotification.ts
- [ ] src/navigations/hooks/useJoinRequestModal.ts

### Phase 5: 우선순위 5 (Utilities) ✅
- [ ] src/utils/chatRoomUtils.ts
- [ ] src/utils/chatUtils.ts
- [ ] src/utils/partyMessageUtils.ts
- [ ] src/lib/minecraftChat.ts
- [ ] src/lib/moderation.ts

### Phase 6: 우선순위 6 (Legacy - 사용 여부 확인) ⚠️
- [ ] src/legacy/ 폴더 전체 사용 여부 확인
- [ ] 사용 중이면 마이그레이션, 미사용이면 삭제 고려
- [ ] legacy/ChatScreen.legacy.tsx

---

## 🧪 테스트 계획

### 1. 각 Phase 완료 후
```bash
# 앱 빌드 및 실행
yarn start
yarn ios  # 또는 yarn android

# Console에서 warning 확인
# 목표: "@react-native-firebase deprecated" warning 감소 확인
```

### 2. 전체 마이그레이션 완료 후
```bash
# Lint 검사
yarn lint

# 타입 체크
npx tsc --noEmit

# 앱 전체 기능 테스트
- [ ] 로그인/로그아웃
- [ ] 택시 파티 생성/참여
- [ ] 채팅 메시지 전송
- [ ] 프로필 수정
- [ ] 공지사항 조회
- [ ] 게시판 글 작성
- [ ] 마인크래프트 기능
- [ ] 푸시 알림 수신

# Warning 로그 최종 확인
# 목표: 0개의 "@react-native-firebase deprecated" warning
```

---

## 🚨 주의사항

### 1. getApp() 제거 시
대부분의 경우 `getApp()`은 필요 없지만, 여러 Firebase 앱을 사용하는 경우 주의가 필요합니다.

### 2. Mixed Import 패턴
일부 파일은 default import와 named import를 혼용하고 있습니다:
```typescript
// ❌ Mixed (Deprecated)
import firestore, { collection, query } from '@react-native-firebase/firestore';

// ✅ Named only
import { getFirestore, collection, query } from '@react-native-firebase/firestore';
```

### 3. Type Import는 유지
타입만 import하는 경우 수정 불필요:
```typescript
// ✅ OK - Type-only import
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
```

### 4. Legacy 폴더 확인
`src/legacy/` 폴더의 파일들이 실제로 사용되는지 먼저 확인:
```bash
# Legacy 파일 참조 확인
grep -r "from './legacy" src/
grep -r "from '../legacy" src/
```

---

## 📊 예상 시간표

| Phase | 파일 수 | 예상 시간 | 난이도 |
|-------|---------|----------|--------|
| Phase 1 (Core) | 2 | 30분 | 중 |
| Phase 2 (Screens) | 5 | 45분 | 하 |
| Phase 3 (Repositories) | 5 | 1시간 | 중 |
| Phase 4 (Hooks) | 3 | 30분 | 중 |
| Phase 5 (Utilities) | 5 | 45분 | 하 |
| Phase 6 (Legacy) | 12 | 1-2시간 | 변동 |
| **테스트** | - | 1시간 | - |
| **총계** | 31 | **4-6시간** | - |

---

## 🔗 참고 자료

- [React Native Firebase v22 마이그레이션 가이드](https://rnfirebase.io/migrating-to-v22)
- [Firebase Web Modular API](https://firebase.google.com/docs/web/modular-upgrade)
- [React Native Firebase 공식 문서](https://rnfirebase.io)
- [Crashlytics Modular API Reference](https://rnfirebase.io/reference/crashlytics)
- [Auth Modular API Reference](https://rnfirebase.io/reference/auth)
- [Firestore Modular API Reference](https://rnfirebase.io/reference/firestore)

---

## 📞 문제 발생 시

### Warning이 계속 나타나는 경우
1. 해당 파일의 import 문 재확인
2. getApp() 사용 여부 확인
3. 캐시 클리어 후 재빌드:
   ```bash
   yarn start --reset-cache
   rm -rf ios/build android/build
   ```

### 런타임 에러 발생 시
1. Firebase 초기화 확인 (src/config/firebase.ts)
2. google-services.json, GoogleService-Info.plist 확인
3. Native 모듈 재빌드:
   ```bash
   cd ios && pod install && cd ..
   yarn ios --clean
   ```

---

**문서 버전**: 1.0  
**최종 수정**: 2026-02-02  
**작성자**: Claude Code + Context7 MCP
