import React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native';
import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {type CampusStackParamList} from '@/app/navigation/types';
import {navigateToBoardDetail} from '@/features/board';
import {navigateToNoticeDetail} from '@/features/notice';
import {StackHeader, StateCard} from '@/shared/design-system/components';
import {V2_COLORS} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks/useScreenView';

import {
  BookmarksTabBar,
  type BookmarksTabKey,
} from '../components/BookmarksTabBar';
import {UserNoticeBookmarkListItem} from '../components/UserNoticeBookmarkListItem';
import {UserPostListItem} from '../components/UserPostListItem';
import {useBookmarksScreenData} from '../hooks/useBookmarksScreenData';

type BookmarksRouteProp = RouteProp<CampusStackParamList, 'Bookmarks'>;

export const BookmarksScreen = () => {
  useScreenView();

  const navigation =
    useNavigation<NativeStackNavigationProp<CampusStackParamList>>();
  const route = useRoute<BookmarksRouteProp>();
  const {data, error, loading, reload} = useBookmarksScreenData();
  const [activeTab, setActiveTab] = React.useState<BookmarksTabKey>(
    route.params?.initialTab ?? 'community',
  );

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <StackHeader onPressBack={() => navigation.goBack()} title="북마크" />

      {loading && !data ? (
        <View style={styles.stateWrap}>
          <StateCard
            description="북마크를 준비하고 있습니다."
            icon={<ActivityIndicator color={V2_COLORS.brand.primary} />}
            title="북마크를 불러오는 중"
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
                color={V2_COLORS.accent.orange}
                name="alert-circle-outline"
                size={28}
              />
            }
            onPressAction={() => {
              reload().catch(() => undefined);
            }}
            title="북마크를 불러오지 못했습니다"
          />
        </View>
      ) : null}

      {data ? (
        <>
          <BookmarksTabBar
            activeTab={activeTab}
            communityCountLabel={data.communityCountLabel}
            noticeCountLabel={data.noticeCountLabel}
            onPressTab={setActiveTab}
          />

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scroll}>
            {activeTab === 'community'
              ? data.communityItems.map((item, index) => (
                  <UserPostListItem
                    bookmarkAlignedRight
                    key={item.postId}
                    isLast={index === data.communityItems.length - 1}
                    item={item}
                    onPress={postId => navigateToBoardDetail(navigation, postId)}
                  />
                ))
              : data.noticeItems.map((item, index) => (
                  <UserNoticeBookmarkListItem
                    key={item.noticeId}
                    isLast={index === data.noticeItems.length - 1}
                    item={item}
                    onPress={noticeId =>
                      navigateToNoticeDetail(navigation, noticeId)
                    }
                  />
                ))}
          </ScrollView>
        </>
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  stateWrap: {
    padding: 16,
  },
});
