# Party Domain (택시 파티)

## 개요
택시 동승 모집, 매칭, 정산 기능. 앱의 핵심 도메인.

## Firestore 컬렉션
- `parties/{partyId}` - 파티 정보 (출발지, 도착지, 시간, 멤버 등)
- `joinRequests/{requestId}` - 동승 요청
- `chats/{partyId}/messages/{messageId}` - 파티 채팅 메시지

## Repository
- `IPartyRepository` - 파티 CRUD, 동승 요청, 채팅 인터페이스
- `FirestorePartyRepository` - Firestore 구현체

## Hooks

| 훅 | 용도 |
|----|------|
| `useParties` | 파티 목록 구독 (필터링 지원) |
| `useParty` | 단일 파티 구독 |
| `useMyParty` | 내가 참여 중인 파티 조회 |
| `usePartyActions` | 파티 생성/수정/삭제/모집마감 |
| `useJoinRequest` | 동승 요청 생성/취소 |
| `useJoinRequestStatus` | 동승 요청 상태 구독 |
| `usePendingJoinRequest` | 대기 중인 요청 조회 |

## 비즈니스 로직
- 파티 생성 시 리더 자동 멤버 등록
- 동승 요청 승인 시 멤버 추가 + 시스템 메시지
- 정산 완료 후 파티 종료 처리
- 리더가 멤버 강퇴 가능

## 사용 화면
- `TaxiScreen` - 파티 목록 + 지도
- `RecruitScreen` - 파티 모집 (생성)
- `ChatScreen` - 파티 채팅
- `AcceptancePendingScreen` - 동승 승인 대기

## Spring 마이그레이션 포인트
- `FirestorePartyRepository` → `SpringPartyRepository` 구현체 교체
- 실시간 채팅: Firestore onSnapshot → WebSocket
- 동승 요청: Firestore 문서 → REST API + 푸시 알림
