import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';

import {
  AppHeader,
  ElevatedCard,
  FilterChip,
  StatusBadge,
  v2Colors,
  v2Radius,
  v2Spacing,
  v2Typography,
} from '../design-system';
import { BOTTOM_TAB_BAR_HEIGHT } from '../constants/constants';
import { useJoinRequestCount } from '../contexts/JoinRequestContext';
import { useAuth } from '../hooks/auth';
import { useMyParty, useParties, usePendingJoinRequest, useJoinRequest } from '../hooks/party';
import { useScreenView } from '../hooks/useScreenView';
import { useUserDisplayNames } from '../hooks/user';
import { logEvent } from '../lib/analytics';
import type { RootStackParamList } from '../navigations/types';
import type { Party } from '../types/party';
import { formatKoreanAmPmTime } from '../utils/datetime';

type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TAXI_FILTERS = ['전체', '안양역', '범계역'] as const;

type TaxiFilter = (typeof TAXI_FILTERS)[number];

type TaxiPartyCardItem = {
  fareLabel: string;
  headcountLabel: string;
  id: string;
  leaderName: string;
  party: Party;
  participantNames: string[];
  status: 'closed' | 'recruiting';
  timeLabel: string;
};

type TaxiPartyCardProps = {
  item: TaxiPartyCardItem;
  onPress: (party: Party) => void;
};

type TaxiStateCardProps = {
  actionLabel?: string;
  description: string;
  onPressAction?: () => void;
  title: string;
};

const KNOWN_FARE_ESTIMATES: Record<string, number> = {
  '범계역→성결대학교': 4000,
  '성결대학교→범계역': 4000,
  '성결대학교→안양역': 3500,
  '안양역→성결대학교': 3500,
} as const;

const AVATAR_PALETTE = [
  { background: v2Colors.accent.green.soft, text: v2Colors.accent.green.strong },
  { background: v2Colors.accent.blue.soft, text: v2Colors.accent.blue.base },
  { background: v2Colors.accent.purple.iconBg, text: v2Colors.accent.purple.base },
  { background: v2Colors.bg.subtle, text: v2Colors.text.secondary },
] as const;

const getAvatarColors = (seed: string) => {
  const hash = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
};

const getAvatarInitial = (value: string) => value.trim().charAt(0) || '?';

const formatFare = (amount: number) => `${amount.toLocaleString('ko-KR')}원`;

const getRouteKey = (party: Party) => `${party.departure.name}→${party.destination.name}`;

