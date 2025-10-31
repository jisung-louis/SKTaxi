import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
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
import { useParties } from '../hooks/useParties'; // SKTaxi: Firestore parties 구독 훅 사용
import { formatKoreanAmPmTime } from '../utils/datetime'; // SKTaxi: 시간 포맷 유틸
import Button from '../components/common/Button';
import { useAuth } from '../hooks/useAuth'; // SKTaxi: 현재 사용자 정보
import { useNotices } from '../hooks/useNotices'; // SKTaxi: 공지사항 훅 사용
import { getFirestore, collection, addDoc, doc, updateDoc, serverTimestamp, query as fsQuery, orderBy, limit as fsLimit, getDocs } from '@react-native-firebase/firestore';
import { CafeteriaSection } from '../components/cafeteria/CafeteriaSection';
import { AcademicCalendarSection } from '../components/academic/AcademicCalendarSection';
import { TimetableSection } from '../components/timetable/TimetableSection';
import { useNotifications } from '../hooks/useNotifications';
import { TabBadge } from '../components/common/TabBadge';
import { usePendingJoinRequest } from '../hooks/usePendingJoinRequest';
import { useMyParty } from '../hooks/useMyParty';

type SimpleNotice = { id: string; title: string; content?: string; postedAt?: any; category?: string };

