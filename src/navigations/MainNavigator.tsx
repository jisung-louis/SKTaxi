import React from 'react';
import { createBottomTabNavigator, BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, TaxiStackParamList, HomeStackParamList, NoticeStackParamList, BoardStackParamList, ChatStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { TaxiScreen } from '../screens/TaxiScreen';
import { BoardScreen } from '../screens/BoardScreen';
import { ProfileScreen } from '../screens/HomeTab/ProfileScreen';
import { NotificationScreen } from '../screens/HomeTab/NotificationScreen';
import { SettingScreen } from '../screens/HomeTab/SettingScreen';
import { ProfileEditScreen } from '../screens/HomeTab/SettingScreen/ProfileEditScreen';
import { AppNoticeScreen } from '../screens/HomeTab/SettingScreen/AppNoticeScreen';
import { AppNoticeDetailScreen } from '../screens/HomeTab/SettingScreen/AppNoticeDetailScreen';
import { AccountModificationScreen } from '../screens/HomeTab/SettingScreen/AccountModificationScreen';
import { NofiticationSettingScreen } from '../screens/HomeTab/SettingScreen/NofiticationSettingScreen';
import { InquiriesScreen } from '../screens/HomeTab/SettingScreen/InquiriesScreen';
import { TermsOfUseScreen } from '../screens/HomeTab/SettingScreen/TermsOfUseScreen';
import { PrivacyPolicyScreen } from '../screens/HomeTab/SettingScreen/PrivacyPolicyScreen';
import { CafeteriaDetailScreen } from '../screens/HomeTab/CafeteriaDetailScreen';
import { AcademicCalendarDetailScreen } from '../screens/HomeTab/AcademicCalendarDetailScreen';
import { TimetableDetailScreen } from '../screens/HomeTab/TimetableDetailScreen';
import { MinecraftDetailScreen } from '../screens/HomeTab/MinecraftDetailScreen';
import { MinecraftMapDetailScreen } from '../screens/HomeTab/MinecraftMapDetailScreen';
import { NoticeScreen } from '../screens/NoticeScreen';
import { AcceptancePendingScreen } from '../screens/TaxiTab/AcceptancePendingScreen';
import { RecruitScreen } from '../screens/TaxiTab/RecruitScreen';
import { ChatScreen } from '../screens/TaxiTab/ChatScreen';
import { MapSearchScreen } from '../screens/TaxiTab/MapSearchScreen';
import { COLORS } from '../constants/colors';
import { BOTTOM_TAB_BAR_HEIGHT } from '../constants/constants';
import { Animated, View, Linking, AppState, Text, Platform } from 'react-native';
import { getMessaging, hasPermission, requestPermission, AuthorizationStatus } from '@react-native-firebase/messaging';
import PermissionBubble from '../components/common/PermissionBubble';
import Icon from 'react-native-vector-icons/Ionicons';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import { TabBadge } from '../components/common/TabBadge';
import { Dot } from '../components/common/Dot';
import { useJoinRequestCount, JoinRequestProvider } from '../contexts/JoinRequestContext';
import { NoticeDetailScreen } from '../screens/NoticeTab/NoticeDetailScreen';
import NoticeDetailWebViewScreen from '../screens/NoticeTab/NoticeDetailWebViewScreen';
import { BoardDetailScreen } from '../screens/BoardTab/BoardDetailScreen';
import { BoardWriteScreen } from '../screens/BoardTab/BoardWriteScreen';
import { BoardEditScreen } from '../screens/BoardTab/BoardEditScreen';
import { ChatListScreen } from '../screens/ChatListScreen';
import { ChatDetailScreen } from '../screens/ChatTab/ChatDetailScreen';
import { useMyParty } from '../hooks/party';
import { TYPOGRAPHY } from '../constants/typhograpy';
import { useChatRooms } from '../hooks/chat';
import { useAuth } from '../hooks/auth';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getFirestore, collection, onSnapshot } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

const Tab = createBottomTabNavigator<MainTabParamList>();
const TaxiStack = createNativeStackNavigator<TaxiStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const NoticeStack = createNativeStackNavigator<NoticeStackParamList>();
const BoardStack = createNativeStackNavigator<BoardStackParamList>();
const ChatStack = createNativeStackNavigator<ChatStackParamList>();

