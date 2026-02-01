// SKTaxi: Jest 설정 파일
// Firebase 및 React Native 모듈 모킹

// Firebase 모듈 모킹
jest.mock('@react-native-firebase/app', () => ({
  getApp: jest.fn(() => ({})),
  getApps: jest.fn(() => []),
  initializeApp: jest.fn(),
}));

jest.mock('@react-native-firebase/firestore', () => {
  const mockCollection = jest.fn(() => ({
    doc: jest.fn(() => mockDocRef),
  }));

  const mockDocRef = {
    get: jest.fn(() => Promise.resolve({ exists: () => false, data: () => null })),
    set: jest.fn(() => Promise.resolve()),
    update: jest.fn(() => Promise.resolve()),
    delete: jest.fn(() => Promise.resolve()),
    onSnapshot: jest.fn((callback) => {
      callback({ exists: () => false, data: () => null });
      return jest.fn();
    }),
  };

  const mockQuery = {
    onSnapshot: jest.fn((callback) => {
      callback({ docs: [] });
      return jest.fn();
    }),
  };

  return {
    __esModule: true,
    default: jest.fn(() => ({
      collection: mockCollection,
      doc: jest.fn(() => mockDocRef),
    })),
    collection: mockCollection,
    doc: jest.fn(() => mockDocRef),
    query: jest.fn(() => mockQuery),
    where: jest.fn(),
    orderBy: jest.fn(),
    limit: jest.fn(),
    startAfter: jest.fn(),
    onSnapshot: jest.fn((query, callback) => {
      callback({ docs: [] });
      return jest.fn();
    }),
    getDoc: jest.fn(() => Promise.resolve({ exists: () => false, data: () => null })),
    getDocs: jest.fn(() => Promise.resolve({ docs: [], empty: true })),
    addDoc: jest.fn(() => Promise.resolve({ id: 'mock-id' })),
    updateDoc: jest.fn(() => Promise.resolve()),
    deleteDoc: jest.fn(() => Promise.resolve()),
    setDoc: jest.fn(() => Promise.resolve()),
    serverTimestamp: jest.fn(() => new Date()),
    arrayUnion: jest.fn((value) => value),
    arrayRemove: jest.fn((value) => value),
    increment: jest.fn((value) => value),
    writeBatch: jest.fn(() => ({
      set: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      commit: jest.fn(() => Promise.resolve()),
    })),
    collectionGroup: jest.fn(() => mockQuery),
  };
});

jest.mock('@react-native-firebase/auth', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    currentUser: { uid: 'test-user-id', email: 'test@example.com' },
    onAuthStateChanged: jest.fn((callback) => {
      callback({ uid: 'test-user-id', email: 'test@example.com' });
      return jest.fn();
    }),
    signInWithCredential: jest.fn(() => Promise.resolve()),
    signOut: jest.fn(() => Promise.resolve()),
  })),
  getAuth: jest.fn(() => ({
    currentUser: { uid: 'test-user-id', email: 'test@example.com' },
  })),
}));

jest.mock('@react-native-firebase/storage', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    ref: jest.fn(() => ({
      putFile: jest.fn(() => Promise.resolve()),
      getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/image.jpg')),
      delete: jest.fn(() => Promise.resolve()),
    })),
    refFromURL: jest.fn(() => ({
      delete: jest.fn(() => Promise.resolve()),
    })),
  })),
}));

jest.mock('@react-native-firebase/messaging', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    getToken: jest.fn(() => Promise.resolve('mock-fcm-token')),
    onMessage: jest.fn(() => jest.fn()),
    onNotificationOpenedApp: jest.fn(() => jest.fn()),
    getInitialNotification: jest.fn(() => Promise.resolve(null)),
    requestPermission: jest.fn(() => Promise.resolve(1)),
  })),
}));

jest.mock('@react-native-firebase/analytics', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    logEvent: jest.fn(() => Promise.resolve()),
    setUserId: jest.fn(() => Promise.resolve()),
    setUserProperties: jest.fn(() => Promise.resolve()),
  })),
}));

jest.mock('@react-native-firebase/crashlytics', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    log: jest.fn(),
    recordError: jest.fn(),
    setUserId: jest.fn(() => Promise.resolve()),
  })),
}));

// React Native 모듈 모킹
jest.mock('react-native-gesture-handler', () => ({
  GestureHandlerRootView: ({ children }) => children,
  PanGestureHandler: 'PanGestureHandler',
  TapGestureHandler: 'TapGestureHandler',
  State: {},
  Directions: {},
}));

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }) => children,
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    setOptions: jest.fn(),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
  useIsFocused: () => true,
}));

// 콘솔 경고 무시 (테스트 출력 정리용)
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' &&
    (args[0].includes('Animated') ||
      args[0].includes('NativeModule') ||
      args[0].includes('Require cycle'))
  ) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};
