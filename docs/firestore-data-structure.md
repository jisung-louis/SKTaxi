# SKURI Firestore 데이터 구조

본 문서는 RN 클라이언트와 Admin 스크립트, Cloud Functions 코드 전반을 조사하여 정리한 Firestore 데이터 모델입니다. 각 섹션에는 컬렉션 경로, 용도, 주요 필드 및 하위 문서 구조를 포함했습니다. (조사 기준: 2025-11-24)

---

## 1. 사용자 및 알림

| 경로 | 설명 | 주요 필드/하위 구조 |
| --- | --- | --- |
| `users/{uid}` | 사용자 기본 프로필, 온보딩 상태, 디바이스 토큰, 버전 정보, 계좌/마인크래프트 정보 등 모든 계정 메타데이터를 저장 | `email`, `displayName`, `studentId`, `department`, `photoURL`,`isAdmin`, `linkedAccounts[]`(displayName(구글 계정에 등록된 이름)·email·photoURL·provider·providerId), `account.{bankName,accountNumber,accountHolder,hideName}`, `onboarding.permissionsComplete`, `fcmTokens[]`, `joinedAt`, `updatedAt`, `currentVersion`, `lastLogin`, `lastLoginOS`, `minecraftAccount.accounts[]`(닉네임·uuid·edition·whoseFriend·linkedAt·storedName(edition이 "BE"일 때만 존재)) |
| `users/{uid}.notificationSettings` | 알림 토글 묶음 | `allNotifications`, `partyNotifications`, `noticeNotifications`, `boardLikeNotifications`, `boardCommentNotifications`, `systemNotifications`, `marketingNotifications`, (선택) `noticeNotificationsDetail.{카테고리}` |
| `users/{uid}/chatRoomNotifications/{chatRoomId}` | 공개 채팅방별 mute 상태 | `enabled` (기본 true) |
| `userNotifications/{uid}/notifications/{notificationId}` | 클라우드 함수/앱에서 발송하는 사용자별 알림 인박스 | `type`, `title`, `message`, `data`, `isRead`, `readAt`, `createdAt` |
| `fcmTokens` 필드 | `users/{uid}` 문서 내부 배열로 유지하며, Functions에서 토큰 정리 시 업데이트 |

## 2. 택시 파티 & 동승

| 경로 | 설명 | 주요 필드/하위 구조 |
| --- | --- | --- |
| `parties/{partyId}` | 택시 모집 카드 | `leaderId`, `departure{name,lat,lng}`, `destination{name,lat,lng}`, `departureTime`(ISO), `maxMembers`, `members[]`, `tags[]`, `detail`, `status ('open'|'closed'|'arrived'|'ended')`, `endReason ('arrived'|'cancelled'|'timeout'|'withdrawed')`, `endedAt`, `createdAt`, `updatedAt`, `settlement.{status,perPersonAmount,members.{uid}.{settled,settledAt}}` |
| `joinRequests/{requestId}` | 동승 요청 | `partyId`, `leaderId`, `requesterId`, `status ('pending'|'accepted'|'declined')`, `createdAt` |
| `chats/{partyId}/messages/{messageId}` | 파티 전용 채팅 메시지 | `partyId`, `senderId`, `senderName`, `type ('user'|'system'|'account'|'arrived'|'end')`, `text`, `accountData{bankName,accountNumber,accountHolder,hideName}`, `arrivalData{taxiFare,perPerson,memberCount,bankName,accountNumber,accountHolder,hideName}`, `createdAt`, `updatedAt` |
| `chats/{partyId}/notificationSettings/{uid}` | 파티 채팅 음소거 여부 | `muted`, `createdAt`, `updatedAt` |

## 3. 공개 채팅(커뮤니티)

| 경로 | 설명 | 주요 필드/하위 구조 |
| --- | --- | --- |
| `chatRooms/{chatRoomId}` | 공개/학과/게임/커스텀 채팅방 메타데이터 | `name`, `type ('university'|'department'|'game'|'custom')`, `department`, `description`, `createdBy`, `members[]`, `isPublic`, `maxMembers`, `lastMessage{text,senderId,senderName,timestamp}`, `unreadCount.{uid}`, `createdAt`, `updatedAt` |
| `chatRooms/{chatRoomId}/messages/{messageId}` | 공개방 메시지 | `text`, `senderId`, `senderName`, `type ('text'|'image'|'system')`, `readBy[]`, `createdAt`, (다음은 Minecraft 채팅방에만 추가로 존재하는 필드) `direction`, `source`, `minecraftUuid`, `appUserDisplayName` |

## 4. 게시판 & 공지

