import React from 'react';
import {
  createBottomTabNavigator,
  BottomTabBar,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Animated, StyleSheet, Text, View } from 'react-native';
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

const MAIN_TAB_LABELS: Record<keyof MainTabParamList, string> = {
  HomeTab: '홈',
  TaxiTab: '택시',
  NoticeTab: '공지',
  BoardTab: '게시판',
  ChatTab: '채팅',
};

const HIDDEN_BOTTOM_NAV_SCREENS: Record<keyof MainTabParamList, string[]> = {
  TaxiTab: ['Recruit', 'MapSearch', 'Chat'],
  HomeTab: [
    'Notification',
    'Setting',
    'Profile',
    'ProfileEdit',
    'AppNotice',
    'AppNoticeDetail',
    'AccountModification',
    'NotificationSettings',
    'Inquiries',
    'TermsOfUse',
    'PrivacyPolicy',
    'CafeteriaDetail',
    'AcademicCalendarDetail',
    'TimetableDetail',
    'MinecraftDetail',
    'MinecraftMapDetail',
  ],
  BoardTab: ['BoardDetail', 'BoardWrite', 'BoardEdit'],
  NoticeTab: ['NoticeDetail', 'NoticeDetailWebView'],
  ChatTab: ['ChatDetail'],
};

const renderAnimatedTabBar = (props: BottomTabBarProps) => (
  <AnimatedTabBar {...props} />
);

const renderHomeTabIcon = ({
  color,
  size,
}: {
  color: string;
  size: number;
}) => (
  <Icon
    name="home-outline"
    size={size}
    color={color}
    style={styles.tabIcon}
  />
);

const renderNoticeTabIcon = ({
  color,
  size,
}: {
  color: string;
  size: number;
}) => (
  <Icon
    name="notifications-outline"
    size={size}
    color={color}
    style={styles.tabIcon}
  />
);

const renderBoardTabIcon = ({
  color,
  size,
}: {
  color: string;
  size: number;
}) => (
  <IconMaterial
    name="note-text"
    size={size}
    color={color}
    style={styles.tabIcon}
  />
);

const TaxiTabIcon = ({
  color,
  hasParty,
  joinRequestCount,
  size,
}: {
  color: string;
  hasParty: boolean;
  joinRequestCount: number;
  size: number;
}) => {
  return (
    <View style={styles.iconContainer}>
      <IconMaterial
        name="taxi"
        size={size}
        color={color}
        style={styles.tabIcon}
      />
      <TabBadge
        count={joinRequestCount}
        location="bottom"
        size="small"
      />
      {hasParty && (
        <View style={styles.partyBadge}>
          <Text style={styles.partyBadgeText}>파티</Text>
        </View>
      )}
    </View>
  );
};

const ChatTabIcon = ({
  color,
  hasUnread,
  size,
}: {
  color: string;
  hasUnread: boolean;
  size: number;
}) => {
  return (
    <View style={styles.iconContainer}>
      <Icon
        name="chatbubbles-outline"
        size={size}
        color={color}
        style={styles.tabIcon}
      />
      <Dot
        visible={hasUnread}
        size="small"
        style={styles.chatUnreadDot}
      />
    </View>
  );
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
        name="NotificationSettings"
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
  const renderTaxiTabBarIcon = React.useCallback(
    ({ color, size }: { color: string; size: number }) => (
      <TaxiTabIcon
        color={color}
        hasParty={hasParty}
        joinRequestCount={joinRequestCount}
        size={size}
      />
    ),
    [hasParty, joinRequestCount],
  );
  const renderChatTabBarIcon = React.useCallback(
    ({ color, size }: { color: string; size: number }) => (
      <ChatTabIcon
        color={color}
        hasUnread={totalUnreadCount > 0}
        size={size}
      />
    ),
    [totalUnreadCount],
  );

  return (
    <>
      <Tab.Navigator
        tabBar={renderAnimatedTabBar}
        screenOptions={{
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: COLORS.accent.green,
          tabBarInactiveTintColor: COLORS.text.secondary,
          tabBarItemStyle: styles.tabBarItem,
          headerShown: false,
          lazy: false,
        }}
        initialRouteName="HomeTab"
      >
        <Tab.Screen
          name="HomeTab"
          component={HomeStackNavigator}
          options={{
            tabBarLabel: MAIN_TAB_LABELS.HomeTab,
            tabBarIcon: renderHomeTabIcon,
            lazy: false,
          }}
        />
        <Tab.Screen
          name="TaxiTab"
          component={TaxiStackNavigator}
          options={{
            tabBarLabel: MAIN_TAB_LABELS.TaxiTab,
            tabBarIcon: renderTaxiTabBarIcon,
          }}
        />
        <Tab.Screen
          name="NoticeTab"
          component={NoticeStackNavigator}
          options={{
            tabBarLabel: MAIN_TAB_LABELS.NoticeTab,
            tabBarIcon: renderNoticeTabIcon,
            lazy: false,
          }}
        />
        <Tab.Screen
          name="BoardTab"
          component={BoardStackNavigator}
          options={{
            tabBarLabel: MAIN_TAB_LABELS.BoardTab,
            tabBarIcon: renderBoardTabIcon,
            lazy: false,
          }}
        />
        <Tab.Screen
          name="ChatTab"
          component={ChatStackNavigator}
          options={{
            tabBarLabel: MAIN_TAB_LABELS.ChatTab,
            tabBarIcon: renderChatTabBarIcon,
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
    const tabName = currentRoute.name as keyof MainTabParamList;
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
      style={[
        styles.animatedTabBarContainer,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
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

const styles = StyleSheet.create({
  animatedTabBarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    elevation: 1000,
  },
  chatUnreadDot: {
    position: 'absolute',
    right: -6,
    bottom: -2,
  },
  iconContainer: {
    position: 'relative',
  },
  partyBadge: {
    position: 'absolute',
    top: 0,
    right: -8,
    backgroundColor: COLORS.accent.green,
    borderRadius: 10,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  partyBadgeText: {
    color: COLORS.text.buttonText,
    ...TYPOGRAPHY.caption3,
    fontWeight: '700',
  },
  tabBar: {
    backgroundColor: COLORS.background.primary,
    borderTopColor: COLORS.border.dark,
    backfaceVisibility: 'hidden',
    borderCurve: 'circular',
    height: BOTTOM_TAB_BAR_HEIGHT,
    paddingTop: 8,
    paddingBottom: 8,
  },
  tabBarItem: {
    gap: 12,
  },
  tabIcon: {
    marginBottom: 4,
  },
});
