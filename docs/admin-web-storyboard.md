---
title: SKTaxi 관리자 웹 스토리보드
description: Firebase 기반 SKTaxi 관리자 웹 애플리케이션의 구조와 화면 설계 요약
lastUpdated: 2025-11-10
---

# SKTaxi 관리자 웹 스토리보드

## 1. 프로젝트 개요
- **목표**: Firestore 및 Firebase 리소스를 직관적으로 관리하는 전용 관리자 웹(웹 콘솔).
- **대상 사용자**: `users/{uid}.isAdmin == true` 인가를 가진 운영자.
- **핵심 기능**: 사용자, 택시 파티, 실시간 채팅, 공지, 앱 버전, 문의, 신고, 학교 공지, 커뮤니티 게시글/댓글 등 데이터 조회·필터링·수정.

## 2. 데이터 구조 참고
- Firestore 컬렉션: `users`, `chatRooms`, `chatRooms/{id}/messages`, `parties`, `chats/{partyId}/messages`, `appNotices`, `appVersion`, `inquiries`, `reports`, `notices`, `notices/{noticeId}/readBy`, `notices/{noticeId}/likes`, `boardPosts`, `boardComments`, `userBoardInteractions` 등.
- 기존 앱 타입 정의 출처:
  - `src/types/firestore.ts`
  - `src/hooks/useNotices.ts`
  - `src/screens/HomeTab/SettingScreen/AppNoticeScreen.tsx`
  - 기타 Firestore CRUD가 구현된 훅/스크린.

## 3. 기술 스택 제안
- **프레임워크**: Next.js(또는 Vite 기반 React SPA) + TypeScript.
- **UI 라이브러리**: Chakra UI / Material UI / Ant Design 중 택일. 다크 모드 지원.
- **데이터**: Firebase Admin SDK(서버 측)와 Firebase Web SDK(클라이언트 측) 병행. React Query(SWR)로 fetch & 캐싱.
- **인증**: Firebase Auth (Email/Password) + `isAdmin` 검증, 세션 쿠키/커스텀 클레임 사용.
- **배포**: Vercel/Netlify 등. 환경 변수로 Firebase 설정 분리.
- **테스트/개발 환경**: Firebase Emulator Suite, Storybook.

## 4. 공통 레이아웃 & UX
- **로그인**: 이메일/비밀번호 입력 → Firebase Auth 로그인 → Firestore로 `isAdmin` 검증. 실패 시 에러 모달.
- **전역 레이아웃**:
  - 좌측 사이드바: 로고, 메뉴, 섹션별 내비.
  - 상단 바: 브레드크럼, 글로벌 검색(UID/문서 ID), 다크 모드 토글, 사용자 정보, 로그아웃.
  - 콘텐츠 영역: 필터·액션 바 + 테이블/상세 패널 조합.
- **공통 기능**: CSV/JSON 내보내기, 빠른 검색, 다중 선택, 실시간 갱신 상태 표시.
- **감사 로그**: 모든 수정 작업은 `adminAuditLogs`(또는 Cloud Logging)에 기록.

## 5. 화면별 스토리보드

### 5.1 Dashboard
- KPI 카드: 신규 가입자 수, 오픈 파티 수, 열린 신고 수, 미답변 문의 수.
- 최근 항목: 신고/문의 최근 5건 리스트.
- 시스템 상태: iOS & Android `appVersion`, 최신 `appNotices`, 공지 발행 시간.
- 그래프: 7일간 활동 지표(로그인, 파티 생성 등) 시각화(추가 파이프라인 필요 시 함수/BigQuery 연동).

### 5.2 사용자 관리 (`users`)
- 리스트: UID, 닉네임, 학과, 학번, 이메일, 가입일, 최근 활동, `isAdmin`, FCM 토큰 수.
- 필터: 학과, 가입일 범위, 관리자 여부.
- 상세 패널:
  - 프로필 편집(닉네임, 실명, 계좌 등).
  - 참여 파티, 작성 게시글, 신고/문의 이력 요약.
  - `chatRoomNotifications` 서브컬렉션(알림 상태) 표시/토글.
  - 관리자 승격/박탈, 계정 잠금(Cloud Function 필요) 액션.

