import React from 'react';
import { Animated, AppState, Linking, Platform, Text, View } from 'react-native';
import { BottomTabBar, type BottomTabBarProps, createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import IconMaterial from 'react-native-vector-icons/MaterialCommunityIcons';
import { AuthorizationStatus, getMessaging, hasPermission, requestPermission } from '@react-native-firebase/messaging';
import { collection, getFirestore, onSnapshot } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  MainTabParamList,
  TaxiStackParamList,
  CampusStackParamList,
  NoticeStackParamList,
  CommunityStackParamList,
  MyStackParamList,
} from './types';
import { CampusShellScreen } from '../screens/CampusShellScreen';
import { TaxiShellScreen } from '../screens/TaxiShellScreen';
import { CommunityShellScreen } from '../screens/CommunityShellScreen';
import { MyShellScreen } from '../screens/MyShellScreen';
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
import { NoticeShellScreen } from '../screens/NoticeShellScreen';
import { AcceptancePendingScreen } from '../screens/TaxiTab/AcceptancePendingScreen';
import { RecruitScreen } from '../screens/TaxiTab/RecruitScreen';
import { ChatScreen } from '../screens/TaxiTab/ChatScreen';
import { MapSearchScreen } from '../screens/TaxiTab/MapSearchScreen';
import PermissionBubble from '../components/common/PermissionBubble';
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
import { useChatRooms } from '../hooks/chat';
import { useAuth } from '../hooks/auth';
import { BOTTOM_TAB_BAR_HEIGHT } from '../constants/constants';
import { v2Colors, v2Typography } from '../design-system';

const Tab = createBottomTabNavigator<MainTabParamList>();
const TaxiStack = createNativeStackNavigator<TaxiStackParamList>();
const CampusStack = createNativeStackNavigator<CampusStackParamList>();
const NoticeStack = createNativeStackNavigator<NoticeStackParamList>();
const CommunityStack = createNativeStackNavigator<CommunityStackParamList>();
const MyStack = createNativeStackNavigator<MyStackParamList>();

type MainTabRouteName = keyof MainTabParamList;

const DEFAULT_TAB_ROUTES: Record<MainTabRouteName, string> = {
  캠퍼스: 'CampusMain',
  택시: 'TaxiMain',
  공지: 'NoticeMain',
  커뮤니티: 'CommunityMain',
};

