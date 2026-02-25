# SKURI Taxi

> 성결대학교 학생을 위한 **택시 동승 · 학교 공지 · 커뮤니티 · 채팅** 올인원 캠퍼스 앱

![React Native](https://img.shields.io/badge/React_Native-0.79.2-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Backend-FFCA28?logo=firebase&logoColor=black)
![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android-lightgrey)
![Version](https://img.shields.io/badge/version-1.2.7-blue)

<p>
  <a href="https://apps.apple.com/kr/app/스쿠리-skuri/id6754636203">
    <img src="https://img.shields.io/badge/App_Store-Download-0D96F6?logo=app-store&logoColor=white" alt="App Store" />
  </a>
  <a href="https://play.google.com/store/apps/details?id=com.jisung.sktaxi">
    <img src="https://img.shields.io/badge/Google_Play-Download-414141?logo=google-play&logoColor=white" alt="Google Play" />
  </a>
</p>

---

## 프로젝트 소개

### 배경 및 목적

대학교 특성상 같은 방향으로 이동하는 학생이 많지만 택시를 혼자 타는 경우가 많습니다. **SKURI Taxi**는 동승자를 빠르게 모집하고 채팅과 정산까지 앱 안에서 해결할 수 있게 합니다. 여기에 학교 공지, 커뮤니티 게시판, 시간표·학식 등의 생활 정보를 통합하여 성결대 학생의 캠퍼스 생활 플랫폼 역할을 합니다.

> 앱 이름 "SKURI"는 **S**ung**K**yul **URI**(University)의 약자입니다.

### 대상 사용자

`@sungkyul.ac.kr` 이메일 계정을 보유한 성결대학교 재학생 (가입 시 학교 도메인 검증)

### 주요 기능

| # | 기능 | 설명 |
|---|------|------|
| 1 | **택시 동승** | 파티 생성/참여, 실시간 채팅, 정산 |
| 2 | **학교 공지** | 크롤링된 학교 공지 열람, 학과별 필터, 댓글 |
| 3 | **커뮤니티 게시판** | 익명/실명 게시글, 좋아요·북마크·댓글, 이미지 |
| 4 | **채팅** | 학교/학과/게임 공개 채팅방, 마인크래프트 서버 연동 |
| 5 | **학교 생활 정보** | 시간표, 학식 메뉴, 학사 일정 |

---

## 기술 스택

### 프론트엔드

| 항목 | 내용 |
|------|------|
| React Native | 0.79.2 |
| React | 19.0.0 |
| TypeScript | 5.0.4 |
| 네비게이션 | React Navigation 7 (Bottom Tabs + Native Stack) |
| 지도 | react-native-maps v1.26 (iOS: MapKit, Android: Google Maps) |
| 애니메이션 | Reanimated 3, Gesture Handler |
| Bottom Sheet | @gorhom/bottom-sheet v5 |
| UI | react-native-vector-icons, react-native-modal, react-native-svg |
| 이미지 | react-native-image-picker, @bam.tech/react-native-image-resizer |

### 백엔드 (Firebase)

| Firebase 제품 | 용도 |
|---------------|------|
| **Firebase Auth** | Google OAuth + 이메일/비밀번호(관리자), `@sungkyul.ac.kr` 도메인 제한 |
| **Firestore** | 실시간 데이터베이스 — 파티, 게시판, 채팅, 공지 등 모든 데이터 |
| **Cloud Functions** | 서버 트리거(17개), FCM 알림, 데이터 일관성 |
| **Messaging (FCM)** | 푸시 알림 (멀티 디바이스, 카테고리별 제어) |
| **Storage** | 게시판 이미지 파일 저장 |
| **Analytics** | 사용자 행동 분석 |
| **Crashlytics** | 런타임 오류 수집 |
| **Realtime Database** | 마인크래프트 채팅 양방향 연동 |

---

## 아키텍처

### 네비게이션 구조

```
RootNavigator (Auth 상태 라우팅)
├── AuthNavigator (미로그인)
│   ├── LoginScreen
│   └── AccountGuideScreen
├── CompleteProfileScreen (프로필 미완성 시)
├── PermissionOnboardingScreen (권한 온보딩)
└── MainNavigator (로그인 완료)
    └── Bottom Tab Navigator
        ├── HomeTab ── Home / Notification / Profile / Setting / TimetableDetail / ...
        ├── TaxiTab ── Taxi / Recruit / AcceptancePending / MapSearch / Chat
        ├── NoticeTab ── Notice / NoticeDetail / NoticeDetailWebView
        ├── BoardTab ── Board / BoardDetail / BoardWrite / BoardEdit
        └── ChatTab ── ChatList / ChatDetail
```

> 탭 바는 각 탭의 최상위 화면에서만 표시되고, 하위 Stack 화면에서는 자동으로 숨겨집니다.

### 상태 관리 전략

| 레이어 | 도구 | 용도 |
|--------|------|------|
| 서버 상태 | Firestore 실시간 구독 훅 (`useParties`, `useChatMessages` 등) | 파티, 채팅, 게시글 등 모든 서버 데이터 |
| 전역 상태 | React Context (`AuthContext`, `JoinRequestContext`, `CourseSearchContext`) | 로그인 사용자, 동승 요청, 강의 검색 상태 |
| 로컬 UI 상태 | `useState` / `useReducer` | 폼 입력, 모달 표시 등 화면 내 상태 |

> **Firestore가 단일 진실 공급원(Single Source of Truth)입니다.** Cloud Functions는 트리거 방식으로 부가 처리(FCM 발송, 데이터 정리)를 담당합니다.

### 프로젝트 구조

```
src/
├── screens/          화면 컴포넌트 (HomeTab, TaxiTab, NoticeTab, BoardTab, ChatTab, auth)
├── components/       재사용 UI (common, home, board, academic, cafeteria, htmlRender, timetable)
├── hooks/            Firestore 구독 훅 (~60개, auth/board/chat/party/notice/setting/timetable/user/storage/common)
├── contexts/         전역 상태 (AuthContext, JoinRequestContext, CourseSearchContext)
├── lib/              외부 연동 (analytics, fcm, minecraft, notifications, moderation, sound, versionCheck)
├── utils/            날짜/채팅/정산/문자열 유틸리티
├── config/           Firebase / Google Sign-In 설정
├── constants/        디자인 토큰 (COLORS, TYPOGRAPHY)
├── navigations/      Main/Stack navigators 및 타입
└── types/            TypeScript 타입 정의

functions/            Firebase Cloud Functions (Node 22, TypeScript)
scripts/              Firestore/Storage 데이터 관리용 Node CLI
docs/                 명세서, 가이드, 법적 문서
android/ | ios/       플랫폼별 네이티브 프로젝트
```

---

## 백엔드 구조

### Cloud Functions (17개)

> 기본 리전: `asia-northeast3` (서울)

#### 스케줄러

| 함수 | 스케줄 | 내용 |
|------|--------|------|
| `cleanupOldParties` | 4시간마다 | 12시간 초과 파티 자동 종료 |
| `scheduledRSSFetch` | 평일 8~20시, 10분마다 | 학교 공지 RSS 자동 크롤링 |

#### 택시 파티

| 함수 | 트리거 | 내용 |
|------|--------|------|
| `onPartyCreate` | parties 생성 | 전체 유저에게 새 파티 알림 |
| `onJoinRequestCreate` | joinRequests 생성 | 리더에게 동승 요청 알림 |
| `onJoinRequestUpdate` | joinRequests 업데이트 | 요청자에게 승인/거절 알림 |
| `onPartyStatusUpdate` | parties 업데이트 | 모집마감/도착 시 멤버 알림 |
| `onSettlementComplete` | parties 업데이트 | 정산 완료 시 전원 알림 |
| `onPartyMemberKicked` | parties 업데이트 | 멤버 강퇴 알림 |
| `onPartyEnded` | parties 업데이트 | 파티 해체 시 멤버 알림 |

#### 채팅

| 함수 | 트리거 | 내용 |
|------|--------|------|
| `onChatMessageCreated` | 파티 채팅 메시지 생성 | mute/알림 설정 체크 후 FCM 발송 |
| `onChatRoomMessageCreated` | 공개 채팅 메시지 생성 | 채팅방별 알림 설정 체크 후 FCM 발송 |
| `syncMinecraftChatMessage` | RTDB 메시지 생성 | 마인크래프트 → Firestore 채팅 동기화 |

#### 게시판 · 공지

| 함수 | 트리거 | 내용 |
|------|--------|------|
| `onNoticeCreated` | notices 생성 | 카테고리별 공지 알림 |
| `onAppNoticeCreated` | appNotices 생성 | 앱 운영 공지 알림 |
| `onBoardCommentCreated` | boardComments 생성 | 댓글/답글 알림 |
| `onNoticeCommentCreated` | noticeComments 생성 | 공지 댓글 알림 |
| `onBoardLikeCreated` | userBoardInteractions 생성 | 좋아요 알림 |

### FCM 전략

- **토큰 관리**: `users/{uid}.fcmTokens[]` 배열로 멀티 디바이스 지원, 전송 실패 토큰 인라인 제거
- **전송 방식**: `sendEachForMulticast` (500개 배치)
- **알림 제어**: 전체 마스터 토글 + 카테고리별 세부 설정 + 채팅방별 mute
- **인박스 연동**: 대부분의 알림은 FCM 발송과 동시에 `userNotifications` 컬렉션에 인박스 문서 생성

---

## 주요 기능 상세

### 택시 동승

파티 생성 → 동승 요청 → 채팅 → 정산까지 완결된 플로우:

- **파티 목록**: 지도 + Bottom Sheet로 모집 중 파티 탐색, 카드 선택 시 지도 포커스 이동
- **파티 생성**: 출발지/도착지(지도 검색), 시간, 최대 인원(2~7명), 태그, 상세 내용
- **동승 요청**: 요청 → 리더 수락/거절 → 수락 시 채팅방 자동 입장, 정원 도달 시 자동 마감
- **파티 채팅**: 멤버 전용 채팅, 계좌 공유, 도착/정산 메시지 타입 지원
- **정산**: 도착 시 택시비 입력 → 인원수 자동 분배 → 계좌 정보와 함께 표시

### 학교 공지

- RSS 자동 크롤링(Cloud Functions) + 수동 동기화(운영 스크립트)로 학교 공지 수집
- 카테고리(학사/장학/취업 등)·학과별 필터, HTML 렌더링/WebView 상세 보기
- 댓글/대댓글, 읽음 상태 표시, 앱 운영 공지 카드

### 커뮤니티 게시판

- 익명/실명 게시글, 이미지 최대 10장 첨부(리사이징 후 Storage 업로드)
- 좋아요·북마크·신고, 댓글/대댓글(2단계), 조회수 자동 증가
- 익명 게시글 내 동일 작성자 시각적 일관성 유지

### 채팅

- 학교/학과/게임/커스텀 4가지 타입의 공개 채팅방
- Firestore 실시간 구독, 채팅방별 mute, 미읽음 배지 계산
- **마인크래프트 양방향 채팅 연동**: Realtime Database를 통해 게임 ↔ 앱 메시지 동기화

### 홈 대시보드

6개 섹션으로 앱 전체 핵심 정보를 한눈에 제공:

| 섹션 | 내용 |
|------|------|
| TaxiSection | 모집 중 파티 가로 스크롤 |
| NoticeSection | 전체/학과 공지 |
| TimetableSection | 오늘의 강의 목록 |
| AcademicCalendarSection | 이번 주 학사 일정 |
| MinecraftSection | 서버 상태 및 접속자 |
| CafeteriaSection | 오늘의 학식 메뉴 |

---

## 개발 환경 & 실행

### 사전 요건

- Node.js 18+ / Yarn 1.x
- Java JDK 21, Android SDK 35, Android Studio
- Xcode 15+, CocoaPods, Ruby(Bundler)
- Watchman (macOS 권장)
- Firebase CLI (`npm install -g firebase-tools`)

### 설치 & 실행

```bash
git clone https://github.com/jisung-louis/SKTaxi.git
cd SKTaxi
yarn install

# iOS 전용
cd ios && bundle install && bundle exec pod install && cd ..
```

```bash
yarn start              # Metro Bundler
yarn android            # Android 빌드 & 실행
yarn ios                # iOS Simulator 빌드 & 실행
```

### Firebase 설정

| 파일 | 용도 |
|------|------|
| `android/app/google-services.json` | Android Firebase 설정 |
| `ios/SKTaxi/GoogleService-Info.plist` | iOS Firebase 설정 |
| `src/config/firebase.ts` | 허용 이메일 도메인, getApp 인스턴스 |
| `src/config/google.ts` | Google Sign-In `webClientId` |
| `firestore.rules` | Firestore 보안 규칙 |

### 품질 관리

```bash
yarn lint               # ESLint (PR 전 필수)
yarn test               # Jest 테스트
```

---

## 배포 & 운영

### Android
- `docs/android-build-guide.md`에 빌드/배포 체크리스트 정리
- `./gradlew assembleRelease` + Crashlytics 심볼 업로드
- 서명 정보는 `gradle.properties`에 설정

### iOS
- 현재 Xcode Organizer → TestFlight 업로드 방식
- 실기기 빌드 시 `SKTaxi.xcworkspace`에서 Signing Team 지정

### Cloud Functions
```bash
cd functions && npm install && npm run build
firebase deploy --only functions
```

---

## 운영 스크립트

| 스크립트 | 목적 |
|----------|------|
| `scripts/manage-app-version.js` | iOS/Android 최소 버전·강제 업데이트 설정 |
| `scripts/manage-app-notices.js` | 앱 운영 공지 CRUD |
| `scripts/upload-notices.js` | 학교 공지 크롤링 결과 Firestore 반영 |
| `scripts/crawl.js` | 학교 공지 크롤링 |
| `scripts/manage-chat-rooms.js` | 채팅방 관리 |
| `scripts/add-cafeteria-menu.js` | 학식 메뉴 등록 |
| `scripts/add-courses-2026-1.js` | 2026-1학기 강의 데이터 등록 |
| `scripts/add-real-academic-schedules.js` | 학사 일정 등록 |
| `scripts/generate-licenses.js` | 오픈소스 라이선스 목록 생성 |

> 스크립트 사용 전 Firebase Admin 권한이 있는 서비스 계정 키 또는 CLI 인증이 완료되어야 합니다.

---

## 문서 목록

| 문서 | 설명 |
|------|------|
| `docs/project-overview.md` | 프로젝트 종합 문서 (아키텍처, 화면 구조, 기술 스택) |
| `docs/firestore-data-structure.md` | Firestore 스키마 (단일 진실 공급원) |
| `docs/SKTaxi-backend-spec.md` | 모바일-백엔드 연동 계약, API 권장안 |
| `docs/android-build-guide.md` | Android 빌드/배포 체크리스트 |
| `docs/android-testing-checklist.md` | Android 테스트 체크리스트 |
| `docs/SOLID-Analysis-Report.md` | SOLID 원칙 분석 보고서 |
| `docs/spring-migration/` | Spring Boot 마이그레이션 설계 문서 |
| `docs/개인정보처리방침.md` / `docs/이용약관.md` | 법적 문서 |
| `docs/OpenSource-Licenses-Guide.md` | 오픈소스 라이선스 가이드 |

---

## 향후 계획

`docs/spring-migration/` 폴더에 **Spring Boot 백엔드 마이그레이션** 설계 문서가 작성되어 있습니다. Firebase 서버리스 구조에서 Spring Boot + PostgreSQL REST API 구조로의 전환을 검토 중입니다.

| 문서 | 내용 |
|------|------|
| `domain-analysis.md` | 도메인 분석 |
| `erd.md` | ERD 설계 |
| `api-specification.md` | API 명세 |
| `tech-strategy.md` | 기술 전략 |
| `role-definition.md` | 역할 정의 |