### 5.3 택시 파티 & 채팅 (`parties`, `chats`)
- 파티 리스트: 파티 ID, 리더, 출발/도착지, 시간, 멤버 수, 상태, 생성일.
- 상세: 멤버 정보, 키워드, 정산 상태(도착 시 배분 현황).
- 채팅 타임라인: 메시지 유형별 카드(text/system/account/arrived/end), 검색(키워드/발신자/기간), 내보내기.
- 시스템 메시지 전송(공지) 및 파티 강제 종료 버튼.

### 5.4 공개 채팅방 (`chatRooms`)
- 리스트: ID, 이름, 타입(university/department/custom), 멤버 수, 생성자, 공개 여부, lastMessage, updatedAt.
- 상세:
  - 멤버 리스트, unreadCount 맵.
  - 메시지 타임라인(검색·내보내기 동일).
  - `users/{uid}/chatRoomNotifications` 조회/설정.
  - 멤버 강퇴, 채팅 공지 전송, 방 정보 수정.
  - 새 채팅방 생성 UI(이름, 설명, 타입, 멤버 추가/검색).

### 5.5 앱 공지 (`appNotices`)
- 테이블: 제목, 카테고리(update/service/event/policy), 우선순위(urgent/normal/info), 발행/수정 시각, 액션 URL.
- 필터: 카테고리, 우선순위, 기간, 키워드.
- 작성/수정 폼:
  - 리치 텍스트(마크다운) 에디터, 이미지 URL, CTA 버튼 정보.
  - 미리보기 모달(모바일 UI 시뮬레이션).
  - 클론(복제) 기능.

### 5.6 앱 버전 (`appVersion`)
- 플랫폼 탭(iOS/Android) 분리.
- 입력: 최소 버전, 강제 업데이트 여부, 안내 메시지, 모달 아이콘/타이틀/버튼.
- 현재값 vs 제출 예정 미리보기.
- 변경 내역 로그(업데이트 시 `appVersionHistory` 같은 히스토리 컬렉션 저장 권장).

### 5.7 문의 (`inquiries`)
- 리스트: ID, 유형(feature/bug/account/service/other), 제목, 사용자, 상태(pending/in_progress/resolved), 생성/업데이트 일시.
- 상세: 본문, 사용자 프로필 요약(학과/학번/이메일), 상태 변경 드롭다운, 내부 메모 필드.
- 일괄 처리: 여러 문의 선택 후 상태 변경.

### 5.8 신고 (`reports`)
- 리스트: ID, 대상 타입(post/comment/chat_message/profile), 대상 ID, 신고자, 대상 작성자, 카테고리, 상태, 생성일.
- 상세: 신고 사유, 첨부 스크린샷 미리보기, 관련 원본 데이터(게시글/댓글/메시지) 링크/미리보기.
- 조치 버튼: 콘텐츠 숨김/삭제, 사용자 제재, 신고 거절. 처리 결과 저장(상태 update + 감사 로그).
- 유사 신고 묶음 표시(같은 대상 ID 기준).

### 5.9 학교 공지 (`notices`)
- 리스트: 제목, 카테고리, 게시일, 좋아요 수, 댓글 수, 출처, 부서.
- 필터: 카테고리, 기간, 특정 부서.
- 상세: HTML 본문, 첨부 파일 다운로드, `readBy`/`likes` 통계.
- 읽음/좋아요 관리: 특정 사용자 기준으로 읽음 상태 검색, `notices/{noticeId}/readBy`/`likes` 조작.
- 댓글: 별도 탭으로 `noticeId` 기반 댓글 트리 관리, 익명 순번 표시, 삭제/블라인드.

