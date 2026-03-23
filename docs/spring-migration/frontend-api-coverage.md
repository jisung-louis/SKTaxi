# RN Spring API 커버리지와 로깅 가이드

> 최종 수정일: 2026-03-22
> 관련 문서: [RN Spring 연동 진행 현황](./frontend-migration-status.md) | [RN Spring 연동 로드맵](./frontend-integration-roadmap.md) | [RN Spring 연동 아키텍처 가이드](./frontend-architecture-guideline.md) | [API 명세](./api-specification.md)

---

## 1. 문서 목적

이 문서는 현재 React Native 앱이 실제로 어떤 Spring API를 호출하고 있는지,
어떤 영역은 부분 연결 상태인지,
그리고 개발 중 API 로깅을 어떤 원칙으로 붙여야 하는지 정리한다.

이 문서의 기준은 다음과 같다.

- 실제 앱 코드에서 호출 중인 endpoint를 우선 기록한다.
- “완료/부분 연결/미연결”은 backend 전체가 아니라 **앱 사용자 기능 기준**으로 판단한다.
- 실서버 연동 디버깅을 위해 로깅은 허용하되, 인증 정보와 민감 데이터는 반드시 마스킹한다.

---

## 2. 현재 요약

현재 앱은 다음 범위까지 Spring REST를 사용한다.

- 완료
  - Member bootstrap / profile / FCM token
  - App Notice 공개 조회
  - Notification Center REST + unread count + SSE 실시간 동기화
  - Taxi Home 조회/동승 요청 생성/취소/수락 대기 조회/실제 파티 채팅 진입
  - Taxi Party의 my party / join request count / leader 승인·거절 / recruit(create, 직접 입력 + 지도 선택 포함) / 수정 / 취소 + 주요 SSE subscription
  - Taxi Chat detail의 close/reopen/arrive/end/kick/leave/settlement confirm + ACCOUNT payload 전송 + 서버 생성 SYSTEM/ARRIVED/END 렌더링 chain
- 부분 연결
  - Taxi Party domain 전체
  - Chat domain 전체
- 아직 미연결
  - 일반 community/custom chat REST/STOMP
  - Board / Notice / Campus 등 나머지 도메인

즉, endpoint 단위로는 꽤 연결됐지만,
도메인 단위로 보면 Taxi / Chat은 아직 다음 phase 작업이 남아 있다.

---

## 3. 연결 완료 API

아래 endpoint는 **현재 프론트에서 실제로 호출 중인 Spring REST API**다.

### 3.1 Member / Auth bootstrap

상태:

- 연결 완료

endpoint:

- `POST /v1/members`
- `GET /v1/members/me`
- `PATCH /v1/members/me`
- `POST /v1/members/me/fcm-tokens`
- `DELETE /v1/members/me/fcm-tokens`

현재 사용처:

- 로그인 직후 Spring member bootstrap
- `CompleteProfileScreen` 저장
- 앱 시작/refresh/logout 시 FCM token 등록/삭제

코드:

- `src/features/member/data/api/memberApiClient.ts`
- `src/features/member/data/repositories/SpringMemberRepository.ts`
- `src/features/auth/hooks/useAuthSession.ts`
- `src/features/member/services/memberFcmTokenService.ts`

### 3.2 App Notice

상태:

- 연결 완료

endpoint:

- `GET /v1/app-notices`
- `GET /v1/app-notices/{appNoticeId}`

현재 사용처:

- 앱 공지 목록 화면
- 앱 공지 상세 화면
- Notification Hub의 App Notice 탭

코드:

- `src/features/settings/data/api/appNoticeApiClient.ts`
- `src/features/settings/data/repositories/SpringAppNoticeRepository.ts`
- `src/features/settings/hooks/useAppNoticeFeedData.ts`
- `src/features/settings/hooks/useAppNoticeDetailData.ts`

### 3.3 Notification Center + realtime

상태:

- 연결 완료

endpoint:

- `GET /v1/notifications`
- `GET /v1/notifications/unread-count`
- `GET /v1/sse/notifications`
- `POST /v1/notifications/{notificationId}/read`
- `POST /v1/notifications/read-all`
- `DELETE /v1/notifications/{notificationId}`

현재 사용처:

- 알림함 목록 조회
- unread count 기준 동기화
- SSE 실시간 신규 알림 반영
- 단건 읽음 처리
- 전체 읽음 처리
- 단건 삭제

