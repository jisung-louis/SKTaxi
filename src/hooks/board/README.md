# Board Domain (게시판)

## 개요
대학 커뮤니티 게시판 기능. 게시글 작성/조회/수정/삭제, 댓글, 좋아요, 북마크 등.

## Firestore 컬렉션
- `boards/{postId}` - 게시글 정보
- `boardComments/{commentId}` - 게시글 댓글 (Top-level collection)
- `boards/{postId}/likes/{userId}` - 게시글 좋아요
- `users/{userId}/bookmarks/{postId}` - 사용자 북마크

## Repository
- `IBoardRepository` - 게시글/댓글 인터페이스
- `FirestoreBoardRepository` - Firestore 구현체

## Hooks

| 훅 | 용도 |
|----|------|
| `useBoardPosts` | 게시글 목록 구독 (카테고리별 필터링) |
| `useBoardPost` | 단일 게시글 구독 |
| `useBoardComments` | 게시글 댓글 구독 |
| `useBoardWrite` | 게시글 작성 |
| `useBoardEdit` | 게시글 수정 |
| `usePostActions` | 게시글 삭제 |
| `useBoardCategoryCounts` | 카테고리별 게시글 수 |
| `useUserBoardInteractions` | 좋아요/북마크 토글 |

## 사용 화면
- `BoardScreen` - 게시판 목록
- `BoardDetailScreen` - 게시글 상세
- `BoardWriteScreen` - 게시글 작성
- `BoardEditScreen` - 게시글 수정

## Spring 마이그레이션 포인트
- `FirestoreBoardRepository` → `SpringBoardRepository` 구현체 교체
- 댓글 구조: Firestore Top-level collection → RDB 외래키 관계
- 좋아요/북마크: Sub-collection → 별도 테이블
