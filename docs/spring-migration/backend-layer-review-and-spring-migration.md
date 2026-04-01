# 백엔드 레이어 점검 및 Spring 마이그레이션 가이드

이 문서는 **마이그레이션 kickoff 시점의 legacy Firebase 구조를 설명한 분석 기록**과,
그 구조를 Spring으로 옮길 때 필요한 설계 요구사항을 함께 정리한 문서입니다.

현재 런타임은 이 문서의 legacy 설명과 다르다.

- 프론트 기본 repository wiring은 대부분 Spring 구현을 사용한다.
- Firebase는 인증/일부 클라이언트 SDK 용도로만 남아 있다.
- 아래 1장은 "당시 왜 이런 설계 전환이 필요했는가"를 설명하는 historical context로 읽어야 한다.

---

## 1. legacy Firebase 구조 기준 역할 차이

### 요약

| 구분 | legacy Cloud Functions 계층 | legacy RN Repository 계층 |
|------|--------------------------------------------|---------------------------------|
| **실행 위치** | Firebase 서버(이벤트/스케줄 시) | 클라이언트(React Native 앱) |
| **역할** | 이벤트 반응 + 스케줄 작업 + 부가 효과 | 앱의 Firestore/Storage 직접 접근 추상화 |
| **호출 주체** | Firestore/Realtime DB/스케줄러가 트리거 | 앱의 훅·화면이 Repository를 통해 호출 |
| **데이터 흐름** | “문서가 생성/수정됐다” → 함수 실행 | “앱이 읽기/쓰기 요청” → Firestore 직접 접근 |

---

### 1.1 legacy Cloud Functions 계층의 책임

**서버에서만 돌아가는, “이벤트에 반응하는 로직”과 “주기 작업”**입니다.

- **클라이언트가 이 함수를 직접 호출하지 않습니다.**  
  (현재 `onCall`/HTTP 엔드포인트는 없음.)
- Firestore 문서 생성/수정, Realtime DB 값 생성, 스케줄 시간이 되면 **자동으로** 실행됩니다.

**구체적 역할:**

1. **Firestore/DB 트리거 (이벤트 기반)**  
   특정 컬렉션/경로의 변경이 일어나면 실행됩니다.

   - `onPartyCreate` → 파티 문서 생성 시: 리더 제외 전원에게 FCM 푸시 + `userNotifications` 문서 생성  
   - `onJoinRequestCreate` / `onJoinRequestUpdate` → 동승 요청 생성/수정 시: 리더 또는 요청자에게 푸시 + 인박스  
   - `onPartyStatusUpdate`, `onSettlementComplete`, `onPartyMemberKicked`, `onPartyEnded` → 파티 상태/정산/강퇴/종료 시: 관련자 푸시  
   - `onChatRoomMessageCreated`, `onChatMessageCreated` → 채팅 메시지 생성 시: 해당 방 참여자에게 푸시  
   - `onBoardCommentCreated`, `onNoticeCommentCreated`, `onBoardLikeCreated` → 댓글/좋아요 시: 글 작성자 등에게 푸시  
   - `onNoticeCreated`, `onAppNoticeCreated` → 공지 생성 시: 대상자에게 푸시  
   - `syncMinecraftChatMessage` → Realtime DB 메시지 생성 시: 앱 채팅방과 동기화

2. **스케줄 작업 (시간 기반)**  
   Cron 식에 따라 주기 실행됩니다.

   - `cleanupOldParties`: 4시간마다, 12시간 초과 파티를 `status: 'ended'`로 소프트 종료  
   - `scheduledRSSFetch`: 평일 8–20시, 10분마다 학교 공지 RSS 크롤링 후 Firestore `notices` 반영

3. **공통 부가 효과**  
   - FCM 멀티캐스트 푸시 발송  
   - 실패한 FCM 토큰 정리(사용자 문서의 `fcmTokens` 업데이트)  
   - `userNotifications/{uid}/notifications` 인박스 문서 생성  

**정리:**  
Cloud Functions는 **“데이터가 이렇게 바뀌었을 때 / 이 시간이 됐을 때, 서버에서 할 일”**을 담당합니다.  
앱이 “파티 생성 API를 호출”하는 게 아니라, **앱이 Firestore에 파티 문서를 쓰면** 그걸 감지해서 푸시·인박스를 보내는 구조입니다.