코드:

- `src/features/user/data/api/notificationApiClient.ts`
- `src/features/user/data/repositories/SpringNotificationRepository.ts`
- `src/features/user/hooks/useNotificationCenterData.ts`

### 3.4 Taxi Home / My Party / Join Request / Leader Flow

상태:

- 연결 완료

endpoint:

- `POST /v1/parties`
- `PATCH /v1/parties/{partyId}`
- `POST /v1/parties/{partyId}/cancel`
- `GET /v1/parties`
- `GET /v1/parties/{partyId}`
- `GET /v1/parties/{partyId}/join-requests`
- `GET /v1/members/me/parties`
- `GET /v1/members/me/join-requests`
- `GET /v1/sse/parties`
- `GET /v1/sse/parties/{partyId}/join-requests`
- `GET /v1/sse/members/me/join-requests`
- `POST /v1/parties/{partyId}/join-requests`
- `PATCH /v1/join-requests/{id}/accept`
- `PATCH /v1/join-requests/{id}/decline`
- `PATCH /v1/join-requests/{id}/cancel`
- `GET /v1/notifications`
- `DELETE /v1/notifications/{notificationId}`

현재 사용처:

- Taxi Home 파티 목록 조회
- Taxi Home `OPEN + CLOSED` 파티 목록 merge 조회
- 내 활성 파티 여부 반영
- 내 pending join request 상태 반영
- Main tab의 `My Party` / `JoinRequestCount`
- leader join request modal의 승인/거절
- leader join request notification 정리
- `useMyParty` / `usePendingJoinRequest` / `useJoinRequestStatus` / `useParty` / `subscribeToJoinRequests`의 SSE signal subscription
- 동승 요청 생성
- AcceptancePending 화면 조회/취소
- RecruitScreen 파티 생성
- RecruitScreen 직접 입력 위치의 지도 선택 기반 좌표 확정
- ChatScreen 리더 전용 파티 수정 / 파티 취소
- 실제 Taxi Chat route 진입

코드:

- `src/features/taxi/data/api/taxiHomeApiClient.ts`
- `src/features/taxi/data/mappers/taxiPartyMapper.ts`
- `src/features/taxi/data/repositories/SpringPartyRepository.ts`
- `src/features/taxi/data/repositories/SpringNotificationActionRepository.ts`
- `src/features/taxi/application/taxiHomeQuery.ts`
- `src/features/taxi/application/taxiAcceptancePendingQuery.ts`
- `src/features/taxi/hooks/useTaxiHomeData.ts`
- `src/features/taxi/hooks/useTaxiAcceptancePendingData.ts`
- `src/features/taxi/hooks/useTaxiRecruitForm.ts`
- `src/features/taxi/hooks/useJoinRequestModal.ts`
- `src/features/taxi/hooks/useMyParty.ts`
- `src/features/taxi/hooks/useJoinRequestStatus.ts`
- `src/features/taxi/providers/JoinRequestProvider.tsx`
- `src/di/RepositoryProvider.tsx`

runtime note:

- `SpringPartyRepository`는 `GET /v1/sse/parties`, `GET /v1/sse/parties/{partyId}/join-requests`, `GET /v1/sse/members/me/join-requests`를 signal transport로 사용하고, 실제 domain state는 REST snapshot으로 다시 읽는다.
- Taxi Home 목록은 `GET /v1/parties?status=OPEN`과 `GET /v1/parties?status=CLOSED`를 각각 호출한 뒤 프론트에서 merge한다.
- 따라서 `useMyParty`, `JoinRequestProvider`, `usePendingJoinRequest`, `useJoinRequestStatus`, `useParty`, `subscribeToJoinRequests()`는 `SSE signal -> REST refresh` 기준으로 동기화된다.
- leader action 이후 화면 반영 기준은 optimistic mutation이 아니라 `REST mutation -> repository refresh + SSE follow-up signal`이다.
- `PARTY_JOIN_REQUEST` 알림 정리는 `notification.data.requestId` 기준으로 삭제해, 같은 party의 다른 pending 요청 알림을 같이 지우지 않는다.
- push runtime은 backend FCM enum(`PARTY_JOIN_REQUEST`, `PARTY_JOIN_ACCEPTED`, `PARTY_JOIN_DECLINED`)을 기존 frontend navigation type으로 정규화한다.
- backend에는 client-authored system message write contract가 없고 `SYSTEM` 메시지 전송은 거부되므로, create/accept 후 조용히 성공하던 frontend no-op는 제거했다.
- `RecruitScreen`은 프리셋 위치 또는 지도에서 선택된 자유 입력 위치만 제출 가능하게 해 `POST /v1/parties`에 항상 `departure/destination.name + lat + lng`를 보낸다.

