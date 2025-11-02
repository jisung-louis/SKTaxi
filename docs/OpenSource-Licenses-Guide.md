# 오픈소스 라이선스 관리 가이드

## 개요

이 프로젝트는 여러 오픈소스 라이브러리를 사용하고 있으며, 각 라이브러리의 라이선스는 iOS 설정 앱을 통해 사용자에게 표시됩니다.

## 사용 중인 주요 오픈소스 라이브러리

### 프레임워크 및 코어 라이브러리

| 라이브러리 | 버전 | 라이선스 | 용도 |
|-----------|------|---------|------|
| React | 19.0.0 | MIT | UI 프레임워크 |
| React Native | 0.79.2 | MIT | 모바일 프레임워크 |
| TypeScript | 5.0.4 | Apache-2.0 | 타입 체크 |

### 네비게이션

| 라이브러리 | 버전 | 라이선스 | 용도 |
|-----------|------|---------|------|
| @react-navigation/native | 7.1.9 | MIT | 네비게이션 코어 |
| @react-navigation/bottom-tabs | 7.3.13 | MIT | 하단 탭 네비게이션 |
| @react-navigation/native-stack | 7.3.13 | MIT | 스택 네비게이션 |

### Firebase 관련

| 라이브러리 | 버전 | 라이선스 | 용도 |
|-----------|------|---------|------|
| @react-native-firebase/app | 22.4.0 | Apache-2.0 | Firebase 코어 |
| @react-native-firebase/auth | 22.4.0 | Apache-2.0 | 인증 |
| @react-native-firebase/firestore | 22.4.0 | Apache-2.0 | 데이터베이스 |
| @react-native-firebase/storage | 22.4.0 | Apache-2.0 | 파일 저장소 |
| @react-native-firebase/messaging | 22.4.0 | Apache-2.0 | 푸시 알림 |
| @react-native-firebase/analytics | 22.4.0 | Apache-2.0 | 분석 |
| @react-native-firebase/functions | 22.4.0 | Apache-2.0 | 클라우드 함수 |

### UI 컴포넌트 및 애니메이션

| 라이브러리 | 버전 | 라이선스 | 용도 |
|-----------|------|---------|------|
| @gorhom/bottom-sheet | 5.1.4 | MIT | 하단 시트 |
| react-native-reanimated | 3.17.5 | MIT | 애니메이션 |
| react-native-gesture-handler | 2.25.0 | MIT | 제스처 처리 |
| react-native-vector-icons | 10.2.0 | MIT | 아이콘 |
| react-native-modal | 14.0.0-rc.1 | MIT | 모달 |
| react-native-linear-gradient | 2.8.3 | MIT | 그라데이션 |
| react-native-svg | 15.14.0 | MIT | SVG 렌더링 |

### 지도 및 위치

| 라이브러리 | 버전 | 라이선스 | 용도 |
|-----------|------|---------|------|
| react-native-maps | 1.26.14 | MIT | 지도 표시 |
| react-native-geolocation-service | 5.3.1 | MIT | 위치 정보 |

### 유틸리티

| 라이브러리 | 버전 | 라이선스 | 용도 |
|-----------|------|---------|------|
| axios | 1.12.2 | MIT | HTTP 클라이언트 |
| date-fns | 4.1.0 | MIT | 날짜 처리 |
| cheerio | 1.1.2 | MIT | HTML 파싱 |
| htmlparser2 | 6.1.0 | MIT | HTML 파서 |
| rss-parser | 3.13.0 | MIT | RSS 파서 |

### 이미지 및 미디어

| 라이브러리 | 버전 | 라이선스 | 용도 |
|-----------|------|---------|------|
| react-native-image-picker | 8.2.1 | MIT | 이미지 선택 |
| @bam.tech/react-native-image-resizer | 3.0.11 | MIT | 이미지 리사이징 |
| react-native-draggable-flatlist | 4.0.3 | MIT | 드래그 가능한 리스트 |

### 인증

| 라이브러리 | 버전 | 라이선스 | 용도 |
|-----------|------|---------|------|
| @react-native-google-signin/google-signin | 16.0.0 | MIT | Google 로그인 |

## 라이선스 표시 방법

사용자는 다음 경로를 통해 라이선스 정보를 확인할 수 있습니다:

1. iPhone **설정** 앱 열기
2. **SKURI Taxi** 찾기
3. **라이선스** 메뉴 탭
4. 원하는 라이선스 선택

## 라이선스 파일 관리

### 자동 생성 스크립트

프로젝트에 포함된 자동화 스크립트를 사용하여 라이선스 파일을 생성할 수 있습니다:

```bash
npm run generate-licenses
```

이 스크립트는:
- `node_modules`에서 패키지 정보 읽기
- 각 라이브러리의 라이선스 정보 추출
- Settings.bundle에 plist 파일 생성
- `License.plist` 자동 업데이트

### 수동 관리

필요한 경우 `ios/SKTaxi/Settings.bundle/` 디렉토리에서 직접 파일을 수정할 수 있습니다.

**파일 구조**:
```
ios/SKTaxi/Settings.bundle/
├── Root.plist              # 메인 설정 화면
├── License.plist           # 라이선스 목록
├── AppLicense.plist        # 앱 자체 라이선스
├── ReactLicense.plist      # React 라이선스
├── ReactNativeLicense.plist # React Native 라이선스
└── ... (기타 라이선스 파일들)
```

## 새 라이선스 추가하기

### 방법 1: 스크립트 사용 (권장)

1. `scripts/generate-licenses.js` 파일 열기
2. `MAIN_LICENSES` 객체에 새 항목 추가:
```javascript
'package-name': {
  title: 'Display Name',
  license: 'MIT', // 또는 'Apache-2.0', 'BSD', 'ISC' 등
  file: 'LicenseFileName',
},
```
3. 스크립트 실행:
```bash
npm run generate-licenses
```

### 방법 2: 수동 추가

1. 새 plist 파일 생성: `ios/SKTaxi/Settings.bundle/NewLicense.plist`
2. 라이선스 텍스트 작성
3. `License.plist`에 항목 추가

## 라이선스 유형 설명

### MIT License
- **사용 조건**: 매우 제한적
- **배포 요구사항**: 라이선스와 저작권 표시 필요
- **사용 예시**: React, React Native, 대부분의 npm 패키지

### Apache License 2.0
- **사용 조건**: MIT와 유사하지만 특허 보호 포함
- **배포 요구사항**: 라이선스, 저작권, 변경 사항 명시
- **사용 예시**: Firebase, TypeScript

### BSD License
- **사용 조건**: MIT와 매우 유사
- **배포 요구사항**: 라이선스와 저작권 표시
- **사용 예시**: 일부 시스템 라이브러리

## 법적 고지

이 프로젝트에 포함된 모든 오픈소스 라이브러리는 해당 라이선스의 조건에 따라 사용됩니다. 각 라이선스의 전체 내용은 iOS 설정 앱의 라이선스 섹션에서 확인할 수 있습니다.

라이선스 요구사항을 준수하기 위해:
1. 모든 오픈소스 라이선스가 Settings.bundle에 포함되어야 합니다
2. 라이선스 변경 시 업데이트가 필요합니다
3. 새로운 의존성 추가 시 라이선스 확인이 필요합니다

## 참고 자료

- [npm 패키지 라이선스 확인](https://www.npmjs.com/)
- [SPDX License List](https://spdx.org/licenses/)
- [Open Source Licenses](https://opensource.org/licenses)

