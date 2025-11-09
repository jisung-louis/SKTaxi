import React, { useEffect, useCallback, useRef, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  Share,
  Linking,
  Image
} from 'react-native';
import { doc, updateDoc, increment } from '@react-native-firebase/firestore';
import { db } from '../../config/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { format, formatDate, formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { POST_CATEGORY_LABELS } from '../../constants/board';
import { useBoardPost } from '../../hooks/useBoardPost';
import { useComments } from '../../hooks/useComments';
import { useAuth } from '../../hooks/useAuth';
import { useUserBoardInteractions } from '../../hooks/useUserBoardInteractions';
import { ToggleButton } from '../../components/common/ToggleButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import CommentInput, { CommentInputRef } from '../../components/common/CommentInput';
import UniversalCommentList from '../../components/common/UniversalCommentList';
import { HashTagText } from '../../components/common/HashTagText';
import { ImageViewer } from '../../components/board/ImageViewer';
import { useScreenView } from '../../hooks/useScreenView';
import { createReport, blockUser } from '../../lib/moderation';
import { isPostEdited } from '../../utils/boardUtils';

interface BoardDetailScreenProps {
  route: {
    params: {
      postId: string;
    };
  };
}

export const BoardDetailScreen: React.FC<BoardDetailScreenProps> = () => {
  useScreenView();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const postId = route?.params?.postId;
  const hasIncrementedView = useRef(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; authorName: string; isAnonymous: boolean } | null>(null);
  const commentInputRef = useRef<CommentInputRef>(null);
  const [isEditingComment, setIsEditingComment] = useState(false);

  const {
    post,
    loading,
    error,
    incrementViewCount,
    deletePost,
    refresh,
  } = useBoardPost(postId);

  const { isLiked, isBookmarked, toggleLike, toggleBookmark } = useUserBoardInteractions(postId);

  const {
    comments: rawComments,
    loading: commentsLoading,
    submitting: commentsSubmitting,
    addComment,
    addReply,
    updateComment,
    deleteComment,
  } = useComments('board', postId);

  // Comment 타입을 UniversalComment 타입으로 변환 (재귀적으로 답글의 답글도 변환)
  const convertComment = (comment: any): any => {
    const boardComment = comment as any;
    return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    isDeleted: comment.isDeleted,
    parentId: comment.parentId,
      authorId: boardComment.authorId || boardComment.userId,
    isAnonymous: comment.isAnonymous,
      authorName: boardComment.authorName || boardComment.userDisplayName,
    anonymousOrder: comment.anonymousOrder,
      replies: comment.replies?.map((reply: any) => convertComment(reply)) || []
    };
  };

  const comments = rawComments.map(comment => convertComment(comment));

  // 조회수 증가 (한 번만)
  useEffect(() => {
    if (post && !loading && !hasIncrementedView.current) {
      hasIncrementedView.current = true;
      incrementViewCount();
    }
  }, [post, loading, incrementViewCount]);

  const handleLike = useCallback(async () => {
    if (!post) return;
    
    try {
      // 사용자 상호작용 토글
      await toggleLike();
      
      // 게시글의 좋아요 수 업데이트
      const postRef = doc(db, 'boardPosts', post.id);
      if (isLiked) {
        // 좋아요 취소 - 수 감소
        await updateDoc(postRef, {
          likeCount: increment(-1),
        });
      } else {
        // 좋아요 - 수 증가
        await updateDoc(postRef, {
          likeCount: increment(1),
        });
      }
    } catch (err) {
      console.error('좋아요 처리 실패:', err);
    }
  }, [post, isLiked, toggleLike]);

  const handleBookmark = useCallback(async () => {
    if (!post) return;
    
    try {
      // 사용자 상호작용 토글
      await toggleBookmark();
      
      // 게시글의 북마크 수 업데이트
      const postRef = doc(db, 'boardPosts', post.id);
      if (isBookmarked) {
        // 북마크 취소 - 수 감소
        await updateDoc(postRef, {
          bookmarkCount: increment(-1),
        });
      } else {
        // 북마크 - 수 증가
        await updateDoc(postRef, {
          bookmarkCount: increment(1),
        });
      }
    } catch (err) {
      console.error('북마크 처리 실패:', err);
    }
  }, [post, isBookmarked, toggleBookmark]);

  const handleReport = useCallback(() => {
    if (!post) return;
    if (!user) {
      Alert.alert('로그인 필요', '신고를 하려면 로그인해주세요.');
      return;
    }
    const categories: Array<'스팸' | '욕설/혐오' | '불법/위험' | '음란물' | '기타'> = ['스팸', '욕설/혐오', '불법/위험', '음란물', '기타'];
    Alert.alert(
      '게시물 신고',
      '신고 사유를 선택해주세요.',
      [
        ...categories.map((cat) => ({
          text: cat,
          onPress: async () => {
            try {
              await createReport({
                targetType: 'post',
                targetId: post.id,
                targetAuthorId: post.authorId,
                category: cat,
              });
              Alert.alert(
                '신고 완료',
                '운영자가 24시간 이내 검토합니다. 감사합니다.',
                [
                  {
                    text: '작성자 차단',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await blockUser(post.authorId);
                        Alert.alert('차단 완료', '해당 사용자의 콘텐츠가 더 이상 표시되지 않습니다.');
                        navigation.goBack();
                      } catch (e) {
                        Alert.alert('오류', '차단에 실패했습니다. 잠시 후 다시 시도해주세요.');
                      }
                    },
                  },
                  { text: '확인' },
                ]
              );
            } catch (e) {
              Alert.alert('오류', '신고에 실패했습니다. 잠시 후 다시 시도해주세요.');
            }
          },
        })),
        { text: '취소', style: 'cancel' },
      ]
    );
  }, [post, user]);

  const handleShare = useCallback(async () => {
    if (!post) return;

    try {
      await Share.share({
        message: `${post.title}\n\n${post.content.substring(0, 100)}...`,
        title: post.title,
      });
    } catch (err) {
      console.error('공유 실패:', err);
    }
  }, [post]);

  const handleHashtagPress = useCallback((tag: string) => {
    // BoardMain으로 돌아가서 해시태그로 검색
    navigation.navigate('BoardMain', { 
      searchText: `#${tag}`,
      fromHashtag: true 
    });
  }, [navigation]);

  const handleImagePress = useCallback((index: number) => {
    setSelectedImageIndex(index);
    setImageViewerVisible(true);
  }, []);

  const handleReply = useCallback((commentId: string, authorName: string, isAnonymous: boolean) => {
    setReplyingTo({ commentId, authorName, isAnonymous });
    // 답글 모드로 전환 후 TextInput에 포커싱
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  const handleEdit = useCallback(() => {
    if (!post || !user || post.authorId !== user.uid) return;
    
    navigation.navigate('BoardEdit', { postId: post.id });
  }, [post, user, navigation]);

  const handleDelete = useCallback(() => {
    if (!post || !user || post.authorId !== user.uid) return;

    Alert.alert(
      '게시글 삭제',
      '정말로 이 게시글을 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { 
          text: '삭제', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost();
              Alert.alert('성공', '게시글이 삭제되었습니다.', [
                { text: '확인', onPress: () => navigation.goBack() }
              ]);
            } catch (err) {
              Alert.alert('오류', '게시글 삭제에 실패했습니다.');
            }
          }
        }
      ]
    );
  }, [post, user, deletePost, navigation]);

  

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return COLORS.accent.blue;
      case 'question': return COLORS.accent.green;
      case 'review': return COLORS.accent.orange;
      case 'announcement': return COLORS.accent.red;
      default: return COLORS.text.secondary;
    }
  };

  const isAuthor = user && post && user.uid === post.authorId;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.popToTop()}>
            <Icon name="chevron-back" size={36} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>게시글</Text>
          <View style={styles.headerRight} />
        </View>
        <LoadingSpinner style={styles.loading} />
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.popToTop()}>
            <Icon name="chevron-back" size={36} color={COLORS.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>게시글</Text>
          <View style={styles.headerRight} />
        </View>
        <ErrorMessage message={error || '게시글을 찾을 수 없습니다.'} onRetry={refresh} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.popToTop()}>
          <Icon name="chevron-back" size={36} color={COLORS.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter} pointerEvents="none">
          <Text style={styles.headerTitle}>게시글</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Icon name="share-outline" size={28} color={COLORS.text.primary} />
          </TouchableOpacity>
          {!isAuthor && (
            <TouchableOpacity onPress={handleReport} style={styles.headerButton}>
              <Icon name="alert-circle-outline" size={28} color={COLORS.text.primary} />
            </TouchableOpacity>
          )}
          {isAuthor && (
            <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
              <Icon name="create-outline" size={28} color={COLORS.text.primary} />
            </TouchableOpacity>
          )}
          {isAuthor && (
            <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
              <Icon name="trash-outline" size={28} color={COLORS.accent.red} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: isEditingComment ? (keyboardHeight > 0 ? keyboardHeight + 91 + 300 : 91 + 20 + 300) : (keyboardHeight > 0 ? keyboardHeight + 91 + 50 : 91 + 20 + 50) }}
      >
        <View style={[styles.postContainer, 
          { margin: post.isPinned ? 5 : 0, 
            outlineWidth: post.isPinned ? 1 : 0, 
            outlineColor: post.isPinned ? COLORS.accent.orange : undefined, 
            borderRadius: post.isPinned ? 12 : 0,
            borderWidth: post.isPinned ? 1 : 0,
            shadowOffset: post.isPinned ? { width: 0, height: 0 } : undefined,
            shadowColor: post.isPinned ? COLORS.accent.orange : undefined,
            shadowOpacity: post.isPinned ? 0.5 : undefined,
            shadowRadius: post.isPinned ? 4 : undefined,
            elevation: post.isPinned ? 3 : undefined,
            backgroundColor: post.isPinned ? COLORS.background.primary : undefined,
          }]}>
          {/* 카테고리 및 고정 배지 */}
          {/* <View style={styles.categoryRow}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(post.category) }]}>
              <Text style={styles.categoryText}>
                {POST_CATEGORY_LABELS[post.category]}
              </Text>
            </View>
          </View> */}
          {post.isPinned && (
            <View style={styles.pinnedBadge}>
              <Text style={styles.pinnedText}>📌 고정</Text>
            </View>
          )}

          {/* 작성자 정보 및 작성일 */}
            <View style={styles.authorInfo}>
              <View style={[styles.authorAvatar, post.isAnonymous && styles.anonymousAvatar]}>
                <Text style={styles.authorInitial}>
                  {post.isAnonymous ? '익' : post.authorName.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.authorName}>{post.isAnonymous ? '익명' : post.authorName}</Text>
                <View style={styles.postDateRow}>
                  <Text style={styles.postDate}>{format(post.createdAt, 'yyyy.MM.dd HH:mm', { locale: ko })}</Text>
                  {isPostEdited(post.createdAt, post.updatedAt) && (
                    <>
                      <Text style={styles.postDate}>•</Text>
                      <Text style={styles.postDate}>수정됨</Text>
                    </>
                  )}
                </View>
              </View>
            </View>

          {/* 제목 */}
          <Text style={styles.title}>{post.title}</Text>

          {/* 내용 + 이미지 (이미지를 본문 아래 세로로 풀폭 표시) */}
          <View style={styles.contentContainer}>
            <HashTagText 
              text={post.content}
              onHashtagPress={handleHashtagPress}
              style={styles.contentText}
            />

            {post.images && post.images.length > 0 && (
              <View style={{ gap: 10, marginTop: 12 }}>
                {post.images.map((image, index) => (
                  <TouchableOpacity key={index} activeOpacity={0.8} onPress={() => handleImagePress(index)}>
                    <Image
                      source={{ uri: image.url }}
                      style={[
                        styles.contentImage,
                        { aspectRatio: image.width && image.height ? image.width / image.height : undefined },
                      ]}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* 통계 및 액션 버튼 */}
          <View style={styles.statsRow}>
            <View style={styles.statsLeft}>
              <View style={styles.statItem}>
                <Icon name="eye-outline" size={16} color={COLORS.text.secondary} />
                <Text style={styles.statText}>{post.viewCount}</Text>
              </View>
              <View style={styles.statItem}>
                <Icon name="chatbubble-outline" size={16} color={COLORS.text.secondary} />
                <Text style={styles.statText}>{post.commentCount}</Text>
              </View>
            </View>
            <View style={styles.actionButtons}>
              <ToggleButton
                type="like"
                count={post.likeCount}
                isActive={isLiked}
                onPress={handleLike}
                size="medium"
              />
              <ToggleButton
                type="bookmark"
                count={post.bookmarkCount}
                isActive={isBookmarked}
                onPress={handleBookmark}
                size="medium"
              />
            </View>
          </View>
        </View>

        {/* 댓글 섹션 */}
        <View style={styles.commentsSection}>
            <UniversalCommentList
                comments={comments}
                loading={commentsLoading}
                onAddComment={async (content: string, isAnonymous?: boolean) => addComment(content, undefined, isAnonymous)}
                onAddReply={addReply}
                onUpdateComment={updateComment}
                onDeleteComment={deleteComment}
                onReply={handleReply}
                submitting={commentsSubmitting}
                currentUserId={user?.uid}
                postAuthorId={post?.authorId}
                borderTop={!post.isPinned}
                replyingToCommentId={replyingTo?.commentId}
                onEditStateChange={setIsEditingComment}
            />
        </View>
      </ScrollView>

      {/* 댓글 입력 */}
      {!replyingTo && !isEditingComment && (
      <CommentInput
        ref={commentInputRef}
        onSubmit={async (content: string, isAnonymous?: boolean) => {
            await addComment(content, undefined, isAnonymous);
          }}
          submitting={commentsSubmitting}
          placeholder={"댓글을 입력하세요..."}
          parentId={undefined}
          onKeyboardHeightChange={setKeyboardHeight}
          onCancelReply={handleCancelReply}
        />
      )}
      {replyingTo && !isEditingComment && (
        <CommentInput
          ref={commentInputRef}
          onSubmit={async (content: string, isAnonymous?: boolean) => {
            await addReply(replyingTo.commentId, content, isAnonymous);
            setReplyingTo(null);
        }}
        submitting={commentsSubmitting}
        placeholder={replyingTo ? `${replyingTo.isAnonymous ? '익명' : replyingTo.authorName}님에게 답글...` : "댓글을 입력하세요..."}
        parentId={replyingTo?.commentId}
        onKeyboardHeightChange={setKeyboardHeight}
        onCancelReply={handleCancelReply}
      />
      )}

      {/* 이미지 뷰어 */}
      {post?.images && (
        <ImageViewer
          visible={imageViewerVisible}
          images={post.images}
          initialIndex={selectedImageIndex}
          onClose={() => setImageViewerVisible(false)}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.primary,
  },
  headerCenter: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 4,
    marginLeft: 6,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  postContainer: {
    padding: 20,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  categoryText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  pinnedBadge: {
    backgroundColor: COLORS.accent.orange + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  pinnedText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.accent.orange,
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text.primary,
    marginBottom: 16,
    lineHeight: 28,
  },
  postDateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  // authorRow: {
  //   flexDirection: 'row',
  //   alignItems: 'center',
  //   justifyContent: 'space-between',
  //   marginBottom: 16,
  // },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  authorAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.accent.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorInitial: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  authorName: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  postDate: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  contentContainer: {
    // backgroundColor: COLORS.background.secondary,
    // borderRadius: 12,
    // padding: 16,
    marginBottom: 20,
  },
  contentText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  contentImage: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: COLORS.background.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imagesContainer: {
    marginBottom: 20,
  },
  imagesTitle: {
    ...TYPOGRAPHY.subtitle2,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 12,
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  imageItem: {
    position: 'relative',
    width: '30%',
    aspectRatio: 1,
  },
  imageThumbnail: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: COLORS.background.secondary,
  },
  moreImagesOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.white,
    fontWeight: '700',
  },
  commentsSection: {
    
  },
  commentsTitle: {
    ...TYPOGRAPHY.subtitle2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  anonymousAvatar: {
    backgroundColor: COLORS.text.secondary,
  },
});