| 경로 | 설명 | 주요 필드/하위 구조 |
| --- | --- | --- |
| `boardPosts/{postId}` | 커뮤니티 게시글 | `title`, `content`, `authorId`, `authorName`, `authorProfileImage`, `isAnonymous`, `anonId`, `category`, `viewCount`, `likeCount`, `commentCount`, `bookmarkCount`, `isPinned`, `isDeleted`, `images[]`, `createdAt`, `updatedAt`, `lastCommentAt` |
| `boardComments/{commentId}` | 게시판 댓글/대댓글 | `postId`, `content`, `authorId`, `authorName`, `authorProfileImage`, `isAnonymous`, `anonId`, `anonymousOrder`, `parentId`, `isDeleted`, `createdAt`, `updatedAt` |
| `userBookmarks/{docId}` | 게시글 즐겨찾기 | `userId`, `postId`, `createdAt` |
| `notices/{noticeId}` | 학교 공지(크롤링) | `title`, `content`, `link`, `postedAt`, `category`, `department`, `author`, `source`, `contentDetail`, `contentAttachments[]`, `likeCount`, `commentCount`, `viewCount`, `createdAt` |
| `notices/{noticeId}/readBy/{uid}` | 공지 읽음 상태 | `userId`, `noticeId`, `isRead`, `readAt` |
| `noticeComments/{commentId}` | 공지 댓글 | `noticeId`, `userId`, `userDisplayName`, `content`, `isAnonymous`, `anonId`, `replyCount`, `parentId`, `isDeleted`, `createdAt`, `updatedAt` |
| `appNotices/{noticeId}` | 운영 공지(앱 내 카드) | `title`, `content`, `category ('update'|'service'|'event'|'policy')`, `priority ('urgent'|'normal'|'info')`, `imageUrls` (string[] · optional), `actionUrl`, `publishedAt`, `updatedAt` (optional) |

## 5. 학사·생활 정보

| 경로 | 설명 | 주요 필드 |
| --- | --- | --- |
| `courses/{courseId}` | 강의 마스터 | `grade`, `category`, `code`, `division`, `name`, `credits`, `professor`, `schedule[]`, `location`, `note`, `semester`, `department`, `createdAt`, `updatedAt` |
| `userTimetables/{docId}` | 사용자별 학기 시간표 | `userId`, `semester`, `courses[]`, `createdAt`, `updatedAt` |
| `academicSchedules/{scheduleId}` | 학사 일정 | `title`, `startDate`, `endDate`, `type ('single'|'multi')`, `isPrimary`, `description`, `createdAt`, `updatedAt` |
| `cafeteriaMenus/{weekId}` | 주차별 학식 | `weekStart`, `weekEnd`, `rollNoodles` (string[] 또는 { [date: string]: string[] }), `theBab` (string[] 또는 { [date: string]: string[] }), `fryRice` (string[] 또는 { [date: string]: string[] }), `createdAt`, `updatedAt` |

## 6. 문의/운영/관리

| 경로 | 설명 | 주요 필드 |
| --- | --- | --- |
| `inquiries/{docId}` | 앱 내 문의 접수 | `type ('feature'|'bug'|...)`, `subject`, `content`, `userId`, `userEmail`, `userName`, `userRealname`, `userStudentId`, `status ('pending'|'in_progress'|'resolved')`, `createdAt`, `updatedAt` |
| `reports/{reportId}` | 신고 접수 | `targetType ('post'|'comment'|'chat_message'|'profile')`, `targetId`, `targetAuthorId`, `category`, `reporterId`, `status`, `createdAt`, `updatedAt` |
| `blocks/{uid}/blockedUsers/{blockedUid}` | 차단 목록 | `blockedUserId`, `blockedBy`, `createdAt` |
| `appVersion/{platform}` (`ios`, `android`) | 필수 업데이트 정보 | `minimumVersion`, `forceUpdate`, `message`, `icon`, `title`, `showButton`, `buttonText`, `buttonUrl`, `updatedAt` |

---

## 참고
- 보안 규칙: `appVersion` 컬렉션만 익명 읽기 허용, 그 외 문서는 모두 인증 필요.
- Cloud Functions는 `users`, `parties`, `joinRequests`, `userNotifications` 등을 트리거하여 토큰 정리·푸시 발송을 수행하므로, 해당 컬렉션의 필드 변경 시 함수 로직도 함께 검토해야 합니다.
- 새 기능 추가 시 `rg "collection(" -n src` 등으로 Firestore 경로 사용 현황을 확인하고, 컬렉션·필드 충돌을 피하세요.

