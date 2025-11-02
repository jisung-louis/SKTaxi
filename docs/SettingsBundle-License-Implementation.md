# iOS Settings.bundle 라이선스 구현 가이드

## 개요

이 가이드는 iOS 앱의 Settings.bundle을 사용하여 iOS 설정 앱에서 라이선스 정보를 표시하는 방법을 설명합니다. 사용자는 iPhone의 **설정 앱 > SKURI Taxi**에서 라이선스 정보를 확인할 수 있습니다.

## 구현 완료 사항

### ✅ 1. Settings.bundle 디렉토리 구조 생성

다음 위치에 `Settings.bundle` 디렉토리가 생성되었습니다:
```
ios/SKTaxi/Settings.bundle/
├── Root.plist
├── License.plist
├── AppLicense.plist
├── ReactNativeLicense.plist
└── FirebaseLicense.plist
```

### ✅ 2. Root.plist - 메인 설정 화면

`Root.plist`는 사용자가 설정 앱에서 앱을 열었을 때 보이는 첫 화면을 정의합니다. "라이선스" 메뉴 항목이 추가되었습니다.

**위치**: `ios/SKTaxi/Settings.bundle/Root.plist`

**구조**:
- `PreferenceSpecifiers`: 설정 항목들의 배열
  - `PSChildPaneSpecifier`: 하위 화면으로 이동하는 항목 타입
  - `Title`: 표시될 텍스트 ("라이선스")
  - `File`: 연결할 하위 plist 파일명 ("License")

### ✅ 3. License.plist - 라이선스 목록 화면

`License.plist`는 여러 라이선스를 그룹으로 표시합니다.

**위치**: `ios/SKTaxi/Settings.bundle/License.plist`

**표시되는 라이선스**:
1. **SKURI Taxi** - 앱 자체 라이선스
2. **React** - React 라이브러리 MIT 라이선스
3. **React Native** - React Native 프레임워크 MIT 라이선스
4. **React Navigation** - React Navigation MIT 라이선스
5. **React Native Firebase** - React Native Firebase Apache 라이선스
6. **Axios** - Axios HTTP 클라이언트 MIT 라이선스
7. **React Native Maps** - React Native Maps MIT 라이선스
8. **React Native Vector Icons** - React Native Vector Icons MIT 라이선스
9. **Bottom Sheet** - @gorhom/bottom-sheet MIT 라이선스
10. **React Native Reanimated** - React Native Reanimated MIT 라이선스

### ✅ 4. 개별 라이선스 파일들

각 라이선스는 별도의 plist 파일로 관리됩니다. 자동화 스크립트로 생성된 주요 라이선스 파일들:

- `AppLicense.plist`: 앱 자체 라이선스 정보
- `ReactLicense.plist`: React MIT 라이선스
- `ReactNativeLicense.plist`: React Native MIT 라이선스
- `ReactNavigationLicense.plist`: React Navigation MIT 라이선스
- `ReactNativeFirebaseLicense.plist`: React Native Firebase Apache 라이선스
- `AxiosLicense.plist`: Axios MIT 라이선스
- `ReactNativeMapsLicense.plist`: React Native Maps MIT 라이선스
- `ReactNativeVectorIconsLicense.plist`: React Native Vector Icons MIT 라이선스
- `BottomSheetLicense.plist`: Bottom Sheet MIT 라이선스
- `ReactNativeReanimatedLicense.plist`: React Native Reanimated MIT 라이선스

### ✅ 5. 자동화 스크립트

오픈소스 라이선스를 자동으로 수집하고 Settings.bundle에 추가하는 스크립트가 제공됩니다.

**스크립트 위치**: `scripts/generate-licenses.js`

**사용 방법**:
```bash
npm run generate-licenses
```

또는

```bash
node scripts/generate-licenses.js
```

**스크립트 기능**:
- `package.json`의 의존성에서 라이선스 정보 자동 수집
- 주요 오픈소스 라이브러리의 라이선스 파일 자동 생성
- `License.plist` 자동 업데이트
- 버전 및 홈페이지 정보 포함

각 파일은 `PSGroupSpecifier` 타입을 사용하여:
- `Title`: 라이선스 이름
- `FooterText`: 라이선스 전문 텍스트

### ✅ 5. Xcode 프로젝트 통합

`project.pbxproj` 파일에 Settings.bundle이 추가되었습니다:
- PBXFileReference에 Settings.bundle 참조 추가
- PBXGroup의 SKTaxi 그룹에 Settings.bundle 추가
- PBXResourcesBuildPhase에 Settings.bundle 리소스 추가

## 사용 방법

### 사용자 관점

1. iPhone에서 **설정** 앱을 엽니다
2. 스크롤하여 **SKURI Taxi** 앱을 찾습니다
3. 앱을 탭합니다
4. **라이선스** 메뉴를 탭합니다
5. 원하는 라이선스를 선택하여 내용을 확인합니다

