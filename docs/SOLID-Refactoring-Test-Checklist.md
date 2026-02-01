# SOLID 리팩토링 테스트 체크리스트

> 테스트 일자: 2026-01-28
> SOLID 분석 리포트 기준 주요 변경 사항에 대한 기능 테스트

---

## 테스트

오늘 완료된 Repository 패턴 전환 관련 테스트입니다.

### 1. 프로필 편집 (ProfileEditScreen)

| # | 테스트 항목 | 확인 |
|---|-----------|-----|
| 1-1 | 설정 > 프로필 편집 진입 시 기존 정보 로드 | ☑️ |
| 1-2 | 닉네임 변경 후 저장 (중복되지 않은 닉네임) | ☑️ |
| 1-3 | 이미 사용 중인 닉네임으로 변경 시 에러 메시지 표시 | ☑️ |
| 1-4 | 학과 변경 후 저장 | ☑️ |
| 1-5 | 학번 변경 후 저장 | ☑️ |

### 2. 회원가입 프로필 생성 (CompleteProfileScreen)

> 테스트 방법: 새 Google 계정으로 로그인 또는 기존 계정 삭제 후 재가입

| # | 테스트 항목 | 확인 |
|---|-----------|-----|
| 2-1 | 새 계정 로그인 시 프로필 설정 화면 표시 | ☑️ |
| 2-2 | 닉네임 중복 검사 작동 | ☑️ |
| 2-3 | 닉네임/학과/학번 입력 후 완료 버튼 작동 | ☑️ |
| 2-4 | 동의 체크박스 (19세 이상, 이용약관) 필수 확인 | ☑️ |
| 2-5 | 프로필 완료 후 권한 온보딩 화면으로 이동 | ☑️ |

### 3. 권한 온보딩 (PermissionOnboardingScreen)

| # | 테스트 항목 | 확인 |
|---|-----------|-----|
| 3-1 | 인트로 화면 표시 후 "시작하기" 버튼 작동 | ☑️ |
| 3-2 | 알림 권한 요청 팝업 표시 | ☑️ |
| 3-3 | (iOS) ATT 권한 요청 팝업 표시 | ☑️ |
| 3-4 | 위치 권한 요청 팝업 표시 | ☐ | // 위치 권한 버튼 클릭시 이미 허용 혹은 거절한 경우 버튼이 무한 로딩/비활성화(앱을 껐다 킨 다음 이 버튼을 다시 누르면 정상 작동)
| 3-5 | 완료 화면 표시 후 메인 화면으로 자동 이동 | ☑️ |

### 4. 관리자 로그인 (LoginScreen)

| # | 테스트 항목 | 확인 |
|---|-----------|-----|
| 4-1 | 로그인 화면 하단 "관리자" 버튼 표시 | ☑️ |
| 4-2 | 관리자 모달에서 이메일/비밀번호 입력 | ☑️ |
| 4-3 | 올바른 관리자 계정으로 로그인 성공 | ☑️ |
| 4-4 | 잘못된 계정으로 로그인 시 에러 메시지 | ☑️ | // 에러메시지는 잘 뜨나, 사용자 친화적이지 못함. (firebase error message를 그대로 띄우는 것이 아니라, 사용자 친화적인 메시지로 변환해야 함.)

---

## 핵심 기능 테스트 (Repository 패턴)

Repository 패턴으로 전환된 주요 기능들입니다.

### 5. 인증 (Auth)

| # | 테스트 항목 | 확인 |
|---|-----------|-----|
| 5-1 | Google 로그인 (성결대 이메일) | ☑️ |
| 5-2 | 비성결대 이메일 로그인 차단 | ☑️ |
| 5-3 | 로그아웃 | ☑️ |
| 5-4 | 앱 재시작 시 자동 로그인 유지 | ☑️ |

### 6. 택시 파티 (Party)

| # | 테스트 항목 | 확인 |
|---|-----------|-----|
| 6-1 | 파티 목록 조회 | ☑️ |
| 6-2 | 파티 생성 (모집 화면) | ☑️ |
| 6-3 | 파티 참여 요청 | ☑️ |
| 6-4 | 참여 요청 승인/거절 (방장) | ☑️ |
| 6-5 | 파티 채팅 메시지 전송 | ☑️ |
| 6-6 | 파티 채팅 메시지 수신 (실시간) | ☑️ |
| 6-7 | 파티 나가기 | ☑️ |
| 6-8 | 파티 삭제 (방장) | ☐ |

