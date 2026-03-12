import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabBar,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Animated, Text, View } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';

import { useNotificationPermissionBubble } from '@/app/bootstrap/useNotificationPermissionBubble';
import {
  BoardDetailScreen,
  BoardEditScreen,
  BoardScreen,
  BoardWriteScreen,
} from '@/features/board';
import {
  AcademicCalendarDetailScreen,
  CafeteriaDetailScreen,
} from '@/features/campus';
import {
  ChatDetailScreen,
  ChatListScreen,
  useChatTabUnreadIndicator,
} from '@/features/chat';
import { HomeScreen } from '@/features/home';
import {
  MinecraftDetailScreen,
  MinecraftMapDetailScreen,
} from '@/features/minecraft';
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
  AcceptancePendingScreen,
  ChatScreen,
  JoinRequestProvider,
  MapSearchScreen,
  RecruitScreen,
  TaxiScreen,
  type TaxiStackParamList,
  useJoinRequestCount,
  useMyParty,
} from '@/features/taxi';
import { TimetableDetailScreen } from '@/features/timetable';
import {
  AccountModificationScreen,
  NotificationScreen,
  NotificationSettingsScreen,
  ProfileEditScreen,
  ProfileScreen,
} from '@/features/user';
import { COLORS } from '@/shared/constants/colors';
import { BOTTOM_TAB_BAR_HEIGHT } from '@/shared/constants/layout';
import { TYPOGRAPHY } from '@/shared/constants/typography';
import { Dot } from '@/shared/ui/Dot';
import PermissionBubble from '@/shared/ui/PermissionBubble';
import { TabBadge } from '@/shared/ui/TabBadge';

import {
  MainTabParamList,
  HomeStackParamList,
  NoticeStackParamList,
  BoardStackParamList,
  ChatStackParamList,
} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const TaxiStack = createNativeStackNavigator<TaxiStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const NoticeStack = createNativeStackNavigator<NoticeStackParamList>();
const BoardStack = createNativeStackNavigator<BoardStackParamList>();
const ChatStack = createNativeStackNavigator<ChatStackParamList>();

const HIDDEN_BOTTOM_NAV_SCREENS: Record<string, string[]> = {
  '택시': ['Recruit', 'MapSearch', 'Chat'],
  '홈': [
    'Notification',
    'Setting',
    'Profile',
    'ProfileEdit',
    'AppNotice',
    'AppNoticeDetail',
    'AccountModification',
    'NotificationSetting',
    'Inquiries',
    'TermsOfUse',
    'PrivacyPolicy',
    'CafeteriaDetail',
    'AcademicCalendarDetail',
    'TimetableDetail',
    'MinecraftDetail',
    'MinecraftMapDetail',
  ],
  '게시판': ['BoardDetail', 'BoardWrite', 'BoardEdit'],
  '공지': ['NoticeDetail', 'NoticeDetailWebView'],
  '채팅': ['ChatDetail'],
};

const TaxiStackNavigator = () => {
  return (
    <TaxiStack.Navigator screenOptions={{ headerShown: false }}>
      <TaxiStack.Screen name="TaxiMain" component={TaxiScreen} />
      <TaxiStack.Screen
        name="AcceptancePending"
        component={AcceptancePendingScreen}
      />
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
      <HomeStack.Screen
        name="AppNoticeDetail"
        component={AppNoticeDetailScreen}
      />
      <HomeStack.Screen
        name="AccountModification"
        component={AccountModificationScreen}
      />
      <HomeStack.Screen
        name="NotificationSetting"
        component={NotificationSettingsScreen}
      />
      <HomeStack.Screen name="Inquiries" component={InquiriesScreen} />
      <HomeStack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
      <HomeStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <HomeStack.Screen
        name="CafeteriaDetail"
        component={CafeteriaDetailScreen}
      />
      <HomeStack.Screen
        name="AcademicCalendarDetail"
        component={AcademicCalendarDetailScreen}
      />
      <HomeStack.Screen
        name="TimetableDetail"
        component={TimetableDetailScreen}
      />
      <HomeStack.Screen
        name="MinecraftDetail"
        component={MinecraftDetailScreen}
      />
      <HomeStack.Screen
        name="MinecraftMapDetail"
        component={MinecraftMapDetailScreen}
      />
    </HomeStack.Navigator>
  );
};

const NoticeStackNavigator = () => {
  return (
    <NoticeStack.Navigator screenOptions={{ headerShown: false }}>
      <NoticeStack.Screen name="NoticeMain" component={NoticeScreen} />
      <NoticeStack.Screen name="NoticeDetail" component={NoticeDetailScreen} />
      <NoticeStack.Screen
        name="NoticeDetailWebView"
        component={NoticeDetailWebViewScreen}
      />
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
  const {
    bubbleVisible,
    checking,
    dismissBubble,
    allowNotification,
  } = useNotificationPermissionBubble();
  const { hasParty } = useMyParty();
  const { totalUnreadCount } = useChatTabUnreadIndicator();

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
              <Icon
                name="home-outline"
                size={size}
                color={color}
                style={{ marginBottom: 4 }}
              />
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
                <IconMaterial
                  name="taxi"
                  size={size}
                  color={color}
                  style={{ marginBottom: 4 }}
                />
                <TabBadge count={joinRequestCount} location="bottom" size="small" />
                {hasParty && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: -8,
                      backgroundColor: COLORS.accent.green,
                      borderRadius: 10,
                      padding: 2,
                      borderWidth: 1,
                      borderColor: COLORS.border.default,
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.text.buttonText,
                        ...TYPOGRAPHY.caption3,
                        fontWeight: 'bold',
                      }}
                    >
                      파티
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="공지"
          component={NoticeStackNavigator}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Icon
                name="notifications-outline"
                size={size}
                color={color}
                style={{ marginBottom: 4 }}
              />
            ),
            lazy: false,
          }}
        />
        <Tab.Screen
          name="게시판"
          component={BoardStackNavigator}
          options={{
            tabBarIcon: ({ color, size }) => (
              <IconMaterial
                name="note-text"
                size={size}
                color={color}
                style={{ marginBottom: 4 }}
              />
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
                <Icon
                  name="chatbubbles-outline"
                  size={size}
                  color={color}
                  style={{ marginBottom: 4 }}
                />
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
          onAllowNotification={allowNotification}
          onClose={dismissBubble}
        />
      )}
    </>
  );
};

const AnimatedTabBar = (props: BottomTabBarProps) => {
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;

  const shouldHide = React.useMemo(() => {
    const currentRoute = props.state.routes[props.state.index];
    const tabName = currentRoute.name;
    const focusedChildName =
      getFocusedRouteNameFromRoute(currentRoute) ?? 'UNKNOWN';
    const hiddenList = HIDDEN_BOTTOM_NAV_SCREENS[tabName] || [];
    return hiddenList.includes(focusedChildName);
  }, [props.state]);

  React.useEffect(() => {
    if (shouldHide) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 100,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
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
