import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../navigations/types';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typhograpy';
import Icon from 'react-native-vector-icons/Ionicons';
import { BOTTOM_TAB_BAR_HEIGHT } from '../constants/constants';
import Surface from '../components/common/Surface';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import { CafeteriaSection } from '../components/cafeteria/CafeteriaSection';
import { AcademicCalendarSection } from '../components/academic/AcademicCalendarSection';
import { TimetableSection } from '../components/timetable/TimetableSection';
import { useNotifications } from '../hooks/common';
import { TabBadge } from '../components/common/TabBadge';
import { useScreenView } from '../hooks/useScreenView';
import { TaxiSection, NoticeSection, MinecraftSection } from '../components/home';

export const HomeScreen = () => {
  useScreenView();
  const { unreadCount } = useNotifications();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const isFocused = useIsFocused();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    translateY.value = withTiming(isFocused ? 0 : 10, { duration: 200 });
  }, [isFocused]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Animated.View style={[{ flex: 1 }, screenAnimatedStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerLeft} onPress={scrollToTop} activeOpacity={1}>
            <View style={styles.logoPlaceholder}>
              <Image source={require('../../assets/icons/skuri_icon.png')} style={{ width: '100%', height: '100%' }} />
            </View>
            <Text style={styles.appName}>SKURI Taxi</Text>
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('홈', { screen: 'Notification' })}>
              <Icon name="notifications-outline" size={22} color={COLORS.text.primary} />
              <TabBadge count={unreadCount} size="small" style={{ top: 1, right: 1 }} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn} onPress={() => navigation.navigate('홈', { screen: 'Setting' })}>
              <Icon name="settings-outline" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerIconBtn, styles.profileBtn]} onPress={() => navigation.navigate('홈', { screen: 'Profile' })}>
              <Icon name="person-circle-outline" size={26} color={COLORS.accent.green} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={{
            paddingTop: 20,
            paddingBottom: BOTTOM_TAB_BAR_HEIGHT + insets.bottom + 20,
            paddingHorizontal: 4
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Taxi Section */}
          <TaxiSection />

          <Surface color={COLORS.background.surface} height={1} margin={24} />

          {/* Notice Section */}
          <NoticeSection />

          <Surface color={COLORS.background.surface} height={1} margin={24} />

          {/* My Timetable */}
          <TimetableSection />

          <Surface color={COLORS.background.surface} height={1} margin={24} />

          {/* Academic Calendar Section */}
          <AcademicCalendarSection />

          <Surface color={COLORS.background.surface} height={1} margin={24} />

          {/* Minecraft Section */}
          <MinecraftSection />

          <Surface color={COLORS.background.surface} height={1} margin={24} />

          {/* Cafeteria Section */}
          <CafeteriaSection />

        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingRight: 30,
  },
  logoPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  appName: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  profileBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
});