const TaxiStackNavigator = () => {
  return (
    <TaxiStack.Navigator screenOptions={{ headerShown: false }}>
      <TaxiStack.Screen name="TaxiMain" component={TaxiScreen} />
      <TaxiStack.Screen name="AcceptancePending" component={AcceptancePendingScreen} />
      <TaxiStack.Screen name="Chat" component={ChatScreen} />
      <TaxiStack.Screen name="Recruit" component={RecruitScreen} />
      <TaxiStack.Screen name="MapSearch" component={MapSearchScreen} />
    </TaxiStack.Navigator>
  );
};

const HomeStackNavigator = () => {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="Notification" component={NotificationScreen} />
      <HomeStack.Screen name="Setting" component={SettingScreen} />
      <HomeStack.Screen name="Profile" component={ProfileScreen} />
      <HomeStack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <HomeStack.Screen name="AppNotice" component={AppNoticeScreen} />
      <HomeStack.Screen name="AppNoticeDetail" component={AppNoticeDetailScreen} />
      <HomeStack.Screen name="AccountModification" component={AccountModificationScreen} />
      <HomeStack.Screen name="NotificationSetting" component={NofiticationSettingScreen} />
      <HomeStack.Screen name="Inquiries" component={InquiriesScreen} />
      <HomeStack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
      <HomeStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <HomeStack.Screen name="CafeteriaDetail" component={CafeteriaDetailScreen} />
      <HomeStack.Screen name="AcademicCalendarDetail" component={AcademicCalendarDetailScreen} />
      <HomeStack.Screen name="TimetableDetail" component={TimetableDetailScreen} />
      <HomeStack.Screen name="MinecraftDetail" component={MinecraftDetailScreen} />
      <HomeStack.Screen name="MinecraftMapDetail" component={MinecraftMapDetailScreen} />
    </HomeStack.Navigator>
  );
};

const NoticeStackNavigator = () => {
  return (
    <NoticeStack.Navigator screenOptions={{ headerShown: false }}>
      <NoticeStack.Screen name="NoticeMain" component={NoticeScreen} />
      <NoticeStack.Screen name="NoticeDetail" component={NoticeDetailScreen} />
      <NoticeStack.Screen name="NoticeDetailWebView" component={NoticeDetailWebViewScreen} />
    </NoticeStack.Navigator>
  );
};

const BoardStackNavigator = () => {
  return (
    <BoardStack.Navigator screenOptions={{ headerShown: false }}>
      <BoardStack.Screen name="BoardMain" component={BoardScreen} />
      <BoardStack.Screen name="BoardDetail" component={BoardDetailScreen} />
      <BoardStack.Screen name="BoardWrite" component={BoardWriteScreen} />
      <BoardStack.Screen name="BoardEdit" component={BoardEditScreen} />
    </BoardStack.Navigator>
  );
};

const ChatStackNavigator = () => {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="ChatList" component={ChatListScreen} />
      <ChatStack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </ChatStack.Navigator>
  );
};