const HIDDEN_TAB_BAR_ROUTES: Record<MainTabRouteName, readonly string[]> = {
  캠퍼스: [
    'Notification',
    'Setting',
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
  택시: ['AcceptancePending', 'Recruit', 'MapSearch', 'Chat'],
  공지: ['NoticeDetail', 'NoticeDetailWebView'],
  커뮤니티: ['BoardDetail', 'BoardWrite', 'BoardEdit', 'ChatDetail'],
};

const TaxiStackNavigator = () => {
  return (
    <TaxiStack.Navigator screenOptions={{ headerShown: false }}>
      <TaxiStack.Screen name="TaxiMain" component={TaxiShellScreen} />
      <TaxiStack.Screen name="AcceptancePending" component={AcceptancePendingScreen} />
      <TaxiStack.Screen name="Chat" component={ChatScreen} />
      <TaxiStack.Screen name="Recruit" component={RecruitScreen} />
      <TaxiStack.Screen name="MapSearch" component={MapSearchScreen} />
    </TaxiStack.Navigator>
  );
};

const CampusStackNavigator = () => {
  return (
    <CampusStack.Navigator screenOptions={{ headerShown: false }}>
      <CampusStack.Screen name="CampusMain" component={CampusShellScreen} />
      <CampusStack.Screen name="Notification" component={NotificationScreen} />
      <CampusStack.Screen name="Setting" component={SettingScreen} />
      <CampusStack.Screen name="AppNotice" component={AppNoticeScreen} />
      <CampusStack.Screen name="AppNoticeDetail" component={AppNoticeDetailScreen} />
      <CampusStack.Screen name="AccountModification" component={AccountModificationScreen} />
      <CampusStack.Screen name="NotificationSetting" component={NofiticationSettingScreen} />
      <CampusStack.Screen name="Inquiries" component={InquiriesScreen} />
      <CampusStack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
      <CampusStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <CampusStack.Screen name="CafeteriaDetail" component={CafeteriaDetailScreen} />
      <CampusStack.Screen name="AcademicCalendarDetail" component={AcademicCalendarDetailScreen} />
      <CampusStack.Screen name="TimetableDetail" component={TimetableDetailScreen} />
      <CampusStack.Screen name="MinecraftDetail" component={MinecraftDetailScreen} />
      <CampusStack.Screen name="MinecraftMapDetail" component={MinecraftMapDetailScreen} />
    </CampusStack.Navigator>
  );
};

const NoticeStackNavigator = () => {
  return (
    <NoticeStack.Navigator screenOptions={{ headerShown: false }}>
      <NoticeStack.Screen name="NoticeMain" component={NoticeShellScreen} />
      <NoticeStack.Screen name="NoticeDetail" component={NoticeDetailScreen} />
      <NoticeStack.Screen name="NoticeDetailWebView" component={NoticeDetailWebViewScreen} />
    </NoticeStack.Navigator>
  );
};

const CommunityStackNavigator = () => {
  return (
    <CommunityStack.Navigator screenOptions={{ headerShown: false }}>
      <CommunityStack.Screen name="CommunityMain" component={CommunityShellScreen} />
      <CommunityStack.Screen name="CommunityChatList" component={ChatListScreen} />
      <CommunityStack.Screen name="BoardDetail" component={BoardDetailScreen} />
      <CommunityStack.Screen name="BoardWrite" component={BoardWriteScreen} />
      <CommunityStack.Screen name="BoardEdit" component={BoardEditScreen} />
      <CommunityStack.Screen name="ChatDetail" component={ChatDetailScreen} />
    </CommunityStack.Navigator>
  );
};

export const MyNavigator = () => {
  return (
    <MyStack.Navigator screenOptions={{ headerShown: false }}>
      <MyStack.Screen name="MyMain" component={MyShellScreen} />
      <MyStack.Screen name="Setting" component={SettingScreen} />
      <MyStack.Screen name="ProfileEdit" component={ProfileEditScreen} />
      <MyStack.Screen name="AppNotice" component={AppNoticeScreen} />
      <MyStack.Screen name="AppNoticeDetail" component={AppNoticeDetailScreen} />
      <MyStack.Screen name="AccountModification" component={AccountModificationScreen} />
      <MyStack.Screen name="NotificationSetting" component={NofiticationSettingScreen} />
      <MyStack.Screen name="Inquiries" component={InquiriesScreen} />
      <MyStack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
      <MyStack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
    </MyStack.Navigator>
  );
};

const AnimatedTabBar = (props: BottomTabBarProps) => {
  const fadeAnim = React.useRef(new Animated.Value(1)).current;
  const translateY = React.useRef(new Animated.Value(0)).current;

  const shouldHide = React.useMemo(() => {
    const currentRoute = props.state.routes[props.state.index];
    const tabName = currentRoute.name as MainTabRouteName;
    const focusedChildName =
      getFocusedRouteNameFromRoute(currentRoute) ?? DEFAULT_TAB_ROUTES[tabName];
    return HIDDEN_TAB_BAR_ROUTES[tabName].includes(focusedChildName);
  }, [props.state]);

  React.useEffect(() => {
    if (shouldHide) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 100, duration: 220, useNativeDriver: true }),
      ]).start();
      return;
    }

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, shouldHide, translateY]);

  return (
    <Animated.View
      pointerEvents={shouldHide ? 'none' : 'auto'}
      style={{
        bottom: 0,
        elevation: 1000,
        left: 0,
        opacity: fadeAnim,
        position: 'absolute',
        right: 0,
        transform: [{ translateY }],
        zIndex: 1000,
      }}
    >
      <BottomTabBar {...props} />
    </Animated.View>
  );
};

