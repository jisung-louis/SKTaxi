# Notice Domain (공지사항)

## 개요
성결대학교 공지사항 조회, 좋아요, 댓글, 알림 설정 기능.

## Firestore 컬렉션
- `notices/{noticeId}` - 공지사항 정보 (제목, 내용, 카테고리, 작성자 등)
- `notices/{noticeId}/readBy/{userId}` - 읽음 상태
- `notices/{noticeId}/likes/{userId}` - 좋아요
- `noticeComments/{commentId}` - 공지 댓글 (Top-level collection)

## Repository
- `INoticeRepository` - 공지사항 CRUD, 댓글 인터페이스
- `FirestoreNoticeRepository` - Firestore 구현체

## Hooks

| 훅 | 용도 |
|----|------|
| `useNotices` | 공지사항 목록 구독 (카테고리별 필터링) |
| `useNotice` | 단일 공지사항 구독 |
| `useRecentNotices` | 최근 공지사항 조회 (홈 화면용) |
| `useNoticeComments` | 공지 댓글 구독 |
| `useNoticeLike` | 공지 좋아요 토글 |
| `useNoticeSettings` | 공지 알림 설정 (카테고리별) |

## 데이터 흐름
```
Cloud Functions (크롤러)
    ↓ 매 시간 실행
Firestore notices 컬렉션
    ↓ 실시간 구독
useNotices Hook
    ↓
NoticeScreen
```

## 사용 화면
- `NoticeScreen` - 공지사항 목록
- `NoticeDetailScreen` - 공지사항 상세 (네이티브)
- `NoticeDetailWebViewScreen` - 공지사항 상세 (웹뷰)

## Spring 마이그레이션 포인트
- 크롤러: Cloud Functions → Spring Scheduler
- `FirestoreNoticeRepository` → `SpringNoticeRepository` 구현체 교체
- 알림: FCM → 별도 푸시 서비스 연동
