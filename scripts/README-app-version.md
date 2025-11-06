# 앱 버전 관리 스크립트 사용 가이드

이 가이드는 앱 버전을 관리하는 스크립트를 사용하는 방법을 설명합니다. 초보자도 쉽게 따라할 수 있도록 단계별로 설명합니다.

## 📋 목차

1. [이 스크립트는 뭘 하는 거야?](#이-스크립트는-뭘-하는-거야)
2. [사전 준비](#사전-준비)
3. [기본 사용법](#기본-사용법)
4. [상세 사용법](#상세-사용법)
5. [자주 묻는 질문](#자주-묻는-질문)

---

## 이 스크립트는 뭘 하는 거야?

이 스크립트는 **Firestore에 앱 버전 정보를 저장하고 관리**하는 도구입니다.

### 왜 필요한가요?

- 앱을 업데이트했을 때, 오래된 버전을 사용하는 사용자에게 **강제로 업데이트를 요구**할 수 있습니다
- 사용자가 최신 버전을 사용하도록 유도할 수 있습니다
- 보안 문제나 중요한 버그가 있을 때 빠르게 모든 사용자에게 업데이트를 강제할 수 있습니다

### 예시 상황

예를 들어, 앱이 1.0.0 버전에서 1.1.0 버전으로 업데이트되었고, 중요한 보안 패치가 포함되어 있다고 가정해봅시다.

1. **스크립트를 실행**해서 "최소 버전을 1.1.0으로 설정하고 강제 업데이트를 켜라"고 Firestore에 저장합니다
2. **사용자가 앱을 실행**하면 앱이 자동으로 "내 버전이 1.1.0보다 낮은가?"를 확인합니다
3. **낮다면** → 사용자에게 "업데이트가 필요합니다" 팝업을 띄우고 앱스토어로 이동시킵니다
4. **높거나 같다면** → 정상적으로 앱을 실행합니다

---

## 사전 준비

### 1. 필요한 파일 확인

스크립트를 실행하기 전에 다음 파일이 있는지 확인하세요:

```
functions/serviceAccountKey.json
```

이 파일이 없으면 스크립트가 작동하지 않습니다. Firebase 콘솔에서 서비스 계정 키를 다운로드해야 합니다.

### 2. Node.js 설치 확인

터미널에서 다음 명령어를 실행해보세요:

```bash
node --version
```

버전이 나오면 정상입니다. 나오지 않으면 Node.js를 설치해야 합니다.

---

## 기본 사용법

### 🔍 현재 버전 정보 확인하기

가장 먼저 해볼 것은 **현재 Firestore에 어떤 버전 정보가 저장되어 있는지 확인**하는 것입니다.

#### 모든 플랫폼 확인

```bash
node scripts/manage-app-version.js get
```

이 명령어를 실행하면 iOS와 Android의 버전 정보가 모두 표시됩니다.

**출력 예시:**
```
📱 앱 버전 정보:

   iOS:
   - 최소 버전: 1.0.0
   - 강제 업데이트: ✅
   - 메시지: 새로운 기능이 추가되었습니다.
   - 업데이트 시간: 2025. 1. 15. 오후 3:30:00

   Android:
   - 최소 버전: 1.0.0
   - 강제 업데이트: ✅
   - 메시지: 새로운 기능이 추가되었습니다.
   - 업데이트 시간: 2025. 1. 15. 오후 3:30:00
```

#### 특정 플랫폼만 확인

```bash
# iOS만 확인
node scripts/manage-app-version.js get --platform ios

# Android만 확인
node scripts/manage-app-version.js get --platform android
```

---

### ➕ 처음 버전 정보 설정하기 (초기 생성)

Firestore에 버전 정보가 아직 없다면, 처음으로 생성해야 합니다.

#### 방법 1: 간단하게 설정하기 (추천)

```bash
node scripts/manage-app-version.js create --ios-version 1.0.0 --android-version 1.0.0 --force-update false
```

**설명:**
- `--ios-version 1.0.0`: iOS의 최소 버전을 1.0.0으로 설정
- `--android-version 1.0.0`: Android의 최소 버전을 1.0.0으로 설정
- `--force-update false`: 강제 업데이트를 끔 (선택적 업데이트)

**성공 메시지:**
```
✅ iOS 버전 설정 완료:
   - 최소 버전: 1.0.0
   - 강제 업데이트: false
✅ Android 버전 설정 완료:
   - 최소 버전: 1.0.0
   - 강제 업데이트: false
```

#### 방법 2: JSON 파일로 설정하기

먼저 설정 파일을 만듭니다. `scripts/version-config.json` 파일을 만들고 다음 내용을 입력하세요:

```json
{
  "ios": {
    "minimumVersion": "1.0.0",
    "forceUpdate": false,
    "message": "선택적 업데이트입니다."
  },
  "android": {
    "minimumVersion": "1.0.0",
    "forceUpdate": false,
    "message": "선택적 업데이트입니다."
  }
}
```

그 다음 스크립트를 실행합니다:

```bash
node scripts/manage-app-version.js create --file ./scripts/version-config.json
```

---

### ✏️ 버전 정보 업데이트하기

이미 설정된 버전 정보를 변경하고 싶을 때 사용합니다.

#### iOS 버전만 업데이트

```bash
node scripts/manage-app-version.js update --platform ios --version 1.1.0 --force-update true --message "중요한 보안 패치가 포함되었습니다."
```

**설명:**
- `--platform ios`: iOS 플랫폼을 지정
- `--version 1.1.0`: 최소 버전을 1.1.0으로 변경
- `--force-update true`: 강제 업데이트를 켬
- `--message "...": 사용자에게 보여줄 메시지

**성공 메시지:**
```
✅ ios 버전 업데이트 완료
   - 최소 버전: 1.1.0
   - 강제 업데이트: true
   - 메시지: 중요한 보안 패치가 포함되었습니다.
```

#### Android 버전만 업데이트

```bash
node scripts/manage-app-version.js update --platform android --version 1.1.0 --force-update false
```

#### 강제 업데이트만 끄기 (버전은 그대로)

```bash
node scripts/manage-app-version.js update --platform ios --force-update false
```

이렇게 하면 버전은 그대로 두고 강제 업데이트만 끕니다.

---

## 상세 사용법

### 📝 각 옵션 설명

#### create 명령어 옵션

| 옵션 | 설명 | 필수 여부 | 예시 |
|------|------|----------|------|
| `--ios-version` | iOS 최소 버전 | 아니오* | `--ios-version 1.0.0` |
| `--android-version` | Android 최소 버전 | 아니오* | `--android-version 1.0.0` |
| `--force-update` | 강제 업데이트 여부 | 아니오 | `--force-update true` |
| `--message` | 사용자에게 보여줄 메시지 | 아니오 | `--message "업데이트하세요"` |
| `--ios-message` | iOS 전용 메시지 | 아니오 | `--ios-message "iOS 업데이트"` |
| `--android-message` | Android 전용 메시지 | 아니오 | `--android-message "Android 업데이트"` |
| `--file` | JSON 설정 파일 경로 | 아니오 | `--file ./version-config.json` |

*`--ios-version`과 `--android-version` 중 하나는 반드시 필요합니다. `--file`을 사용하면 이 옵션들은 무시됩니다.

#### update 명령어 옵션

| 옵션 | 설명 | 필수 여부 | 예시 |
|------|------|----------|------|
| `--platform` | 플랫폼 선택 (`ios` 또는 `android`) | **필수** | `--platform ios` |
| `--version` | 최소 버전 | 아니오 | `--version 1.1.0` |
| `--force-update` | 강제 업데이트 여부 | 아니오 | `--force-update true` |
| `--message` | 사용자에게 보여줄 메시지 | 아니오 | `--message "업데이트하세요"` |
| `--file` | JSON 설정 파일 경로 | 아니오 | `--file ./version-update.json` |

**중요:** `--version`, `--force-update`, `--message` 중 최소 하나는 반드시 입력해야 합니다.

#### get 명령어 옵션

| 옵션 | 설명 | 필수 여부 | 예시 |
|------|------|----------|------|
| `--platform` | 특정 플랫폼만 조회 | 아니오 | `--platform ios` |

---

### 📋 실제 사용 시나리오

#### 시나리오 1: 첫 배포 (앱 출시)

앱을 처음 배포할 때는 강제 업데이트를 끄는 것이 좋습니다.

```bash
node scripts/manage-app-version.js create --ios-version 1.0.0 --android-version 1.0.0 --force-update false
```

**설명:** 
- 최소 버전을 1.0.0으로 설정
- 강제 업데이트는 끔 (아직 사용자가 없으므로)

---

#### 시나리오 2: 보안 패치 업데이트 (강제 업데이트 필요)

중요한 보안 문제를 발견했고, 모든 사용자가 즉시 업데이트해야 할 때:

```bash
# iOS 강제 업데이트
node scripts/manage-app-version.js update --platform ios --version 1.0.1 --force-update true --message "보안 패치가 포함된 중요한 업데이트입니다. 즉시 업데이트해주세요."

# Android 강제 업데이트
node scripts/manage-app-version.js update --platform android --version 1.0.1 --force-update true --message "보안 패치가 포함된 중요한 업데이트입니다. 즉시 업데이트해주세요."
```

**결과:**
- 1.0.0 버전 사용자는 앱을 실행할 수 없음
- 앱을 실행하려고 하면 업데이트 팝업이 뜸
- 팝업을 닫을 수 없음 (강제 업데이트)

---

#### 시나리오 3: 새로운 기능 추가 (선택적 업데이트)

새로운 기능을 추가했지만, 기존 버전도 계속 사용할 수 있게 하고 싶을 때:

```bash
node scripts/manage-app-version.js update --platform ios --version 1.1.0 --force-update false --message "새로운 기능이 추가되었습니다. 업데이트를 권장합니다."
```

**결과:**
- 1.0.0 버전 사용자도 계속 앱을 사용할 수 있음
- 하지만 사용자가 업데이트를 선택할 수 있도록 안내

---

#### 시나리오 4: 버전만 올리고 강제 업데이트는 나중에

먼저 버전만 올려두고, 나중에 강제 업데이트를 켜고 싶을 때:

```bash
# 1단계: 버전만 올리기
node scripts/manage-app-version.js update --platform ios --version 1.2.0 --force-update false

# 2단계: 나중에 강제 업데이트 켜기
node scripts/manage-app-version.js update --platform ios --force-update true --message "새로운 버전으로 업데이트가 필요합니다."
```

---

#### 시나리오 5: 강제 업데이트 해제

실수로 강제 업데이트를 켰거나, 더 이상 강제 업데이트가 필요 없을 때:

```bash
node scripts/manage-app-version.js update --platform ios --force-update false
```

---

### 📄 JSON 파일 예시

복잡한 설정을 하고 싶을 때는 JSON 파일을 사용하는 것이 편리합니다.

#### version-config.json (전체 설정)

```json
{
  "ios": {
    "minimumVersion": "1.0.0",
    "forceUpdate": true,
    "message": "중요한 보안 패치가 포함되었습니다.\n즉시 업데이트해주세요."
  },
  "android": {
    "minimumVersion": "1.0.0",
    "forceUpdate": true,
    "message": "중요한 보안 패치가 포함되었습니다.\n즉시 업데이트해주세요."
  }
}
```

**사용:**
```bash
node scripts/manage-app-version.js create --file ./version-config.json
```

#### version-update.json (부분 업데이트)

```json
{
  "minimumVersion": "1.1.0",
  "forceUpdate": true,
  "message": "새로운 기능이 추가되었습니다."
}
```

**사용:**
```bash
node scripts/manage-app-version.js update --platform ios --file ./version-update.json
```

---

## 자주 묻는 질문

### Q1: 버전 번호는 어떻게 정하나요?

일반적으로 **세 자리 숫자**를 사용합니다: `주요버전.부버전.패치버전`

- **주요 버전 (Major):** 큰 변화가 있을 때 (예: 1.0.0 → 2.0.0)
- **부 버전 (Minor):** 새로운 기능 추가 (예: 1.0.0 → 1.1.0)
- **패치 버전 (Patch):** 버그 수정 (예: 1.0.0 → 1.0.1)

### Q2: 강제 업데이트(true)와 선택적 업데이트(false)의 차이는?

- **강제 업데이트 (true):**
  - 사용자가 오래된 버전을 사용하면 앱을 실행할 수 없음
  - 업데이트 팝업을 닫을 수 없음
  - 보안 문제나 중요한 버그 수정 시 사용

- **선택적 업데이트 (false):**
  - 사용자가 오래된 버전을 사용해도 앱을 실행할 수 있음
  - 업데이트 안내는 하지만 강제하지 않음
  - 새로운 기능 추가 시 사용

### Q3: iOS와 Android를 따로 설정해야 하나요?

네, **각각 따로 설정**할 수 있습니다. 

예를 들어:
- iOS는 1.1.0 버전부터 강제 업데이트
- Android는 1.0.5 버전부터 강제 업데이트

이렇게 다르게 설정할 수 있습니다.

### Q4: 실수로 잘못 설정했어요. 어떻게 되돌리나요?

다시 `update` 명령어를 사용해서 원래대로 되돌리면 됩니다.

```bash
# 예: 강제 업데이트를 끄고 싶을 때
node scripts/manage-app-version.js update --platform ios --force-update false

# 예: 버전을 낮추고 싶을 때
node scripts/manage-app-version.js update --platform ios --version 1.0.0
```

### Q5: 현재 어떤 버전이 설정되어 있는지 확인하고 싶어요.

```bash
node scripts/manage-app-version.js get
```

이 명령어로 현재 설정을 확인할 수 있습니다.

### Q6: 에러가 발생했어요. 어떻게 해야 하나요?

1. **serviceAccountKey.json 파일 확인**
   - `functions/serviceAccountKey.json` 파일이 있는지 확인
   - 파일이 없으면 Firebase 콘솔에서 다운로드

2. **Node.js 버전 확인**
   ```bash
   node --version
   ```
   - 버전이 나오지 않으면 Node.js 설치 필요

3. **명령어 오타 확인**
   - `--platform ios` 또는 `--platform android` (소문자)
   - `--force-update true` 또는 `--force-update false` (소문자)

4. **필수 옵션 확인**
   - `update` 명령어는 `--platform`이 필수
   - 최소 하나의 업데이트 옵션(`--version`, `--force-update`, `--message`) 필요

### Q7: 버전 정보를 완전히 삭제하고 싶어요.

현재는 삭제 기능이 없습니다. 대신 `force-update: false`로 설정하면 강제 업데이트를 해제할 수 있습니다.

---

## 💡 팁

1. **버전 업데이트 전에 항상 확인**
   ```bash
   node scripts/manage-app-version.js get
   ```
   현재 설정을 확인한 후 업데이트하세요.

2. **JSON 파일 사용 권장**
   - 복잡한 설정을 할 때는 JSON 파일을 사용하는 것이 편리합니다
   - 파일을 버전 관리 시스템(Git)에 저장하면 설정 이력을 추적할 수 있습니다

3. **테스트 환경에서 먼저 확인**
   - 실제 서비스에 적용하기 전에 테스트 환경에서 먼저 확인하세요

4. **강제 업데이트는 신중하게**
   - 강제 업데이트를 켜면 사용자가 앱을 사용할 수 없게 됩니다
   - 정말 필요한 경우에만 사용하세요

---

## 📚 관련 문서

- [Firebase Console](https://console.firebase.google.com/)
- [Firestore 문서](https://firebase.google.com/docs/firestore)

---

## 🆘 도움이 필요하신가요?

문제가 발생하거나 추가 도움이 필요하시면 팀에 문의하세요.





