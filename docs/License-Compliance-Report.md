# 오픈소스 라이선스 준수 검토 리포트

## 📋 검토 개요

이 문서는 SKTaxi 프로젝트에서 사용 중인 오픈소스 라이브러리들의 라이선스를 검토하고, 상업적 사용 및 라이선스 준수 요구사항을 확인합니다.

**검토 일자**: 2025년 8월  
**검토 범위**: package.json의 모든 dependencies

## ✅ 종합 결론

**대부분의 패키지는 상업적 사용에 문제가 없습니다.**  
모든 주요 패키지들이 **MIT** 또는 **Apache-2.0** 라이선스를 사용하고 있으며, 이들은 상업적 사용이 자유롭고 라이선스 표시만 요구합니다.

## 📊 라이선스 분류

### 🟢 안전 - 상업적 사용 가능 (라이선스 표시 필요)

| 라이선스 유형 | 패키지 수 | 대표 패키지 | 상업적 사용 | 라이선스 표시 |
|--------------|----------|------------|-----------|-------------|
| **MIT** | 대부분 | React, React Native, React Navigation 등 | ✅ 가능 | ✅ 필수 |
| **Apache-2.0** | 일부 | Firebase, TypeScript | ✅ 가능 | ✅ 필수 |
| **BSD-3-Clause** | 일부 | node-forge (듀얼) | ✅ 가능 | ✅ 필수 |

### 주요 패키지 상세