---

### 1.2 legacy RN Repository 계층의 책임

**앱(클라이언트)이 Firestore·Storage 등에 접근하는 방법을 인터페이스로 추상화한 계층**입니다.

- **실행 위치:** React Native 앱 내부  
- **역할:**  
  - Firestore의 `collection`/`doc` 읽기·쓰기·실시간 구독(`onSnapshot`)  
  - Storage 업로드 등  
  을 **도메인 단위 API**로 감싸서, 화면/훅은 Repository 인터페이스만 사용합니다.

**구체적 역할:**

1. **CRUD 및 구독**  
   - `IPartyRepository`: 파티 생성/수정/삭제, 동승 요청 생성/승인/거절, 파티 채팅 메시지 전송, 정산 상태 업데이트 등  
   - `subscribeToParties`, `subscribeToParty`, `subscribeToPartyMessages` 등 → Firestore `onSnapshot` 기반 실시간 구독  
   - `IUserRepository`, `IBoardRepository`, `INoticeRepository` 등도 동일하게 “어떤 컬렉션/경로를 어떻게 읽고 쓸지”를 캡슐화

2. **추상화 이점**  
   - 구현체를 `FirestorePartyRepository` → `SpringPartyRepository`처럼 바꿀 수 있어, 백엔드를 Spring으로 옮겨도 **호출부(훅/화면) 시그니처는 그대로** 유지 가능  
   - 테스트 시 목적에 맞는 test double 구현으로 대체 가능

**데이터 흐름:**  
`화면/훅` → `usePartyRepository()` 등으로 Repository 획득 → `createParty()`, `subscribeToParties()` 등 호출 → **Firestore SDK로 직접** `parties` 컬렉션 읽기/쓰기/구독.  
즉, **현재 “비즈니스에 가까운 데이터 조작”은 전부 앱이 Firestore에 직접 접근해서 수행**하고, Cloud Functions는 그 **결과(문서 생성/수정)에 반응**하는 구조입니다.

---

### 1.3 한 줄로 정리

- **Repository:** “앱이 Firestore/Storage를 **어떻게 읽고 쓸지** 정의” (클라이언트 데이터 접근 계층)  
- **Cloud Functions:** “Firestore/DB/시간 **이벤트가 났을 때 서버에서 무엇을 할지** 정의” (이벤트 핸들러 + 스케줄 job)

---

## 2. Spring으로 백엔드를 구현할 때 설계해야 할 요구사항 (예시)

현재는 “앱 → Firestore 직접”이고, “서버는 이벤트/스케줄만 처리”인데, Spring으로 옮기면 **앱 → Spring API → DB**로 바뀝니다.  
그래서 “Repository가 하던 일”을 REST/WebSocket 등 **API**로 설계하고, “Cloud Functions가 하던 일”을 **서버 내부 로직(이벤트/스케줄/푸시)**로 설계해야 합니다.

아래는 도메인별로 “무엇을 설계하면 되는지” 예시 위주로 정리한 것입니다.

---

### 2.1 인증·사용자

- **요구사항**
  - 앱은 계속 Firebase Auth로 로그인할 수 있어야 함 (기존 사용자 경험 유지).
  - Spring은 요청마다 **Firebase ID Token**을 검증해 사용자 식별.

- **설계 예시**
  - **Filter / Interceptor:** `Authorization: Bearer <idToken>` 검증, 검증된 `uid`를 `SecurityContext` 또는 요청 속성에 넣기.
  - **인증 실패:** 401 반환.
  - (선택) Spring Security + OAuth2 Resource Server로 JWT 검증하거나, Firebase Admin SDK로 `verifyIdToken` 호출하는 커스텀 검증기.

- **문서화할 것**
  - 인증 헤더 형식, 토큰 갱신 주기, 만료 시 앱 동작(재로그인 유도 등).

---

### 2.2 파티(택시 동승) – Repository → API

- **요구사항**
  - 지금 `IPartyRepository`가 하는 일을 **REST(또는 일부 WebSocket)**로 제공.
  - 파티 목록, 단일 파티, 내 파티, 생성/수정/삭제(소프트 삭제), 동승 요청 생성/승인/거절, 정산 시작/멤버 정산/정산 완료 등.