### 7. 공지사항 (Notice)

| # | 테스트 항목 | 확인 |
|---|-----------|-----|
| 7-1 | 공지사항 목록 조회 | ☑️ |
| 7-2 | 카테고리별 필터링 | ☑️ |
| 7-3 | 공지사항 상세 보기 | ☑️ |
| 7-4 | 읽음 상태 표시 (읽은 공지 회색) | ☑️ |
| 7-5 | 좋아요 기능 | ☑️ |
| 7-6 | 댓글 작성/조회/수정/삭제 | ☐ |

### 8. 게시판 (Board)

| # | 테스트 항목 | 확인 |
|---|-----------|-----|
| 8-1 | 게시글 목록 조회 | ☑️ |
| 8-2 | 게시글 작성 (텍스트) | ☐ |
| 8-3 | 게시글 작성 (이미지 첨부) | ☐ |
| 8-4 | 게시글 수정 | ☑️ |
| 8-5 | 게시글 삭제 | ☑️ |
| 8-6 | 댓글 작성/조회/수정/삭제 | ☐ |
| 8-7 | 좋아요 기능 | ☑️ |
| 8-8 | 북마크 기능 | ☑️ |

### 9. 채팅 (Chat)

| # | 테스트 항목 | 확인 |
|---|-----------|-----|
| 9-1 | 채팅방 목록 조회 | ☑️ |
| 9-2 | 채팅방 입장 | ☑️ |
| 9-3 | 메시지 전송 | ☑️ |
| 9-4 | 메시지 수신 (실시간) | ☑️ |

### 10. 사용자 (User)

| # | 테스트 항목 | 확인 |
|---|-----------|-----|
| 10-1 | 프로필 조회 | ☑️ |
| 10-2 | 프로필 수정 | ☑️ |
| 10-3 | 계좌 정보 등록/수정 | ☑️ |
| 10-4 | 계좌 정보 삭제 | ☑️ |

### 11. 시간표 (Timetable)

| # | 테스트 항목 | 확인 |
|---|-----------|-----|
| 11-1 | 시간표 조회 | ☐ |
| 11-2 | 강의 검색 | ☐ |
| 11-3 | 강의 추가 | ☐ |
| 11-4 | 강의 삭제 | ☐ |

### 12. 학식 (Cafeteria)

| # | 테스트 항목 | 확인 |
|---|-----------|-----|
| 12-1 | 오늘 학식 메뉴 조회 | ☑️ |
| 12-2 | 날짜별 메뉴 조회 | ☑️ |

### 13. 학사일정 (Academic)

| # | 테스트 항목 | 확인 |
|---|-----------|-----|
| 13-1 | 학사일정 목록 조회 | ☑️ |
| 13-2 | 월별 캘린더 표시 | ☑️ |
| 13-3 | 일정 상세 보기 | ☐ |

---

## 알림 테스트 (FCM)

| # | 테스트 항목 | 확인 |
|---|-----------|-----|
| 14-1 | 앱 포그라운드에서 알림 수신 | ☑️ |
| 14-2 | 앱 백그라운드에서 알림 수신 | ☑️ |
| 14-3 | 알림 탭 시 해당 화면으로 이동 | ☑️ |
| 14-4 | 파티 참여 요청 알림 | ☑️ |
| 14-5 | 채팅 메시지 알림 | ☑️ |

---

## 설정 테스트

| # | 테스트 항목 | 확인 |
|---|-----------|-----|
| 15-1 | 알림 설정 변경 | ☑️ |
| 15-2 | 앱 공지사항 조회 | ☑️ |
| 15-3 | 문의하기 | ☑️ |
| 15-4 | 이용약관/개인정보처리방침 보기 | ☑️ |

---

## 테스트 우선순위

### P0 (필수 - 오늘 마이그레이션 관련)

1. **1-1 ~ 1-5**: 프로필 편집 전체
2. **2-1 ~ 2-5**: 회원가입 프로필 생성 전체
3. **3-1 ~ 3-5**: 권한 온보딩 전체
4. **4-1 ~ 4-4**: 관리자 로그인 전체

