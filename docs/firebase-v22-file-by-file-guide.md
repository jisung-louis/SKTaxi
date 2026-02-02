# Firebase v22 파일별 상세 수정 가이드

> 본 문서는 각 파일의 Before/After 코드를 상세하게 정리한 실무 가이드입니다.

---

## 📌 목차

- [Phase 1: Core 파일](#phase-1-core-파일)
- [Phase 2: Screens](#phase-2-screens)
- [Phase 3: Repositories](#phase-3-repositories)
- [Phase 4: Hooks](#phase-4-hooks)
- [Phase 5: Utilities](#phase-5-utilities)
- [Phase 6: Legacy](#phase-6-legacy)

---

## Phase 1: Core 파일

### 1. App.tsx

#### 현재 코드 (문제점)
```typescript
// Line 18-19
import auth from '@react-native-firebase/auth';
import crashlytics from '@react-native-firebase/crashlytics';

// Line 32
crashlytics().log('App mounted');

// Line 37
const unsubAuth = auth().onAuthStateChanged(() => {});
```

#### 수정 후 코드
```typescript
// Import 수정
import { getAuth, onAuthStateChanged } from '@react-native-firebase/auth';
import { getCrashlytics, log } from '@react-native-firebase/crashlytics';

// useEffect 내부에서
useEffect(() => {
  configureGoogleSignin();
  
  // Crashlytics 인스턴스 생성 및 사용
  const crashlyticsInstance = getCrashlytics();
  log(crashlyticsInstance, 'App mounted');
  
  // Auth 인스턴스 생성 및 사용
  const authInstance = getAuth();
  const unsubAuth = onAuthStateChanged(authInstance, () => {});
  
  if (Platform.OS === 'android') {
    ImmersiveMode.setBarMode('BottomSticky');
  }
  
  // 버전 체크 로직 (변경 없음)
  checkVersionUpdate().then((result) => {
    if (result.forceUpdate) {
      setForceUpdateRequired(true);
      setModalConfig(result.modalConfig);
      console.log('강제 업데이트 필요:', result);
    }
  }).catch((error) => {
    console.error('버전 체크 실패:', error);
  });
  
  return () => { unsubAuth(); };
}, []);
```

#### 변경 사항 요약
- ✅ `auth` → `getAuth()`, `onAuthStateChanged()`
- ✅ `crashlytics` → `getCrashlytics()`, `log()`
- ✅ 인스턴스를 변수에 저장하여 재사용

---

### 2. src/navigations/MainNavigator.tsx

#### 현재 코드 (문제점)
```typescript
import messaging from '@react-native-firebase/messaging';
import firestore, { collection, onSnapshot } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

// 어딘가에서 사용
messaging().requestPermission();
const db = firestore(getApp());
```

#### 수정 후 코드
```typescript
import { getMessaging, requestPermission } from '@react-native-firebase/messaging';
import { getFirestore, collection, onSnapshot } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// 인스턴스 생성
const messagingInstance = getMessaging();
const db = getFirestore();

// 사용
requestPermission(messagingInstance);
const colRef = collection(db, 'collectionName');
```

#### 변경 사항 요약
- ✅ `messaging` default import 제거
- ✅ `firestore` default import 제거
- ✅ `getApp()` 제거 (불필요)
- ✅ `getMessaging()`, `getFirestore()` 사용

---

## Phase 2: Screens

### 3. src/screens/HomeTab/SettingScreen.tsx

#### 파일 전체 수정
```typescript
// ❌ Before
import crashlytics from '@react-native-firebase/crashlytics';

const SettingScreen = () => {
  const handleCrashTest = () => {
    crashlytics().log('Testing crash');
    crashlytics().crash();
  };
  
  return (
    // JSX...
  );
};
```

```typescript
// ✅ After
import { getCrashlytics, log, crash } from '@react-native-firebase/crashlytics';

const SettingScreen = () => {
  const handleCrashTest = () => {
    const crashlyticsInstance = getCrashlytics();
    log(crashlyticsInstance, 'Testing crash');
    crash(crashlyticsInstance);
  };
  
  return (
    // JSX...
  );
};
```

---

### 4. src/screens/HomeTab/ProfileScreen.tsx

#### 파일 전체 수정
```typescript
// ❌ Before
import auth from '@react-native-firebase/auth';

const ProfileScreen = () => {
  const currentUser = auth().currentUser;
  
  const handleLogout = async () => {
    await auth().signOut();
  };
  
  return (
    // JSX...
  );
};
```

```typescript
// ✅ After
import { getAuth, signOut } from '@react-native-firebase/auth';

const ProfileScreen = () => {
  const authInstance = getAuth();
  const currentUser = authInstance.currentUser;
  
  const handleLogout = async () => {
    await signOut(authInstance);
  };
  
  return (
    // JSX...
  );
};
```

---

### 5. src/screens/ChatTab/ChatDetailScreen.tsx

#### 파일 전체 수정
```typescript
// ❌ Before
import database from '@react-native-firebase/database';

const ChatDetailScreen = () => {
  const messagesRef = database().ref('mc_chat/messages');
  
  useEffect(() => {
    messagesRef.on('value', (snapshot) => {
      // handle data
    });
    
    return () => messagesRef.off();
  }, []);
  
  return (
    // JSX...
  );
};
```

```typescript
// ✅ After
import { getDatabase, ref, onValue, off } from '@react-native-firebase/database';

const ChatDetailScreen = () => {
  const db = getDatabase();
  const messagesRef = ref(db, 'mc_chat/messages');
  
  useEffect(() => {
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      // handle data
    });
    
    return () => unsubscribe();
  }, []);
  
  return (
    // JSX...
  );
};
```

---

### 6-7. Minecraft Screens (동일 패턴)

**적용 파일:**
- `src/screens/HomeTab/MinecraftDetailScreen.tsx`
- `src/screens/HomeTab/MinecraftMapDetailScreen.tsx`

#### 수정 패턴
```typescript
// ❌ Before
import database from '@react-native-firebase/database';
database().ref('path')

// ✅ After
import { getDatabase, ref } from '@react-native-firebase/database';
const db = getDatabase();
ref(db, 'path')
```

---

## Phase 3: Repositories

### 8. src/repositories/firestore/FirestoreAppConfigRepository.ts

#### 현재 코드
```typescript
import firestore from '@react-native-firebase/firestore';

export class FirestoreAppConfigRepository {
  // 사용 예시
  async getConfig() {
    const doc = await firestore()
      .collection('appConfig')
      .doc('main')
      .get();
    return doc.data();
  }
}
```

#### 수정 후 코드
```typescript
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc 
} from '@react-native-firebase/firestore';

export class FirestoreAppConfigRepository {
  private db = getFirestore();
  
  async getConfig() {
    const docRef = doc(this.db, 'appConfig', 'main');
    const docSnap = await getDoc(docRef);
    return docSnap.data();
  }
}
```

---

### 9. src/repositories/firestore/FirestoreBoardRepository.ts

#### 현재 코드
```typescript
import storage from '@react-native-firebase/storage';

export class FirestoreBoardRepository {
  async uploadImage(uri: string, path: string) {
    const ref = storage().ref(path);
    await ref.putFile(uri);
    return await ref.getDownloadURL();
  }
}
```

#### 수정 후 코드
```typescript
import { getStorage, ref, getDownloadURL } from '@react-native-firebase/storage';

export class FirestoreBoardRepository {
  private storage = getStorage();
  
  async uploadImage(uri: string, path: string) {
    const storageRef = ref(this.storage, path);
    await storageRef.putFile(uri);
    return await getDownloadURL(storageRef);
  }
}
```

---

### 10. src/repositories/firestore/FirestoreModerationRepository.ts

#### 수정 패턴
```typescript
// ❌ Before
import firestore from '@react-native-firebase/firestore';
const db = firestore();

// ✅ After
import { getFirestore } from '@react-native-firebase/firestore';
private db = getFirestore();
```

---

### 11-12. Mixed Import Repositories

**적용 파일:**
- `src/repositories/firestore/FirestoreAcademicRepository.ts`
- `src/repositories/firestore/FirestoreCafeteriaRepository.ts`

#### 현재 코드 (Mixed)
```typescript
import firestore, { collection, getDocs, query, orderBy } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

export class FirestoreAcademicRepository {
  async getSchedules() {
    const db = firestore(getApp());
    const q = query(
      collection(db, 'academicSchedules'),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }
}
```

#### 수정 후 코드
```typescript
import { 
  getFirestore,
  collection, 
  getDocs, 
  query, 
  orderBy 
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

export class FirestoreAcademicRepository {
  private db = getFirestore();
  
  async getSchedules() {
    const q = query(
      collection(this.db, 'academicSchedules'),
      orderBy('date', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => doc.data());
  }
}
```

---

## Phase 4: Hooks

### 13. src/hooks/common/usePermissionStatus.ts

#### 현재 코드
```typescript
import messaging from '@react-native-firebase/messaging';
import { useState, useEffect } from 'react';

export const usePermissionStatus = () => {
  const [status, setStatus] = useState<number>(0);
  
  useEffect(() => {
    const checkPermission = async () => {
      const authStatus = await messaging().hasPermission();
      setStatus(authStatus);
    };
    
    checkPermission();
  }, []);
  
  return status;
};
```

#### 수정 후 코드
```typescript
import { getMessaging, hasPermission } from '@react-native-firebase/messaging';
import { useState, useEffect } from 'react';

export const usePermissionStatus = () => {
  const [status, setStatus] = useState<number>(0);
  
  useEffect(() => {
    const checkPermission = async () => {
      const messagingInstance = getMessaging();
      const authStatus = await hasPermission(messagingInstance);
      setStatus(authStatus);
    };
    
    checkPermission();
  }, []);
  
  return status;
};
```

---

### 14-15. Navigation Hooks

**적용 파일:**
- `src/navigations/hooks/useForegroundNotification.ts`
- `src/navigations/hooks/useJoinRequestModal.ts`

#### 현재 코드 (Mixed)
```typescript
import firestore, { doc, getDoc } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

const db = firestore(getApp());
const docRef = doc(db, 'collection', 'docId');
```

#### 수정 후 코드
```typescript
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';

const db = getFirestore();
const docRef = doc(db, 'collection', 'docId');
```

---

## Phase 5: Utilities

### 16. src/utils/chatRoomUtils.ts

#### 수정 패턴
```typescript
// ❌ Before
import firestore from '@react-native-firebase/firestore';

export const createChatRoom = async () => {
  const ref = firestore().collection('chatRooms').doc();
  await ref.set({ /* data */ });
};

// ✅ After
import { getFirestore, collection, doc, setDoc } from '@react-native-firebase/firestore';

export const createChatRoom = async () => {
  const db = getFirestore();
  const docRef = doc(collection(db, 'chatRooms'));
  await setDoc(docRef, { /* data */ });
};
```

---

### 17-18. Auth Utils

**적용 파일:**
- `src/utils/chatUtils.ts`
- `src/utils/partyMessageUtils.ts`

#### 수정 패턴
```typescript
// ❌ Before
import auth from '@react-native-firebase/auth';
const currentUser = auth().currentUser;

// ✅ After
import { getAuth } from '@react-native-firebase/auth';
const authInstance = getAuth();
const currentUser = authInstance.currentUser;
```

---

### 19. src/lib/minecraftChat.ts

#### 현재 코드
```typescript
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

export const sendMinecraftMessage = async (message: string) => {
  const user = auth().currentUser;
  const db = firestore(getApp());
  
  await db.collection('messages').add({
    userId: user?.uid,
    message,
    timestamp: firestore.FieldValue.serverTimestamp()
  });
};
```

#### 수정 후 코드
```typescript
import { getAuth } from '@react-native-firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp 
} from '@react-native-firebase/firestore';

export const sendMinecraftMessage = async (message: string) => {
  const authInstance = getAuth();
  const user = authInstance.currentUser;
  const db = getFirestore();
  
  await addDoc(collection(db, 'messages'), {
    userId: user?.uid,
    message,
    timestamp: serverTimestamp()
  });
};
```

---

### 20. src/lib/moderation.ts

#### 수정 패턴 (간단)
```typescript
// ❌ Before
import auth from '@react-native-firebase/auth';
const user = auth().currentUser;

// ✅ After
import { getAuth } from '@react-native-firebase/auth';
const authInstance = getAuth();
const user = authInstance.currentUser;
```

---

## Phase 6: Legacy

### 레거시 파일 처리 방침

#### 1단계: 사용 여부 확인
```bash
# 각 legacy 파일이 현재 코드에서 참조되는지 확인
grep -r "from './legacy/hooks-legacy/useAuth'" src/
grep -r "from '../legacy/hooks-legacy/useAuth'" src/

# 참조가 없으면 미사용 파일
```

#### 2단계: 처리 방법
- **사용 중**: 위의 패턴대로 마이그레이션
- **미사용**: 삭제 또는 보관

### 주요 레거시 파일 수정 패턴

#### useAuth.ts (예시)
```typescript
// ❌ Before
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';

export const useAuth = () => {
  const [user, setUser] = useState(auth().currentUser);
  
  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);
  
  const logout = async () => {
    await auth().signOut();
  };
  
  return { user, logout };
};
```

```typescript
// ✅ After
import { getAuth, onAuthStateChanged, signOut } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getMessaging } from '@react-native-firebase/messaging';

export const useAuth = () => {
  const authInstance = getAuth();
  const [user, setUser] = useState(authInstance.currentUser);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setUser(user);
    });
    return unsubscribe;
  }, []);
  
  const logout = async () => {
    await signOut(authInstance);
  };
  
  return { user, logout };
};
```

---

## 🔍 공통 수정 패턴 정리

### 1. Default Import → Named Import
```typescript
// ❌ Before
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// ✅ After
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
```

### 2. 인스턴스 생성 및 사용
```typescript
// ❌ Before
auth().currentUser
firestore().collection('users')

// ✅ After
const authInstance = getAuth();
authInstance.currentUser

const db = getFirestore();
collection(db, 'users')
```

### 3. Mixed Import 정리
```typescript
// ❌ Before (Mixed)
import firestore, { collection, query } from '@react-native-firebase/firestore';

// ✅ After (Named only)
import { getFirestore, collection, query } from '@react-native-firebase/firestore';
```

### 4. getApp() 제거
```typescript
// ❌ Before
import { getApp } from '@react-native-firebase/app';
const db = firestore(getApp());

// ✅ After
const db = getFirestore();  // Default app 자동 사용
```

### 5. FieldValue → serverTimestamp
```typescript
// ❌ Before
import firestore from '@react-native-firebase/firestore';
timestamp: firestore.FieldValue.serverTimestamp()

// ✅ After
import { serverTimestamp } from '@react-native-firebase/firestore';
timestamp: serverTimestamp()
```

---

## 🛠️ 자동화 도구

### 파일별 빠른 체크
```bash
# 특정 파일의 deprecated import 확인
grep -n "import.*from '@react-native-firebase/" <파일경로>

# 해당 파일에서 사용되는 Firebase 메서드 확인
grep -n "auth()\|firestore()\|storage()\|messaging()\|crashlytics()" <파일경로>
```

### 전체 진행 상황 확인
```bash
# 아직 수정되지 않은 파일 카운트
find src -name "*.ts" -o -name "*.tsx" | xargs grep -l "import auth from\|import firestore from\|import storage from" | wc -l
```

---

**문서 버전**: 1.0  
**최종 수정**: 2026-02-02