### 5.10 커뮤니티 게시판 (`boardPosts`, `boardComments`)
- 게시글 리스트: 제목, 카테고리(general/question/review/announcement), 작성자(익명 여부), 조회/좋아요/댓글/북마크 수, 고정 여부, 작성/수정일, 삭제 여부.
- 필터: 카테고리, 익명 여부, 고정, 삭제, 기간.
- 상세: 본문, 이미지 썸네일, 댓글/대댓글 트리 (`anonymousOrder` 기반 익명 식별 표시).
- 상호작용 데이터: `userBoardInteractions` 조회(좋아요/북마크 상태).
- 액션: 게시글 고정, 공지 전환, 삭제, 숨김, 댓글 삭제/신고 처리.
- 통계: 로그/그래프(선택 사항).

### 5.11 전역 검색 & Raw 문서
- 상단 글로벌 검색창: UID/문서 ID 입력 시 해당 상세 페이지로 이동.
- Raw Firestore Document 모달: JSON 뷰/편집(전문가 모드) 제공. 수정 시 주의사항 안내.

## 6. 보안 및 운영 고려사항
- Firestore 보안 규칙: 관리자 웹 전용 서비스 계정 또는 커스텀 클레임 기반 권한 체크.
- 다중 역할 대비: `isSuperAdmin`, `isModerator` 등 확장 가능성 염두에 두고 메뉴 접근 제어.
- 감사 로그: 모든 수정/삭제/생성 작업은 `adminAuditLogs`에 기록 (actor, action, target, diff, timestamp).
- 개인정보 보호: 민감 정보(계좌번호 등)는 부분 마스킹. 접근 로그 남기기.
- 백업/버전: 중요 컬렉션 업데이트 전 백업. 변경 이력 관리.
- 성능: 대용량 컬렉션은 서버 사이드 페이징 + React Query 캐싱. 실시간 구독은 필요한 화면에만 제한.
- 인덱스: 관리자 전용 복합 색인 생성 필요. `firestore.indexes.json` 업데이트.
- 배포 환경: Staging/Production 분리, 서비스 계정 권한 최소화.

## 7. 개발 진행 가이드
1. **프로젝트 구조 생성**
   - `apps/admin` 또는 별도 레포 구성.
   - 환경 변수 템플릿(.env.example) 제공.
2. **Firebase 설정**
   - Firebase Web config + Admin SDK service account 분리.
   - Emulator 세팅 문서화.
3. **공통 모듈**
   - AuthContext, AdminGuard, Firestore hooks(React Query 기반) 구축.
   - Audit 로그 유틸, 권한 체크 HOC.
4. **화면별 구현 순서**
   - 로그인 → 레이아웃 → Dashboard → 사용자 → 파티/채팅 → 채팅방 → 공지/버전 → 문의 → 신고 → 학교 공지 → 게시판.
5. **테스트 & QA**
   - Storybook 컴포넌트, Jest/RTL 기본 테스트.
   - Firebase Emulator로 CRUD 플로우 검증.
   - 접근권한/감사 로그 시나리오 점검.
6. **배포 및 문서화**
   - Vercel/Netlify 파이프라인.
   - 운영 매뉴얼 & Trouble shooting 가이드라인 작성.

## 8. 추가 체크 포인트
- **데이터 정합성**: 서브컬렉션 대량 조회 시 Cloud Function 기반 집계 고려.
- **대용량 Export**: Cloud Functions로 CSV 생성 후 Cloud Storage Signed URL 제공.
- **알림/자동화**: 특정 조건(신고 10건↑ 등) 발생 시 Slack/Webhook 알림.
- **협업 안내**: 다른 AI/개발자가 작업할 수 있도록 README에 컬렉션 요약·권한·데이터 흐름 정리.

---

이 문서는 Cursor AI 또는 다른 개발자가 SKTaxi 관리자 웹페이지를 구현할 때 참조할 스토리보드이자 요구 정리 문서입니다. 최신 요구 변경 사항이 있을 경우 `lastUpdated` 값을 갱신하고 내용에 반영해주세요.

