import React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {type CampusStackParamList} from '@/app/navigation/types';
import {StackHeader, StateCard} from '@/shared/design-system/components';
import {V2_COLORS, V2_SPACING} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks/useScreenView';

import {TaxiHistoryListItem} from '../components/TaxiHistoryListItem';
import {TaxiHistorySummaryCard} from '../components/TaxiHistorySummaryCard';
import {useTaxiHistoryScreenData} from '../hooks/useTaxiHistoryScreenData';

export const TaxiHistoryScreen = () => {
  useScreenView();

  const navigation =
    useNavigation<NativeStackNavigationProp<CampusStackParamList>>();
  const {data, error, loading, reload} = useTaxiHistoryScreenData();

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <StackHeader
        onPressBack={() => navigation.goBack()}
        title="택시 이용 내역"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {loading && !data ? (
          <StateCard
            description="택시 이용 내역을 준비하고 있습니다."
            icon={<ActivityIndicator color={V2_COLORS.brand.primary} />}
            title="택시 이용 내역을 불러오는 중"
          />
        ) : null}

        {error && !data ? (
          <StateCard
            actionLabel="다시 시도"
            description={error}
            icon={
              <Icon
                color={V2_COLORS.accent.orange}
                name="alert-circle-outline"
                size={28}
              />
            }
            onPressAction={() => {
              reload().catch(() => undefined);
            }}
            title="택시 이용 내역을 불러오지 못했습니다"
          />
        ) : null}

        {data ? (
          <>
            <TaxiHistorySummaryCard item={data.summary} />

            <View style={styles.list}>
              {data.entries.map(item => (
                <TaxiHistoryListItem key={item.id} item={item} />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  content: {
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: 20,
    paddingBottom: 24,
  },
  list: {
    gap: 12,
    marginTop: 20,
  },
});
