# Chat Domain (채팅)

## 개요
일반 채팅방 기능 (대학 전체 채팅, 학과 채팅 등). 택시 파티 채팅은 party 도메인에서 처리.

## Firestore 컬렉션
- `chatRooms/{roomId}` - 채팅방 정보
- `chatRooms/{roomId}/messages/{messageId}` - 채팅 메시지
- `chatRooms/{roomId}/members/{userId}` - 채팅방 멤버
- `chats/{partyId}/messages/{messageId}` - 택시 파티 채팅 메시지

## Repository
- `IChatRepository` - 채팅방/메시지 인터페이스
- `FirestoreChatRepository` - Firestore 구현체
- `IPartyRepository` - 파티 채팅 메시지 (party 도메인)

## Hooks

### 채팅방 (chatRooms 컬렉션)
| 훅 | 용도 |
|----|------|
| `useChatRooms` | 채팅방 목록 구독 |
| `useChatRoom` | 단일 채팅방 구독 |
| `useChatMessages` | 채팅방 메시지 구독 |
| `useChatActions` | 채팅방 액션 (메시지 전송 등) |
| `useChatRoomStates` | 채팅방 읽음 상태 |
| `useChatRoomNotifications` | 채팅방 알림 설정 |

### 파티 채팅 (chats 컬렉션)
| 훅 | 용도 |
|----|------|
| `useMessages` | 파티 채팅 메시지 구독 |

## 유틸리티 함수 (src/utils/)
- `chatUtils.ts` - 채팅방 메시지 전송, 알림 설정
- `partyMessageUtils.ts` - 파티 채팅 메시지, 시스템 메시지

## 사용 화면
- `ChatListScreen` - 채팅방 목록
- `ChatDetailScreen` - 채팅방 상세
- `TaxiTab/ChatScreen` - 택시 파티 채팅

## Spring 마이그레이션 포인트
- 실시간 메시지: Firestore onSnapshot → WebSocket/SSE
- `FirestoreChatRepository` → `SpringChatRepository` 구현체 교체