const getCreatedAtMs = (party: Party) => {
  const createdAt = party.createdAt as { toMillis?: () => number } | number | string | undefined;

  if (typeof createdAt === 'number') {
    return createdAt;
  }

  if (typeof createdAt === 'string') {
    const timestamp = new Date(createdAt).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  if (createdAt && typeof createdAt === 'object' && typeof createdAt.toMillis === 'function') {
    return createdAt.toMillis();
  }

  return 0;
};

const getDepartureMs = (party: Party) => {
  const timestamp = new Date(party.departureTime).getTime();
  return Number.isNaN(timestamp) ? Number.MAX_SAFE_INTEGER : timestamp;
};

const isPartyRecruiting = (party: Party) =>
  party.status === 'open' && Array.isArray(party.members) && party.members.length < party.maxMembers;

const shouldDisplayParty = (party: Party) => party.status !== 'ended' && party.status !== 'arrived';

const getEstimatedFareLabel = (party: Party) => {
  const settledFare = party.settlement?.perPersonAmount;

  if (typeof settledFare === 'number' && Number.isFinite(settledFare) && settledFare > 0) {
    return formatFare(settledFare);
  }

  const knownEstimate = KNOWN_FARE_ESTIMATES[getRouteKey(party)];
  if (knownEstimate) {
    return formatFare(knownEstimate);
  }

  return '미정';
};

const resolveDisplayName = (
  displayNameMap: Record<string, string>,
  userId: string | undefined,
) => {
  if (!userId) {
    return '알 수 없음';
  }

  const mappedName = displayNameMap[userId];
  if (!mappedName || mappedName === '알 수 없음') {
    return userId;
  }

  return mappedName;
};

const TaxiStateCard = ({
  actionLabel,
  description,
  onPressAction,
  title,
}: TaxiStateCardProps) => (
  <ElevatedCard padding={20} style={styles.stateCard}>
    <Text style={styles.stateTitle}>{title}</Text>
    <Text style={styles.stateDescription}>{description}</Text>
    {actionLabel && onPressAction ? (
      <Pressable
        accessibilityLabel={actionLabel}
        accessibilityRole="button"
        onPress={onPressAction}
        style={({ pressed }) => [styles.stateAction, pressed && styles.stateActionPressed]}
      >
        <Text style={styles.stateActionLabel}>{actionLabel}</Text>
      </Pressable>
    ) : null}
  </ElevatedCard>
);

const TaxiPartyCard = ({ item, onPress }: TaxiPartyCardProps) => {
  const leaderAvatarColors = getAvatarColors(item.leaderName || item.id);

  return (
    <ElevatedCard
      accessibilityLabel={`${item.leaderName} 파티, ${item.timeLabel} 출발`}
      onPress={() => onPress(item.party)}
      padding={17}
      style={styles.partyCard}
    >
      <View style={styles.partyTopRow}>
        <View>
          <Text style={styles.partyMetaLabel}>출발 시간</Text>
          <Text style={styles.partyTime}>{item.timeLabel}</Text>
        </View>
        <StatusBadge status={item.status} variant="pill" />
      </View>

      <View style={styles.routePill}>
        <View style={styles.routeEndpoint}>
          <View style={styles.departureBadge}>
            <Icon color={v2Colors.accent.green.strong} name="location" size={12} />
          </View>
          <Text numberOfLines={1} style={styles.routeText}>
            {item.party.departure.name}
          </Text>
        </View>

        <Icon color={v2Colors.text.quaternary} name="arrow-forward-outline" size={14} />

        <View style={[styles.routeEndpoint, styles.routeEndpointRight]}>
          <Text numberOfLines={1} style={[styles.routeText, styles.routeTextRight]}>
            {item.party.destination.name}
          </Text>
          <View style={styles.destinationBadge}>
            <MaterialCommunityIcons
              color={v2Colors.accent.blue.base}
              name="office-building-outline"
              size={12}
            />
          </View>
        </View>
      </View>

      <View style={styles.partyBottomRow}>
        <View style={styles.driverRow}>
          <View
            style={[
              styles.driverAvatar,
              { backgroundColor: leaderAvatarColors.background },
            ]}
          >
            <Text style={[styles.driverInitial, { color: leaderAvatarColors.text }]}>
              {getAvatarInitial(item.leaderName)}
            </Text>
          </View>

          <View style={styles.driverMetaBlock}>
            <Text numberOfLines={1} style={styles.driverName}>
              {item.leaderName}
            </Text>
            <Text style={styles.driverMeta}>파티장</Text>
          </View>

          <View style={styles.memberDivider} />

          <View style={styles.memberStack}>
            {item.participantNames.map((name, index) => {
              const avatarColors = getAvatarColors(name || `${item.id}-${index}`);

              return (
                <View
                  key={`${item.id}-${name}-${index}`}
                  style={[
                    styles.memberAvatar,
                    index > 0 && styles.memberAvatarOverlap,
                    { backgroundColor: avatarColors.background },
                  ]}
                >
                  <Text style={[styles.memberAvatarText, { color: avatarColors.text }]}>
                    {getAvatarInitial(name)}
                  </Text>
                </View>
              );
            })}
          </View>

          <Text style={styles.headcount}>{item.headcountLabel}</Text>
        </View>

        <View style={styles.fareBox}>
          <Text style={styles.partyMetaLabel}>예상 요금</Text>
          <Text style={styles.partyFare}>{item.fareLabel}</Text>
        </View>
      </View>
    </ElevatedCard>
  );
};

export const TaxiShellScreen = () => {
  useScreenView();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<RootNavigationProp>();
  const { user } = useAuth();
  const { parties, loading, error } = useParties();
  const { myParty, hasParty, loading: myPartyLoading } = useMyParty();
  const { joinRequestCount } = useJoinRequestCount();
  const { pendingRequest } = usePendingJoinRequest();
  const { createJoinRequest, cancelJoinRequest } = useJoinRequest();
  const [selectedFilter, setSelectedFilter] = React.useState<TaxiFilter>('전체');
  const [searchSummary, setSearchSummary] = React.useState<string | null>(null);

  const filteredParties = React.useMemo(() => {
    const visibleParties = parties.filter(shouldDisplayParty);

    if (selectedFilter === '전체') {
      return visibleParties;
    }

    return visibleParties.filter(party => party.departure.name === selectedFilter);
  }, [parties, selectedFilter]);

  const sortedParties = React.useMemo(
    () =>
      [...filteredParties].sort((left, right) => {
        const createdAtDiff = getCreatedAtMs(right) - getCreatedAtMs(left);
        if (createdAtDiff !== 0) {
          return createdAtDiff;
        }

        return getDepartureMs(left) - getDepartureMs(right);
      }),
    [filteredParties],
  );

  const userIdsForCards = React.useMemo(() => {
    const ids = new Set<string>();

    sortedParties.forEach(party => {
      if (party.leaderId) {
        ids.add(party.leaderId);
      }

      if (Array.isArray(party.members)) {
        party.members.forEach(memberId => {
          if (memberId) {
            ids.add(memberId);
          }
        });
      }
    });

    return Array.from(ids);
  }, [sortedParties]);

  const { displayNameMap } = useUserDisplayNames(userIdsForCards);

  const partyCards = React.useMemo<TaxiPartyCardItem[]>(
    () =>
      sortedParties.map(party => {
        const leaderName = resolveDisplayName(displayNameMap, party.leaderId);
        const members = Array.isArray(party.members) && party.members.length > 0
          ? [...party.members]
          : [party.leaderId];

        if (party.leaderId && !members.includes(party.leaderId)) {
          members.unshift(party.leaderId);
        }

        const participantNames = members.slice(0, 3).map(memberId => {
          if (memberId === party.leaderId) {
            return leaderName;
          }

          return resolveDisplayName(displayNameMap, memberId);
        });

        return {
          fareLabel: getEstimatedFareLabel(party),
          headcountLabel: `${party.members.length}/${party.maxMembers}명`,
          id: party.id || `${party.leaderId}-${party.departureTime}`,
          leaderName,
          party,
          participantNames,
          status: isPartyRecruiting(party) ? 'recruiting' : 'closed',
          timeLabel: formatKoreanAmPmTime(party.departureTime),
        };
      }),
    [displayNameMap, sortedParties],
  );

  const recruitingCount = React.useMemo(
    () => sortedParties.filter(isPartyRecruiting).length,
    [sortedParties],
  );

  const heroSummaryText = React.useMemo(() => {
    if (hasParty && joinRequestCount > 0) {
      return `대기 중인 동승 요청 ${joinRequestCount}개`;
    }

    if (searchSummary) {
      return `최근 검색 · ${searchSummary}`;
    }

    if (selectedFilter === '전체') {
      return `모집 중 ${recruitingCount}개`;
    }

    return `${selectedFilter} 출발 ${recruitingCount}개`;
  }, [hasParty, joinRequestCount, recruitingCount, searchSummary, selectedFilter]);

  const handleSearchPress = () => {
    navigation.navigate('Main', {
      screen: '택시',
      params: {
        screen: 'MapSearch',
        params: {
          onLocationSelect: location => {
            setSearchSummary(location.address);
          },
          type: 'departure',
        },
      },
    });
  };

  const handlePrimaryCtaPress = () => {
    if (!myPartyLoading && hasParty && myParty?.id) {
      navigation.navigate('Main', {
        screen: '택시',
        params: {
          screen: 'Chat',
          params: {
            partyId: myParty.id,
          },
        },
      });
      return;
    }

    navigation.navigate('Main', {
      screen: '택시',
      params: {
        screen: 'Recruit',
      },
    });
  };

  const handlePartyPress = async (party: Party) => {
    const partyId = party.id;

    if (!partyId) {
      return;
    }

    if (hasParty && myParty?.id && partyId !== myParty.id) {
      Alert.alert('알림', '이미 다른 파티에 소속되어 있어요. 파티를 탈퇴하고 다시 요청해주세요.');
      return;
    }

    if (myParty?.id === partyId) {
      navigation.navigate('Main', {
        screen: '택시',
        params: {
          screen: 'Chat',
          params: {
            partyId,
          },
        },
      });
      return;
    }

    if (pendingRequest?.partyId === partyId && pendingRequest.requestId) {
      navigation.navigate('Main', {
        screen: '택시',
        params: {
          screen: 'AcceptancePending',
          params: {
            party,
            requestId: pendingRequest.requestId,
          },
        },
      });
      return;
    }

    if (!isPartyRecruiting(party)) {
      Alert.alert('알림', '이 파티는 모집이 마감되었어요.');
      return;
    }

    if (!user?.uid) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    if (pendingRequest?.partyId && pendingRequest.requestId) {
      const shouldSwitchParty = await new Promise<boolean>(resolve => {
        Alert.alert(
          '동승 요청 취소',
          '이미 동승 요청을 보낸 파티가 있어요. 기존 요청을 취소하고 이 파티로 이동할까요?',
          [
            { text: '취소', style: 'cancel', onPress: () => resolve(false) },
            {
              text: '확인',
              onPress: () => resolve(true),
            },
          ],
        );
      });

      if (!shouldSwitchParty) {
        return;
      }

      try {
        await cancelJoinRequest(pendingRequest.requestId);
      } catch (cancelError) {
        console.warn('기존 동승 요청 취소 실패:', cancelError);
      }
    }

    Alert.alert(
      '동승 요청',
      `${party.departure.name}에서 ${party.destination.name}로 가는 ${formatKoreanAmPmTime(
        party.departureTime,
      )} 출발 파티에 동승 요청을 보낼까요?`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '요청 보내기',
          onPress: async () => {
            try {
              const requestId = await createJoinRequest(partyId, party.leaderId);

              await logEvent('party_join_requested', {
                party_id: partyId,
                request_id: requestId,
              });

              navigation.navigate('Main', {
                screen: '택시',
                params: {
                  screen: 'AcceptancePending',
                  params: {
                    party,
                    requestId,
                  },
                },
              });
            } catch (requestError) {
              console.error('동승 요청 전송 실패:', requestError);
              Alert.alert('오류', '동승 요청 전송에 실패했습니다.');
            }
          },
        },
      ],
    );
  };

  const ctaLabel = !myPartyLoading && hasParty && myParty?.id ? '내 파티 채팅방' : '새 파티 만들기';
  const ctaIconName = !myPartyLoading && hasParty && myParty?.id
    ? 'chatbubble-ellipses-outline'
    : 'add-outline';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <AppHeader
        actions={[
          {
            accessibilityLabel: 'MY로 이동',
            icon: <Icon color={v2Colors.text.primary} name="person-outline" size={20} />,
            onPress: () => navigation.navigate('My', { screen: 'MyMain' }),
          },
        ]}
        title="택시"
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: BOTTOM_TAB_BAR_HEIGHT + insets.bottom + v2Spacing[6] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <LinearGradient
          colors={[v2Colors.accent.green.soft, v2Colors.accent.green.border]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={styles.hero}
        >
          <ElevatedCard padding={0} style={styles.searchCard}>
            <Pressable
              accessibilityHint="출발지를 직접 선택합니다"
              accessibilityLabel="출발지 검색"
              accessibilityRole="button"
              onPress={handleSearchPress}
              style={({ pressed }) => [styles.searchField, pressed && styles.searchFieldPressed]}
            >
              <Icon color={v2Colors.text.quaternary} name="search-outline" size={14} />
              <Text
                numberOfLines={1}
                style={[styles.searchPlaceholder, searchSummary && styles.searchValue]}
              >
                {searchSummary || '출발지 검색'}
              </Text>
            </Pressable>
          </ElevatedCard>

          <View style={styles.heroSummary}>
            <View style={styles.heroSummaryDot} />
            <Text numberOfLines={1} style={styles.heroSummaryText}>
              {heroSummaryText}
            </Text>
          </View>
        </LinearGradient>

        <View style={styles.filterRow}>
          {TAXI_FILTERS.map(filter => (
            <FilterChip
              key={filter}
              label={filter}
              onPress={() => setSelectedFilter(filter)}
              selected={selectedFilter === filter}
            />
          ))}
        </View>

        <Pressable
          accessibilityLabel={ctaLabel}
          accessibilityRole="button"
          onPress={handlePrimaryCtaPress}
          style={({ pressed }) => [styles.primaryCta, pressed && styles.primaryCtaPressed]}
        >
          <Icon color={v2Colors.text.inverse} name={ctaIconName} size={20} />
          <Text style={styles.primaryCtaLabel}>{ctaLabel}</Text>
        </Pressable>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{`모집 중인 파티 (${recruitingCount})`}</Text>
          <View style={styles.sortButton}>
            <Text style={styles.sortLabel}>최신순</Text>
            <Icon color={v2Colors.text.secondary} name="chevron-down-outline" size={14} />
          </View>
        </View>

        {loading ? (
          <TaxiStateCard
            description="파티 정보를 불러오는 중이에요."
            title="목록을 준비하고 있어요"
          />
        ) : error ? (
          <TaxiStateCard
            actionLabel="새 파티 만들기"
            description="잠시 후 다시 확인하거나 바로 새 파티를 열 수 있어요."
            onPressAction={handlePrimaryCtaPress}
            title="파티 목록을 불러오지 못했어요"
          />
        ) : partyCards.length === 0 ? (
          <TaxiStateCard
            actionLabel="새 파티 만들기"
            description="첫 번째 파티를 만들어 바로 모집을 시작해보세요."
            onPressAction={handlePrimaryCtaPress}
            title="아직 모집 중인 파티가 없어요"
          />
        ) : (
          <View style={styles.partyList}>
            {partyCards.map(item => (
              <TaxiPartyCard item={item} key={item.id} onPress={handlePartyPress} />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: v2Colors.bg.app,
    flex: 1,
  },
  departureBadge: {
    alignItems: 'center',
    backgroundColor: v2Colors.accent.green.soft,
    borderRadius: v2Radius.full,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  destinationBadge: {
    alignItems: 'center',
    backgroundColor: v2Colors.accent.blue.soft,
    borderRadius: v2Radius.full,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  driverAvatar: {
    alignItems: 'center',
    borderRadius: v2Radius.full,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  driverInitial: {
    ...v2Typography.meta.medium,
    fontWeight: '700',
  },
  driverMeta: {
    ...v2Typography.meta.default,
    color: v2Colors.text.quaternary,
  },
  driverMetaBlock: {
    flexShrink: 1,
    marginLeft: v2Spacing[2],
  },
  driverName: {
    ...v2Typography.meta.medium,
    color: v2Colors.text.secondary,
  },
  driverRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  fareBox: {
    alignItems: 'flex-end',
    marginLeft: v2Spacing[4],
  },
  filterRow: {
    backgroundColor: v2Colors.bg.surface,
    borderBottomColor: v2Colors.border.default,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: v2Spacing[2],
    paddingBottom: 17,
    paddingHorizontal: v2Spacing[4],
    paddingTop: v2Spacing[4],
  },
  headcount: {
    ...v2Typography.meta.default,
    color: v2Colors.text.secondary,
    marginLeft: v2Spacing[2],
  },
  hero: {
    height: 256,
    paddingHorizontal: v2Spacing[4],
    paddingTop: v2Spacing[4],
    position: 'relative',
  },
  heroSummary: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.82)',
    borderColor: 'rgba(255, 255, 255, 0.65)',
    borderRadius: v2Radius.full,
    borderWidth: 1,
    bottom: 24,
    flexDirection: 'row',
    left: v2Spacing[4],
    maxWidth: 220,
    paddingHorizontal: 12,
    paddingVertical: 8,
    position: 'absolute',
  },
  heroSummaryDot: {
    backgroundColor: v2Colors.accent.green.base,
    borderRadius: v2Radius.full,
    height: 6,
    marginRight: v2Spacing[2],
    width: 6,
  },
  heroSummaryText: {
    ...v2Typography.meta.medium,
    color: v2Colors.text.secondary,
    flexShrink: 1,
  },
  memberAvatar: {
    alignItems: 'center',
    borderColor: v2Colors.bg.surface,
    borderRadius: v2Radius.full,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  memberAvatarOverlap: {
    marginLeft: -6,
  },
  memberAvatarText: {
    ...v2Typography.meta.default,
    fontWeight: '700',
  },
  memberDivider: {
    backgroundColor: v2Colors.border.default,
    height: 24,
    marginHorizontal: 4,
    width: 1,
  },
  memberStack: {
    alignItems: 'center',
    flexDirection: 'row',
    marginLeft: v2Spacing[1],
  },
  partyBottomRow: {
    alignItems: 'center',
    borderTopColor: v2Colors.border.subtle,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: v2Spacing[4],
    paddingTop: 13,
  },
  partyCard: {
    minHeight: 203,
  },
  partyFare: {
    ...v2Typography.fare.emphasis,
    color: v2Colors.text.primary,
  },
  partyList: {
    gap: v2Spacing[3],
    paddingHorizontal: v2Spacing[4],
  },
  partyMetaLabel: {
    ...v2Typography.meta.default,
    color: v2Colors.text.quaternary,
    marginBottom: 2,
  },
  partyTime: {
    ...v2Typography.title.screen,
    color: v2Colors.text.primary,
  },
  partyTopRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryCta: {
    alignItems: 'center',
    backgroundColor: v2Colors.accent.green.base,
    borderRadius: v2Radius.xl,
    flexDirection: 'row',
    height: 60,
    justifyContent: 'center',
    marginHorizontal: v2Spacing[4],
    marginTop: v2Spacing[4],
    shadowColor: v2Colors.accent.green.base,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
  },
  primaryCtaLabel: {
    ...v2Typography.body.medium,
    color: v2Colors.text.inverse,
    fontWeight: '700',
    marginLeft: v2Spacing[2],
  },
  primaryCtaPressed: {
    opacity: 0.72,
  },
  routeEndpoint: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    minWidth: 0,
  },
  routeEndpointRight: {
    justifyContent: 'flex-end',
  },
  routePill: {
    alignItems: 'center',
    backgroundColor: v2Colors.bg.app,
    borderRadius: v2Radius.lg,
    flexDirection: 'row',
    gap: v2Spacing[2],
    justifyContent: 'space-between',
    marginTop: v2Spacing[4],
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  routeText: {
    ...v2Typography.body.medium,
    color: v2Colors.text.primary,
    flexShrink: 1,
  },
  routeTextRight: {
    textAlign: 'right',
  },
  scrollContent: {
    paddingBottom: v2Spacing[6],
  },
  searchCard: {
    borderRadius: v2Radius.lg,
  },
  searchField: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: v2Spacing[2],
    minHeight: 41,
    paddingHorizontal: v2Spacing[4],
    paddingVertical: 10,
  },
  searchFieldPressed: {
    opacity: 0.72,
  },
  searchPlaceholder: {
    ...v2Typography.body.medium,
    color: v2Colors.text.quaternary,
    flex: 1,
  },
  searchValue: {
    color: v2Colors.text.primary,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: v2Spacing[4],
    marginTop: v2Spacing[4],
    paddingHorizontal: v2Spacing[4],
  },
  sectionTitle: {
    ...v2Typography.title.section,
    color: v2Colors.text.primary,
  },
  sortButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  sortLabel: {
    ...v2Typography.body.default,
    color: v2Colors.text.secondary,
  },
  stateAction: {
    marginTop: v2Spacing[4],
  },
  stateActionLabel: {
    ...v2Typography.body.medium,
    color: v2Colors.accent.green.base,
  },
  stateActionPressed: {
    opacity: 0.72,
  },
  stateCard: {
    alignItems: 'flex-start',
    marginHorizontal: v2Spacing[4],
  },
  stateDescription: {
    ...v2Typography.body.default,
    color: v2Colors.text.secondary,
    marginTop: v2Spacing[2],
  },
  stateTitle: {
    ...v2Typography.title.section,
    color: v2Colors.text.primary,
  },
});
