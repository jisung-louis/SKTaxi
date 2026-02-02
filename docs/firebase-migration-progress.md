# Firebase v22 마이그레이션 진행 상황

## ✅ 완료된 Phase

### Phase 1: Core 파일 (2/2) - 완료! ✅
- ✅ **App.tsx** - auth, crashlytics → modular API 완료
- ✅ **src/navigations/MainNavigator.tsx** - messaging, firestore → modular API 완료

### Phase 2: Screens (5/5) - 완료! ✅
- ✅ **src/screens/HomeTab/SettingScreen.tsx** - crashlytics → modular API 완료
- ✅ **src/screens/HomeTab/ProfileScreen.tsx** - auth → modular API 완료
- ✅ **src/screens/ChatTab/ChatDetailScreen.tsx** - database → modular API 완료
- ✅ **src/screens/HomeTab/MinecraftDetailScreen.tsx** - database → modular API 완료
- ✅ **src/screens/HomeTab/MinecraftMapDetailScreen.tsx** - database → modular API 완료

**Phase 2 주요 변경사항:**
1. **SettingScreen.tsx**
   - `crashlytics().log()` → `log(getCrashlytics(), ...)`
   - `crashlytics().crash()` → `crash(getCrashlytics())`

2. **ProfileScreen.tsx**
   - `auth().currentUser` → `getAuth().currentUser`

3. **ChatDetailScreen.tsx, MinecraftDetailScreen.tsx, MinecraftMapDetailScreen.tsx**
   - `database().ref('path')` → `ref(getDatabase(), 'path')`
   - `ref.on('value', callback)` → `onValue(ref, callback)`
   - `ref.off('value', handler)` → `unsubscribe()` (onValue가 반환하는 함수)

---

### Phase 3: Repositories (5/5) - 완료! ✅
- ✅ **src/repositories/firestore/FirestoreAppConfigRepository.ts** - firestore → modular API 완료
- ✅ **src/repositories/firestore/FirestoreBoardRepository.ts** - storage, firestore → modular API 완료
- ✅ **src/repositories/firestore/FirestoreModerationRepository.ts** - firestore → modular API 완료
- ✅ **src/repositories/firestore/FirestoreAcademicRepository.ts** - firestore → modular API 완료
- ✅ **src/repositories/firestore/FirestoreCafeteriaRepository.ts** - firestore → modular API 완료

**Phase 3 주요 변경사항:**
1. **FirestoreAppConfigRepository.ts**
   - `import firestore from '@react-native-firebase/firestore'` → `import { getFirestore }`
   - `private db = firestore()` → `private db = getFirestore()`

2. **FirestoreBoardRepository.ts**
   - Mixed import 제거: `import firestore, { ... }` → `import { getFirestore, ... }`
   - `import storage from '@react-native-firebase/storage'` → `import { getStorage, ref }`
   - `firestore(getApp())` → `getFirestore()` (getApp 제거)
   - `storage().ref(filename)` → `ref(getStorage(), filename)`
   - `storage().refFromURL(imageUrl)` → `ref(getStorage(), imageUrl)`

3. **FirestoreModerationRepository.ts**
   - `firestore()` → `getFirestore()`
   - `firestore.FieldValue.serverTimestamp()` → `serverTimestamp()`

4. **FirestoreAcademicRepository.ts**
   - Mixed import 제거, getApp() 제거
   - `firestore(getApp())` → `getFirestore()`

5. **FirestoreCafeteriaRepository.ts**
   - Mixed import 제거, getApp() 제거
   - `firestore(getApp())` → `getFirestore()`

---

### Phase 4: Hooks (3/3) - 완료! ✅
- ✅ **src/hooks/common/usePermissionStatus.ts** - messaging → modular API 완료
- ✅ **src/navigations/hooks/useForegroundNotification.ts** - firestore → modular API 완료
- ✅ **src/navigations/hooks/useJoinRequestModal.ts** - firestore → modular API 완료

**Phase 4 주요 변경사항:**
1. **usePermissionStatus.ts**
   - `import messaging from '@react-native-firebase/messaging'` → `import { getMessaging, requestPermission, AuthorizationStatus }`
   - `messaging().requestPermission()` → `requestPermission(getMessaging())`
   - `messaging.AuthorizationStatus.AUTHORIZED` → `AuthorizationStatus.AUTHORIZED`

2. **useForegroundNotification.ts**
   - Mixed import 제거: `import firestore, { ... }` → `import { getFirestore, ... }`
   - `firestore(getApp())` → `getFirestore()` (getApp 제거)

3. **useJoinRequestModal.ts**
   - Mixed import 제거: `import firestore, { ... }` → `import { getFirestore, ... }`
   - `firestore()` → `getFirestore()`

---

### Phase 5: Utilities (5/5) - 완료! ✅
- ✅ **src/utils/chatRoomUtils.ts** - firestore → modular API 완료
- ✅ **src/utils/chatUtils.ts** - auth, firestore → modular API 완료
- ✅ **src/utils/partyMessageUtils.ts** - auth → modular API 완료
- ✅ **src/lib/minecraftChat.ts** - auth, firestore → modular API 완료
- ✅ **src/lib/moderation.ts** - auth → modular API 완료

**Phase 5 주요 변경사항:**
1. **chatRoomUtils.ts**
   - `import firestore from '@react-native-firebase/firestore'` → `import { getFirestore, arrayRemove }`
   - `firestore().collection()` → `getFirestore().collection()`
   - `firestore.FieldValue.arrayRemove(uid)` → `arrayRemove(uid)`

2. **chatUtils.ts**
   - `import auth from '@react-native-firebase/auth'` → `import { getAuth }`
   - `auth(getApp()).currentUser` → `getAuth().currentUser`
   - Dynamic import: `firestore(getApp())` → `getFirestore()`
   - `getApp()` 제거

3. **partyMessageUtils.ts**
   - `auth(getApp()).currentUser` → `getAuth().currentUser` (4곳)
   - `getApp()` 제거

4. **minecraftChat.ts**
   - `auth(getApp()).currentUser` → `getAuth().currentUser`
   - `firestore(getApp())` → `getFirestore()`
   - `getApp()` 제거

5. **moderation.ts**
   - `auth().currentUser` → `getAuth().currentUser` (5곳)

---

## 📋 다음 단계: Phase 6 - Legacy (12개)

### 테스트 권장
Phase 5 완료 후 테스트를 권장합니다:
```bash
yarn start
yarn ios  # 또는 yarn android
```

특히 다음 기능들을 테스트하세요:
- 학과 채팅방 가입/탈퇴
- 채팅 메시지 전송
- 파티 채팅 메시지 전송 (일반/계좌/도착/종료)
- 마인크래프트 채팅 메시지 전송
- 신고/차단 기능

### Phase 6 파일 목록 (사용 여부 확인 필요)
1-11. `src/legacy/hooks-legacy/*.ts` (11개)
12. `legacy/ChatScreen.legacy.tsx`

⚠️ **주의**: Legacy 파일들은 사용 여부를 먼저 확인한 후 마이그레이션 또는 삭제를 결정해야 합니다.

---

## 📊 전체 진행률

- ✅ Phase 1: 2/2 (100%) - 완료
- ✅ Phase 2: 5/5 (100%) - 완료
- ✅ Phase 3: 5/5 (100%) - 완료
- ✅ Phase 4: 3/3 (100%) - 완료
- ✅ Phase 5: 5/5 (100%) - 완료
- ⏳ Phase 6: 0/12 (0%)

**전체: 20/31 (64.5%)** 🎉

---

**최종 업데이트**: 2026-02-02
