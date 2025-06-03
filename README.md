# SKTaxi

SKTaxi는 React Native로 개발된 택시 호출 및 관리 애플리케이션입니다.

## 기술 스택

- React Native
- TypeScript
- React Navigation
- Firebase
- React Native Gesture Handler
- React Native Safe Area Context

## 시작하기

### 필수 요구사항

- Node.js (v14 이상)
- npm 또는 yarn
- iOS 개발을 위한 Xcode (macOS)
- Android 개발을 위한 Android Studio
- Ruby (iOS CocoaPods 설치용)

### 설치 방법

1. 저장소 클론
```sh
git clone https://github.com/jisung-louis/SKTaxi.git
cd SKTaxi
```

2. 의존성 설치
```sh
# npm 사용
npm install

# 또는 yarn 사용
yarn install
```

3. iOS 의존성 설치 (iOS 개발 시)
```sh
cd ios
bundle install
bundle exec pod install
cd ..
```

### 개발 서버 실행

```sh
# Metro 서버 시작
npm start
# 또는
yarn start
```

### 앱 실행

#### Android
```sh
npm run android
# 또는
yarn android
```

#### iOS
```sh
npm run ios
# 또는
yarn ios
```

## 프로젝트 구조

```
src/
  ├── components/     # 재사용 가능한 컴포넌트
  ├── contexts/       # React Context 관련 파일
  ├── navigations/    # 네비게이션 설정
  ├── screens/        # 화면 컴포넌트
  ├── services/       # API 및 외부 서비스 연동
  ├── utils/          # 유틸리티 함수
  └── config/         # 설정 파일
```

## 주요 기능

- 사용자 인증 (로그인/회원가입)
- 택시 호출
- 실시간 위치 추적
- 결제 시스템
- 운행 이력 관리

## 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 새로운 브랜치 생성 (`feature/기능명` 또는 `fix/버그명`)
3. 변경사항 커밋
4. Pull Request 생성

## 라이선스

이 프로젝트는 [라이선스명] 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.