### 3.5 Taxi Chat detail

상태:

- 해당 screen chain 연결 완료

endpoint / realtime contract:

- `GET /v1/parties/{partyId}`
- `GET /v1/chat-rooms/party:{partyId}`
- `GET /v1/chat-rooms/party:{partyId}/messages`
- `PATCH /v1/parties/{id}/close`
- `PATCH /v1/parties/{id}/reopen`
- `PATCH /v1/parties/{id}/arrive`
- `PATCH /v1/parties/{id}/end`
- `DELETE /v1/parties/{id}/members/{memberId}`
- `DELETE /v1/parties/{id}/members/me`
- `PATCH /v1/parties/{id}/settlement/members/{memberId}/confirm`
- `PATCH /v1/chat-rooms/party:{partyId}/settings`
- `PATCH /v1/chat-rooms/party:{partyId}/read`
- STOMP endpoint:
  - SockJS/web: `/ws`
  - RN native WebSocket: `/ws-native`
- publish: `/app/chat/party:{partyId}`
- subscribe: `/topic/chat/party:{partyId}`
- error queue: `/user/queue/errors`
- client publish type: `TEXT`, `ACCOUNT`
- server-generated subscribe type: `SYSTEM`, `ARRIVED`, `END`

현재 사용처:

- Taxi Chat 상세 화면 초기 상태 로드
- Taxi Chat 과거 메시지 조회
- Taxi Chat 실시간 메시지 수신/전송
- Taxi Chat 음소거 토글
- Taxi Chat 방 열람 중 읽음 처리
- Taxi Chat 화면에서 모집 마감/재개, 도착 처리, 강제 종료, 멤버 내보내기, 직접 나가기, 정산 확인
- Taxi Chat 리더/멤버 header menu 분기와 파티 수정/취소
- Taxi Chat `+` 액션 트레이, 택시 호출 딥링크, 계좌 전송, 정산 현황 상단 공지/관리 modal
- Taxi Chat `ACCOUNT` payload 전송과 `SYSTEM` / `ARRIVED` / `END` 서버 생성 메시지 렌더링

코드:

- `src/features/taxi/data/api/taxiChatApiClient.ts`
- `src/features/taxi/data/api/taxiHomeApiClient.ts`
- `src/features/taxi/data/repositories/SpringPartyRepository.ts`
- `src/features/taxi/data/repositories/SpringTaxiChatRepository.ts`
- `src/features/taxi/application/taxiChatDetailAssembler.ts`
- `src/features/taxi/components/TaxiChatSummaryCard.tsx`
- `src/features/taxi/hooks/useTaxiChatDetailData.ts`
- `src/features/taxi/screens/ChatScreen.tsx`
- `src/di/RepositoryProvider.tsx`

runtime note:

- `SpringTaxiChatRepository`는 subscriber가 0명이 되거나 auth session uid가 바뀌면 STOMP client를 deactivate하고 party state를 정리한다.
- 따라서 로그아웃 후 다른 계정 로그인 시 이전 CONNECT Authorization 세션을 재사용하지 않는다.
- Taxi Chat detail은 `partyRepository.subscribeToParty()`의 SSE signal을 받아 `taxiChatRepository.getPartyChat()` REST snapshot을 다시 읽으므로, party status/member/settlement 변화도 chat summary에서 Spring source 기준으로 다시 반영된다.
- `SpringTaxiChatRepository`는 `ACCOUNT` publish 이후 같은 room topic에서 실제 `ACCOUNT` message를 수신할 때까지 대기한다.
- 실기기 보강으로 ACCOUNT pending은 duplicate topic frame과 REST snapshot fallback으로도 해제한다. dev 환경에서는 publish/topic/error-queue/pending-clear 시점 로그를 남긴다.
- leader 승인 후 `SYSTEM`, arrive 후 `ARRIVED`, cancel/end 후 `END`는 backend가 직접 생성하고 프론트는 해당 snapshot/message를 렌더링만 한다.
- `ACCOUNT`는 `bankName`, `accountNumber`, `accountHolder`, `hideName`, `remember` payload를 그대로 전송한다.
- `/arrive`는 `taxiFare`, `settlementTargetMemberIds`, `account { bankName, accountNumber, accountHolder, hideName }` payload를 전송한다.
- 멤버 `DELETE /v1/parties/{id}/members/me` 성공 후에는 leave guard로 stale refresh/SSE callback을 무시하고 chat session을 정리한다.

