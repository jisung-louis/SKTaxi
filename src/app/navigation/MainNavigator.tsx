import React from 'react';
import {
  createBottomTabNavigator,
  type BottomTabBarProps,
} from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Animated, StyleSheet } from 'react-native';

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
import { CampusScreen } from '@/features/campus/screens/CampusScreen';
import {
  ChatDetailScreen,
  ChatListScreen,
  useCommunityTabUnreadIndicator,
} from '@/features/chat';
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
import PermissionBubble from '@/shared/ui/PermissionBubble';

import { V2BottomTabBar } from './components/V2BottomTabBar';
import {
  MainTabParamList,
  CampusStackParamList,
  CommunityStackParamList,
  NoticeStackParamList,
} from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const TaxiStack = createNativeStackNavigator<TaxiStackParamList>();
const CampusStack = createNativeStackNavigator<CampusStackParamList>();
const NoticeStack = createNativeStackNavigator<NoticeStackParamList>();
const CommunityStack = createNativeStackNavigator<CommunityStackParamList>();

const MAIN_TAB_LABELS: Record<keyof MainTabParamList, string> = {
  CampusTab: '캠퍼스',
  TaxiTab: '택시',
  NoticeTab: '공지',
  CommunityTab: '커뮤니티',
};

const HIDDEN_BOTTOM_NAV_SCREENS: Record<keyof MainTabParamList, string[]> = {
  TaxiTab: ['Recruit', 'MapSearch', 'Chat'],
  CampusTab: [
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
  NoticeTab: ['NoticeDetail', 'NoticeDetailWebView'],
  CommunityTab: ['BoardDetail', 'BoardWrite', 'BoardEdit', 'ChatDetail'],
};

type AnimatedTabBarProps = BottomTabBarProps & {
  hasCommunityUnread: boolean;
  hasTaxiParty: boolean;
  taxiJoinRequestCount: number;
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

const CampusStackNavigator = () => {
  return (
    <CampusStack.Navigator screenOptions={{ headerShown: false }}>
      <CampusStack.Screen name="CampusMain" component={CampusScreen} />
      <CampusStack.Screen name="Notification" component={NotificationScreen} />
      <CampusStack.Screen name="Setting" component={SettingScreen} />
      <CampusStack.Screen name="Profile" component={ProfileScreen} />
      <CampusStack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <CampusStack.Screen name="AppNotice" component={AppNoticeScreen} />
      <CampusStack.Screen
        name="AppNoticeDetail"
        component={AppNoticeDetailScreen}
      />
      <CampusStack.Screen
        name="AccountModification"
        component={AccountModificationScreen}
      />
      <CampusStack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
      />
      <CampusStack.Screen name="Inquiries" component={InquiriesScreen} />
      <CampusStack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
      <CampusStack.Screen
        name="PrivacyPolicy"
        component={PrivacyPolicyScreen}
      />
      <CampusStack.Screen
        name="CafeteriaDetail"
        component={CafeteriaDetailScreen}
      />
      <CampusStack.Screen
        name="AcademicCalendarDetail"
        component={AcademicCalendarDetailScreen}
      />
      <CampusStack.Screen
        name="TimetableDetail"
        component={TimetableDetailScreen}
      />
      <CampusStack.Screen
        name="MinecraftDetail"
        component={MinecraftDetailScreen}
      />
      <CampusStack.Screen
        name="MinecraftMapDetail"
        component={MinecraftMapDetailScreen}
      />
    </CampusStack.Navigator>
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

const CommunityStackNavigator = () => {
  return (
    <CommunityStack.Navigator screenOptions={{ headerShown: false }}>
      <CommunityStack.Screen name="BoardMain" component={BoardScreen} />
      <CommunityStack.Screen
        name="BoardDetail"
        component={BoardDetailScreen}
      />
      <CommunityStack.Screen name="BoardWrite" component={BoardWriteScreen} />
      <CommunityStack.Screen name="BoardEdit" component={BoardEditScreen} />
      <CommunityStack.Screen name="ChatList" component={ChatListScreen} />
      <CommunityStack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </CommunityStack.Navigator>
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
  const { totalUnreadCount } = useCommunityTabUnreadIndicator();

  const renderAnimatedTabBar = React.useCallback(
    (props: BottomTabBarProps) => (
      <AnimatedTabBar
        {...props}
        hasCommunityUnread={totalUnreadCount > 0}
        hasTaxiParty={hasParty}
        taxiJoinRequestCount={joinRequestCount}
      />
    ),
    [hasParty, joinRequestCount, totalUnreadCount],
  );

  return (
    <>
      <Tab.Navigator
        tabBar={renderAnimatedTabBar}
        screenOptions={{
          headerShown: false,
          lazy: false,
        }}
        initialRouteName="CampusTab"
      >
        <Tab.Screen
          name="CampusTab"
          component={CampusStackNavigator}
          options={{
            tabBarLabel: MAIN_TAB_LABELS.CampusTab,
            lazy: false,
          }}
        />
        <Tab.Screen
          name="TaxiTab"
          component={TaxiStackNavigator}
          options={{
            tabBarLabel: MAIN_TAB_LABELS.TaxiTab,
          }}
        />
        <Tab.Screen
          name="NoticeTab"
          component={NoticeStackNavigator}
          options={{
            tabBarLabel: MAIN_TAB_LABELS.NoticeTab,
            lazy: false,
          }}
        />
        <Tab.Screen
          name="CommunityTab"
          component={CommunityStackNavigator}
          options={{
            tabBarLabel: MAIN_TAB_LABELS.CommunityTab,
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

const AnimatedTabBar = (props: AnimatedTabBarProps) => {
  const {
    hasCommunityUnread,
    hasTaxiParty,
    taxiJoinRequestCount,
    ...tabBarProps
  } = props as AnimatedTabBarProps;
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;

  const shouldHide = React.useMemo(() => {
    const currentRoute = tabBarProps.state.routes[tabBarProps.state.index];
    const tabName = currentRoute.name as keyof MainTabParamList;
    const focusedChildName =
      getFocusedRouteNameFromRoute(currentRoute) ?? 'UNKNOWN';
    const hiddenList = HIDDEN_BOTTOM_NAV_SCREENS[tabName] || [];
    return hiddenList.includes(focusedChildName);
  }, [tabBarProps.state]);

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
      <V2BottomTabBar
        {...tabBarProps}
        hasCommunityUnread={hasCommunityUnread}
        hasTaxiParty={hasTaxiParty}
        taxiJoinRequestCount={taxiJoinRequestCount}
      />
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
});
