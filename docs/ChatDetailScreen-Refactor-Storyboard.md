# ChatDetailScreen 리팩토링 스토리보드

## 📋 개요
현재 ChatDetailScreen의 복잡한 로직을 단순화하고, 카카오톡 스타일의 자연스러운 채팅 UX를 구현합니다.

---

## 🎯 핵심 요구사항

1. **채팅방 접속 시 최근 30개 메시지 로드**
2. **30개 로드 완료 후 FlatList를 바로 가장 아래로 스크롤**
3. **TextInput 클릭 시 키보드와 함께 입력창이 올라옴 (카카오톡 스타일)**
4. **화면 구성: Header → Messages List → Input Area**
5. **FlatList를 가장 위로 스크롤하면 이전 30개 페이징 로드**

---

## 🏗️ 아키텍처 설계

### 컴포넌트 구조
```
ChatDetailScreen
├── Header (고정)
│   ├── 뒤로가기 버튼
│   ├── 채팅방 이름/멤버 수
│   └── 알림 설정 토글
├── MessagesList (Flex: 1)
│   ├── FlatList
│   │   ├── ListHeaderComponent (로딩 인디케이터)
│   │   ├── MessageItem (각 메시지)
│   │   └── ListEmptyComponent
│   └── 스크롤 감지 (페이징)
└── InputArea (고정, 하단)
    ├── TextInput
    └── 전송 버튼
```

### 상태 관리
```typescript
// 메시지 관련
- messages: ChatMessage[] (useChatMessages 훅)
- loading: boolean
- loadingMore: boolean
- hasMore: boolean

// 채팅방 관련
- chatRoom: ChatRoom | null
- notificationEnabled: boolean
- hasJoined: boolean

// 입력 관련
- message: string

// UI 상태
- keyboardHeight: number (키보드 높이 추적)
```

### Ref 관리
```typescript
- flatListRef: FlatList 참조
- isInitialLoadComplete: boolean (초기 로드 완료 여부)
```

---

## 📐 단계별 구현 계획

### Phase 1: 기본 구조 단순화

#### 1.1 컴포넌트 레이아웃 재구성
- **KeyboardAvoidingView** 사용 (카카오톡 스타일)
- Header, MessagesList, InputArea를 명확히 분리
- 불필요한 Animated.View 제거

#### 1.2 useEffect 정리
**제거할 useEffect:**
- ❌ 화면 포커스 시 스크롤 (불필요)
- ❌ 키보드 이벤트에서 복잡한 스크롤 로직
- ❌ 메시지 추가 시마다 스크롤 (초기 로드 후에만)

**유지할 useEffect:**
- ✅ 채팅방 정보 구독
- ✅ 최초 접속 시 members 추가
- ✅ 알림 설정 로드
- ✅ 초기 메시지 로드 후 스크롤 (1회만)
- ✅ 새 메시지 읽음 처리

### Phase 2: 스크롤 로직 단순화

#### 2.1 초기 스크롤
```typescript
useEffect(() => {
  // 조건: 메시지 로딩 완료 && 초기 로드 완료 안됨
  if (!messagesLoading && messages.length > 0 && !isInitialLoadComplete.current) {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: false });
      isInitialLoadComplete.current = true;
    }, 100);
  }
}, [messagesLoading, messages.length]);
```

#### 2.2 페이징 로드
```typescript
onScroll={(event) => {
  const { contentOffset } = event.nativeEvent;
  const scrollY = contentOffset.y;
  
  // 초기 로드 완료 후 && 상단 근처(200px) && 더 불러올 메시지 있음
  if (isInitialLoadComplete.current && scrollY < 200 && hasMore && !loadingMore) {
    loadMore();
  }
}}
```

#### 2.3 새 메시지 스크롤
```typescript
useEffect(() => {
  // 초기 로드 완료 후 && 새 메시지 추가 시
  if (isInitialLoadComplete.current && messages.length > 0) {
    // 사용자가 하단 근처에 있으면 자동 스크롤
    // (키보드가 올라와 있거나, 하단 200px 이내)
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }
}, [messages.length]);
```

### Phase 3: 키보드 처리 개선

#### 3.1 KeyboardAvoidingView 활용
```typescript
<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
>
  {/* Header */}
  {/* MessagesList */}
  {/* InputArea */}
</KeyboardAvoidingView>
```

#### 3.2 키보드 높이 추적 (선택적)
- 키보드가 올라올 때 InputArea가 자연스럽게 따라 올라가도록
- KeyboardAvoidingView가 자동 처리하지만, 필요시 키보드 높이 추적

### Phase 4: 메시지 읽음 처리 최적화

#### 4.1 읽음 처리 로직
- 초기 로드 시: 모든 메시지 읽음 처리
- 새 메시지 추가 시: 읽지 않은 메시지만 읽음 처리
- 화면 포커스 시: 읽음 처리만 (스크롤 없음)

---

## 🔄 데이터 플로우

### 초기 로드 플로우
```
1. 채팅방 접속
   ↓
2. joinChatRoom() 실행
   ↓
3. useChatMessages 훅에서 최근 30개 로드
   ↓
4. messages 상태 업데이트
   ↓
5. useEffect 감지 → FlatList 가장 아래로 스크롤
   ↓
6. isInitialLoadComplete = true
   ↓
7. 실시간 구독 시작 (새 메시지만)
```

