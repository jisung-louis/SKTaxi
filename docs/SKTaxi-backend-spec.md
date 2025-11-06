# SKTaxi 백엔드 명세서 (for Server Team / AI)

## 1. 프로젝트 개요
- 목적: 대학생 대상 택시 동승자 모집 앱
- 클라이언트: React Native 0.79, React 19
- 인증: Firebase Auth(이메일/비밀번호, 학교 도메인 제한 `sungkyul.ac.kr`)
- 지도/위치: react-native-maps(기본 MapKit), react-native-geolocation-service
- 네비게이션 구조: Bottom Tabs(홈/택시/게시판/공지), 택시 탭 내부에 Stack(TaxiMain, Recruit, AcceptancePending, MapSearch)

## 2. 주요 화면과 플로우
- 홈(HomeScreen)
  - 섹션: 택시 카드 리스트(요약), 공지 드롭다운(학교/내 과), 학사일정, 내 시간표
  - "모두 보기" 클릭 시 각 탭으로 이동
- 택시(TaxiScreen = TaxiMain)
  - 지도 + BottomSheet 목록(모집 중 파티 리스트)
  - 카드 선택 시 상세 정보 노출 및 지도 포커스 이동
  - Floating + 버튼 → RecruitScreen(파티 생성)
  - 카드 내 "동승 요청" → AcceptancePendingScreen(수락 대기)
- RecruitScreen(파티 생성)
  - 출발지/도착지(사전 옵션 or 지도 검색), 출발시간, 최대 인원, 키워드, 상세 내용 입력
  - 생성 시 서버에 파티 생성
- AcceptancePendingScreen
  - 선택한 파티 정보 표시, 수락 대기
  - (향후) 취소/1:1 채팅 등 액션
- MapSearchScreen
  - 지도 검색 결과로 위치 선택 후 RecruitScreen에 콜백 전달
- 게시판/공지, 프로필은 기본 화면

## 3. 데이터 모델(권장)
백엔드가 Firebase/REST 무엇이든 다음 개념을 제공해야 함.

### 3.1 Users
```
id (UID)
email
displayName
major (optional)
avatarUrl (optional)
fcmToken (optional)
createdAt, updatedAt
```

### 3.2 Parties(모집 파티)
```
id
leaderId (User.id)
departure { name, lat?, lng? }
destination { name, lat?, lng? }
departureTime (ISO)
maxMembers (int)
members [User.id] (leader 포함)
tags [string]
detail (string)
status ('open'|'closed'|'cancelled')
createdAt, updatedAt
```

### 3.3 JoinRequests(동승 요청)
```
id
partyId (Parties.id)
requesterId (User.id)
status ('pending'|'accepted'|'declined')
createdAt, updatedAt
```

### 3.4 Chats
```
id
partyId (Parties.id)
lastMessage, updatedAt
messages: [{ id, senderId, text, createdAt }]
```

## 4. API 설계(REST 기준 예시)
백엔드 선택지에 따라 경로/응답은 조정 가능. 모바일은 간결/예측 가능해야 함.

### 4.1 인증
- 클라에서 Firebase idToken 발급 → 서버 검증 후 세션/사용자 생성 동기화(옵션)
```
POST /auth/session { idToken }
→ { user: {id,email,displayName,...}, accessToken? }
```

### 4.2 파티
```
GET  /parties?status=open&limit=20&cursor=...
POST /parties { departure, destination, departureTime, maxMembers, tags, detail }
GET  /parties/:id
PATCH /parties/:id { fields... } (리더만)
POST /parties/:id/close (리더만)
```

### 4.3 동승 요청
```
POST   /parties/:id/join-requests { }
GET    /parties/:id/join-requests (리더만)
POST   /join-requests/:id/accept
POST   /join-requests/:id/decline
```
수락 시 트랜잭션으로 `parties.members` 업데이트, 정원 찼으면 `status=closed` 처리.

### 4.4 채팅(옵션)
```
GET  /chats/:partyId/messages?cursor=...&limit=50
POST /chats/:partyId/messages { text }
WS/SSE 구독 /chats/:partyId/stream
```

## 5. Firestore 대안(서버리스 구성)
- 컬렉션: `users`, `parties`, `joinRequests`, `chats`, `chats/{chatId}/messages`
- 보안 규칙(요지)
  - parties: read=public, write=leaderId==auth.uid
  - joinRequests: create=requesterId==auth.uid; read= (requesterId==auth.uid || party.leaderId==auth.uid)
  - messages: party.members에 포함된 사용자만 read/write
- Cloud Functions
  - onJoinRequested → 파티장 FCM 알림
  - acceptJoinRequest(callable) → members 추가 트랜잭션
  - onMessageCreated → 상대에게 푸시

## 6. 인증/권한
- 이메일/비밀번호(Firebase Auth). 백엔드 서버가 있을 경우 각 요청 헤더에 `Authorization: Bearer <idToken or accessToken>`
- 파티 생성/수정/종료는 리더만, 요청 조회/승인은 리더만, 본인 요청 조회는 본인만

## 7. 유즈케이스(시퀀스)
### 7.1 파티 생성(RecruitScreen)
1) POST /parties
2) 성공 시 클라 알림 및 TaxiScreen 리스트 갱신

### 7.2 동승 요청 & 수락
1) POST /parties/:id/join-requests
2) AcceptancePendingScreen 표시
3) (리더) 리스트 확인 후 accept/decline
4) accept → `members` 업데이트, 요청자에게 푸시, 앱에서 파티 참여 상태로 반영

### 7.3 채팅
1) 파티 멤버 간 메시지 전송/수신
2) 새 메시지 푸시

## 8. 검색/정렬
- TaxiScreen 목록: status=open 파티만, departureTime 오름차순, 태그/출발지/도착지 필터 옵션 고려
- HomeScreen 카드: 캐시된 요약 API 제공 가능 `/home/summary`

## 9. 환경변수/설정(예시)
```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FCM_SERVER_KEY=
APP_BASE_URL=
```

## 10. 비기능 요구사항
- 성능: 목록 페이지네이션 필수(cursor 기반)
- 보안: 인증 필수 엔드포인트, 권한 체크, 입력 검증
- 관찰성: 로그/메트릭, 에러 추적(Sentry 등)
- 알림: FCM 토큰 저장 및 토픽/개별 푸시

## 11. 클라이언트 연동 포인트(코드 기준)
- Recruit: `src/screens/TaxiTab/RecruitScreen.tsx`
- Join 요청 버튼: `src/components/section/TaxiTab/PartyList.tsx` → 상위 `TaxiScreen`에서 `onRequestJoinParty` 처리
- 수락 대기: `src/screens/TaxiTab/AcceptancePendingScreen.tsx`
- 네비게이션 타입: `src/navigations/types.ts` (TaxiStackParamList 등)

## 12. 추후 확장
- 결제(선결제/정산) 연동
- 신고/차단, 평점, 운영자 공지 관리 백오피스

---
본 문서를 기준으로 서버 구현 시 REST/Firebase 중 택일 가능. API 스펙 확정되면 응답 스키마/에러 코드/예외 케이스 추가 정의 예정.


