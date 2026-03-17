import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import Animated from 'react-native-reanimated';

import {
  V2DetailBackHeader,
  V2DetailBodyBlocks,
  V2DetailCommentCard,
  V2DetailComposer,
  V2DetailNotFoundState,
  V2DetailReactionChip,
  V2StateCard,
  V2ToneBadge,
} from '@/shared/design-system/components';
import {V2_COLORS, V2_RADIUS, V2_SPACING} from '@/shared/design-system/tokens';
import {
  useKeyboardInset,
  useScreenEnterAnimation,
  useScreenView,
} from '@/shared/hooks';

import type {BoardStackParamList} from '../model/navigation';
import {useBoardDetailData} from '../hooks/useBoardDetailData';
import {BoardDetailPopupMenu} from '../components/v2/BoardDetailPopupMenu';

type BoardDetailNavigationProp = NativeStackNavigationProp<
  BoardStackParamList,
  'BoardDetail'
>;

export const BoardDetailScreen = () => {
  useScreenView();

  const navigation = useNavigation<BoardDetailNavigationProp>();
  const route =
    useRoute<
      NativeStackScreenProps<BoardStackParamList, 'BoardDetail'>['route']
    >();
  const insets = useSafeAreaInsets();
  const {height: keyboardHeight, isVisible: isKeyboardVisible} =
    useKeyboardInset();
  const screenAnimatedStyle = useScreenEnterAnimation();
  const [isMenuVisible, setIsMenuVisible] = React.useState(false);
  const {data, error, loading, notFound, reload} = useBoardDetailData(
    route.params?.postId,
  );

  const headerOffset = insets.top + 56;
  const scrollBottomPadding = isKeyboardVisible
    ? keyboardHeight + 88 + insets.bottom
    : 88;

  const handlePressBack = React.useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate('BoardMain');
  }, [navigation]);

  const handlePressReturnToList = React.useCallback(() => {
    navigation.navigate('BoardMain');
  }, [navigation]);

  const handlePressReport = React.useCallback(() => {
    Alert.alert('게시글 신고', '신고 기능은 다음 단계에서 연결할 예정입니다.');
  }, []);

  const handlePressEdit = React.useCallback(() => {
    if (route.params?.postId) {
      navigation.navigate('BoardEdit', {postId: route.params.postId});
      return;
    }

    Alert.alert('게시글 수정', '수정할 게시글 정보를 찾지 못했습니다.');
  }, [navigation, route.params?.postId]);

  const handlePressDelete = React.useCallback(() => {
    Alert.alert('게시글 삭제', '삭제 메뉴 연결은 다음 단계에서 진행할 예정입니다.');
  }, []);

  const categoryBadge = data?.metaBadges[0];

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Animated.View style={[styles.screen, screenAnimatedStyle]}>
        {loading ? (
          <View style={[styles.centeredState, {paddingTop: headerOffset}]}>
            <ActivityIndicator color={V2_COLORS.brand.primary} size="large" />
          </View>
        ) : notFound ? (
          <View style={[styles.centeredState, {paddingTop: headerOffset}]}>
            <V2DetailNotFoundState
              actionLabel="목록으로 돌아가기"
              onPressAction={handlePressReturnToList}
              title="게시물을 찾을 수 없어요"
            />
          </View>
        ) : error ? (
          <View style={[styles.centeredState, {paddingTop: headerOffset}]}>
            <V2StateCard
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
              title="게시물을 불러오지 못했습니다"
            />
          </View>
        ) : data ? (
          <>
            <ScrollView
              contentInsetAdjustmentBehavior="never"
              contentContainerStyle={[
                styles.scrollContent,
                {
                  paddingBottom: scrollBottomPadding,
                  paddingTop: headerOffset,
                },
              ]}
              keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
              keyboardShouldPersistTaps="handled"
              onScrollBeginDrag={() => {
                if (isMenuVisible) {
                  setIsMenuVisible(false);
                }
              }}
              showsVerticalScrollIndicator={false}>
              <View style={styles.metaRow}>
                {categoryBadge ? (
                  <V2ToneBadge
                    label={categoryBadge.label}
                    tone={categoryBadge.tone}
                  />
                ) : null}
                <Text style={styles.dateLabel}>{data.dateLabel}</Text>
              </View>

              <Text style={styles.title}>{data.title}</Text>

              {data.authorLabel ? (
                <View style={styles.authorRow}>
                  <View style={styles.avatarCircle}>
                    <Icon
                      color={V2_COLORS.text.muted}
                      name="person-outline"
                      size={14}
                    />
                  </View>
                  <Text style={styles.authorLabel}>{data.authorLabel}</Text>
                </View>
              ) : null}

              <View style={styles.divider} />
              <V2DetailBodyBlocks blocks={data.bodyBlocks} />

              <View style={styles.reactionsRow}>
                {data.reactions.map(reaction => (
                  <V2DetailReactionChip
                    count={reaction.count}
                    iconName={reaction.iconName}
                    key={reaction.id}
                  />
                ))}
              </View>

              <View style={[styles.divider, styles.commentsDivider]} />
              <Text style={styles.commentsTitle}>댓글 {data.comments.length}</Text>

              {data.comments.length === 0 ? (
                <View style={styles.emptyCommentsWrap}>
                  <Text style={styles.emptyCommentsLabel}>
                    {data.emptyCommentsLabel}
                  </Text>
                </View>
              ) : (
                <View style={styles.commentsList}>
                  {data.comments.map(comment => (
                    <V2DetailCommentCard comment={comment} key={comment.id} />
                  ))}
                </View>
              )}
            </ScrollView>

            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'position' : 'height'}
              keyboardVerticalOffset={0}
              pointerEvents="box-none"
              style={styles.composerAvoidingView}>
              <V2DetailComposer placeholder={data.commentInputPlaceholder} />
            </KeyboardAvoidingView>
          </>
        ) : null}

        <V2DetailBackHeader
          onPressBack={handlePressBack}
          rightAccessory={
            <TouchableOpacity
              accessibilityLabel="게시물 메뉴"
              accessibilityRole="button"
              activeOpacity={0.82}
              onPress={() => {
                setIsMenuVisible(previous => !previous);
              }}
              style={styles.menuButton}>
              <Icon
                color={V2_COLORS.text.secondary}
                name="ellipsis-vertical"
                size={18}
              />
            </TouchableOpacity>
          }
        />
        <BoardDetailPopupMenu
          onClose={() => {
            setIsMenuVisible(false);
          }}
          onPressDelete={handlePressDelete}
          onPressEdit={handlePressEdit}
          onPressReport={handlePressReport}
          top={insets.top + 44}
          visible={isMenuVisible}
        />
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
  centeredState: {
    flex: 1,
    paddingHorizontal: V2_SPACING.lg,
  },
  scrollContent: {
    paddingHorizontal: V2_SPACING.lg,
  },
  metaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    marginBottom: V2_SPACING.md,
  },
  dateLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: V2_SPACING.md,
  },
  authorRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    marginBottom: V2_SPACING.xl,
  },
  avatarCircle: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.pill,
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  authorLabel: {
    color: V2_COLORS.text.tertiary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  divider: {
    backgroundColor: V2_COLORS.border.default,
    height: 1,
    marginBottom: V2_SPACING.xl,
  },
  reactionsRow: {
    flexDirection: 'row',
    gap: V2_SPACING.md,
    marginTop: V2_SPACING.xl,
  },
  commentsDivider: {
    marginBottom: V2_SPACING.lg,
    marginTop: V2_SPACING.xxl,
  },
  commentsTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
    marginBottom: V2_SPACING.md,
  },
  emptyCommentsWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 84,
    paddingVertical: 32,
  },
  emptyCommentsLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 14,
    lineHeight: 20,
  },
  commentsList: {
    paddingBottom: V2_SPACING.md,
  },
  composerAvoidingView: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  menuButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
});