### P1 (중요 - 핵심 사용자 플로우)

5. **5-1, 5-3**: 로그인/로그아웃
6. **6-1 ~ 6-6**: 택시 파티 핵심 기능
7. **7-1, 7-3**: 공지사항 조회
8. **9-3, 9-4**: 채팅 메시지

### P2 (권장 - 보조 기능)

9. 게시판, 시간표, 학식, 학사일정

---

## 테스트 결과 기록

| 섹션 | 테스트 수 | 통과 | 실패 | 미완료 |
|------|----------|-----|-----|-------|
| 1. 프로필 편집 | 5 | 5 | 0 | 0 |
| 2. 회원가입 | 5 | 5 | 0 | 0 |
| 3. 권한 온보딩 | 5 | 4 | 1 | 0 |
| 4. 관리자 로그인 | 4 | 4 | 0 | 0 |
| 5. 인증 | 4 | 4 | 0 | 0 |
| 6. 택시 파티 | 8 | 7 | 1 | 0 |
| 7. 공지사항 | 6 | 5 | 1 | 0 |
| 8. 게시판 | 8 | 5 | 3 | 0 |
| 9. 채팅 | 4 | 4 | 0 | 0 |
| 10. 사용자 | 4 | 4 | 0 | 0 |
| 11. 시간표 | 4 | 0 | 4 | 0 |
| 12. 학식 | 2 | 2 | 0 | 0 |
| 13. 학사일정 | 3 | 2 | 1 | 0 |
| 14. 알림 | 5 | 5 | 0 | 0 |
| 15. 설정 | 4 | 4 | 0 | 0 |
| **합계** | **71** | **60** | **11** | **0** |

---

## 발견된 이슈

| # | 섹션 | 테스트 번호 | 이슈 설명 | 심각도 |
|---|------|-----------|----------|-------|
| 1 | 3-4 | 위치 권한 요청 팝업 표시 | 위치 권한 버튼 클릭시 이미 허용 혹은 거절한 경우 버튼이 무한 로딩/비활성화(앱을 껐다 킨 다음 이 버튼을 다시 누르면 정상 작동) | Major |
| 2 | 4-4 | 잘못된 계정으로 로그인 시 에러 메시지 | 에러메시지는 잘 뜨나, 사용자 친화적이지 못함. (firebase error message를 그대로 띄우는 것이 아니라, 사용자 친화적인 메시지로 변환해야 함.) | Minor |
| 3 | 7-1 | 공지사항 목록 조회 | 간헐적으로 카테고리별로('전체' 포함) 최신순 정렬, n개씩 페이지네이션이 작동하지 않을 때가 있음.(같은 조건으로 다시 테스트해보면 정상 작동 될 때도 있음) | Major |
| 4 | 7-1 | 공지사항 목록 조회 | 각 카테고리(칩 버튼)를 눌러서 리스트 종류를 변경하면 스크롤 위치가 전역으로 공유되는 문제가 있음. 카테고리를 변경하면 스크롤 위치를 가장 상단으로 초기화 시키거나 카테고리별 현재 스크롤 위치를 유지하는 기능이 필요함. (이 두 정책 중 하나를 선택해야 함.) | Major |
| 5 | 7-6 | 공지 댓글 구독 실패 | `The query requires an index` 라는 콘솔 에러가 떠서 조회가 안됨 (조회가 안 되니 작성/수정/삭제 테스트 불가) | Critical |
| 6 | 8-2 | 게시글 작성(텍스트) | `게시글 작성 실패: Error: Unsopproted field value: undefined` 라는 콘솔 에러가 뜨면서 작성이 안됨 | Critical |
| 7 | 8-3 | 게시글 작성(이미지 첨부) | `게시글 작성 실패: Error: Unsopproted field value: undefined` 라는 콘솔 에러가 뜨면서 작성이 안됨 | Critical |
| 8 | 8-4 | 게시판 댓글 구독 실패 | `The query requires an index` 라는 콘솔 에러가 떠서 조회가 안됨 (조회가 안 되니 작성/수정/삭제 테스트 불가) | Critical |
| 9 | 8-7 | 좋아요 기능 | 좋아요/북마크를 눌렀던 게시물을 눌러서 게시물 상세 페이지로 들어왔을 때 좋아요/북마크 버튼이 눌린 상태(하이라이트)로 표시되지 않음. (prod에서는 잘 되는지 아직 확인 못함. dev server의 문제인지 파악해봐야함) | Major |
| 10 | 8-8 | 북마크 기능 | 좋아요/북마크를 눌렀던 게시물을 눌러서 게시물 상세 페이지로 들어왔을 때 좋아요/북마크 버튼이 눌린 상태(하이라이트)로 표시되지 않음. (prod에서는 잘 되는지 아직 확인 못함. dev server의 문제인지 파악해봐야함) | Major |
| 11 | 11-1 | 시간표 조회 | 시간표가 불러와지지 않음(빈 테이블만 보임)(firestore에서는 데이터가 존재함) | Critical |
| 12 | 11-3 | 강의 추가 | 강의가 추가되지 않음('시간표에 추가' 버튼을 눌러도 firestore에 데이터가 추가되지 않음) | Critical |
| 13 | 11-4 | 강의 삭제 | 강의 추가가 작동하지 않고 시간표도 불러와지지 않아 삭제 테스트를 해볼 수 없음 | Critical |
| 14 | 13-3 | 오늘 일정 메시지 로직 문제 | useAcademicSchedules.ts에서 오늘이 특정 일정의 마지막날인데도 "마지막 날이에요" 라는 메시지가 뜨지 않고 "오늘은 {일정 제목} 날이에요" 라는 메시지가 뜨는 문제가 있음. 로직 자세히 뜯어봐야 함 | Major |
| 15 | 6-8 | 파티 삭제시 alert가 매우 많이 뜨는 버그 | 파티 삭제시 alert가 매우 많이 뜨는 버그가 있음. 파티 삭제시 alert가 한 번만 뜨도록 수정해야 함 | Major |

