# App Store 재심사 제출 가이드

이 문서는 App Store Connect에서 거절된 앱을 다시 제출하는 방법과 거절 사유에 대한 해결 내용을 정리합니다.

---

## 📋 재제출 절차

### 1. App Store Connect 접속
1. [App Store Connect](https://appstoreconnect.apple.com)에 로그인
2. **내 앱** → 해당 앱 선택
3. **앱 스토어** 탭 클릭

### 2. 새로운 빌드 업로드
1. **빌드** 섹션에서 **+ 버튼** 클릭
2. Xcode에서 Archive 후 업로드된 새 빌드 선택
3. 또는 Xcode에서 직접 업로드:
   - `Product` → `Archive`
   - `Distribute App` → `App Store Connect` → `Upload`

### 3. 재심사 요청
1. **앱 정보** 또는 **버전 정보** 페이지로 이동
2. **심사 제출** 버튼 클릭
3. **심사 정보** 섹션에 거절 사유별 해결 내용 작성 (아래 참고)

---

## 📝 거절 사유별 해결 내용

### Guideline 5.1.1 - Privacy: Data Collection and Storage

**거절 사유:**
- 카메라 및 사진 라이브러리 접근에 대한 불충분한 목적 설명

**해결 내용:**
✅ **카메라 권한 (NSCameraUsageDescription):**
```
카메라로 촬영한 사진을 커뮤니티 글/채팅 또는 프로필 사진으로 업로드하는 데 사용합니다. 예: 차량 번호판 인증 사진 첨부
```

✅ **사진 라이브러리 접근 (NSPhotoLibraryUsageDescription):**
```
앱에서 사진을 선택해 커뮤니티 글/채팅 또는 프로필 사진으로 첨부하는 데 사용합니다. 예: 탑승 위치 안내 사진 첨부
```

✅ **사진 라이브러리 저장 (NSPhotoLibraryAddUsageDescription):**
```
촬영한 사진을 기기 앨범에 저장하는 데 사용합니다. 예: 업로드한 인증 사진을 앨범에 보관
```

**위치:** `ios/SKTaxi/Info.plist` (라인 38-43)

---

### Guideline 1.2 - Safety: User Generated Content

**거절 사유:**
- 익명 콘텐츠에 대한 충분한 예방 조치 부족

**해결 내용:**

✅ **1. 연령 제한 설정**
- App Store Connect에서 앱 연령 등급을 **18+**로 설정 완료

✅ **2. 이용약관 및 EULA 동의**
- 프로필 설정 화면(`CompleteProfileScreen`)에서 다음 동의를 받도록 구현:
  - "성결대 학생이고 19세 이상이에요" 체크박스
  - "이용약관(EULA 포함)에 동의해요" 체크박스
- 두 체크박스 모두 체크해야만 프로필 저장 가능
- 약관 보기 링크 제공 (`TermsOfUseForAuthScreen`)
- 동의 상태는 Firestore `users/{uid}/agreements`에 저장

**위치:** 
- `src/screens/auth/CompleteProfileScreen.tsx` (라인 24-25, 137-172)
- `src/screens/auth/TermsOfUseForAuthScreen.tsx`

✅ **3. 신고 기능**
- 게시물 및 댓글에 신고 기능 구현
- 신고 카테고리: 스팸, 욕설/혐오, 불법/위험, 음란물, 기타
- 신고 후 작성자 차단 옵션 제공
- 신고 데이터는 Firestore `reports/{reportId}`에 저장
- 운영자가 24시간 이내 검토 안내 메시지 표시

**위치:**
- `src/screens/BoardTab/BoardDetailScreen.tsx` (라인 162-211) - 게시물 신고
- `src/components/common/UniversalCommentList.tsx` (라인 127-174) - 댓글 신고
- `src/lib/moderation.ts` (라인 23-35) - 신고 생성 로직

✅ **4. 사용자 차단 기능**
- 신고 후 작성자 차단 옵션 제공
- 차단된 사용자의 게시물은 게시판에서 숨김 처리
- 차단된 사용자의 댓글은 "차단된 사용자의 댓글(답글)입니다"로 마스킹
- 차단 데이터는 Firestore `blocks/{uid}/blockedUsers/{blockedUid}`에 저장

**위치:**
- `src/lib/moderation.ts` (라인 38-48, 58-66) - 차단 로직
- `src/screens/BoardScreen.tsx` - 차단 사용자 게시물 필터링
- `src/components/common/UniversalCommentList.tsx` - 차단 사용자 댓글 마스킹

✅ **5. 콘텐츠 필터링**
- 차단된 사용자의 콘텐츠는 자동으로 숨김 처리
- `shouldHideContent()` 함수로 실시간 필터링

**위치:** `src/lib/moderation.ts` (라인 68-78)

---

### Guideline 2.1 - Information Needed

**거절 사유:**
- 계정 생성 프로세스 데모 영상 필요

**해결 내용:**
✅ **계정 생성 프로세스:**
1. Google 로그인 (`LoginScreen.tsx`)
2. 프로필 설정 (`CompleteProfileScreen.tsx`):
   - 닉네임, 학번, 학과 입력
   - 18세 이상 확인 및 이용약관 동의 체크박스
   - 약관 보기 링크 클릭 가능
3. 권한 설정 (`PermissionOnboardingScreen.tsx`):
   - 알림 권한
   - ATT (App Tracking Transparency) - iOS만
   - 위치 권한

**데모 영상 제작 필요:**
- 위 프로세스를 단계별로 녹화한 영상
- App Store Connect의 **앱 심사 정보** 섹션에 첨부
- 또는 YouTube/Vimeo 링크 제공

**위치:**
- `src/screens/auth/LoginScreen.tsx`
- `src/screens/auth/CompleteProfileScreen.tsx`
- `src/screens/PermissionOnboardingScreen.tsx`

---

### Guideline 5.1.2 - Privacy: Data Use and Sharing

**거절 사유:**
- App Tracking Transparency (ATT) 구현 필요

**해결 내용:**
✅ **ATT 구현:**
- 앱 시작 시 iOS에서 ATT 권한 요청 (`App.tsx`)
- 권한 온보딩 화면에서도 ATT 단계 포함 (`PermissionOnboardingScreen.tsx`)
- `NSUserTrackingUsageDescription` 설정:
```
서비스 개선을 위한 사용자 행동 분석과 앱 성능 최적화를 위해 기기 식별자를 사용합니다.
```

**위치:**
- `ios/SKTaxi/Info.plist` (NSUserTrackingUsageDescription)
- `App.tsx` (라인 34-43) - 앱 시작 시 ATT 요청
- `src/screens/PermissionOnboardingScreen.tsx` - 온보딩 ATT 단계
- `src/lib/att.ts` - ATT 권한 요청 로직

---

## 📤 심사 정보에 작성할 내용

App Store Connect의 **앱 심사 정보** 섹션에 다음 내용을 작성하세요:

```
안녕하세요,

이전 심사에서 지적해주신 사항들을 모두 해결했습니다:

1. Guideline 5.1.1 (Privacy - Data Collection):
   - 카메라 및 사진 라이브러리 접근 목적을 구체적으로 설명하는 문구로 업데이트했습니다.
   - Info.plist의 모든 권한 설명을 실제 사용 사례를 포함하여 명확하게 작성했습니다.

2. Guideline 1.2 (Safety - User Generated Content):
   - 앱 연령 등급을 18+로 설정했습니다.
   - 프로필 설정 화면에서 18세 이상 확인 및 이용약관(EULA) 동의를 받도록 구현했습니다.
   - 이 앱은 @sungkyul.ac.kr 이메일 주소로만 가입을 허용하며, 이는 사용자가 18세 이상임을 간접적으로 증명합니다.
   - 게시물 및 댓글에 신고 기능을 추가했습니다.
   - 사용자 차단 기능을 구현하여 차단된 사용자의 콘텐츠를 숨김 처리합니다.
   - 신고 데이터는 Firestore에 저장되며, 운영자가 24시간 이내 검토합니다.

3. Guideline 2.1 (Information Needed):
   - 계정 생성 프로세스 데모 영상을 [링크 또는 첨부]했습니다.
   - 프로세스: Google 로그인 → 프로필 설정(18세 이상 확인 및 약관 동의) → 권한 설정

4. Guideline 5.1.2 (Privacy - Data Use and Sharing):
   - App Tracking Transparency (ATT)를 구현했습니다.
   - 앱 시작 시 및 권한 온보딩 화면에서 ATT 권한을 요청합니다.

감사합니다.
```

---

## ✅ 체크리스트

재제출 전 확인사항:

- [ ] 새 빌드 업로드 완료 (모든 수정사항 반영)
- [ ] Info.plist의 권한 설명 업데이트 확인
- [ ] 18세 이상 확인 및 약관 동의 기능 테스트
- [ ] 신고 및 차단 기능 테스트
- [ ] ATT 팝업 정상 동작 확인 (iOS)
- [ ] 계정 생성 데모 영상 준비 및 첨부
- [ ] 심사 정보에 해결 내용 작성
- [ ] App Store Connect에서 연령 등급 18+ 확인

---

## 📚 관련 파일 위치

### 주요 수정 파일:
- `ios/SKTaxi/Info.plist` - 권한 설명
- `src/screens/auth/CompleteProfileScreen.tsx` - 18세 이상 확인 및 약관 동의
- `src/screens/auth/TermsOfUseForAuthScreen.tsx` - 약관 화면
- `src/screens/BoardTab/BoardDetailScreen.tsx` - 게시물 신고
- `src/components/common/UniversalCommentList.tsx` - 댓글 신고
- `src/lib/moderation.ts` - 신고 및 차단 로직
- `App.tsx` - ATT 권한 요청
- `src/screens/PermissionOnboardingScreen.tsx` - ATT 온보딩
- `src/lib/att.ts` - ATT 구현

---

## 🆘 문제 발생 시

재심사에서도 거절되면:
1. **거절 사유**를 자세히 확인
2. **심사 정보**에 추가 설명 작성
3. 필요 시 **앱 심사팀과 직접 소통** 요청

---

**마지막 업데이트:** 2025년 11월 5일

