import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import type {CampusStackParamList} from '@/app/navigation/types';
import {
  V2StackHeader,
  V2StateCard,
} from '@/shared/design-system/components';
import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks/useScreenView';

import {AppNoticeBadge} from '../components/v2/AppNoticeBadge';
import {AppNoticeHeroCarousel} from '../components/v2/AppNoticeHeroCarousel';
import {useAppNoticeDetailData} from '../hooks/useAppNoticeDetailData';

type AppNoticeDetailNavigationProp = NativeStackNavigationProp<
  CampusStackParamList,
  'AppNoticeDetail'
>;
type AppNoticeDetailRouteProp = RouteProp<
  CampusStackParamList,
  'AppNoticeDetail'
>;

export const AppNoticeDetailScreen = () => {
  useScreenView();

  const navigation = useNavigation<AppNoticeDetailNavigationProp>();
  const route = useRoute<AppNoticeDetailRouteProp>();
  const {data, error, loading, reload} = useAppNoticeDetailData(
    route.params?.noticeId,
  );
  const hasGallery = (data?.galleryImages.length ?? 0) > 0;

  const renderLoadingState = () => (
    <View style={styles.stateContainer}>
      <V2StateCard
        description="앱 공지사항 상세 내용을 준비하고 있습니다."
        icon={<ActivityIndicator color={V2_COLORS.brand.primary} />}
        title="앱 공지사항을 불러오는 중"
      />
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.stateContainer}>
      <V2StateCard
        actionLabel="다시 시도"
        description={
          error ?? '앱 공지사항을 찾지 못했습니다. 잠시 후 다시 시도해주세요.'
        }
        icon={
          <Icon
            color={V2_COLORS.accent.orange}
            name="alert-circle-outline"
            size={26}
          />
        }
        onPressAction={reload}
        title="앱 공지사항을 열 수 없습니다"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
      <V2StackHeader
        onPressBack={() => navigation.goBack()}
        title="앱 공지사항"
      />

      {loading && !data ? renderLoadingState() : null}
      {!loading && (!data || error) ? renderErrorState() : null}

      {data ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {data.galleryImages.length > 0 ? (
            <AppNoticeHeroCarousel images={data.galleryImages} />
          ) : null}

          <View
            style={[
              styles.bodyCard,
              hasGallery ? styles.bodyCardWithGallery : styles.bodyCardStandalone,
            ]}>
            <View style={styles.badgeRow}>
              {data.badges.map(badge => (
                <AppNoticeBadge key={badge.id} badge={badge} />
              ))}
            </View>

            <Text style={styles.title}>{data.title}</Text>

            <View style={styles.metaRow}>
              <View style={styles.authorRow}>
                <View style={styles.authorIcon}>
                  <Icon
                    color={V2_COLORS.brand.primaryStrong}
                    name="shield-checkmark"
                    size={14}
                  />
                </View>
                <Text style={styles.authorLabel}>{data.authorLabel}</Text>
              </View>

              <Text style={styles.metaSeparator}>|</Text>
              <Text style={styles.metaLabel}>{data.publishedLabel}</Text>
              <Text style={styles.metaSeparator}>|</Text>

              <View style={styles.viewCountRow}>
                <Icon
                  color={V2_COLORS.text.muted}
                  name="eye-outline"
                  size={14}
                />
                <Text style={styles.metaLabel}>{data.viewCountLabel}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.paragraphGroup}>
              {data.bodyParagraphs.map((paragraph, index) => (
                <Text key={`${data.id}-paragraph-${index}`} style={styles.bodyText}>
                  {paragraph}
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: V2_SPACING.lg,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  bodyCard: {
    backgroundColor: V2_COLORS.background.surface,
    minHeight: 320,
    paddingHorizontal: V2_SPACING.xl,
    paddingVertical: V2_SPACING.xl,
    ...V2_SHADOWS.card,
  },
  bodyCardWithGallery: {
    borderTopLeftRadius: V2_RADIUS.lg,
    borderTopRightRadius: V2_RADIUS.lg,
    marginTop: -1,
  },
  bodyCardStandalone: {
    borderRadius: V2_RADIUS.lg,
    marginHorizontal: V2_SPACING.lg,
    marginTop: V2_SPACING.lg,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: V2_SPACING.sm,
    marginBottom: V2_SPACING.md,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 30,
    marginBottom: V2_SPACING.md,
  },
  metaRow: {
    alignItems: 'center',
    columnGap: V2_SPACING.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 6,
  },
  authorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  authorIcon: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primaryTint,
    borderRadius: V2_RADIUS.pill,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  authorLabel: {
    color: V2_COLORS.brand.primaryStrong,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  metaSeparator: {
    color: V2_COLORS.border.default,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
  },
  metaLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 18,
  },
  viewCountRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  divider: {
    backgroundColor: V2_COLORS.border.subtle,
    height: 1,
    marginVertical: V2_SPACING.lg,
  },
  paragraphGroup: {
    gap: V2_SPACING.md,
  },
  bodyText: {
    color: V2_COLORS.text.strong,
    fontSize: 14,
    lineHeight: 28,
  },
});
