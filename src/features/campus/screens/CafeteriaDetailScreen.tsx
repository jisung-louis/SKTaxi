import React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';

import type {CampusStackParamList} from '@/app/navigation/types';
import {StateCard} from '@/shared/design-system/components';
import {
  COLORS,
  SPACING,
} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks/useScreenView';

import {CafeteriaCategoryCard} from '../components/CafeteriaCategoryCard';
import {CafeteriaDetailHeader} from '../components/CafeteriaDetailHeader';
import {useCafeteriaDetailData} from '../hooks/useCafeteriaDetailData';

type CafeteriaDetailRouteProp = RouteProp<CampusStackParamList, 'CafeteriaDetail'>;
type CafeteriaDetailNavigationProp = NativeStackNavigationProp<
  CampusStackParamList,
  'CafeteriaDetail'
>;

export const CafeteriaDetailScreen = () => {
  useScreenView();

  const navigation = useNavigation<CafeteriaDetailNavigationProp>();
  const route = useRoute<CafeteriaDetailRouteProp>();
  const insets = useSafeAreaInsets();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const categoryRefs = React.useRef<Record<string, View | null>>({});
  const hasAutoScrolledRef = React.useRef(false);
  const scrollToCategoryParam = route.params?.scrollToCategory;
  const {data, error, loading, reload} = useCafeteriaDetailData();

  const scrollToCategory = React.useCallback((categoryId: string) => {
    const targetRef = categoryRefs.current[categoryId];

    if (!targetRef || !scrollViewRef.current) {
      return;
    }

    targetRef.measureLayout(
      scrollViewRef.current as never,
      (_x, y) => {
        scrollViewRef.current?.scrollTo({
          animated: true,
          y: Math.max(0, y - 16),
        });
      },
      () => undefined,
    );
  }, []);

  React.useEffect(() => {
    if (!data || !scrollToCategoryParam || hasAutoScrolledRef.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      hasAutoScrolledRef.current = true;
      scrollToCategory(scrollToCategoryParam);
    }, 260);

    return () => clearTimeout(timeoutId);
  }, [data, scrollToCategory, scrollToCategoryParam]);

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <View style={styles.container}>
        <CafeteriaDetailHeader
          onPressBack={() => navigation.goBack()}
          title={data?.title ?? '학식 메뉴'}
        />

        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.content,
            {paddingBottom: insets.bottom + SPACING.xxl},
          ]}
          showsVerticalScrollIndicator={false}>
          {loading && !data ? (
            <StateCard
              description="학식 메뉴를 준비하고 있습니다."
              icon={<ActivityIndicator color={COLORS.brand.primary} />}
              style={styles.stateCard}
              title="학식 메뉴를 불러오는 중"
            />
          ) : null}

          {error && !data ? (
            <StateCard
              actionLabel="다시 시도"
              description={error}
              icon={
                <Icon
                  color={COLORS.accent.orange}
                  name="alert-circle-outline"
                  size={28}
                />
              }
              onPressAction={() => {
                reload().catch(() => undefined);
              }}
              style={styles.stateCard}
              title="학식 메뉴를 불러오지 못했습니다"
            />
          ) : null}

          {data ? (
            <View style={styles.list}>
              {data.categories.map(category => (
                <View
                  key={category.id}
                  ref={node => {
                    categoryRefs.current[category.id] = node;
                  }}
                  collapsable={false}>
                  <CafeteriaCategoryCard category={category} />
                </View>
              ))}
            </View>
          ) : null}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background.page,
    flex: 1,
  },
  container: {
    backgroundColor: COLORS.background.page,
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  stateCard: {
    marginTop: SPACING.xs,
  },
  list: {
    gap: SPACING.lg,
  },
});
