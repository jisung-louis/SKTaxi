# 안드로이드 빌드 및 실행 가이드

## 📋 사전 준비사항 확인

### 1. 필수 도구 설치 확인
- ✅ Java JDK (21.0.9 설치 확인됨)
- ✅ Android SDK (설치 확인됨)
- ⚠️ Android Studio 설치 필요 (에뮬레이터 사용 시)

### 2. 환경 변수 설정 확인
터미널에서 다음 명령어로 확인:
```bash
echo $ANDROID_HOME
echo $JAVA_HOME
```

만약 설정되지 않았다면 `~/.zshrc` 파일에 추가:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

## 🚀 빌드 및 실행 방법

### 방법 1: 실제 안드로이드 기기 사용 (권장)

#### 1단계: 기기 준비
1. 안드로이드 기기의 **개발자 옵션** 활성화
   - 설정 → 휴대전화 정보 → 빌드 번호를 7번 연속 탭
2. **USB 디버깅** 활성화
   - 설정 → 개발자 옵션 → USB 디버깅 켜기
3. USB 케이블로 Mac에 연결

#### 2단계: 기기 연결 확인
```bash
cd /Users/jisung/SKTaxi
adb devices
```
연결된 기기가 목록에 표시되면 성공!

#### 3단계: 앱 실행
```bash
# Metro 번들러 시작 (새 터미널 창에서)
npm start

# 다른 터미널에서 앱 빌드 및 실행
npm run android
```

### 방법 2: 안드로이드 에뮬레이터 사용

#### 1단계: Android Studio 설치
1. [Android Studio 다운로드](https://developer.android.com/studio)
2. 설치 후 Android Studio 실행
3. SDK Manager에서 필요한 SDK 설치:
   - Android SDK Platform 35
   - Android SDK Build-Tools 35.0.0
   - Android Emulator

#### 2단계: 에뮬레이터 생성
1. Android Studio → Tools → Device Manager
2. Create Device 클릭
3. 원하는 기기 선택 (예: Pixel 7)
4. 시스템 이미지 선택 (API 35 권장)
5. Finish 클릭

#### 3단계: 에뮬레이터 실행
```bash
# 에뮬레이터 목록 확인
emulator -list-avds

# 에뮬레이터 실행 (또는 Android Studio에서 실행)
emulator -avd <에뮬레이터_이름>
```

#### 4단계: 앱 실행
```bash
# Metro 번들러 시작 (새 터미널 창에서)
npm start

# 다른 터미널에서 앱 빌드 및 실행
npm run android
```

## 🔧 문제 해결

### 문제 1: "adb: command not found"
```bash
# Android SDK platform-tools 경로 확인
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 문제 2: "SDK location not found"
```bash
# android/local.properties 파일 생성
echo "sdk.dir=$ANDROID_HOME" > android/local.properties
```

### 문제 3: Gradle 빌드 실패
```bash
# Gradle 캐시 정리
cd android
./gradlew clean
cd ..
```

### 문제 4: Metro 번들러 연결 실패
```bash
# Metro 번들러 재시작
npm start -- --reset-cache
```

### 문제 5: 기기 인식 안 됨
```bash
# ADB 재시작
adb kill-server
adb start-server
adb devices
```

## 📦 APK 빌드 (배포용)

### Debug APK
```bash
cd android
./gradlew assembleDebug
```
생성 위치: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (서명 필요)
1. 키스토어 생성 (처음 한 번만)
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. `android/gradle.properties`에 추가:
```
MYAPP_RELEASE_STORE_FILE=my-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=my-key-alias
MYAPP_RELEASE_STORE_PASSWORD=*****
MYAPP_RELEASE_KEY_PASSWORD=*****
```

3. `android/app/build.gradle`의 signingConfigs 수정

4. 빌드:
```bash
cd android
./gradlew assembleRelease
```

## ✅ 체크리스트

빌드 전 확인사항:
- [ ] Node.js 및 npm 설치 확인
- [ ] Java JDK 설치 확인
- [ ] Android SDK 설치 확인
- [ ] ANDROID_HOME 환경 변수 설정
- [ ] 기기 또는 에뮬레이터 연결 확인
- [ ] `android/local.properties` 파일 존재 확인
- [ ] Firebase 설정 파일 확인 (`android/app/google-services.json`)

## 📝 참고사항

- 첫 빌드는 시간이 오래 걸릴 수 있습니다 (의존성 다운로드)
- Metro 번들러는 별도 터미널에서 실행해야 합니다
- 빌드 중 에러가 발생하면 에러 메시지를 확인하고 위의 문제 해결 섹션을 참고하세요