#### MIT 라이선스 패키지 (라이선스 표시 필수)
- ✅ React (19.0.0)
- ✅ React Native (0.79.2)
- ✅ React Navigation 시리즈 (@react-navigation/*)
- ✅ Axios (1.12.2)
- ✅ React Native Maps (1.26.14)
- ✅ React Native Reanimated (3.17.5)
- ✅ React Native Gesture Handler (2.25.0)
- ✅ React Native Vector Icons (10.2.0)
- ✅ @gorhom/bottom-sheet (5.1.4)
- ✅ 기타 대부분의 react-native-* 패키지들

**MIT 라이선스 요구사항**:
- ✅ 라이선스 및 저작권 고지 포함 (현재 Settings.bundle에 표시 중)
- ✅ 상업적 사용 가능
- ✅ 수정 및 배포 가능
- ❌ 소스 코드 공개 불필요

#### Apache-2.0 라이선스 패키지 (라이선스 표시 필수)
- ✅ @react-native-firebase/* (22.4.0)
- ✅ TypeScript (5.0.4)

**Apache-2.0 라이선스 요구사항**:
- ✅ 라이선스 및 저작권 고지 포함 (현재 Settings.bundle에 표시 중)
- ✅ 변경 사항 명시 (필요시)
- ✅ 상업적 사용 가능
- ✅ 특허 보호 포함 (MIT보다 유리)
- ❌ 소스 코드 공개 불필요

## ⚠️ 주의 사항

### 1. node-forge (간접 의존성)

**상태**: ✅ 문제 없음  
**경로**: firebase-admin → node-forge  
**라이선스**: (BSD-3-Clause OR GPL-2.0)

**설명**:
- `node-forge`는 듀얼 라이선스입니다
- **BSD-3-Clause를 선택**하여 사용하면 상업적 사용에 문제 없습니다
- GPL-2.0을 사용하지 않으므로 소스 코드 공개 의무 없습니다
- firebase-admin이 BSD-3-Clause로 사용하므로 문제 없습니다

### 2. React Native Maps - Google Maps API

**상태**: ⚠️ 추가 확인 필요  
**패키지 라이선스**: MIT (문제 없음)  
**주의 사항**: Google Maps API 사용 시 Google의 이용약관 확인 필요

**확인 사항**:
1. Google Maps Platform 이용약관 준수
2. Google Maps API 키 정책 준수
3. 사용량 제한 및 과금 정책 확인

**권장 사항**:
- Google Cloud Console에서 API 사용량 모니터링
- Google Maps Platform 이용약관 준수 확인
- 필요시 Google Maps Attribution 표시 (앱 내 지도 화면)

### 3. React Native Vector Icons

**상태**: ✅ 주의 필요 (폰트 아이콘)  
**패키지 라이선스**: MIT  
**주의 사항**: 사용하는 아이콘 폰트의 라이선스 확인 필요

**설명**:
- react-native-vector-icons 패키지 자체는 MIT
- 하지만 포함된 아이콘 폰트는 각각 다른 라이선스를 가질 수 있음:
  - Font Awesome: SIL OFL 또는 MIT
  - Material Icons: Apache-2.0
  - Ionicons: MIT
  - 기타: 각 폰트별 라이선스 확인 필요

**권장 사항**:
- 실제로 사용하는 아이콘 폰트의 라이선스 확인
- 대부분 MIT 또는 SIL OFL이므로 상업적 사용 가능

## 📝 라이선스 표시 현황

### ✅ 완료된 항목

1. **Settings.bundle 구현 완료**
   - iOS 설정 앱에서 라이선스 정보 표시
   - 주요 오픈소스 라이선스 파일 생성 완료

2. **자동화 스크립트 제공**
   - `npm run generate-licenses` 명령으로 라이선스 정보 자동 생성

### 📋 권장 추가 작업

1. **README.md에 라이선스 정보 추가** (선택사항)
   ```markdown
   ## 라이선스
   
   이 프로젝트는 여러 오픈소스 라이브러리를 사용합니다.
   자세한 라이선스 정보는 iOS 설정 앱 > SKURI Taxi > 라이선스에서 확인할 수 있습니다.
   ```

2. **앱 내 라이선스 화면 추가** (선택사항)
   - 설정 화면에 "오픈소스 라이선스" 메뉴 추가
   - Settings.bundle 내용과 동기화

3. **Google Maps Attribution 확인**
   - 지도 사용 시 Google 로고 표시 확인
   - Google Maps Platform 가이드라인 준수

## 🔍 상세 검토 결과

### 직접 의존성 (dependencies)

| 패키지 | 라이선스 | 상업적 사용 | 라이선스 표시 | 상태 |
|--------|---------|-----------|-------------|------|
| react | MIT | ✅ | ✅ | ✅ 안전 |
| react-native | MIT | ✅ | ✅ | ✅ 안전 |
| @react-navigation/* | MIT | ✅ | ✅ | ✅ 안전 |
| @react-native-firebase/* | Apache-2.0 | ✅ | ✅ | ✅ 안전 |
| react-native-maps | MIT | ✅ | ✅ | ✅ 안전* |
| axios | MIT | ✅ | ✅ | ✅ 안전 |
| react-native-vector-icons | MIT | ✅ | ✅ | ✅ 안전* |
| 기타 react-native-* | MIT | ✅ | ✅ | ✅ 안전 |

*: 추가 확인 필요 (위 참조)

### 간접 의존성

| 패키지 | 라이선스 | 상업적 사용 | 상태 |
|--------|---------|-----------|------|
| node-forge | BSD-3-Clause OR GPL-2.0 | ✅ (BSD-3-Clause 사용) | ✅ 안전 |

## 📌 라이선스 준수 체크리스트

- [x] 주요 오픈소스 라이선스 정보 수집
- [x] Settings.bundle에 라이선스 표시 구현
- [x] MIT 라이선스 요구사항 준수 (라이선스 표시)
- [x] Apache-2.0 라이선스 요구사항 준수 (라이선스 표시)
- [ ] Google Maps API 이용약관 확인 (권장)
- [ ] 사용 중인 아이콘 폰트 라이선스 확인 (권장)
- [ ] README.md에 라이선스 정보 추가 (선택)

## 🎯 결론 및 권장사항

### ✅ 현재 상태: 준수 완료

1. **상업적 사용**: 모든 주요 패키지가 상업적 사용 허용
2. **라이선스 표시**: Settings.bundle에 주요 라이선스 정보 표시 완료
3. **문제 없는 라이선스**: GPL, AGPL 등 소스 코드 공개가 필요한 라이선스 없음

### 📋 권장 추가 작업

1. **Google Maps API 이용약관 확인**
   - Google Cloud Console에서 이용약관 확인
   - API 사용량 및 과금 정책 확인

2. **아이콘 폰트 라이선스 확인** (낮은 우선순위)
   - 실제 사용 중인 아이콘 폰트만 확인
   - 대부분 문제 없을 것으로 예상

3. **정기적인 라이선스 검토**
   - 새로운 패키지 추가 시 라이선스 확인
   - `npm run generate-licenses` 실행하여 라이선스 정보 업데이트

## 📚 참고 자료

- [SPDX License List](https://spdx.org/licenses/)
- [Google Maps Platform 이용약관](https://cloud.google.com/maps-platform/terms)
- [React Native Maps 문서](https://github.com/react-native-maps/react-native-maps)
- [React Native Vector Icons 문서](https://github.com/oblador/react-native-vector-icons)

---

**최종 판단**: ✅ **상업적 사용 가능하며, 라이선스 표시 요구사항도 현재 Settings.bundle을 통해 준수하고 있습니다.**