> 심각도: Critical / Major / Minor

---

## 버그 Fix 이력

### 2026-01-29 Fix (Phase 1)

| 이슈 # | 수정 파일 | 수정 내용 | 상태 |
|--------|----------|----------|------|
| 5, 8 | `firestore.indexes.json` | noticeComments, boardComments 컬렉션에 isDeleted 필드 포함 복합 인덱스 추가 | ✅ 배포 완료 |
| 6, 7 | `src/hooks/board/useBoardWrite.ts` | `authorProfileImage: user.photoURL ?? null` (undefined → null) | ✅ 수정 완료 |
| 6, 7 | `src/hooks/board/useBoardComments.ts` | `authorProfileImage`, `anonId`, `parentId` 필드 undefined → null 변경 | ✅ 수정 완료 |
| - | `src/hooks/notice/useNoticeComments.ts` | `parentId` 필드 undefined → null 변경 | ✅ 수정 완료 |
| 9, 10 | `src/hooks/board/usePostActions.ts` | `useState` → `useEffect` 변경으로 마운트 시 좋아요/북마크 상태 확인 | ✅ 수정 완료 |
| 11, 12, 13 | `src/repositories/interfaces/ITimetableRepository.ts` | `updateCourseIds` 메서드 인터페이스 추가 | ✅ 수정 완료 |
| 11, 12, 13 | `src/repositories/firestore/FirestoreTimetableRepository.ts` | `updateCourseIds` 메서드 구현 | ✅ 수정 완료 |
| 11, 12, 13 | `src/hooks/timetable/useTimetable.ts` | `saveTimetable` → `updateCourseIds` 사용, courses 비교 로직 수정 | ✅ 수정 완료 |
| 3 | `src/hooks/notice/useNotices.ts` | `categoryCacheRef` 추가하여 useEffect 의존성 무한 루프 방지 | ✅ 수정 완료 |
| 4 | `src/screens/NoticeTab/components/NoticeList.tsx` | FlatList에 `key` prop 추가로 카테고리 변경 시 스크롤 초기화 | ✅ 수정 완료 |
| 15 | `src/hooks/taxi/useChatScreen.ts` | `handleLeaderDeleteParty`에 `deleteHandledRef.current` 중복 방지 로직 추가 | ✅ 수정 완료 |
| 2 | `src/screens/auth/LoginScreen.tsx` | `getFirebaseErrorMessage` 함수 추가로 사용자 친화적 에러 메시지 표시 | ✅ 수정 완료 |

