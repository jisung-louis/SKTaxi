# User Domain (사용자)

## 개요
사용자 프로필, 계좌 정보, 알림 설정, 북마크 관리 기능.

## Firestore 컬렉션
- `users/{userId}` - 사용자 정보 (displayName, department, studentId 등)
- `users/{userId}/bookmarks/{postId}` - 게시글 북마크
- `users/{userId}/notificationSettings` - 알림 설정 (embed)

## Repository
- `IUserRepository` - 사용자 프로필, 북마크 인터페이스
- `FirestoreUserRepository` - Firestore 구현체

## Hooks

| 훅 | 용도 |
|----|------|
| `useUserProfile` | 사용자 프로필 조회/수정 |
| `useAccountInfo` | 계좌 정보 조회/수정 |
| `useNotificationSettings` | 알림 설정 조회/수정 |
| `useUserBookmarks` | 북마크 목록 조회/토글 |
| `useUserDisplayNames` | 여러 사용자 닉네임 조회 (캐시) |

## 인증
- `useAuth` (hooks/auth) - Firebase Auth 연동
- `useAuthContext` (contexts) - 인증 상태 관리
- Google Sign-In, 이메일/비밀번호 로그인 지원

## 사용 화면
- `ProfileScreen` - 내 프로필
- `ProfileEditScreen` - 프로필 수정
- `AccountModificationScreen` - 계좌 정보 수정
- `NotificationSettingScreen` - 알림 설정

## Spring 마이그레이션 포인트
- `FirestoreUserRepository` → `SpringUserRepository` 구현체 교체
- 인증: Firebase Auth → Spring Security + OAuth2
- 북마크: Sub-collection → 별도 테이블
