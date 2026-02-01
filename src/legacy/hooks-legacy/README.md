# Legacy Hooks

이 폴더에는 **Firebase를 직접 import**하는 레거시 훅들이 보관되어 있습니다.

## 배경

SKTaxi 프로젝트는 SOLID 원칙(특히 DIP - Dependency Inversion Principle)을 준수하고, 
향후 Firebase → Spring 백엔드 마이그레이션을 용이하게 하기 위해 Repository 패턴을 도입했습니다.

새로운 훅들은 `src/hooks/{domain}/` 폴더에 위치하며, Repository를 통해 데이터에 접근합니다.
이 레거시 훅들은 **직접 Firebase SDK를 import**하여 사용하므로, DIP를 위반하고 있습니다.

## 레거시 훅 목록 및 대체 훅 매핑

| 레거시 훅 | 새 훅 (Repository 패턴) | 도메인 |
|-----------|------------------------|--------|
| `useParties.ts` | `src/hooks/party/useParties.ts` | Party |
| `useMyParty.ts` | `src/hooks/party/useMyParty.ts` | Party |
| `usePendingJoinRequest.ts` | `src/hooks/party/usePendingJoinRequest.ts` | Party |
| `useMessages.ts` | `src/hooks/chat/useChatMessages.ts` | Chat |
| `useChatMessages.ts` | `src/hooks/chat/useChatMessages.ts` | Chat |
| `useChatRooms.ts` | `src/hooks/chat/useChatRooms.ts` | Chat |
| `useBoardPosts.ts` | `src/hooks/board/useBoardPosts.ts` | Board |
| `useBoardPost.ts` | `src/hooks/board/useBoardPost.ts` | Board |
| `useBoardComments.ts` | `src/hooks/board/useBoardComments.ts` | Board |
| `usePostActions.ts` | `src/hooks/board/usePostActions.ts` | Board |
| `useUserBoardInteractions.ts` | (신규 생성 필요) | Board |
| `useNotices.ts` | `src/hooks/notice/useNotices.ts` | Notice |
| `useNoticeComments.ts` | `src/hooks/notice/useNoticeComments.ts` | Notice |
| `useNoticeLike.ts` | `src/hooks/notice/useNoticeLike.ts` | Notice |
| `useNoticeSettings.ts` | (신규 생성 필요) | Notice |
| `useComments.ts` | (도메인별 분리됨) | Common |
| `useNotifications.ts` | `src/hooks/common/useNotifications.ts` | Common |
| `useUserDisplayNames.ts` | `src/hooks/user/useUserDisplayNames.ts` | User |
| `useUserBookmarks.ts` | (신규 생성 필요) | User |
| `useAuth.ts` | (IAuthRepository 사용 예정) | Auth |
| `useImageUpload.ts` | (IStorageRepository 사용 예정) | Storage |
| `useTimetable.ts` | (ITimetableRepository 사용 예정) | Timetable |
| `useAcademicSchedules.ts` | `src/hooks/setting/useAcademicSchedules.ts` | Setting |
| `useCafeteriaMenu.ts` | `src/hooks/setting/useCafeteriaMenu.ts` | Setting |
| `usePermissionStatus.ts` | (React Native 권한 전용, 유지 가능) | System |

## 새 훅 아키텍처

```
src/hooks/
├── party/          # 택시 동승 파티 관련
├── chat/           # 채팅 관련
├── board/          # 게시판 관련
├── notice/         # 공지사항 관련
├── user/           # 사용자 정보 관련
├── setting/        # 설정 (학사일정, 식단 등) 관련
├── common/         # 공통 유틸리티 훅
└── taxi/           # 택시 화면 전용 복합 훅
```

## 마이그레이션 가이드

레거시 훅에서 새 훅으로 마이그레이션할 때:

1. **새 훅 import 경로 변경**
   ```typescript
   // Before (레거시)
   import { useParties } from '../hooks/useParties';
   
   // After (새 훅)
   import { useParties } from '../hooks/party';
   ```

2. **반환값 확인**: 새 훅은 Repository 패턴에 맞게 반환값이 조정되었을 수 있음

3. **에러 처리**: 새 훅은 `RepositoryError`를 사용하여 표준화된 에러 처리 제공

## 주의사항

- 이 폴더의 파일들은 **참조용**으로만 사용하세요
- 새 기능 개발 시 반드시 `src/hooks/{domain}/` 폴더의 새 훅을 사용하세요
- 레거시 코드에서 새 훅으로 점진적으로 마이그레이션 진행 중

## 관련 문서

- `src/repositories/interfaces/` - Repository 인터페이스 정의
- `src/di/` - 의존성 주입 시스템
- `src/errors/` - 표준화된 에러 처리
- `docs/SOLID-Improvement-Plan.md` - SOLID 개선 계획