### 수정 상세 내용

#### 1. Firestore 인덱스 추가 (이슈 #5, #8)

```json
// noticeComments 인덱스
{
  "collectionGroup": "noticeComments",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "noticeId", "order": "ASCENDING" },
    { "fieldPath": "isDeleted", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "ASCENDING" }
  ]
}

// boardComments 인덱스
{
  "collectionGroup": "boardComments",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "postId", "order": "ASCENDING" },
    { "fieldPath": "isDeleted", "order": "ASCENDING" },
    { "fieldPath": "createdAt", "order": "ASCENDING" }
  ]
}
```

#### 2. undefined 필드 수정 (이슈 #6, #7)

Firestore는 `undefined` 값을 지원하지 않음. `null`로 변경하여 저장 가능하게 수정.

```typescript
// Before
authorProfileImage: user.photoURL || undefined,
anonId: isAnonymous ? `${postId}:${user.uid}` : undefined,
parentId: parentId || undefined,

// After
authorProfileImage: user.photoURL ?? null,
anonId: isAnonymous ? `${postId}:${user.uid}` : null,
parentId: parentId ?? null,
```

#### 3. usePostActions Hook 수정 (이슈 #9, #10)

`useState`를 콜백으로 사용하는 것은 React Hook 오용. `useEffect`로 변경.

```typescript
// Before (잘못된 사용)
useState(() => {
  checkLikeStatus();
  checkBookmarkStatus();
});

// After (올바른 사용)
useEffect(() => {
  checkLikeStatus();
  checkBookmarkStatus();
}, [checkLikeStatus, checkBookmarkStatus]);
```

#### 4. 시간표 데이터 모델 수정 (이슈 #11, #12, #13)

`TimetableData.courses`는 전체 Course 객체를 기대하지만, 실제로는 ID만 전달되어 데이터 손실 발생.
새로운 `updateCourseIds` 메서드로 강의 ID 목록만 업데이트하도록 변경.

```typescript
// Repository 인터페이스 추가
updateCourseIds(userId: string, semester: string, courseIds: string[]): Promise<void>;

// Hook에서 사용
await timetableRepository.updateCourseIds(user.uid, semester, newCourseIds);
```

#### 5. 페이지네이션 의존성 수정 (이슈 #3)

`categoryCache`가 useEffect 의존성 배열에 포함되어 무한 루프 발생 가능.
`categoryCacheRef`를 사용하여 의존성에서 제거.

```typescript
const categoryCacheRef = useRef(categoryCache);

useEffect(() => {
  categoryCacheRef.current = categoryCache;
}, [categoryCache]);

// useEffect에서 categoryCacheRef.current 사용
```

#### 6. 스크롤 위치 초기화 (이슈 #4)

카테고리 변경 시 FlatList가 재마운트되도록 `key` prop 추가.

```tsx
<FlatList
  key={`notice-list-${selectedCategory}`}
  data={notices}
  // ...
/>
```

#### 7. Alert 중복 방지 (이슈 #15)

파티 삭제 시 `deleteHandledRef.current` 플래그로 중복 실행 방지.

```typescript
const handleLeaderDeleteParty = useCallback(async (isPartyArrived = false) => {
  if (!partyId || !isLeader || deleteHandledRef.current) return;

  deleteHandledRef.current = true; // 중복 방지

  try {
    // ...
  } catch (error) {
    deleteHandledRef.current = false; // 실패 시 리셋
    // ...
  }
}, [partyId, isLeader, partyRepository]);
```

#### 8. 로그인 에러 메시지 개선 (이슈 #2)

Firebase 에러 코드를 사용자 친화적 메시지로 변환.

```typescript
const getFirebaseErrorMessage = (error: any): string => {
  const errorMap: Record<string, string> = {
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/user-not-found': '등록되지 않은 이메일입니다.',
    'auth/invalid-email': '올바른 이메일 형식이 아닙니다.',
    'auth/too-many-requests': '잠시 후 다시 시도해주세요.',
    'auth/invalid-credential': '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/user-disabled': '비활성화된 계정입니다.',
    'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
  };
  return errorMap[error?.code] || '로그인에 실패했습니다.';
};
```