### 개발자 관점

#### 라이선스 추가하기

**방법 1: 자동화 스크립트 사용 (권장)**

1. `scripts/generate-licenses.js` 파일을 열어서 `MAIN_LICENSES` 객체에 새 패키지 추가:
```javascript
const MAIN_LICENSES = {
  // ... 기존 항목들 ...
  'new-package-name': {
    title: 'New Library Name',
    license: 'MIT', // 또는 'Apache-2.0', 'BSD' 등
    file: 'NewLibraryLicense',
  },
};
```

2. 스크립트 실행:
```bash
npm run generate-licenses
```

**방법 2: 수동으로 추가하기**

1. **새 라이선스 plist 파일 생성**

   예: `NewLibraryLicense.plist`
   
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
	<key>StringsTable</key>
	<string>NewLibraryLicense</string>
	<key>PreferenceSpecifiers</key>
	<array>
		<dict>
			<key>Type</key>
			<string>PSGroupSpecifier</string>
			<key>Title</key>
			<string>New Library</string>
			<key>FooterText</key>
			<string>라이선스 전문을 여기에 작성하세요.</string>
		</dict>
	</array>
</dict>
</plist>
```

2. **License.plist에 항목 추가**

`License.plist`의 `PreferenceSpecifiers` 배열에 새 항목을 추가합니다:

```xml
<dict>
	<key>Type</key>
	<string>PSChildPaneSpecifier</string>
	<key>Title</key>
	<string>New Library</string>
	<key>File</key>
	<string>NewLibraryLicense</string>
</dict>
```

#### 라이선스 내용 수정하기

각 라이선스 파일의 `FooterText` 값을 수정하면 됩니다. 긴 텍스트의 경우 여러 줄로 작성할 수 있습니다.

## 파일 구조 상세 설명

### Root.plist 구조

```xml
<dict>
	<key>PreferenceSpecifiers</key>
	<array>
		<dict>
			<key>Type</key>
			<string>PSChildPaneSpecifier</string>  <!-- 하위 화면으로 이동 -->
			<key>Title</key>
			<string>라이선스</string>               <!-- 표시될 이름 -->
			<key>File</key>
			<string>License</string>                <!-- 연결할 plist 파일 (확장자 제외) -->
		</dict>
	</array>
</dict>
```

### 라이선스 plist 구조

```xml
<dict>
	<key>PreferenceSpecifiers</key>
	<array>
		<dict>
			<key>Type</key>
			<string>PSGroupSpecifier</string>        <!-- 그룹 표시 -->
			<key>Title</key>
			<string>라이선스 이름</string>            <!-- 상단에 표시 -->
			<key>FooterText</key>
			<string>라이선스 전문</string>            <!-- 하단에 표시 -->
		</dict>
	</array>
</dict>
```

## 주의사항

1. **파일명 규칙**
   - plist 파일명은 영어와 숫자만 사용
   - 공백 대신 대문자 사용 권장 (예: `NewLibraryLicense.plist`)
   - 확장자 `.plist` 필수

2. **텍스트 인코딩**
   - 모든 plist 파일은 UTF-8 인코딩 사용
   - 한글 텍스트도 정상적으로 표시됨

3. **빌드 및 테스트**
   - Xcode에서 프로젝트를 빌드하면 Settings.bundle이 앱 번들에 자동으로 포함됨
   - 시뮬레이터 또는 실제 기기에서 설정 앱을 통해 확인 가능

4. **플레이스홀더 텍스트**
   - 현재 `AppLicense.plist`의 라이선스 텍스트는 예시입니다
   - 실제 라이선스 정책에 맞게 수정 필요

## 참고 자료

- [Apple Developer: Settings Bundle](https://developer.apple.com/library/archive/documentation/Cocoa/Conceptual/UserDefaults/Preferences/Preferences.html)
- [Preference Settings Keys](https://developer.apple.com/library/archive/documentation/PreferenceSettings/Conceptual/SettingsApplicationSchemaReference/)

## 문제 해결

### 라이선스가 표시되지 않는 경우

1. **Xcode 프로젝트 확인**
   - Settings.bundle이 프로젝트에 추가되어 있는지 확인
   - Target Membership이 활성화되어 있는지 확인

2. **파일명 확인**
   - `File` 키의 값이 실제 plist 파일명과 일치하는지 확인 (확장자 제외)
   - 대소문자 구분 확인

3. **빌드 클린**
   - Xcode에서 Product > Clean Build Folder 실행 후 재빌드

4. **앱 재설치**
   - 기기/시뮬레이터에서 앱을 삭제하고 재설치

### 텍스트가 잘리는 경우

- `FooterText`에 매우 긴 텍스트를 넣을 경우 스크롤됩니다
- 가독성을 위해 적절한 길이로 유지하는 것을 권장합니다