const MainNavigatorContent = () => {
  const { joinRequestCount } = useJoinRequestCount();
  const [bubbleVisible, setBubbleVisible] = React.useState(false);
  const [checking, setChecking] = React.useState(true);
  const { hasParty } = useMyParty();
  const { user } = useAuth();
  const [chatRoomStates, setChatRoomStates] = React.useState<{ [chatRoomId: string]: { lastReadAt?: any } }>({});
  const insets = useSafeAreaInsets();
  const bottomInset = React.useMemo(
    () => (Platform.OS === 'android' && insets.bottom === 0 ? 16 : insets.bottom),
    [insets.bottom],
  );
  // 모든 채팅방 조회 (안읽은 메시지 수 계산용)
  const { chatRooms: allChatRooms } = useChatRooms('all');
  const { chatRooms: customChatRooms } = useChatRooms('custom');

  // 내 방 읽음 상태(lastReadAt) 구독
  React.useEffect(() => {
    if (!user?.uid) {
      setChatRoomStates({});
      return;
    }

    const db = getFirestore();
    const statesRef = collection(db, 'users', user.uid, 'chatRoomStates');
    const unsubscribe = onSnapshot(
      statesRef,
      (snap) => {
        const next: { [chatRoomId: string]: { lastReadAt?: any } } = {};
        snap.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          next[docSnap.id] = docSnap.data() as any;
        });
        setChatRoomStates(next);
      },
      (error) => {
        console.error('채팅방 읽음 상태 구독 실패 (tab badge):', error);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);
  
  // 전체 안읽은 메시지 존재 여부 (있으면 1, 없으면 0)
  const totalUnreadCount = React.useMemo(() => {
    if (!user?.uid) return 0;

    const toMillis = (ts: any) => {
      try {
        if (!ts) return null;
        if ((ts as any).toMillis) return (ts as any).toMillis();
        if ((ts as any).toDate) return (ts as any).toDate().getTime();
        return new Date(ts as any).getTime();
      } catch {
        return null;
      }
    };

    // 모든 채팅방에서 내가 참가중인 채팅방만 필터링 (중복 제거)
    const roomMap = new Map<string, any>();
    [...allChatRooms, ...customChatRooms].forEach(room => {
      if (room.id && room.members?.includes(user.uid)) {
        roomMap.set(room.id, room);
      }
    });
    const myRooms = Array.from(roomMap.values());

    const hasUnread = myRooms.some((room) => {
      const lastMessageAt = room.lastMessage?.timestamp;
      const lastMessageMillis = toMillis(lastMessageAt);
      if (!lastMessageMillis) return false; // 메시지가 없으면 unread 아님

      const state = room.id ? chatRoomStates[room.id] : undefined;
      const lastReadMillis = toMillis(state?.lastReadAt);
      return lastReadMillis ? lastMessageMillis > lastReadMillis : true;
    });

    return hasUnread ? 1 : 0;
  }, [allChatRooms, customChatRooms, user?.uid, chatRoomStates]);
  React.useEffect(() => {
    let mounted = true;

    const checkPermission = async () => {
      try {
        if (Platform.OS === 'ios') {
          const messagingInstance = getMessaging();
          const status = await hasPermission(messagingInstance);
          const granted = status === AuthorizationStatus.AUTHORIZED;
          if (mounted) setBubbleVisible(!granted);
        } else {
          // Android: POST_NOTIFICATIONS 권한 확인 (API 33+)
          const androidVersion = typeof Platform.Version === 'number' ? Platform.Version : parseInt(Platform.Version, 10);
          if (androidVersion >= 33) {
            const { PermissionsAndroid } = require('react-native');
            const granted = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
            );
            if (mounted) setBubbleVisible(!granted);
          } else {
            // Android 12 이하는 자동 허용
            if (mounted) setBubbleVisible(false);
          }
        }
      } catch (error) {
        console.warn('알림 권한 확인 실패:', error);
        if (mounted) setBubbleVisible(true);
      } finally {
        if (mounted) setChecking(false);
      }
    };

    // 최초 1회 체크
    checkPermission();

    // 포그라운드 복귀 시 재체크
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkPermission();
      }
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const handleAllowNotification = React.useCallback(async () => {
    try {
      if (Platform.OS === 'ios') {
        const messagingInstance = getMessaging();
        const req = await requestPermission(messagingInstance);
        const ok = req === AuthorizationStatus.AUTHORIZED;
        if (ok) {
          setBubbleVisible(false);
          return;
        }
      } else {
        // Android: POST_NOTIFICATIONS 권한 요청 (API 33+)
        const androidVersion = typeof Platform.Version === 'number' ? Platform.Version : parseInt(Platform.Version, 10);
        if (androidVersion >= 33) {
          const { PermissionsAndroid } = require('react-native');
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
          );
          if (result === PermissionsAndroid.RESULTS.GRANTED) {
            setBubbleVisible(false);
            return;
          }
        } else {
          // Android 12 이하는 자동 허용
          setBubbleVisible(false);
          return;
        }
      }
      // 권한이 여전히 허용되지 않은 경우(이전에 거절로 더 이상 팝업이 안 뜨는 케이스 포함): 설정으로 이동
      try { await Linking.openSettings(); } catch {}
    } catch (error) {
      console.warn('알림 권한 요청 실패:', error);
      // 요청 자체가 실패한 경우에도 설정으로 이동 시도
      try { await Linking.openSettings(); } catch {}
    }
  }, []);

  return (
    <>
      <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.background.primary,
          borderTopColor: COLORS.border.dark,
          backfaceVisibility: 'hidden',
          borderCurve: 'circular',
          height: BOTTOM_TAB_BAR_HEIGHT,
          paddingTop: 8,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: COLORS.accent.green,
        tabBarInactiveTintColor: COLORS.text.secondary,
        tabBarItemStyle: {
          gap: 12,
        },
        headerShown: false,
        lazy: false,
      }}
      initialRouteName="홈"
    >
      <Tab.Screen 
        name="홈" 
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} style={{ marginBottom: 4 }} />
          ),
          lazy: false,
        }}
      />
      <Tab.Screen 
        name="택시" 
        component={TaxiStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <IconMaterial name="taxi" size={size} color={color} style={{ marginBottom: 4 }} />
              <TabBadge count={joinRequestCount} location="bottom" size="small" />
              {/* 파티 소속중일경우 여기에 absolute로 표시하는 뷰 띄우기 */}
              {hasParty && (
                <View style={{ position: 'absolute', top: 0, right: -8, backgroundColor: COLORS.accent.green, borderRadius: 10, padding: 2, borderWidth: 1, borderColor: COLORS.border.default }}>
                  <Text style={{ color: COLORS.text.buttonText, ...TYPOGRAPHY.caption3, fontWeight: 'bold' }}>파티</Text>
                </View>
              )}
            </View>
          ),
          // tabBarStyle: { display: 'none' } // 택시 화면에서 탭바 숨기기
        }}
      />
      <Tab.Screen 
        name="공지" 
        component={NoticeStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="notifications-outline" size={size} color={color} style={{ marginBottom: 4 }} />
          ),
          lazy: false,
        }}
      />
      <Tab.Screen 
        name="게시판" 
        component={BoardStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            // <Icon name="chatbubbles-outline" size={size} color={color} style={{ marginBottom: 4 }} />
            <IconMaterial name="note-text" size={size} color={color} style={{ marginBottom: 4 }} />
          ),
          lazy: false,
        }}
      />
      <Tab.Screen 
        name="채팅" 
        component={ChatStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => (
            <View style={{ position: 'relative' }}>
              <Icon name="chatbubbles-outline" size={size} color={color} style={{ marginBottom: 4 }} />
              <Dot
                visible={totalUnreadCount > 0}
                size="small"
                style={{ position: 'absolute', right: -6, bottom: -2 }}
              />
            </View>
          ),
          lazy: false,
        }}
      />
      </Tab.Navigator>
      {!checking && (
        <PermissionBubble
          visible={bubbleVisible}
          onAllowNotification={handleAllowNotification}
          onClose={() => setBubbleVisible(false)}
        />
      )}
    </>
  );
}; 

