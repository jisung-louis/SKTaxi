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
import LinearGradient from 'react-native-linear-gradient';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {useScreenView} from '@/shared/hooks/useScreenView';
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
import {useMyParty} from '../hooks/useMyParty';
import type {TaxiStackParamList} from '../model/navigation';
import type {TaxiHomePartyCardViewData} from '../model/taxiHomeViewData';

type TaxiNavigationProp = NavigationProp<TaxiStackParamList>;

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
  const {hasParty, loading: myPartyLoading, partyId} = useMyParty();
  const {
    data,
    error,
    loading,
    refetch,
    selectFilter,
    selectSort,
    setSearchQuery,
  } = useTaxiHomeData();

  const contentContainerStyle = React.useMemo(
    () => ({
      paddingBottom: BOTTOM_TAB_BAR_HEIGHT + insets.bottom + V2_SPACING.xxl,
    }),
    [insets.bottom],
  );

  const handlePressCreateParty = React.useCallback(() => {
    navigation.navigate('Recruit');
  }, [navigation]);

  const handlePressMyPartyChat = React.useCallback(() => {
    if (!partyId) {
      Alert.alert(
        '내 파티가 없습니다',
        '현재 참여 중인 파티 채팅방이 없습니다.',
      );
      return;
    }

    navigation.navigate('Chat', {partyId});
  }, [navigation, partyId]);

  const handlePressPartyCard = React.useCallback(
    (party: TaxiHomePartyCardViewData) => {
      if (party.action.type === 'open-chat') {
        handlePressMyPartyChat();
        return;
      }

      Alert.alert(
        '다음 단계에서 연결합니다',
        '파티 상세 진입은 다음 단계에서 route를 붙일 예정입니다.',
      );
    },
    [handlePressMyPartyChat],
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
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
        <LinearGradient
          colors={[V2_COLORS.brand.primarySoft, V2_COLORS.border.accent]}
          end={{x: 1, y: 1}}
          start={{x: 0, y: 0}}
          style={[styles.hero, {paddingTop: V2_SPACING.lg}]}>
          <View style={styles.heroContent}>
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

        <View style={styles.content}>
          <TouchableOpacity
            accessibilityRole="button"
            activeOpacity={0.88}
            onPress={handlePressCreateParty}
            style={styles.primaryButton}>
            <Icon color={V2_COLORS.text.inverse} name="add-outline" size={20} />
            <Text style={styles.primaryButtonLabel}>
              {data?.primaryActionLabel ?? '새 파티 만들기'}
            </Text>
          </TouchableOpacity>

          {!myPartyLoading && hasParty && partyId ? (
            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.88}
              onPress={handlePressMyPartyChat}
              style={styles.secondaryButton}>
              <Icon
                color={V2_COLORS.brand.primaryStrong}
                name="chatbubble-ellipses-outline"
                size={18}
              />
              <Text style={styles.secondaryButtonLabel}>
                {data?.liveChatActionLabel ?? '내 파티 채팅방'}
              </Text>
            </TouchableOpacity>
          ) : null}

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
              key={party.id}
              onPress={handlePressPartyCard}
              party={party}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: V2_COLORS.background.page,
  },
  hero: {
    height: 288,
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
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    height: 48,
    justifyContent: 'center',
    ...V2_SHADOWS.card,
  },
  secondaryButtonLabel: {
    color: V2_COLORS.brand.primaryStrong,
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