### 페이징 플로우
```
1. 사용자가 FlatList를 위로 스크롤
   ↓
2. onScroll 이벤트 감지 (scrollY < 200)
   ↓
3. loadMore() 호출
   ↓
4. 이전 30개 메시지 로드
   ↓
5. messages 배열 앞에 추가
   ↓
6. 스크롤 위치 유지 (자동 조정)
```

### 새 메시지 플로우
```
1. 실시간으로 새 메시지 수신
   ↓
2. messages 배열에 추가
   ↓
3. useEffect 감지
   ↓
4. 사용자가 하단 근처인지 확인
   ↓
5. 하단 근처면 자동 스크롤, 아니면 스크롤 안함
```

---

## 🎨 UI/UX 개선사항

### 1. 스크롤 동작
- **초기 로드**: 부드러운 스크롤 없이 즉시 하단으로 (animated: false)
- **새 메시지**: 부드러운 스크롤 (animated: true)
- **페이징**: 스크롤 위치 유지

### 2. 키보드 동작
- **TextInput 포커스**: 키보드와 함께 InputArea가 자연스럽게 올라옴
- **키보드 숨김**: InputArea가 자연스럽게 내려옴
- **스크롤**: 키보드가 올라와도 메시지 리스트는 자연스럽게 조정

### 3. 로딩 상태
- **초기 로딩**: 전체 화면 로딩 인디케이터
- **페이징 로딩**: ListHeaderComponent에 "이전 메시지 불러오는 중..."

---

## 🧹 제거할 코드

### 불필요한 상태
- ❌ `isInitialScrollCompleteRef` (단순화)
- ❌ `isScrollingProgrammaticallyRef` (불필요)
- ❌ `currentScrollYRef` (키보드 처리 단순화로 불필요)
- ❌ `contentHeightRef` (FlatList의 scrollToEnd 사용)
- ❌ `opacity`, `translateY` (Animated 제거)
- ❌ `inputTranslateY` (KeyboardAvoidingView 사용)

### 불필요한 함수
- ❌ `scrollToEndWithPadding` (FlatList의 scrollToEnd 사용)
- ❌ 복잡한 키보드 이벤트 리스너

### 불필요한 useEffect
- ❌ 화면 포커스 시 스크롤
- ❌ 키보드 이벤트에서 스크롤
- ❌ 메시지 추가 시마다 무조건 스크롤

---

## ✅ 최종 코드 구조 (간략)

```typescript
export const ChatDetailScreen = () => {
  // 기본 훅
  const { user } = useAuth();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  
  // 상태
  const [message, setMessage] = useState('');
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);
  
  // Ref
  const flatListRef = useRef<FlatList>(null);
  const isInitialLoadCompleteRef = useRef(false);
  
  // 메시지 훅
  const { messages, loading, loadingMore, hasMore, loadMore } = useChatMessages(chatRoomId);
  
  // 초기 스크롤 (1회만)
  useEffect(() => {
    if (!loading && messages.length > 0 && !isInitialLoadCompleteRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: false });
        isInitialLoadCompleteRef.current = true;
      }, 100);
    }
  }, [loading, messages.length]);
  
  // 새 메시지 스크롤 (조건부)
  useEffect(() => {
    if (isInitialLoadCompleteRef.current && messages.length > 0) {
      // 하단 근처 확인 후 스크롤
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <Header />
        
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          onScroll={handleScroll}
          // ...
        />
        
        {/* Input Area */}
        <InputArea />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
```

---

## 📝 체크리스트

### Phase 1: 기본 구조
- [ ] KeyboardAvoidingView로 레이아웃 재구성
- [ ] 불필요한 Animated 제거
- [ ] Header, MessagesList, InputArea 분리

### Phase 2: 스크롤 로직
- [ ] 초기 스크롤 로직 단순화
- [ ] 페이징 스크롤 감지 개선
- [ ] 새 메시지 스크롤 조건부 처리

### Phase 3: 키보드 처리
- [ ] KeyboardAvoidingView 적용
- [ ] 불필요한 키보드 이벤트 리스너 제거

### Phase 4: 최적화
- [ ] 불필요한 useEffect 제거
- [ ] 코드 정리 및 주석 추가
- [ ] 테스트

---

## 🚀 예상 개선 효과

1. **코드 라인 수**: ~936줄 → ~600줄 (약 35% 감소)
2. **useEffect 개수**: 10개 → 5개 (50% 감소)
3. **복잡도**: 높음 → 낮음
4. **유지보수성**: 향상
5. **UX**: 카카오톡 스타일의 자연스러운 동작

---

## ❓ 검토 사항

1. **키보드 처리**: KeyboardAvoidingView만으로 충분한가? 추가 커스터마이징이 필요한가?
2. **새 메시지 스크롤**: 항상 스크롤할지, 사용자 위치에 따라 조건부로 할지?
3. **페이징 로딩**: 현재 위치 유지가 자연스러운가?
4. **애니메이션**: 초기 스크롤에 애니메이션을 넣을지 말지?

---

**이 스토리보드를 검토 후 피드백 주시면 구현을 시작하겠습니다!** 🎯


