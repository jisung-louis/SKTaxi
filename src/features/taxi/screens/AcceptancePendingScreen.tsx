import React from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated from 'react-native-reanimated';

import {
  StateCard,
} from '@/shared/design-system/components';
import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';
import {useScreenEnterAnimation, useScreenView} from '@/shared/hooks';

import {TaxiAcceptancePendingInfoCard} from '../components/TaxiAcceptancePendingInfoCard';
import {TaxiAcceptancePendingStatus} from '../components/TaxiAcceptancePendingStatus';
import {useTaxiAcceptancePendingData} from '../hooks/useTaxiAcceptancePendingData';

import type {TaxiStackParamList} from '../model/navigation';
import { WINDOW_HEIGHT } from '@/shared/constants/layout';

type AcceptancePendingScreenNavigationProp = NativeStackNavigationProp<
  TaxiStackParamList,
  'AcceptancePending'
>;
type AcceptancePendingScreenRouteProp = RouteProp<
  TaxiStackParamList,
  'AcceptancePending'
>;

export const AcceptancePendingScreen = () => {
  useScreenView();

  const navigation = useNavigation<AcceptancePendingScreenNavigationProp>();
  const route = useRoute<AcceptancePendingScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const screenAnimatedStyle = useScreenEnterAnimation();
  const {cancelRequest, data, error, loading, refetch} =
    useTaxiAcceptancePendingData(route.params ?? {});

  const handleCancelRequest = React.useCallback(async () => {
    try {
      await cancelRequest();
      navigation.goBack();
    } catch (cancelError) {
      console.error('taxi acceptance pending cancel failed', cancelError);
      Alert.alert('오류', '동승 요청 취소에 실패했습니다.');
    }
  }, [cancelRequest, navigation]);

  React.useEffect(() => {
    if (!data) {
      return;
    }

    if (data.requestState === 'accepted') {
      navigation.reset({
        index: 1,
        routes: [
          {name: 'TaxiMain'},
          {name: 'Chat', params: {partyId: data.partyId}},
        ],
      });
      return;
    }

    if (data.requestState === 'declined') {
      Alert.alert('동승 요청 거절', '동승 요청이 거절되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    }
  }, [data, navigation]);

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Animated.View style={[styles.screen, screenAnimatedStyle]}>
        {loading && !data ? (
          <View style={styles.stateWrap}>
            <StateCard
              description="동승 요청 대기 화면을 준비하고 있습니다."
              icon={<ActivityIndicator color={V2_COLORS.brand.primary} />}
              title="수락 대기 화면 로딩 중"
            />
          </View>
        ) : null}

        {!loading && error ? (
          <View style={styles.stateWrap}>
            <StateCard
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
              title="대기 정보를 불러오지 못했습니다"
            />
          </View>
        ) : null}

        {!loading && !error && data ? (
          <ScrollView
            contentContainerStyle={[styles.content, {paddingBottom: insets.bottom + V2_SPACING.lg}]}
            showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.mainSection,
                {
                  paddingTop: Math.max(WINDOW_HEIGHT * 0.18, insets.top + V2_SPACING.lg),
                },
              ]}>
              <TaxiAcceptancePendingStatus
                description={data.heroDescription}
                title={data.heroTitle}
              />

              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.88}
                onPress={handleCancelRequest}
                style={styles.cancelButton}>
                <Icon
                  color={V2_COLORS.text.strong}
                  name="close-circle-outline"
                  size={18}
                />
                <Text style={styles.cancelButtonLabel}>
                  {data.cancelButtonLabel}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                {
                  paddingBottom: Math.max(insets.bottom, V2_SPACING.lg) + 48,
                },
              ]}>
              <TaxiAcceptancePendingInfoCard
                departureLabel={data.route.departureLabel}
                destinationLabel={data.route.destinationLabel}
                rows={data.rows}
                title={data.cardTitle}
              />
            </View>
          </ScrollView>
        ) : null}
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  stateWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: V2_SPACING.lg,
  },
  content: {
    justifyContent: 'space-between',
    paddingHorizontal: 24,
  },
  mainSection: {
    flex: 1,
    justifyContent: 'center',
  },
  cancelButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.gray,
    borderRadius: V2_RADIUS.lg,
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    height: 60,
    justifyContent: 'center',
    ...V2_SHADOWS.card,
    marginVertical: V2_SPACING.xxl,
  },
  cancelButtonLabel: {
    color: V2_COLORS.text.strong,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 21,
  },
  cancelHint: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    paddingTop: V2_SPACING.sm,
    textAlign: 'center',
  },
});
