import React from 'react';
import { createBottomTabNavigator, BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  AcademicCalendarDetailScreen,
  CafeteriaDetailScreen,
} from '@/features/campus';
import {
  BoardDetailScreen,
  BoardEditScreen,
  BoardScreen,
  BoardWriteScreen,
} from '@/features/board';
import {
  AccountModificationScreen,
  NotificationSettingsScreen,
  ProfileEditScreen,
  ProfileScreen,
} from '@/features/user';
import {
  ChatDetailScreen,
  ChatListScreen,
  useChatTabUnreadIndicator,
} from '@/features/chat';
import {
  NoticeDetailScreen,
  NoticeDetailWebViewScreen,
  NoticeScreen,
} from '@/features/notice';
import {
  AppNoticeDetailScreen,
  AppNoticeScreen,
  InquiriesScreen,
  PrivacyPolicyScreen,
  SettingScreen,
  TermsOfUseScreen,
} from '@/features/settings';
import {
  MinecraftDetailScreen,
  MinecraftMapDetailScreen,
} from '@/features/minecraft';
import {
  AcceptancePendingScreen,
  ChatScreen,
  JoinRequestProvider,
  MapSearchScreen,
  RecruitScreen,
  TaxiScreen,
  useJoinRequestCount,
  useMyParty,
} from '@/features/taxi';
import { TimetableDetailScreen } from '@/features/timetable';
import { MainTabParamList, TaxiStackParamList, HomeStackParamList, NoticeStackParamList, BoardStackParamList, ChatStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { NotificationScreen } from '../screens/HomeTab/NotificationScreen';
import { COLORS } from '../constants/colors';
import { BOTTOM_TAB_BAR_HEIGHT } from '../constants/constants';
import { Animated, View, Linking, AppState, Text, Platform } from 'react-native';
import { getMessaging, hasPermission, requestPermission, AuthorizationStatus } from '@react-native-firebase/messaging';
import PermissionBubble from '../components/common/PermissionBubble';
import Icon from 'react-native-vector-icons/Ionicons';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import { TabBadge } from '../components/common/TabBadge';
import { Dot } from '../components/common/Dot';
import { TYPOGRAPHY } from '../constants/typhograpy';

const Tab = createBottomTabNavigator<MainTabParamList>();
const TaxiStack = createNativeStackNavigator<TaxiStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const NoticeStack = createNativeStackNavigator<NoticeStackParamList>();
const BoardStack = createNativeStackNavigator<BoardStackParamList>();
const ChatStack = createNativeStackNavigator<ChatStackParamList>();

const HIDDEN_BOTTOM_NAV_SCREENS: Record<string, string[]> = {
  '택시': ['Recruit', 'MapSearch', 'Chat'],
  '홈': ['Notification', 'Setting', 'Profile', 'ProfileEdit',
    'AppNotice', 'AppNoticeDetail', 'AccountModification', 'NotificationSetting', 'Inquiries', 'TermsOfUse', 'PrivacyPolicy',
    'CafeteriaDetail', 'AcademicCalendarDetail', 'TimetableDetail', 'MinecraftDetail', 'MinecraftMapDetail'],
  '게시판': ['BoardDetail', 'BoardWrite', 'BoardEdit'],
  '공지': ['NoticeDetail', 'NoticeDetailWebView'],
  '채팅': ['ChatDetail'],
};

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
      <HomeStack.Screen name="NotificationSetting" component={NotificationSettingsScreen} />
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
  const { totalUnreadCount } = useChatTabUnreadIndicator();
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
