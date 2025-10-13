import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView } from 'react-native';
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
import { dummyParties } from '../constants/mock_data/dummyParties';

type Food = {
  id: string;
  date: string;
  dateTitle: '월' | '화' | '수' | '목' | '금' ;
  title: string[];
};

const noticeItems = [
  { id: 'n1', title: '학사 공지', subtitle: '수강정정 안내' },
  { id: 'n2', title: '셔틀 공지', subtitle: '노선 임시 변경' },
  { id: 'n3', title: '행사 안내', subtitle: '축제 일정 공개' },
];

const dummyFoods: Food[] = [
  { id: 'f1', date: '11/03', dateTitle: '월', title: ['아침', '점심', '저녁'] },
  { id: 'f2', date: '11/04', dateTitle: '화', title: ['아침', '점심', '저녁'] },
  { id: 'f3', date: '11/05', dateTitle: '수', title: ['아침', '점심', '저녁'] },
  { id: 'f4', date: '11/06', dateTitle: '목', title: ['아침', '점심', '저녁'] },
  { id: 'f5', date: '11/07', dateTitle: '금', title: ['아침', '점심', '저녁'] },
  { id: 'f6', date: '11/10', dateTitle: '월', title: ['아침', '점심', '저녁'] },
  { id: 'f7', date: '11/11', dateTitle: '화', title: ['아침', '점심', '저녁'] },
  { id: 'f8', date: '11/12', dateTitle: '수', title: ['아침', '점심', '저녁'] },
  { id: 'f9', date: '11/13', dateTitle: '목', title: ['아침', '점심', '저녁'] },
  { id: 'f10', date: '11/14', dateTitle: '금', title: ['아침', '점심', '저녁'] },
];

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const [noticeType, setNoticeType] = useState<'학교 공지사항' | '내 과 공지사항'>('학교 공지사항');
  const [isNoticeDropdownOpen, setIsNoticeDropdownOpen] = useState(false);
  const isFocused = useIsFocused();
  const opacity = useSharedValue(1);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    translateY.value = withTiming(isFocused ? 0 : 10, { duration: 200 });
  }, [isFocused]);

  const screenAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Animated.View style={[{ flex: 1 }, screenAnimatedStyle]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoPlaceholder} />
            <Text style={styles.appName}>SKTaxi</Text>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Icon name="notifications-outline" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Icon name="settings-outline" size={22} color={COLORS.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.headerIconBtn, styles.profileBtn]}>
              <Icon name="person-circle-outline" size={26} color={COLORS.accent.green} />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ marginTop: 24, paddingBottom: BOTTOM_TAB_BAR_HEIGHT + insets.bottom }} showsVerticalScrollIndicator={false}>
        {/* Taxi Segment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>현재 모집중인 택시</Text>
            <TouchableOpacity onPress={() => navigation.navigate('택시')}>
              <Text style={styles.sectionAction}>모두 보기</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={dummyParties}
            keyExtractor={(it) => it.id}
            renderItem={({ item }) => 
            <TouchableOpacity style={styles.card} activeOpacity={0.9}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.departure} → {item.destination}</Text>
                <Text style={styles.cardMembersText}>{item.members}/{item.maxMembers}명</Text>
              </View>
              <Text style={styles.cardTimeText}>{item.departureTime}</Text>
              {item.description ? <Text style={styles.cardSubtitle}>{item.description}</Text> : null}
            </TouchableOpacity>
          }
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
        </View>

        <Surface color={COLORS.background.surface} height={1} margin={24} />

        {/* Notice Segment */}
        <View style={styles.section}>
          <View style={[styles.sectionHeader, { position: 'relative' }]}>
            <TouchableOpacity
              style={styles.sectionDropdownContainer}
              activeOpacity={0.8}
              onPress={() => setIsNoticeDropdownOpen(v => !v)}
            >
              <Text style={styles.sectionTitle}>{noticeType}</Text>
              <Icon
                name={isNoticeDropdownOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={22}
                color={COLORS.text.primary}
              />
            </TouchableOpacity>
            {isNoticeDropdownOpen && (
              <View style={styles.dropdownMenu}>
                {(['학교 공지사항', '내 과 공지사항'] as const).map(label => (
                  <TouchableOpacity
                    key={label}
                    style={[styles.dropdownItem, noticeType === label && styles.dropdownItemSelected]}
                    onPress={() => {
                      setNoticeType(label);
                      setIsNoticeDropdownOpen(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, noticeType === label && styles.dropdownItemTextSelected]}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <TouchableOpacity onPress={() => navigation.navigate('공지')}>
              <Text style={styles.sectionAction}>모두 보기</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={noticeItems}
            keyExtractor={(it) => it.id}
            renderItem={({ item }) => 
            <TouchableOpacity style={styles.card} activeOpacity={0.9}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              {item.subtitle ? <Text style={styles.cardSubtitle}>{item.subtitle}</Text> : null}
            </TouchableOpacity>
          }
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
        </View>

        <Surface color={COLORS.background.surface} height={1} margin={24} />

        {/* 학식 Segment */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>학식</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>모두 보기</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={dummyFoods}
            keyExtractor={(it) => it.id}
            renderItem={({ item }) => 
            <TouchableOpacity style={[styles.card, { width: 150, height: 150 }]} activeOpacity={0.9} key={item.id}>
              <Text style={styles.cardTitle}>{item.date} {item.dateTitle}요일</Text>
              {item.title.map((title) => (
                <Text style={styles.cardSubtitle}>{title}</Text>
              ))}
            </TouchableOpacity>
          }
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
        </View>

        <Surface color={COLORS.background.surface} height={1} margin={24} />

        {/* Academic Calendar */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>학사일정</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>자세히</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.calendarCard}>
            <View style={styles.calendarRow}>
              <Text style={styles.calendarDot}>•</Text>
              <Text style={styles.calendarText}>수강신청 정정 기간 (9/2 ~ 9/6)</Text>
            </View>
            <View style={styles.calendarRow}>
              <Text style={styles.calendarDot}>•</Text>
              <Text style={styles.calendarText}>중간고사 (10/21 ~ 10/25)</Text>
            </View>
            <View style={styles.calendarRow}>
              <Text style={styles.calendarDot}>•</Text>
              <Text style={styles.calendarText}>축제 주간 (9/27)</Text>
            </View>
          </View>
        </View>

        <Surface color={COLORS.background.surface} height={1} margin={24} />

        {/* My Timetable */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>내 시간표</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>편집</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timetableCard}>
            <View style={styles.timetableRow}>
              <Text style={styles.timetableTime}>09:00</Text>
              <Text style={styles.timetableCourse}>자료구조 (공학관 302)</Text>
            </View>
            <View style={styles.timetableRow}>
              <Text style={styles.timetableTime}>13:00</Text>
              <Text style={styles.timetableCourse}>모바일프로그래밍 (IT관 201)</Text>
            </View>
            <View style={styles.timetableRow}>
              <Text style={styles.timetableTime}>16:00</Text>
              <Text style={styles.timetableCourse}>캡스톤디자인 (공학관 101)</Text>
            </View>
          </View>
        </View>
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoPlaceholder: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: COLORS.accent.green,
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
  section: {
    paddingHorizontal: 16,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
  },
  sectionAction: {
    ...TYPOGRAPHY.body2,
    color: COLORS.accent.green,
  },
  sectionDropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 36,
    left: 0,
    backgroundColor: COLORS.background.dropdown,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    paddingVertical: 6,
    minWidth: 180,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownItemSelected: {
    backgroundColor: COLORS.accent.green + '20',
  },
  dropdownItemText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  dropdownItemTextSelected: {
    color: COLORS.accent.green,
    fontWeight: '600',
  },
  card: {
    width: 220,
    height: 110,
    borderRadius: 16,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardTitle: {
    ...TYPOGRAPHY.body1,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  cardMembersText: {
    ...TYPOGRAPHY.caption1,
    fontWeight: 'bold',
    color: COLORS.text.secondary,
  },
  cardTimeText: {
    ...TYPOGRAPHY.caption1,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  calendarCard: {
    borderRadius: 16,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: 16,
    gap: 8,
  },
  calendarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  calendarDot: {
    color: COLORS.accent.green,
    fontSize: 16,
  },
  calendarText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  timetableCard: {
    borderRadius: 16,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: 16,
    gap: 12,
  },
  timetableRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timetableTime: {
    width: 56,
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  timetableCourse: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
});