- **설계 예시**
  - **리소스·엔드포인트 예시**
    - `GET /api/parties` — 활성 파티 목록 (쿼리: 정렬, 페이지, status 등).
    - `GET /api/parties/{id}` — 단일 파티.
    - `GET /api/parties/me` — 현재 사용자가 참여 중인 파티.
    - `POST /api/parties` — 파티 생성 (body: leaderId, departure, destination, departureTime, maxMembers 등).
    - `PATCH /api/parties/{id}` — 파티 수정 (상태 변경 포함).
    - `POST /api/parties/{id}/end` — 파티 종료 (endReason 등).
    - `POST /api/parties/{partyId}/join-requests` — 동승 요청 생성.
    - `GET /api/parties/{partyId}/join-requests` — 해당 파티의 동승 요청 목록 (리더용).
    - `POST /api/join-requests/{requestId}/accept` — 승인.
    - `POST /api/join-requests/{requestId}/decline` — 거절.
    - `POST /api/parties/{id}/settlement/start` — 정산 시작.
    - `POST /api/parties/{id}/settlement/members/{memberId}/settled` — 멤버 정산 완료.
    - `POST /api/parties/{id}/settlement/complete` — 정산 완료 및 파티 종료.
  - **DTO**
    - 요청/응답 스키마 (파티 생성 DTO, 파티 응답 DTO, 동승 요청 DTO 등).  
    - `docs/firestore-data-structure.md`의 `parties`, `joinRequests` 필드와 매핑해 두면 이관 시 유리.
  - **권한**
    - 파티 수정/종료/멤버 강퇴는 리더만.
    - 동승 승인/거절은 리더만.
    - 정산 완료는 리더만 등.

- **실시간성**
  - 지금은 Firestore `onSnapshot`으로 목록/상세가 실시간 갱신됩니다.
  - Spring으로 갈 때 선택지:
    - **폴링:** `GET /api/parties`, `GET /api/parties/me` 등을 주기적으로 호출.
    - **WebSocket/SSE:** 파티 목록/상세/동승 요청 목록을 구독해서 서버가 변경 시 푸시.
  - “어디까지 실시간으로 할지”(목록만 / 상세+채팅까지 등)를 요구사항으로 적어 두면 좋습니다.

---

### 2.3 파티 채팅 – Repository → API + 실시간

- **요구사항**
  - `sendPartyMessage`, `subscribeToPartyMessages` 등을 API + 실시간 채널로 대체.

- **설계 예시**
  - **REST**
    - `GET /api/parties/{partyId}/messages?limit=20&before={messageId}` — 과거 메시지 페이지네이션.
    - `POST /api/parties/{partyId}/messages` — 일반/시스템/계좌/도착/종료 메시지 전송 (body에 type, text, accountData 등).
  - **실시간**
    - **WebSocket** ` /ws/parties/{partyId}/messages` 에 연결해 메시지 수신 (및 필요 시 발송도 WebSocket으로 통일).
    - 또는 **SSE**로 메시지 스트리밍.
  - **저장소**
    - Firestore 유지 시 Spring이 Firestore SDK로 쓰기/읽기.
    - RDB 이전 시 `party_messages` 테이블 설계 (party_id, sender_id, type, text, created_at 등).

---

### 2.4 알림(푸시·인박스) – Cloud Functions → Spring

- **요구사항**
  - “파티 생성/동승 요청/정산 완료/강퇴/채팅 메시지…” 등 **이벤트가 났을 때** 푸시와 인박스 저장을 Spring에서 수행.

- **설계 예시**
  - **이벤트 발생 지점**
    - 파티 생성, 동승 요청 생성/수정, 파티 상태 변경, 정산 완료, 멤버 강퇴, 채팅 메시지 생성 등 **서비스 계층**에서 “도메인 이벤트” 발행.
  - **발행/구독**
    - Spring `ApplicationEventPublisher` + `@EventListener` 로 내부 이벤트 처리.
    - 또는 RabbitMQ/Kafka 등 메시지 큐로 “알림 필요” 이벤트를 보내고, 별도 리스너에서 FCM + 인박스 DB 저장.
  - **FCM**
    - FCM HTTP v1 API를 호출하는 `FcmService` (또는 Admin SDK 사용 가능한 라이브러리).
    - 사용자별 FCM 토큰은 DB 테이블(`user_fcm_tokens`) 또는 기존 Firestore에서 읽어오기.
  - **인박스**
    - `userNotifications/{uid}/notifications` 에 해당하는 테이블/문서 구조를 Spring이 쓰도록 (RDB라면 `user_notifications` 테이블).
  - **토큰 정리**
    - FCM 전송 실패(invalid token 등) 시 해당 토큰 삭제 로직을 Cloud Functions에서 하던 것처럼 Spring에서 구현.

