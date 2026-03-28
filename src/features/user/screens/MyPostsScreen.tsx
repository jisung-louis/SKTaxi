import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {type CampusStackParamList} from '@/app/navigation/types';
import {navigateToBoardDetail} from '@/features/board';
import {StackHeader, StateCard} from '@/shared/design-system/components';
import {COLORS} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks/useScreenView';

import {UserPostListItem} from '../components/UserPostListItem';
import {useMyPostsScreenData} from '../hooks/useMyPostsScreenData';

export const MyPostsScreen = () => {
  useScreenView();

  const navigation =
    useNavigation<NativeStackNavigationProp<CampusStackParamList>>();
  const {data, error, loading, reload} = useMyPostsScreenData();

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <StackHeader
        onPressBack={() => navigation.goBack()}
        rightAccessory={
          data ? (
            <View style={styles.countBadge}>
              <Text style={styles.countLabel}>{data.countLabel}</Text>
            </View>
          ) : undefined
        }
        title="내가 쓴 글"
      />

      {loading && !data ? (
        <View style={styles.stateWrap}>
          <StateCard
            description="내가 쓴 글을 준비하고 있습니다."
            icon={<ActivityIndicator color={COLORS.brand.primary} />}
            title="내가 쓴 글을 불러오는 중"
          />
        </View>
      ) : null}

      {error && !data ? (
        <View style={styles.stateWrap}>
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
            title="내가 쓴 글을 불러오지 못했습니다"
          />
        </View>
      ) : null}

      {data ? (
        <ScrollView
          bounces={false}
          showsVerticalScrollIndicator={false}
          style={styles.scroll}>
          {data.items.length > 0 ? (
            data.items.map((item, index) => (
              <UserPostListItem
                key={item.postId}
                isLast={index === data.items.length - 1}
                item={item}
                onPress={postId => navigateToBoardDetail(navigation, postId)}
              />
            ))
          ) : (
            <View style={styles.stateWrap}>
              <StateCard
                description="아직 작성한 게시글이 없습니다. 첫 글을 작성해보세요."
                icon={
                  <Icon
                    color={COLORS.accent.blue}
                    name="document-text-outline"
                    size={28}
                  />
                }
                title="작성한 글이 없습니다"
              />
            </View>
          )}
        </ScrollView>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background.page,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  stateWrap: {
    padding: 16,
  },
  countBadge: {
    backgroundColor: COLORS.brand.primaryTint,
    borderRadius: 9999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countLabel: {
    color: COLORS.brand.primaryStrong,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
});