---

## 4. 부분 연결 API

이 섹션은 “endpoint 몇 개는 이미 연결됐지만, 도메인 전체 전환은 끝나지 않은 영역”을 정리한다.

### 4.1 Taxi Party domain

상태:

- 부분 연결

이미 연결된 endpoint:

- `POST /v1/parties`
- `PATCH /v1/parties/{id}`
- `POST /v1/parties/{partyId}/cancel`
- `GET /v1/parties/{partyId}/join-requests`
- `PATCH /v1/join-requests/{id}/accept`
- `PATCH /v1/join-requests/{id}/decline`
- `GET /v1/parties`
- `GET /v1/parties/{partyId}`
- `GET /v1/members/me/parties`
- `GET /v1/members/me/join-requests`
- `GET /v1/sse/parties`
- `GET /v1/sse/parties/{partyId}/join-requests`
- `GET /v1/sse/members/me/join-requests`
- `POST /v1/parties/{partyId}/join-requests`
- `PATCH /v1/join-requests/{id}/cancel`
- `PATCH /v1/parties/{id}/close`
- `PATCH /v1/parties/{id}/reopen`
- `PATCH /v1/parties/{id}/arrive`
- `PATCH /v1/parties/{id}/end`
- `DELETE /v1/parties/{id}/members/{memberId}`
- `DELETE /v1/parties/{partyId}/members/me`
- `PATCH /v1/parties/{id}/settlement/members/{memberId}/confirm`

아직 남은 것:

- signal-only SSE + REST snapshot 구조의 재조회 비용
- Taxi Party domain 외부의 일반 Chat / legacy 경로 수렴

의미:

- Taxi Home, AcceptancePending, Main tab의 my party/join request badge, leader 승인/거절, recruit(create), 파티 수정/취소와 주요 subscription은 Spring REST/SSE 기준으로 동작한다.
- Taxi Party의 Phase E 사용자 기능 범위는 정리됐지만, domain 전체 관점에서는 signal-only SSE 구조와 legacy 경로가 일부 남아 있다.

### 4.2 Chat domain

상태:

- 부분 연결

이미 연결된 것:

- Taxi Home / AcceptancePending에서 실제 `Chat` route 진입
- Taxi Chat detail의 `GET /v1/chat-rooms/{chatRoomId}`
- Taxi Chat detail의 `GET /v1/chat-rooms/{chatRoomId}/messages`
- Taxi Chat detail의 `PATCH /v1/chat-rooms/{chatRoomId}/settings`
- Taxi Chat detail의 `PATCH /v1/chat-rooms/{chatRoomId}/read`
- Taxi Chat detail의 `/app/chat/{chatRoomId}`
- Taxi Chat detail의 `/topic/chat/{chatRoomId}`
- Taxi Chat detail의 `/user/queue/errors`
- Taxi Chat detail의 `ACCOUNT` payload write/read
- Taxi Chat detail의 server-generated `SYSTEM` / `ARRIVED` / `END` message read/render

아직 남은 것:

- `GET /v1/chat-rooms`
- `/user/queue/chat-rooms`
- community/custom chat detail의 Spring 이전
- 이미지 메시지 전송의 실사용 연결

의미:

- Taxi Chat detail은 REST/STOMP 기준으로 동작하고, 택시 파티 전용 ACCOUNT payload와 서버 생성 SYSTEM/ARRIVED/END snapshot도 실사용 연결됐다.
- 하지만 Chat domain 전체로 보면 목록/요약/일반 채팅방은 아직 legacy/mock 경로가 남아 있다.

---

## 5. 아직 미연결 API

이 섹션은 “현재 앱에서 아직 Spring으로 붙지 않은 대표 사용자 기능 API”를 정리한다.

### 5.1 Chat

- `GET /v1/chat-rooms`
- `/user/queue/chat-rooms`
- 일반 community/custom chat 목록/상세의 Spring 이전
- 이미지 메시지 전송의 실사용 연결

### 5.2 Notice / Board / Campus / 기타