---

## 재테스트 체크리스트 (2026-01-29 Fix 후)

### Critical 기능 (필수 재테스트)

| # | 테스트 항목 | 관련 이슈 | 확인 |
|---|-----------|----------|-----|
| R-1 | 공지사항 댓글 목록 로드 | #5 | ☑️ |
| R-2 | 게시판 댓글 목록 로드 | #8 | ☑️ |
| R-3 | 게시글 작성 - 텍스트 | #6 | ☑️ |
| R-4 | 게시글 작성 - 이미지 첨부 | #7 | ☑️ |
| R-5 | 시간표 조회 | #11 | ☑️ |
| R-6 | 강의 추가 | #12 | ☑️ |
| R-7 | 강의 삭제 | #13 | ☐ |

### Major 기능 (권장 재테스트)

| # | 테스트 항목 | 관련 이슈 | 확인 |
|---|-----------|----------|-----|
| R-8 | 좋아요 버튼 하이라이트 | #9 | ☑️ |
| R-9 | 북마크 버튼 하이라이트 | #10 | ☑️ |
| R-10 | 공지 페이지네이션 | #3 | ☑️ |
| R-11 | 카테고리 변경 시 스크롤 초기화 | #4 | ☑️ |
| R-12 | 파티 삭제 Alert 단일 표시 | #15 | ☑️ |

### Minor 기능

| # | 테스트 항목 | 관련 이슈 | 확인 |
|---|-----------|----------|-----|
| R-13 | 관리자 로그인 에러 메시지 | #2 | ☑️ |

---

## 미해결 이슈

| # | 섹션 | 테스트 번호 | 이슈 설명 | 심각도 | 상태 |
|---|------|-----------|----------|-------|------|
| 1 | 3-4 | 위치 권한 요청 팝업 표시 | 위치 권한 버튼 클릭시 이미 허용 혹은 거절한 경우 버튼이 무한 로딩/비활성화 | Major | 미해결 |
| 14 | 13-3 | 오늘 일정 메시지 로직 문제 | 오늘이 특정 일정의 마지막날인데도 "마지막 날이에요" 메시지가 표시되지 않음 | Major | 미해결 |

---

## 재테스트에서 발견된 이슈 (2026-01-29 Fix 후)

| # | 섹션 | 테스트 번호 | 이슈 설명 | 심각도 |
|---|------|-----------|----------|-------|
| 1 | R-13 | 관리자 로그인 에러 메시지 | 관리자 로그인 에러메시지가 어떤 경우에서든 "로그인에 실패했습니다"만 뜨고 있음. firebase auth로부터 에러 코드를 제대로 받지 못하고 있는 것 같음. 최신 공식 문서를 참고해서 정확한 에러 코드를 받아와야 할 듯 함.(Context7 mcp 활용) | Minor |
| 2 | R-5 | 시간표 조회 | 시간표가 불러와지지 않음(빈 테이블만 보임)(firestore에서는 데이터가 존재함) | Critical |
| 3 | R-6 | 강의가 조회되지 않음 | 수업 추가를 눌렀는데 수업 목록이 하나도 뜨지 않고 있음 (그래서 강의 추가/삭제 테스트 불가) | Critical |
| 4 | R-8 | 좋아요 버튼 하이라이트 느리게 변경 | 좋아요/북마크를 누르면 토글(하이라이트) 상태가 즉시 변경되지 않고 느리게 변경되는 버그가 있음. firestore를 보면 값이 바로 바뀌긴 함. 앱에서 느림 | Minor |
| 5 | R-9 | 북마크 버튼 하이라이트 느리게 변경 | 좋아요/북마크를 누르면 토글(하이라이트) 상태가 즉시 변경되지 않고 느리게 변경되는 버그가 있음. firestore를 보면 값이 바로 바뀌긴 함. 앱에서 느림 | Minor |

## 추가 이슈
- 로그아웃을 하면 users/{uid}/fcmTokens 에서 토큰이 삭제되지 않음. 로그아웃 시 토큰이 삭제되어야 함.



> 심각도: Critical / Major / Minor