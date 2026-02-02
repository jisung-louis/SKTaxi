# Firebase v22 마이그레이션 요약

## 📊 전체 통계

| 항목 | 개수 |
|-----|------|
| 총 Firebase 관련 파일 | 65개 |
| 수정 필요 파일 | 31개 |
| 이미 완료된 파일 | 34개 |
| 예상 작업 시간 | 4-6시간 |

---

## 📂 수정 필요 파일 31개 목록

### Phase 1: Core (2개) - 최우선
1. `App.tsx`
2. `src/navigations/MainNavigator.tsx`

### Phase 2: Screens (5개)
3. `src/screens/HomeTab/SettingScreen.tsx`
4. `src/screens/HomeTab/ProfileScreen.tsx`
5. `src/screens/ChatTab/ChatDetailScreen.tsx`
6. `src/screens/HomeTab/MinecraftDetailScreen.tsx`
7. `src/screens/HomeTab/MinecraftMapDetailScreen.tsx`

### Phase 3: Repositories (5개)
8. `src/repositories/firestore/FirestoreAppConfigRepository.ts`
9. `src/repositories/firestore/FirestoreBoardRepository.ts`
10. `src/repositories/firestore/FirestoreModerationRepository.ts`
11. `src/repositories/firestore/FirestoreAcademicRepository.ts`
12. `src/repositories/firestore/FirestoreCafeteriaRepository.ts`

### Phase 4: Hooks (3개)
13. `src/hooks/common/usePermissionStatus.ts`
14. `src/navigations/hooks/useForegroundNotification.ts`
15. `src/navigations/hooks/useJoinRequestModal.ts`

### Phase 5: Utilities (5개)
16. `src/utils/chatRoomUtils.ts`
17. `src/utils/chatUtils.ts`
18. `src/utils/partyMessageUtils.ts`
19. `src/lib/minecraftChat.ts`
20. `src/lib/moderation.ts`

### Phase 6: Legacy (12개) - 사용 여부 확인 필요
21-31. `src/legacy/hooks-legacy/*.ts` (11개)
32. `legacy/ChatScreen.legacy.tsx`

---

## 🔑 핵심 변환 패턴

### Before (Deprecated) → After (Modular)

```typescript
// Auth
auth().currentUser                    → getAuth().currentUser
auth().onAuthStateChanged(cb)         → onAuthStateChanged(getAuth(), cb)

// Firestore
firestore().collection('users')       → collection(getFirestore(), 'users')
.doc('id').get()                      → getDoc(doc(db, 'users', 'id'))
.doc('id').set(data)                  → setDoc(doc(db, 'users', 'id'), data)

// Storage
storage().ref('path')                 → ref(getStorage(), 'path')
.getDownloadURL()                     → getDownloadURL(ref)

// Messaging
messaging().getToken()                → getToken(getMessaging())
messaging().onMessage(handler)        → onMessage(getMessaging(), handler)

// Crashlytics
crashlytics().log('msg')              → log(getCrashlytics(), 'msg')
crashlytics().recordError(err)        → recordError(getCrashlytics(), err)

// Database
database().ref('path')                → ref(getDatabase(), 'path')
.once('value')                        → get(ref)
```

---

## 📋 작업 순서

1. **Phase 1 완료** → 앱 실행 테스트 → Warning 개수 확인
2. **Phase 2 완료** → 화면 기능 테스트
3. **Phase 3 완료** → 데이터 읽기/쓰기 테스트
4. **Phase 4-5 완료** → 전체 기능 테스트
5. **Phase 6**: Legacy 사용 여부 확인 → 마이그레이션 또는 삭제
6. **최종 테스트**: Warning 0개 확인

---

## 📚 생성된 문서

1. **firebase-v22-migration-plan.md** (본 문서)
   - 전체 마이그레이션 계획 및 가이드
   - 31개 파일 목록 및 설명
   - 서비스별 API 변환표

2. **firebase-v22-file-by-file-guide.md**
   - 각 파일의 Before/After 코드
   - 실제 수정 예제
   - 공통 패턴 정리

3. **firebase-v22-quick-reference.md**
   - 서비스별 Quick Snippet
   - 자주 사용하는 패턴
   - 디버깅 팁

4. **firebase-v22-summary.md** (현재 문서)
   - 핵심 요약
   - 빠른 체크리스트

---

## ✅ 빠른 시작 가이드

### 1단계: 문서 읽기 (10분)
```bash
cd /Users/jisung/SKTaxi/docs
cat firebase-v22-migration-plan.md
```

### 2단계: Phase 1 시작 (30분)
```bash
# App.tsx 수정
# src/navigations/MainNavigator.tsx 수정
```

### 3단계: 테스트
```bash
yarn start
yarn ios  # 또는 yarn android
# Console에서 warning 확인
```

### 4단계: 나머지 Phase 순차 진행

---

## 🚨 주의사항

- ✅ Type import는 수정하지 않아도 됨
- ✅ `getApp()`은 대부분 제거 가능
- ✅ Mixed import는 named import로 통일
- ⚠️ Legacy 폴더는 사용 여부 먼저 확인
- ⚠️ 각 Phase 완료 후 반드시 테스트

---

## 📞 문제 발생 시

### Warning이 계속 나타나는 경우
```bash
# 캐시 클리어
yarn start --reset-cache

# 빌드 클리어
rm -rf ios/build android/build

# 재빌드
yarn ios --clean
```

### 더 자세한 내용은
- `firebase-v22-migration-plan.md` 참조
- `firebase-v22-file-by-file-guide.md` 참조
- [공식 가이드](https://rnfirebase.io/migrating-to-v22)

---

**작성일**: 2026-02-02  
**목표**: React Native Firebase v22 Deprecated Warning 완전 제거