export const HomeScreen = () => {
  const { parties, loading } = useParties(); // SKTaxi: Firestore에서 실제 파티 목록 구독
  const { user } = useAuth(); // SKTaxi: 현재 사용자 정보
  const { markAsRead } = useNotices('전체'); // SKTaxi: 공지사항 읽음 처리 함수
  const { unreadCount } = useNotifications(); // SKTaxi: 읽지 않은 알림 개수
  const { pendingRequest } = usePendingJoinRequest(); // SKTaxi: 현재 사용자의 pending 동승 요청 조회
  const { hasParty, partyId: myPartyId } = useMyParty(); // SKTaxi: 사용자 파티 소속 여부 확인
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const [noticeType, setNoticeType] = useState<'학교 공지사항' | '내 과 공지사항'>('학교 공지사항');
  const [isNoticeDropdownOpen, setIsNoticeDropdownOpen] = useState(false);
  const [recentNotices, setRecentNotices] = useState<SimpleNotice[]>([]);
  const [loadingNotices, setLoadingNotices] = useState<boolean>(false);
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

  // SKTaxi: 스크롤을 맨 위로 올리는 함수
  const scrollToTop = () => {
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  // SKTaxi: 최근 공지 10개 로드 (postedAt desc)
  useEffect(() => {
    const loadRecentNotices = async () => {
      try {
        setLoadingNotices(true);
        const db = getFirestore();
        const ref = collection(db, 'notices');
        const q = fsQuery(ref, orderBy('postedAt', 'desc'), fsLimit(10));
        const snap = await getDocs(q);
        const items: SimpleNotice[] = snap.docs.map((d: any) => ({ id: d.id, ...(d.data() as any) }));
        setRecentNotices(items);
      } catch (e) {
        console.log('최근 공지 로드 실패:', e);
        setRecentNotices([]);
      } finally {
        setLoadingNotices(false);
      }
    };
    loadRecentNotices();
  }, []);

  // SKTaxi: 파티 카드 클릭 핸들러
  const handlePartyCardPress = async (party: any) => {
    // SKTaxi: 이미 다른 파티에 소속되어 있는지 확인
    if (hasParty && party.id !== myPartyId) {
      Alert.alert('알림', '이미 다른 파티에 소속되어 있어요. 파티를 탈퇴하고 다시 요청해주세요.');
      return;
    }

    // SKTaxi: 현재 사용자가 이 파티에 속해 있는지 확인
    if (party.id === myPartyId) {
      // TODO: 채팅 화면으로 이동 또는 처리
      Alert.alert('알림', '이미 이 파티에 참여하고 있어요.');
      return;
    }

    // SKTaxi: 현재 파티에 pending 요청이 있으면 AcceptancePendingScreen으로 이동
    if (pendingRequest.partyId === party.id && pendingRequest.requestId) {
      navigation.navigate('택시', {
        screen: 'AcceptancePending',
        params: { party, requestId: pendingRequest.requestId }
      });
      return;
    }

    // SKTaxi: 다른 파티에 pending 요청이 있는 경우 확인 Alert
    if (pendingRequest.partyId && pendingRequest.requestId) {
      const confirmCancel = await new Promise<boolean>((resolve) => {
        Alert.alert(
          '동승 요청 취소',
          '이미 동승을 요청한 파티가 있어요. 그 요청을 취소하고 이 파티에 동승요청을 할까요?',
          [
            {
              text: '취소',
              style: 'cancel',
              onPress: () => resolve(false),
            },
            {
              text: '확인',
              onPress: () => resolve(true),
            },
          ]
        );
      });

      if (!confirmCancel) return;

      // SKTaxi: 기존 요청 취소
      try {
        const cancelRequestRef = collection(getFirestore(), 'joinRequests');
        const cancelDocRef = doc(cancelRequestRef, pendingRequest.requestId);
        await updateDoc(cancelDocRef, { status: 'canceled' });
      } catch (e) {
        console.warn('기존 요청 취소 실패:', e);
      }
    }

    if (party.status === 'open') {
      if (!user?.uid) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      // SKTaxi: 동승 요청 확인 Alert
      Alert.alert(
        '동승 요청',
        `${party.departure.name} → ${party.destination.name}로 가는 ${formatKoreanAmPmTime(party.departureTime)} 출발 파티에 동승 요청을 할까요?`,
        [
          { text: '취소', style: 'cancel' },
          { text: '요청 보내기', onPress: async () => {
            try {
              const ref = await addDoc(collection(getFirestore(), 'joinRequests'), {
                partyId: party.id,
                leaderId: party.leaderId,
                requesterId: user.uid,
                status: 'pending',
                createdAt: serverTimestamp(),
              });
              
              Alert.alert('요청 전송', '방장에게 요청을 보냈어요.');
              
              // SKTaxi: 수락 대기 화면으로 이동
              navigation.navigate('택시', {
                screen: 'AcceptancePending',
                params: { party, requestId: ref.id }
              });
            } catch (error) {
              console.error('동승 요청 전송 실패:', error);
              Alert.alert('오류', '동승 요청 전송에 실패했습니다.');
            }
          }}
        ]
      );
    } else if (party.status === 'closed') {
      Alert.alert('알림', '이 파티는 모집이 마감되었어요');
    } else if (party.status === 'arrived') {
      Alert.alert('알림', '이 파티는 이미 목적지에 도착했어요');
    }
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
          {/* Taxi Segment */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Icon name="car" size={20} color={COLORS.accent.green} />
                <Text style={styles.sectionTitle}>현재 모집중인 택시 파티</Text>
              </View>
              <TouchableOpacity 
                style={styles.sectionActionButton}
                onPress={() => navigation.navigate('택시', { screen: 'TaxiMain' })}
              >
                <Text style={styles.sectionAction}>모두 보기</Text>
                <Icon name="chevron-forward" size={16} color={COLORS.accent.green} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={parties}
              keyExtractor={(it) => it.id as string}
              renderItem={({ item }) => 
              <TouchableOpacity 
                style={[styles.card, (item.status === 'arrived' || item.status === 'closed') && styles.cardDisabled]} 
                activeOpacity={0.8} 
                key={item.id as string}
                onPress={() => handlePartyCardPress(item)}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleContainer}>
                    <View style={styles.routeContainer}>
                      <View style={styles.locationDot} />
                      <Text style={styles.cardTitle}>{item.departure.name}</Text>
                    </View>
                    <Icon name="arrow-forward" size={16} color={COLORS.text.secondary} />
                    <View style={styles.routeContainer}>
                      <View style={[styles.locationDot, styles.destinationDot]} />
                      <Text style={styles.cardTitle}>{item.destination.name}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cardBodyContainer}>
                  {item.detail ? (
                    <View style={styles.detailContainer}>
                      <Icon name="chatbubble-outline" size={14} color={COLORS.text.secondary} style={{ flex:1 }} />
                      <Text style={[styles.cardSubtitle, { flex: 12 }]} numberOfLines={1}>{item.detail}</Text>
                    </View>
                  ) : null}
                  <View style={styles.statusBadgeContainer}>
                    <View style={styles.timeContainer}>
                      <Icon name="time-outline" size={14} color={COLORS.accent.green} />
                      <Text style={styles.cardTimeText}>{formatKoreanAmPmTime(item.departureTime)} 출발</Text>
                    </View>
                    <View style={[styles.statusBadge, (item.status === 'arrived' || item.status === 'closed') && styles.statusBadgeDisabled]}>
                      <Text style={[styles.statusText, (item.status === 'arrived' || item.status === 'closed') && styles.statusTextDisabled]}>
                        {item.status === 'arrived' ? '도착완료' : item.status === 'closed' ? '모집마감' : `${(item.members.length)}/${item.maxMembers}명`}
                      </Text>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            }
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              ListEmptyComponent={() => 
                <View style={styles.emptyContainer}>
                  <Image source={require('../../assets/images/empty_taxi_party.png')} style={styles.emptyImage} />
                  <View style={styles.emptyTextContainer}>
                    <Text style={styles.emptyText}>모집 중인 파티가 없어요</Text>
                    <Text style={styles.emptyText}>첫 번째 파티를 만들어보세요!</Text>
                    <Button 
                      title="파티 만들기" 
                      onPress={() => navigation.navigate('택시', { screen: 'TaxiMain' })} 
                      size="small"
                      style={styles.emptyButton}
                    />
                  </View>
                </View>
                }
            />
          </View>

          <Surface color={COLORS.background.surface} height={1} margin={24} />

          {/* Notice Segment */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { position: 'relative' }]}>
              <View style={styles.sectionTitleContainer}>
                <Icon name="megaphone" size={20} color={COLORS.accent.blue} />
                <TouchableOpacity
                  style={styles.sectionDropdownContainer}
                  activeOpacity={0.8}
                  onPress={() => setIsNoticeDropdownOpen(v => !v)}
                >
                  <Text style={styles.sectionTitle}>{noticeType}</Text>
                  <Icon
                    name={isNoticeDropdownOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
                    size={18}
                    color={COLORS.text.primary}
                  />
                </TouchableOpacity>
              </View>
              {isNoticeDropdownOpen && (
                <View style={styles.dropdownMenu}>
                  {([
                    '학교 공지사항', 
                    //'내 과 공지사항'
                  ] as const).map(label => (
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
              <TouchableOpacity 
                style={styles.sectionActionButton}
                onPress={() => navigation.navigate('공지', { screen: 'NoticeMain' })}
              >
                <Text style={styles.sectionAction}>모두 보기</Text>
                <Icon name="chevron-forward" size={16} color={COLORS.accent.green} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={recentNotices}
              keyExtractor={(it) => it.id}
              renderItem={({ item }) => 
              <TouchableOpacity 
                style={styles.noticeCard} 
                activeOpacity={0.8}
                onPress={() => {
                  markAsRead(item.id);
                  navigation.navigate('공지', { screen: 'NoticeDetail', params: { noticeId: item.id } });
                }}
              >
                <View style={styles.noticeCardHeader}>
                  <View style={styles.noticeHeaderLeft}>
                    <View style={styles.noticeIconContainer}>
                      <Icon name="document-text" size={16} color={COLORS.accent.blue} />
                    </View>
                    {!!item.category && (
                      <View style={styles.noticeChip}>
                        <Text style={styles.noticeChipText}>{item.category}</Text>
                      </View>
                    )}
                  </View>
                  <Icon name="chevron-forward" size={16} color={COLORS.text.secondary} />
                </View>

                <Text style={styles.noticeCardTitle} numberOfLines={2}>{item.title}</Text>
                {!!item.content && (
                  <Text style={styles.noticeCardSubtitle} numberOfLines={3}>{item.content}</Text>
                )}

                <View style={styles.noticeMetaRow}>
                  <View style={styles.noticeMetaLeft}>
                    <Icon name="time-outline" size={12} color={COLORS.text.secondary} />
                    <Text style={styles.noticeTimeText} numberOfLines={1}>
                      {(() => {
                        try {
                          const d: any = (item as any)?.postedAt;
                          const dt = d?.toDate ? d.toDate() : (d? new Date(d): null);
                          return dt ? dt.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit'}) + ' ' + dt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit'}) : '';
                        } catch { return ''; }
                      })()}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            }
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
              ListEmptyComponent={() => 
              <View style={styles.emptyContainer}>
                <View style={styles.emptyTextContainer}>
                  <Text style={styles.emptyText}>{loadingNotices ? '공지사항을 불러오는 중...' : '현재 공지 정보가 없습니다.'}</Text>
                </View>
              </View>
              }
            />
          </View>

          <Surface color={COLORS.background.surface} height={1} margin={24} />

          {/* 학식 섹션 */}
          <CafeteriaSection />

          <Surface color={COLORS.background.surface} height={1} margin={24} />

          {/* 학사일정 섹션 */}
          <AcademicCalendarSection />

          <Surface color={COLORS.background.surface} height={1} margin={24} />

        {/* My Timetable */}
        <TimetableSection />
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
    //paddingVertical: 12,
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
  section: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  sectionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    // paddingHorizontal: 8,
    // paddingVertical: 4,
    // borderRadius: 8,
    // backgroundColor: COLORS.background.card,
  },
  sectionAction: {
    ...TYPOGRAPHY.body2,
    color: COLORS.accent.green,
    fontWeight: '600',
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
    height: 130,
    borderRadius: 20,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: 18,
    paddingBottom: 12,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.background.surface,
  },
  cardTitle: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.text.primary,
    fontSize: 14,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontSize: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent.green,
  },
  destinationDot: {
    backgroundColor: COLORS.accent.blue,
  },
  statusBadge: {
    backgroundColor: COLORS.accent.green + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeDisabled: {
    backgroundColor: COLORS.accent.red + '20',
  },
  statusText: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '600',
    color: COLORS.accent.green,
    fontSize: 11,
  },
  statusTextDisabled: {
    color: COLORS.accent.red,
  },
  cardBodyContainer: {
    gap: 8,
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTimeText: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '600',
    color: COLORS.text.primary,
    fontSize: 12,
  },
  // SKTaxi: 공지사항 카드 스타일
  noticeCard: {
    width: 220,
    height: 180,
    borderRadius: 16,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  noticeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  noticeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent.blue + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeChip: {
    backgroundColor: COLORS.accent.blue + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.accent.blue + '40',
  },
  noticeChipText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.accent.blue,
    fontWeight: '700',
  },
  noticeCardTitle: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.text.primary,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  noticeCardSubtitle: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontSize: 12,
  },
  noticeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  noticeMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  noticeTimeText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontSize: 11,
  },
  // SKTaxi: 학식 카드 스타일
  foodCard: {
    width: 160,
    height: 140,
    borderRadius: 16,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  foodCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  foodDateContainer: {
    gap: 2,
  },
  foodDate: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.text.primary,
    fontSize: 16,
  },
  foodDay: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontSize: 11,
  },
  foodIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent.red + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  foodMenuContainer: {
    gap: 6,
  },
  foodMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  foodMenuDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.accent.red,
  },
  foodMenuText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.primary,
    fontSize: 11,
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  emptyImage: {
    width: 140,
    height: 140,
  },
  emptyTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
  emptyButton: {
    marginTop: 16,
    width: '80%',
  },
});