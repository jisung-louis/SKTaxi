import React from 'react';
import { createBottomTabNavigator, BottomTabBar, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabParamList, TaxiStackParamList, HomeStackParamList } from './types';
import { HomeScreen } from '../screens/HomeScreen';
import { TaxiScreen } from '../screens/TaxiScreen';
import { BoardScreen } from '../screens/BoardScreen';
import { ProfileScreen } from '../screens/HomeTab/ProfileScreen';
import { NotificationScreen } from '../screens/HomeTab/NotificationScreen';
import { SettingScreen } from '../screens/HomeTab/SettingScreen';
import { ProfileEditScreen } from '../screens/HomeTab/SettingScreen/ProfileEditScreen';
import { AppNoticeScreen } from '../screens/HomeTab/SettingScreen/AppNoticeScreen';
import { AccountModificationScreen } from '../screens/HomeTab/SettingScreen/AccountModificationScreen';
import { NofiticationSettingScreen } from '../screens/HomeTab/SettingScreen/NofiticationSettingScreen';
import { InquiriesScreen } from '../screens/HomeTab/SettingScreen/InquiriesScreen';
import { TermsOfUseScreen } from '../screens/HomeTab/SettingScreen/TermsOfUseScreen';
import { PrivacyPolicyScreen } from '../screens/HomeTab/SettingScreen/PrivacyPolicyScreen';
import { NoticeScreen } from '../screens/NoticeScreen';
import { AcceptancePendingScreen } from '../screens/TaxiTab/AcceptancePendingScreen';
import { RecruitScreen } from '../screens/TaxiTab/RecruitScreen';
import { ChatScreen } from '../screens/TaxiTab/ChatScreen';
import { MapSearchScreen } from '../screens/TaxiTab/MapSearchScreen';
import { COLORS } from '../constants/colors';
import { BOTTOM_TAB_BAR_HEIGHT } from '../constants/constants';
import Icon from 'react-native-vector-icons/Ionicons';
import { Animated } from 'react-native';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';

const Tab = createBottomTabNavigator<MainTabParamList>();
const TaxiStack = createNativeStackNavigator<TaxiStackParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();

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
      <HomeStack.Screen name="AccountModification" component={AccountModificationScreen} />
      <HomeStack.Screen name="NotificationSetting" component={NofiticationSettingScreen} />
      <HomeStack.Screen name="Inquiries" component={InquiriesScreen} />
      <HomeStack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
      <HomeStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </HomeStack.Navigator>
  );
};

export const MainNavigator = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <AnimatedTabBar {...props} />}
      screenOptions={{
        tabBarStyle: {
          backgroundColor: COLORS.background.primary,
          borderTopColor: COLORS.border.default,
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
            <IconMaterial name="taxi" size={size} color={color} style={{ marginBottom: 4 }} />
          ),
          // tabBarStyle: { display: 'none' } // 택시 화면에서 탭바 숨기기
        }}
      />
      <Tab.Screen 
        name="게시판" 
        component={BoardScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="chatbubbles-outline" size={size} color={color} style={{ marginBottom: 4 }} />
          ),
          lazy: false,
        }}
      />
      <Tab.Screen 
        name="공지" 
        component={NoticeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Icon name="notifications-outline" size={size} color={color} style={{ marginBottom: 4 }} />
          ),
          lazy: false,
        }}
      />
    </Tab.Navigator>
  );
}; 

// 자연스러운 페이드/슬라이드 애니메이션으로 탭바를 숨기는 커스텀 탭바
const AnimatedTabBar = (props: BottomTabBarProps) => {
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;

  // 탭별로 숨길 내부 스택 스크린 이름들
  const HIDDEN_BOTTOM_NAV_SCREENS: Record<string, string[]> = {
    '택시': ['Recruit', 'MapSearch', 'Chat'],
    '홈': ['Notification', 'Setting', 'Profile', 'ProfileEdit', 'AppNotice', 'AccountModification', 'NotificationSetting', 'Inquiries', 'TermsOfUse', 'PrivacyPolicy'],
    '게시판': [],
    '공지': [],
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