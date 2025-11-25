# SKURI

> 성결대학교 구성원을 위한 **택시 동승 모집 · 학사 정보 · 커뮤니티** 올인원 모바일 앱

React Native 0.79 · React 19 · TypeScript 5 · Firebase (Auth / Firestore / Functions / Messaging / Storage)

---

## 목차
- [앱 하이라이트](#앱-하이라이트)
- [기술 스택 & 인프라](#기술-스택--인프라)
- [아키텍처 개요](#아키텍처-개요)
- [프로젝트 구조](#프로젝트-구조)
- [개발 환경 준비](#개발-환경-준비)
- [환경 구성](#환경-구성)
- [실행 방법](#실행-방법)
- [품질 관리](#품질-관리)
- [배포 & 운영](#배포--운영)
- [Firestore & 백엔드 계약](#firestore--백엔드-계약)
- [운영 스크립트](#운영-스크립트)
- [추가 문서](#추가-문서)

---

## 앱 하이라이트
### 🚕 택시 동승 & 정산
- `TaxiScreen`과 Bottom Sheet로 **실시간 파티 목록**, 지도 기반 탐색, 상태 필터 제공
- `RecruitScreen`에서 출발/도착, 시간, 키워드, 태그, 최대 인원을 입력해 파티 생성
- `joinRequests` 컬렉션과 `AcceptancePendingScreen`으로 **동승 요청 → 수락** 플로우 관리
- `TaxiTab/ChatScreen` + `chats/{partyId}`로 파티 전용 채팅 및 도착/정산 알림 메시지 표시
- Cloud Functions(FCM)로 파티장에게 요청/정산 Push, 정원 도달 시 자동 `status=closed`

### 📰 공지 · 게시판 · 채팅
- `NoticeTab` 에서 학교 공지 크롤링 데이터(`notices`)를 카테고리별로 열람 및 읽음 처리
- `BoardTab` 은 익명/실명 커뮤니티, 좋아요/북마크/댓글, 게시글 CRUD를 지원
- `ChatTab` 은 공개 채팅방(`chatRooms`) + 커스텀 채널을 구독하고, 전체 unread badge를 계산

### 🏫 학생 생활 서비스
- `HomeScreen` 에 학사 일정(`academicSchedules`), 학식(`cafeteriaMenus`), 시간표(`userTimetables`) 카드 노출
- Minecraft 서버 화이트리스트 등록/삭제, 앱 운영 공지(`appNotices`), 사용자 알림 Inbox 등을 통합
- `PermissionOnboardingScreen` 으로 위치/알림 권한을 안내하고, `PermissionBubble` 로 미허용 상태를 상시 알림

### 👤 프로필 & 설정
- `ProfileScreen` + `SettingScreen` 에서 계정 수정, 문의 접수(`inquiries`), 알림 토글, 개인정보/이용약관 열람
- `useAuth`, `JoinRequestContext`, `useNotifications` 등 커스텀 훅으로 사용자 상태와 Badge 숫자를 싱크

---

## 기술 스택 & 인프라

| 구분 | 내용 |
| --- | --- |
| 클라이언트 | React Native 0.79.2, React 19, TypeScript 5.0.4 |
| 상태/네비게이션 | React Navigation 7 (Bottom Tabs + Native Stack), React Context + custom hooks |
| UI | Reanimated 3, react-native-vector-icons, Gesture Handler, custom design system (`COLORS`, `TYPOGRAPHY`) |
| 백엔드 | Firebase Auth · Firestore · Storage · Functions(Node 22) · Messaging(FCM) |
| 데이터 수집 | Firebase Functions + `scripts/` 내 Node CLI (공지 크롤링, 학식/학사 데이터, 앱 공지) |
| 품질 | ESLint(@react-native config), Jest + React Test Renderer, patch-package |

---

## 아키텍처 개요
- **탭 기반 라우팅**: `MainNavigator` → (홈/택시/공지/게시판/채팅) 각 스택, 화면별 탭바 자동 숨김.
- **데이터 계층**: `src/hooks` 가 Firestore 구독 & 캐시, `src/lib` 는 analytics/minecraft 등 외부 연동.
- **Context**: `contexts/JoinRequestContext` 로 파티 배지, `contexts/AuthContext` 로 사용자 세션 공유.
- **Cloud Functions**: `functions/src/index.ts` 에 join-request 트리거, 알림 브로드캐스트, 데이터 정합성 처리.
- **Docs-first**: Firestore 스키마는 `docs/firestore-data-structure.md`를 단일 진실 원천으로 관리.
- **Scripts**: `scripts/*.js` 는 Firestore/Storage 데이터를 일괄 업데이트(공지, 버전, 학식 등)하여 운영 자동화.

---

## 프로젝트 구조
```
src/
  components/         재사용 UI, Section, Surface, Badge 등
  config/             Firebase/Google Sign-In 설정
  constants/          디자인 토큰, 상수
  contexts/           Auth, JoinRequest 등 글로벌 상태
  hooks/              Firestore 구독 훅(useParties, useNotices, useChatRooms...)
  lib/                analytics, minecraft, permission helper
  navigations/        Main/Stack navigators 및 타입
  screens/            탭별 화면 (HomeTab, TaxiTab, BoardTab, Auth 등)
  utils/              날짜/채팅/정산/문자열 유틸리티
functions/            Firebase Cloud Functions (TS → lib/)
docs/                 운영/법무/출시 문서, 데이터 스펙
scripts/              Firestore/Storage 데이터 관리용 Node CLI
android | ios/        플랫폼별 네이티브 프로젝트
```

---

## 개발 환경 준비
1. **필수 버전**
   - Node.js ≥ 18 (프로젝트 `engines.node` 권장)
   - npm 10+ 또는 Yarn 1.x
   - Java JDK 21, Android SDK 35, Android Studio / adb
   - Xcode 15+, CocoaPods, Ruby(Bundler) for iOS
   - Watchman (macOS 개발 시 권장)
2. **의존성 설치**
   ```sh
   git clone https://github.com/jisung-louis/SKTaxi.git
   cd SKTaxi
   yarn install        # 또는 npm install

   # iOS 전용
   cd ios && bundle install && bundle exec pod install && cd ..
   ```
3. **도구 확인**
   - `adb devices`, `xcode-select -p`, `pod --version`, `watchman --version`
   - Android SDK 경로는 `android/local.properties` 또는 `$ANDROID_HOME`으로 지정

세부 Android 세팅은 `docs/android-build-guide.md`에 체크리스트 형태로 정리되어 있습니다.

---

## 환경 구성
- **Firebase 설정**
  - `android/app/google-services.json`, `ios/SKTaxi/GoogleService-Info.plist`를 Firebase Console에서 내려받아 각 경로에 배치
  - `src/config/firebase.ts`에서 허용 이메일 도메인(`ALLOWED_EMAIL_DOMAINS`) 및 getApp 인스턴스를 관리
- **Google Sign-In**
  - `src/config/google.ts`의 `webClientId`는 Firebase OAuth 클라이언트와 일치해야 합니다.
- **Functions**
  - `firebase login` & `firebase use <project>` 후 `functions/.env`(필요 시) 또는 `.runtimeconfig.json`을 구성
  - Cloud Functions는 Node 22 런타임을 사용하므로 `nvm use 22` 후 작업하는 것을 권장
- **비밀정보 관리**
  - Git에 포함되지 않는 키/토큰은 macOS Keychain 또는 `.env.local`(gitignore)에 분리 저장하고, README 대신 `docs/` 내 내부 문서로 공유합니다.

---

## 실행 방법
```sh
# Metro 번들러
yarn start   # 또는 npm start
```

- **Android**
  ```sh
  yarn android    # USB 디바이스 또는 활성 에뮬레이터 필요
  ```
  - 문제가 생기면 `cd android && ./gradlew clean` 후 재시도

- **iOS**
  ```sh
  yarn ios        # iOS Simulator
  ```
  - 실기기는 `SKTaxi.xcworkspace`를 Xcode에서 열고 Signing Team을 지정한 뒤 빌드

앱 실행 전 위치/알림 권한은 `PermissionOnboardingScreen`에서 한 번에 안내하므로 새로운 계정 테스트 시 해당 화면부터 진행하세요.

---

## 품질 관리
- **Lint**: `yarn lint`
  - PR 전 필수. React Native ESLint preset이 적용되어 있으며, 경고를 방치하지 않습니다.
- **테스트**: `yarn test`
  - `__tests__/App.test.tsx`를 시작으로, UI/로직 테스트를 확장 예정입니다.
- **Formatting**: Prettier 2.8 규칙 준수. IDE Format on Save 권장.
- **Patch Management**: 네이티브 패치가 필요한 라이브러리는 `patches/` 디렉터리에 `patch-package`로 관리합니다.

---

## 배포 & 운영
- **Android**
  - Debug/Release 빌드 플로우 및 키스토어 절차는 `docs/android-build-guide.md` 참고
  - `./gradlew assembleRelease` 실행 전 `gradle.properties`에 서명 정보를 설정
- **iOS**
  - `ios/` 디렉터리에서 `bundle exec fastlane beta`와 같은 워크플로를 구성할 예정이며, 현재는 Xcode Organizer를 통해 TestFlight 업로드
- **Cloud Functions**
  ```sh
  cd functions
  npm install
  npm run build
  firebase deploy --only functions
  ```
  - 에뮬레이터: `npm run serve`
- **앱 버전 강제 업데이트**
  - `scripts/manage-app-version.js` 또는 `scripts/manage-app-notices.js`로 `appVersion`, `appNotices` 컬렉션을 갱신

---

## Firestore & 백엔드 계약
- Firestore 컬렉션 구조, 권한 룰, 트리거 요약은 **`docs/firestore-data-structure.md`**에 최신화되어 있습니다.
- 새로운 필드/컬렉션을 추가할 경우 반드시 해당 문서를 먼저 업데이트한 뒤 코드와 Functions를 수정하세요.
- 백엔드 REST 사양 및 파티/동승 플로우는 `docs/SKTaxi-backend-spec.md`에서 시퀀스 다이어그램과 함께 확인할 수 있습니다.

---

## 운영 스크립트
| 스크립트 | 목적 | 예시 명령 |
| --- | --- | --- |
| `scripts/upload-notices.js` | 학교 공지/크롤링 결과를 Firestore `notices`에 반영 | `node scripts/upload-notices.js --source=school` |
| `scripts/manage-app-notices.js` | 앱 내 운영 공지(`appNotices`) CRUD | `node scripts/manage-app-notices.js add ./scripts/notice-example.json` |
| `scripts/manage-app-version.js` | iOS/Android 최소 버전·강제 업데이트 설정 | `node scripts/manage-app-version.js --platform=ios --min=1.1.0` |
| `scripts/add-dummy-*` | 개발/테스트용 더미 데이터 (과목, 공지, 학식 등) 삽입 | 필요 시 파라미터 참고 |

스크립트 사용 전 Firebase Admin 권한이 있는 서비스 계정 키 또는 CLI 인증이 완료되어야 합니다.

---

## 추가 문서
- `docs/android-build-guide.md` – Android 빌드/배포, 문제 해결
- `docs/SKTaxi-backend-spec.md` – 모바일-백엔드 연동 계약, API 권장안
- `docs/firestore-data-structure.md` – Firestore 스키마(2025-11-24 업데이트)
- `docs/manage-app-notices-guide.md`, `docs/README-app-version.md` – 운영 데이터 관리
- `docs/개인정보처리방침.md`, `docs/이용약관.md`, `docs/법적-리스크-분석-보고서.md` – 법적 문서

필요한 추가 문서는 `docs/` 디렉터리에서 검색(예: `rg "notice" docs/`)하여 바로 확인할 수 있습니다.

---

기여 시 `feature/<기능>` 또는 `fix/<이슈>` 브랜치를 생성하고, lint/test를 모두 통과한 뒤 PR을 열어주세요. 질문이나 제안은 Issue에 기록하거나, 앱 내 문의(`Setting > 문의하기`) 플로우를 활용하면 운영팀 알림과 연동됩니다.