- **문서화할 것**
  - “어떤 도메인 이벤트 → 어떤 알림 타입/메시지/수신자” 매핑 테이블.  
  - 현재 `onPartyCreate`, `onJoinRequestUpdate` 등 각 함수의 제목/본문/데이터 페이로드를 그대로 옮기면 됩니다.

---

### 2.5 스케줄 작업 – Cloud Functions → Spring

- **요구사항**
  - `cleanupOldParties`, `scheduledRSSFetch` 를 Spring에서 주기 실행.

- **설계 예시**
  - **Spring Scheduler**
    - `@Scheduled(cron = "0 0 */4 * * ?")` (4시간마다) → 12시간 초과 파티 조회 후 status 업데이트.
    - `@Scheduled(cron = "0 */10 8-20 * * 1-5")` (평일 8–20시, 10분마다) → RSS 크롤링 후 공지 저장.
  - **크롤링**
    - `scheduledRSSFetch`와 동일한 URL·파싱 로직을 Spring 서비스로 이전 (Jsoup 등 사용).
  - **운영**
    - 단일 인스턴스만 스케줄 실행되도록 하려면 스케줄 락(DB 락 또는 ShedLock 등) 고려.

---

### 2.6 공지·게시판·공개 채팅 등

- **공지(notices)**
  - RSS 크롤링은 위 스케줄로.
  - `GET /api/notices`, `GET /api/notices/{id}`, 읽음 처리 등은 REST로 설계 (기존 Repository 메서드와 1:1 매핑해 보면 됨).
- **게시판(board)**
  - `boardPosts`, `boardComments`, `userBoardInteractions` 에 해당하는 CRUD + 좋아요/북마크 API.
  - 댓글/좋아요 시 알림은 “도메인 이벤트 → 알림 서비스”로 위와 동일하게.
- **공개 채팅(chatRooms)**
  - 방 목록, 방 생성, 메시지 목록/전송, 실시간은 WebSocket 등으로 설계.
  - `onChatRoomMessageCreated` 에 해당하는 “메시지 생성 시 푸시”를 Spring 이벤트/리스너로 구현.

---

### 2.7 저장소 선택

- **현재:** Firestore가 단일 소스.
- **Spring 이전 시**
  - **Case A:** Spring은 “REST/WS만 제공”하고, 실제 읽기/쓰기는 Firestore SDK로 계속 사용.  
    → Repository가 하던 CRUD를 Spring 서비스가 Firestore로 수행하고, 트리거는 Spring 이벤트로 대체.
  - **Case B:** RDB(PostgreSQL 등)로 이전.  
    → `docs/firestore-data-structure.md` 기준으로 테이블 설계, 마이그레이션 스크립트, 기존 Firestore와의 병행 기간 정책 필요.

---

### 2.8 설계 체크리스트 (요약)

- [ ] **인증:** Firebase ID Token 검증 방식, 401 처리, (선택) Spring Security 설정.
- [ ] **파티·동승·정산:** REST 리소스·URL·DTO·권한 규칙, 실시간(폴링 vs WebSocket/SSE).
- [ ] **파티 채팅:** 메시지 CRUD API, WebSocket/SSE 경로 및 프로토콜.
- [ ] **알림:** 도메인 이벤트 목록, 이벤트 → FCM + 인박스 매핑, 토큰 저장소 및 실패 시 토큰 정리.
- [ ] **스케줄:** 4시간 cleanup, 10분 RSS 크롤링, 스케줄 락 여부.
- [ ] **공지/게시판/공개채팅:** 각각 REST + 필요 시 실시간, 알림 연동.
- [ ] **저장소:** Firestore 유지 vs RDB 이전, 마이그레이션 계획.

이 체크리스트와 위 예시를 기준으로 “지금 Cloud Functions / Repository가 하는 일”을 Spring의 **API 설계**와 **이벤트/스케줄 설계**로 나누어 보면, 포트폴리오용 Spring 백엔드 요구사항을 잡는 데 도움이 됩니다.