현재 다음 영역은 여전히 Spring 정식 이전 전이다.

- Notice 본체
- Board / Community
- Campus 계열
- 남아 있는 mock 화면 체인

---

## 6. 개발용 API 로깅 가이드

### 6.1 결론

개발 중에는 API 요청/응답을 콘솔에 출력해도 된다.

하지만 아래 항목은 **그대로 출력하면 안 된다.**

- Firebase ID token
- Authorization header 원문
- FCM token
- password / auth code / refresh token 계열
- multipart binary payload
- 채팅/문의/신고처럼 민감한 본문 전체

즉, **“전부 raw dump”는 비권장**이고,
**“개발 전용 + 구조화된 로그 + 민감정보 마스킹”** 전략이 맞다.

### 6.2 권장 로깅 위치

우선순위는 다음 순서가 좋다.

1. `src/shared/api/httpClient.ts`
2. `src/shared/realtime/sseClient.ts`
3. `src/shared/realtime/chatSocketClient.ts`

이유:

- 모든 Spring REST 요청이 `httpClient`를 통과한다.
- 여기서 찍어야 feature별 중복 로깅이 안 생긴다.
- SSE/STOMP도 transport 레이어에서 찍어야 연결/재연결/구독 실패를 한 번에 볼 수 있다.

### 6.3 권장 로그 필드

request 로그:

- requestId
- method
- full URL
- params
- body summary
- sanitized headers
- startedAt

response 로그:

- requestId
- method
- full URL
- statusCode
- durationMs
- response summary

error 로그:

- requestId
- method
- full URL
- statusCode
- repository error code
- api error code
- message
- durationMs

### 6.4 반드시 마스킹할 값

header:

- `Authorization`
- `Cookie`
- `Set-Cookie`
- `X-Api-Key`

body / params key:

- `token`
- `idToken`
- `refreshToken`
- `fcmToken`
- `password`
- `authCode`

권장 출력 형식:

- `Authorization: Bearer <redacted>`
- `fcmToken: <redacted>`

### 6.5 body/response 로깅 원칙

body와 response는 무조건 전부 찍지 않는다.

권장 방식:

- 기본값은 key 목록 + 길이/개수만 출력
- 객체는 depth 2 정도까지만 출력
- 배열은 앞쪽 몇 개만 preview
- 문자열은 최대 길이 제한
- multipart/form-data는 파일 메타만 출력

예:

- 게시글 본문: 전문 출력 금지, 길이만 출력
- 채팅 메시지: 전문 출력 금지, 길이만 출력
- 파티 목록: `content.length`, `page`, `hasNext` 중심 출력

### 6.6 환경별 정책

권장 정책:

- `__DEV__ === true`일 때만 기본 활성화
- release build에서는 완전 비활성화
- 필요하면 별도 debug flag로 강제 on/off

예:

- `ENABLE_API_DEBUG_LOG=true`일 때만 상세 로그
- 기본 개발 모드에서는 summary 로그만

### 6.7 추천 전략

가장 안전한 전략은 아래 3단계다.

1. request/response/error 공통 logger를 `httpClient`에 1곳만 둔다.
2. 민감정보는 중앙 sanitizer 함수로 마스킹한다.
3. 기본은 summary 로그, 필요할 때만 endpoint whitelist 기반 상세 로그를 켠다.

즉, 지금 프로젝트에 가장 맞는 방식은:

- 중앙 로깅
- dev only
- redaction 필수
- large payload truncation
- requestId 기반 추적

### 6.8 지금 프로젝트에서의 권장 구현 순서

1. `src/shared/api/httpClient.ts`에 dev-only logger hook 추가
2. `src/shared/api/` 아래에 `apiLogger.ts`와 `apiLogSanitizer.ts` 추가
3. SSE / STOMP는 Phase D/F에서 transport별 event logger 추가

권장 추가 파일:

- `src/shared/api/apiLogger.ts`
- `src/shared/api/apiLogSanitizer.ts`

---

## 7. 다음 작업자 메모

- 실제 endpoint 계약은 `/v3/api-docs` 우선이다.
- 이 문서의 “연결 완료”는 사용자 기능 기준이며, backend 전체 완료를 뜻하지 않는다.
- Notification / Taxi / Chat은 domain 전체 기준으로는 아직 다음 phase 작업이 남아 있다.
- API 로깅을 붙일 때는 raw token/body를 그대로 출력하지 않는다.