// 자연스러운 페이드/슬라이드 애니메이션으로 탭바를 숨기는 커스텀 탭바
const AnimatedTabBar = (props: BottomTabBarProps) => {
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;

  // 탭별로 숨길 내부 스택 스크린 이름들
  const HIDDEN_BOTTOM_NAV_SCREENS: Record<string, string[]> = {
    '택시': ['Recruit', 'MapSearch', 'Chat'],
    '홈': ['Notification', 'Setting', 'Profile', 'ProfileEdit', 
      'AppNotice', 'AppNoticeDetail', 'AccountModification', 'NotificationSetting', 'Inquiries', 'TermsOfUse', 'PrivacyPolicy', 
      'CafeteriaDetail', 'AcademicCalendarDetail', 'TimetableDetail', 'MinecraftDetail', 'MinecraftMapDetail'],
    '게시판': ['BoardDetail', 'BoardWrite', 'BoardEdit'],
    '공지': ['NoticeDetail', 'NoticeDetailWebView'],
    '채팅': ['ChatDetail'],
  };

  const shouldHide = React.useMemo(() => {
    const currentRoute = props.state.routes[props.state.index];
    const tabName = currentRoute.name;
    // @ts-ignore route may be a NavigationState
    const focusedChildName = getFocusedRouteNameFromRoute(currentRoute) ?? 'UNKNOWN';
    const hiddenList = HIDDEN_BOTTOM_NAV_SCREENS[tabName] || [];
    return hiddenList.includes(focusedChildName);
  }, [props.state]);

  React.useEffect(() => {
    if (shouldHide) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 100, duration: 220, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    }
  }, [shouldHide, fadeAnim, translateY]);

  return (
    <Animated.View
      pointerEvents={shouldHide ? 'none' : 'auto'}
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        elevation: 1000,
        opacity: fadeAnim,
        transform: [{ translateY }],
      }}
    >
      <BottomTabBar {...props} />
    </Animated.View>
  );
};

export const MainNavigator = () => {
  return (
    <JoinRequestProvider>
      <MainNavigatorContent />
    </JoinRequestProvider>
  );
};