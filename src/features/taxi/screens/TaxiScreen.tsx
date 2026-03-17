import React from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {Marker, type Region} from 'react-native-maps';
import LinearGradient from 'react-native-linear-gradient';
import Animated from 'react-native-reanimated';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {useScreenEnterAnimation, useScreenView} from '@/shared/hooks';
import {BOTTOM_TAB_BAR_HEIGHT} from '@/shared/constants/layout';
import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

import {TaxiHomeFilterChips} from '../components/v2/TaxiHomeFilterChips';
import {TaxiHomePartyCard} from '../components/v2/TaxiHomePartyCard';
import {TaxiHomeSearchBar} from '../components/v2/TaxiHomeSearchBar';
import {TaxiHomeSortMenu} from '../components/v2/TaxiHomeSortMenu';
import {useTaxiHomeData} from '../hooks/useTaxiHomeData';
import {useTaxiLocation} from '../hooks/useTaxiLocation';
import {DEPARTURE_LOCATION, DEPARTURE_OPTIONS} from '../model/constants';
import type {TaxiStackParamList} from '../model/navigation';
import type {TaxiHomePartyCardViewData} from '../model/taxiHomeViewData';
import {WINDOW_HEIGHT} from '@/shared/constants/layout';

type TaxiNavigationProp = NavigationProp<TaxiStackParamList>;
type DepartureMarker = {
  coordinate: {latitude: number; longitude: number};
  id: string;
  title: string;
};

const DEFAULT_MAP_REGION: Region = {
  latitude: 37.38965,
  longitude: 126.9325,
  latitudeDelta: 0.035,
  longitudeDelta: 0.035,
};

const DEPARTURE_COORDINATES_BY_LABEL = DEPARTURE_OPTIONS.flatMap(
  (row, rowIndex) =>
    row.map((label, columnIndex) => ({
      coordinate: DEPARTURE_LOCATION[rowIndex][columnIndex],
      label,
    })),
).reduce<Record<string, {latitude: number; longitude: number}>>(
  (accumulator, item) => {
    accumulator[item.label] = item.coordinate;
    return accumulator;
  },
  {},
);