const MainNavigatorContent = () => {
  const { joinRequestCount } = useJoinRequestCount();
  const [bubbleVisible, setBubbleVisible] = React.useState(false);
  const [checking, setChecking] = React.useState(true);
  const { hasParty } = useMyParty();
  const { user } = useAuth();
  const [chatRoomStates, setChatRoomStates] = React.useState<Record<string, { lastReadAt?: unknown }>>({});
  const insets = useSafeAreaInsets();
  const bottomInset = React.useMemo(
    () => (Platform.OS === 'android' && insets.bottom === 0 ? 16 : insets.bottom),
    [insets.bottom],
  );
  const { chatRooms: allChatRooms } = useChatRooms('all');
  const { chatRooms: customChatRooms } = useChatRooms('custom');

  React.useEffect(() => {
    if (!user?.uid) {
      setChatRoomStates({});
      return;
    }

    const unsubscribe = onSnapshot(
      collection(getFirestore(), 'users', user.uid, 'chatRoomStates'),
      snap => {
        const next: Record<string, { lastReadAt?: unknown }> = {};
        snap.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
          next[docSnap.id] = docSnap.data() as { lastReadAt?: unknown };
        });
        setChatRoomStates(next);
      },
      error => {
        console.error('채팅방 읽음 상태 구독 실패 (community tab badge):', error);
      },
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const totalUnreadCount = React.useMemo(() => {
    if (!user?.uid) {
      return 0;
    }

    const toMillis = (value: unknown) => {
      try {
        if (!value) {
          return null;
        }
        if ((value as { toMillis?: () => number }).toMillis) {
          return (value as { toMillis: () => number }).toMillis();
        }
        if ((value as { toDate?: () => Date }).toDate) {
          return (value as { toDate: () => Date }).toDate().getTime();
        }
        return new Date(value as string | number | Date).getTime();
      } catch {
        return null;
      }
    };

    const roomMap = new Map<string, (typeof allChatRooms)[number]>();
    [...allChatRooms, ...customChatRooms].forEach(room => {
      if (room.id && room.members?.includes(user.uid)) {
        roomMap.set(room.id, room);
      }
    });

    return Array.from(roomMap.values()).some(room => {
      const lastMessageMillis = toMillis(room.lastMessage?.timestamp);
      if (!lastMessageMillis) {
        return false;
      }

      const lastReadMillis = toMillis(room.id ? chatRoomStates[room.id]?.lastReadAt : undefined);
      return lastReadMillis ? lastMessageMillis > lastReadMillis : true;
    })
      ? 1
      : 0;
  }, [allChatRooms, chatRoomStates, customChatRooms, user?.uid]);

  React.useEffect(() => {
    let mounted = true;

    const checkPermission = async () => {
      try {
        if (Platform.OS === 'ios') {
          const status = await hasPermission(getMessaging());
          if (mounted) {
            setBubbleVisible(status !== AuthorizationStatus.AUTHORIZED);
          }
        } else {
          const androidVersion =
            typeof Platform.Version === 'number'
              ? Platform.Version
              : parseInt(Platform.Version, 10);

          if (androidVersion >= 33) {
            const { PermissionsAndroid } = require('react-native');
            const granted = await PermissionsAndroid.check(
              PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
            );
            if (mounted) {
              setBubbleVisible(!granted);
            }
          } else if (mounted) {
            setBubbleVisible(false);
          }
        }
      } catch (error) {
        console.warn('알림 권한 확인 실패:', error);
        if (mounted) {
          setBubbleVisible(true);
        }
      } finally {
        if (mounted) {
          setChecking(false);
        }
      }
    };

    checkPermission();

    const sub = AppState.addEventListener('change', state => {
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
        const status = await requestPermission(getMessaging());
        if (status === AuthorizationStatus.AUTHORIZED) {
          setBubbleVisible(false);
          return;
        }
      } else {
        const androidVersion =
          typeof Platform.Version === 'number'
            ? Platform.Version
            : parseInt(Platform.Version, 10);

        if (androidVersion >= 33) {
          const { PermissionsAndroid } = require('react-native');
          const result = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
          if (result === PermissionsAndroid.RESULTS.GRANTED) {
            setBubbleVisible(false);
            return;
          }
        } else {
          setBubbleVisible(false);
          return;
        }
      }

      try {
        await Linking.openSettings();
      } catch {}
    } catch (error) {
      console.warn('알림 권한 요청 실패:', error);
      try {
        await Linking.openSettings();
      } catch {}
    }
  }, []);

  return (
    <>
      <Tab.Navigator
        initialRouteName="캠퍼스"
        screenOptions={{
          headerShown: false,
          lazy: false,
          tabBarActiveTintColor: v2Colors.accent.green.base,
          tabBarInactiveTintColor: v2Colors.text.quaternary,
          tabBarItemStyle: {
            gap: 4,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            ...v2Typography.tab.label,
          },
          tabBarStyle: {
            backgroundColor: v2Colors.bg.surface,
            borderTopColor: v2Colors.border.default,
            height: BOTTOM_TAB_BAR_HEIGHT,
            paddingBottom: Math.max(bottomInset, 8),
            paddingTop: 4,
          },
        }}
        tabBar={props => <AnimatedTabBar {...props} />}
      >
        <Tab.Screen
          component={CampusStackNavigator}
          name="캠퍼스"
          options={{
            lazy: false,
            tabBarIcon: ({ color, size }) => (
              <Icon name="home-outline" size={size} color={color} style={{ marginBottom: 2 }} />
            ),
          }}
        />
        <Tab.Screen
          component={TaxiStackNavigator}
          name="택시"
          options={{
            tabBarIcon: ({ color, size }) => (
              <View style={{ position: 'relative' }}>
                <IconMaterial name="taxi" size={size} color={color} style={{ marginBottom: 2 }} />
                <TabBadge count={joinRequestCount} location="bottom" size="small" />
                {hasParty ? (
                  <View
                    style={{
                      backgroundColor: v2Colors.accent.green.base,
                      borderColor: v2Colors.border.default,
                      borderRadius: 10,
                      borderWidth: 1,
                      padding: 2,
                      position: 'absolute',
                      right: -8,
                      top: 0,
                    }}
                  >
                    <Text
                      style={{
                        color: v2Colors.text.inverse,
                        fontSize: 10,
                        fontWeight: '700',
                        lineHeight: 12,
                      }}
                    >
                      파티
                    </Text>
                  </View>
                ) : null}
              </View>
            ),
          }}
        />
        <Tab.Screen
          component={NoticeStackNavigator}
          name="공지"
          options={{
            lazy: false,
            tabBarIcon: ({ color, size }) => (
              <Icon
                name="notifications-outline"
                size={size}
                color={color}
                style={{ marginBottom: 2 }}
              />
            ),
          }}
        />
        <Tab.Screen
          component={CommunityStackNavigator}
          name="커뮤니티"
          options={{
            lazy: false,
            tabBarIcon: ({ color, size }) => (
              <View style={{ position: 'relative' }}>
                <Icon
                  name="chatbubbles-outline"
                  size={size}
                  color={color}
                  style={{ marginBottom: 2 }}
                />
                <Dot
                  visible={totalUnreadCount > 0}
                  size="small"
                  style={{ bottom: -2, position: 'absolute', right: -6 }}
                />
              </View>
            ),
          }}
        />
      </Tab.Navigator>
      {!checking ? (
        <PermissionBubble
          visible={bubbleVisible}
          onAllowNotification={handleAllowNotification}
          onClose={() => setBubbleVisible(false)}
        />
      ) : null}
    </>
  );
};

export const MainNavigator = () => {
  return (
    <JoinRequestProvider>
      <MainNavigatorContent />
    </JoinRequestProvider>
  );
};
