// SKTaxi: API 엔드포인트 상수 - Spring 마이그레이션 시 사용
// 현재는 정의만, 추후 Spring 백엔드 연동 시 실제 URL로 교체

/**
 * API 기본 URL
 * 환경변수로 관리 권장
 */
export const API_BASE_URL = process.env.API_BASE_URL || 'https://api.skuri-taxi.com';

/**
 * WebSocket 기본 URL
 */
export const WS_BASE_URL = process.env.WS_BASE_URL || 'wss://api.skuri-taxi.com/ws';

/**
 * API 엔드포인트 상수
 * Spring 백엔드 마이그레이션 시 이 상수들을 사용
 */
export const API_ENDPOINTS = {
  // 인증
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    PROFILE: '/api/auth/profile',
  },

  // 파티 (택시 동승)
  PARTIES: {
    BASE: '/api/parties',
    BY_ID: (id: string) => `/api/parties/${id}`,
    MEMBERS: (id: string) => `/api/parties/${id}/members`,
    JOIN_REQUESTS: (id: string) => `/api/parties/${id}/join-requests`,
    MESSAGES: (id: string) => `/api/parties/${id}/messages`,
  },

  // 동승 요청
  JOIN_REQUESTS: {
    BASE: '/api/join-requests',
    BY_ID: (id: string) => `/api/join-requests/${id}`,
    ACCEPT: (id: string) => `/api/join-requests/${id}/accept`,
    DECLINE: (id: string) => `/api/join-requests/${id}/decline`,
    CANCEL: (id: string) => `/api/join-requests/${id}/cancel`,
  },

  // 채팅방 (공개 채팅)
  CHAT_ROOMS: {
    BASE: '/api/chat-rooms',
    BY_ID: (id: string) => `/api/chat-rooms/${id}`,
    MESSAGES: (id: string) => `/api/chat-rooms/${id}/messages`,
    JOIN: (id: string) => `/api/chat-rooms/${id}/join`,
    LEAVE: (id: string) => `/api/chat-rooms/${id}/leave`,
  },

  // 게시판
  BOARD: {
    POSTS: '/api/board/posts',
    POST_BY_ID: (id: string) => `/api/board/posts/${id}`,
    COMMENTS: (postId: string) => `/api/board/posts/${postId}/comments`,
    LIKE: (postId: string) => `/api/board/posts/${postId}/like`,
    BOOKMARK: (postId: string) => `/api/board/posts/${postId}/bookmark`,
  },

  // 공지사항
  NOTICES: {
    BASE: '/api/notices',
    BY_ID: (id: string) => `/api/notices/${id}`,
    COMMENTS: (noticeId: string) => `/api/notices/${noticeId}/comments`,
    READ: (noticeId: string) => `/api/notices/${noticeId}/read`,
  },

  // 사용자
  USERS: {
    BASE: '/api/users',
    BY_ID: (id: string) => `/api/users/${id}`,
    PROFILE: '/api/users/me',
    NOTIFICATIONS: '/api/users/me/notifications',
    BOOKMARKS: '/api/users/me/bookmarks',
    FCM_TOKEN: '/api/users/me/fcm-token',
  },

  // 설정
  SETTINGS: {
    ACADEMIC_SCHEDULES: '/api/settings/academic-schedules',
    CAFETERIA_MENU: '/api/settings/cafeteria-menu',
    COURSES: '/api/settings/courses',
    APP_VERSION: '/api/settings/app-version',
    APP_NOTICES: '/api/settings/app-notices',
  },

  // 기타
  INQUIRIES: '/api/inquiries',
  REPORTS: '/api/reports',
} as const;

/**
 * WebSocket 채널 상수
 */
export const WS_CHANNELS = {
  // 파티 관련
  PARTIES: '/ws/parties',
  PARTY: (id: string) => `/ws/parties/${id}`,
  PARTY_MESSAGES: (id: string) => `/ws/parties/${id}/messages`,

  // 채팅방 관련
  CHAT_ROOMS: '/ws/chat-rooms',
  CHAT_ROOM: (id: string) => `/ws/chat-rooms/${id}`,
  CHAT_ROOM_MESSAGES: (id: string) => `/ws/chat-rooms/${id}/messages`,

  // 알림
  NOTIFICATIONS: '/ws/notifications',

  // 공지사항
  NOTICES: '/ws/notices',
} as const;