const TaxiScreenState = ({
  actionLabel,
  description,
  icon,
  onPressAction,
  title,
}: {
  actionLabel?: string;
  description: string;
  icon: React.ReactNode;
  onPressAction?: () => void;
  title: string;
}) => {
  return (
    <View style={styles.stateCard}>
      <View style={styles.stateIcon}>{icon}</View>
      <Text style={styles.stateTitle}>{title}</Text>
      <Text style={styles.stateDescription}>{description}</Text>
      {actionLabel && onPressAction ? (
        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.85}
          onPress={onPressAction}
          style={styles.stateButton}>
          <Text style={styles.stateButtonLabel}>{actionLabel}</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export const TaxiScreen = () => {
  useScreenView();

  const navigation = useNavigation<TaxiNavigationProp>();
  const insets = useSafeAreaInsets();
  const screenAnimatedStyle = useScreenEnterAnimation();
  const {location} = useTaxiLocation();
  const {
    data,
    error,
    loading,
    refetch,
    selectFilter,
    selectSort,
    setSearchQuery,
  } = useTaxiHomeData();
  const [expandedPartyId, setExpandedPartyId] = React.useState<string | null>(
    null,
  );
  const hasActiveParty = true;
  // TODO: 참여 중인 파티 세션 API와 연결해서 플로팅 버튼 노출 여부를 결정한다.

  const contentContainerStyle = React.useMemo(
    () => ({
      paddingBottom:
        BOTTOM_TAB_BAR_HEIGHT +
        insets.bottom +
        V2_SPACING.xxl +
        (hasActiveParty ? 72 : 0),
    }),
    [hasActiveParty, insets.bottom],
  );

  const mapRegion = React.useMemo<Region>(() => {
    if (!location) {
      return DEFAULT_MAP_REGION;
    }

    return {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: DEFAULT_MAP_REGION.latitudeDelta,
      longitudeDelta: DEFAULT_MAP_REGION.longitudeDelta,
    };
  }, [location]);

  const departureMarkers = React.useMemo(
    (): DepartureMarker[] =>
      (data?.parties ?? [])
        .map(party => ({
          coordinate: DEPARTURE_COORDINATES_BY_LABEL[party.departureLabel],
          id: party.id,
          title: party.departureLabel,
        }))
        .filter((marker): marker is DepartureMarker =>
          Boolean(marker.coordinate),
        ),
    [data?.parties],
  );

  const handlePressCreateParty = React.useCallback(() => {
    navigation.navigate('Recruit');
  }, [navigation]);

  const handlePressMyPartyChat = React.useCallback(() => {
    Alert.alert('준비 중', 'TODO: 실제 참여 중인 파티 채팅으로 연결할 예정입니다.');
    // TODO: 참여 중인 파티 세션 API와 연결한 뒤 실제 partyId로 Chat 화면으로 이동한다.
  }, []);

  React.useEffect(() => {
    if (!expandedPartyId) {
      return;
    }

    if (!data?.parties.some(party => party.id === expandedPartyId)) {
      setExpandedPartyId(null);
    }
  }, [data?.parties, expandedPartyId]);

  const handlePressPartyCard = React.useCallback(
    (party: TaxiHomePartyCardViewData) => {
      if (party.statusTone !== 'active') {
        return;
      }

      setExpandedPartyId(currentExpandedId =>
        currentExpandedId === party.id ? null : party.id,
      );
    },
    [],
  );

  const handlePressPartyJoinAction = React.useCallback(
    (party: TaxiHomePartyCardViewData) => {
      if (party.joinAction.state === 'joined') {
        return;
      }

      if (party.joinAction.state === 'blocked-by-other-party') {
        Alert.alert(
          '이미 다른 파티에 참여중이에요.',
          '기존 파티 탈퇴 후 다시 요청해주세요.',
        );
        return;
      }

      if (party.acceptancePendingSeed) {
        navigation.navigate('AcceptancePending', {
          seed: party.acceptancePendingSeed,
        });
        return;
      }

      Alert.alert('대기 정보를 찾을 수 없습니다', '잠시 후 다시 시도해주세요.');
    },
    [navigation],
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Animated.View style={[styles.screen, screenAnimatedStyle]}>
        <LinearGradient
          colors={[V2_COLORS.brand.primarySoft, V2_COLORS.border.accent]}
          end={{x: 1, y: 1}}
          start={{x: 0, y: 0}}
          style={[styles.hero, {height: WINDOW_HEIGHT * 0.35}]}>
          <MapView
            pitchEnabled={false}
            region={mapRegion}
            rotateEnabled={false}
            showsCompass={false}
            showsMyLocationButton={false}
            showsUserLocation={Boolean(location)}
            style={styles.heroMap}
            toolbarEnabled={false}>
            {departureMarkers.map(marker => (
              <Marker
                coordinate={marker.coordinate}
                key={marker.id}
                pinColor={V2_COLORS.brand.primaryStrong}
                title={marker.title}
              />
            ))}
          </MapView>
          <View style={[styles.heroContent, {paddingTop: insets.top}]}>
            <TaxiHomeSearchBar
              onChangeText={setSearchQuery}
              placeholder={data?.searchPlaceholder ?? '출발지 검색'}
              value={data?.searchQuery ?? ''}
            />
          </View>
        </LinearGradient>
        <View style={styles.filterSection}>
          <TaxiHomeFilterChips
            filters={data?.filterChips ?? []}
            onPressFilter={selectFilter}
          />
        </View>
        <ScrollView
          contentContainerStyle={contentContainerStyle}
          refreshControl={
            <RefreshControl
              onRefresh={refetch}
              refreshing={loading && !!data}
              tintColor={V2_COLORS.brand.primary}
            />
          }
          showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.88}
              onPress={handlePressCreateParty}
              style={styles.primaryButton}>
              <Icon
                color={V2_COLORS.text.inverse}
                name="add-outline"
                size={20}
              />
              <Text style={styles.primaryButtonLabel}>
                {data?.primaryActionLabel ?? '새 파티 만들기'}
              </Text>
            </TouchableOpacity>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {data?.sectionTitle ?? '모집 중인 파티'}{' '}
                {data ? `(${data.visiblePartyCount})` : ''}
              </Text>
              <TaxiHomeSortMenu
                onSelect={selectSort}
                options={data?.sortOptions ?? []}
                selectedLabel={data?.selectedSortLabel ?? '최신순'}
              />
            </View>

            {loading && !data ? (
              <TaxiScreenState
                description="택시 홈 화면을 준비하고 있습니다."
                icon={<ActivityIndicator color={V2_COLORS.brand.primary} />}
                title="Taxi 화면 로딩 중"
              />
            ) : null}

            {error && !data ? (
              <TaxiScreenState
                actionLabel="다시 시도"
                description={error}
                icon={
                  <Icon
                    color={V2_COLORS.accent.orange}
                    name="refresh-outline"
                    size={24}
                  />
                }
                onPressAction={() => {
                  refetch().catch(() => undefined);
                }}
                title="Taxi 화면을 불러오지 못했습니다"
              />
            ) : null}

            {data?.emptyState ? (
              <TaxiScreenState
                description={data.emptyState.description}
                icon={
                  <Icon
                    color={V2_COLORS.text.muted}
                    name="car-sport-outline"
                    size={28}
                  />
                }
                title={data.emptyState.title}
              />
            ) : null}

            {data?.parties.map(party => (
              <TaxiHomePartyCard
                expanded={expandedPartyId === party.id}
                key={party.id}
                onPressCard={handlePressPartyCard}
                onPressJoinAction={handlePressPartyJoinAction}
                party={party}
              />
            ))}
          </View>
        </ScrollView>

        {hasActiveParty ? (
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.88}
            onPress={handlePressMyPartyChat}
            style={[
              styles.liveChatFloatingButton,
              {
                bottom: BOTTOM_TAB_BAR_HEIGHT + insets.bottom + V2_SPACING.lg,
              },
            ]}>
            <Icon
              color={V2_COLORS.text.inverse}
              name="chatbubble-ellipses-outline"
              size={18}
            />
            <Text style={styles.liveChatFloatingButtonLabel}>
              {data?.liveChatActionLabel ?? '파티 채팅 가기'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: V2_COLORS.background.page,
  },
  screen: {
    flex: 1,
  },
  hero: {
    height: 288,
  },
  heroMap: {
    ...StyleSheet.absoluteFillObject,
  },
  heroContent: {
    paddingHorizontal: V2_SPACING.lg,
  },
  filterSection: {
    backgroundColor: V2_COLORS.background.surface,
    borderBottomColor: V2_COLORS.border.default,
    borderBottomWidth: 1,
    paddingBottom: V2_SPACING.md + 1,
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: V2_SPACING.lg,
  },
  content: {
    gap: V2_SPACING.md,
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: V2_SPACING.lg,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primary,
    borderRadius: V2_RADIUS.lg,
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    height: 60,
    justifyContent: 'center',
    ...V2_SHADOWS.floating,
  },
  primaryButtonLabel: {
    color: V2_COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
  liveChatFloatingButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primaryStrong,
    borderRadius: V2_RADIUS.pill,
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    height: 48,
    justifyContent: 'center',
    paddingHorizontal: V2_SPACING.lg,
    position: 'absolute',
    right: V2_SPACING.lg,
    ...V2_SHADOWS.floating,
  },
  liveChatFloatingButtonLabel: {
    color: V2_COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  sectionTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
  },
  stateCard: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.subtle,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    paddingHorizontal: V2_SPACING.xl,
    paddingVertical: V2_SPACING.xxl,
    ...V2_SHADOWS.card,
  },
  stateIcon: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    marginBottom: V2_SPACING.md,
    width: 32,
  },
  stateTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: V2_SPACING.xs,
    textAlign: 'center',
  },
  stateDescription: {
    color: V2_COLORS.text.secondary,
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
  stateButton: {
    backgroundColor: V2_COLORS.brand.primaryTint,
    borderRadius: V2_RADIUS.pill,
    marginTop: V2_SPACING.lg,
    paddingHorizontal: V2_SPACING.lg,
    paddingVertical: V2_SPACING.sm,
  },
  stateButtonLabel: {
    color: V2_COLORS.brand.primaryStrong,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});
