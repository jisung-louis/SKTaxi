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
  Linking
} from 'react-native';
import { doc, updateDoc, increment } from '@react-native-firebase/firestore';
import { db } from '../../config/firebase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { POST_CATEGORY_LABELS } from '../../constants/board';
import { useBoardPost } from '../../hooks/useBoardPost';
import { useBoardComments } from '../../hooks/useBoardComments';
import { useAuth } from '../../hooks/useAuth';
import { useUserBoardInteractions } from '../../hooks/useUserBoardInteractions';
import { ToggleButton } from '../../components/common/ToggleButton';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import CommentInput from '../../components/common/CommentInput';
import UniversalCommentList from '../../components/common/UniversalCommentList';
import { HashTagText } from '../../components/common/HashTagText';

interface BoardDetailScreenProps {
  route: {
    params: {
      postId: string;
    };
  };
}

export const BoardDetailScreen: React.FC<BoardDetailScreenProps> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const postId = route?.params?.postId;
  const hasIncrementedView = useRef(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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
    updateComment,
    deleteComment,
  } = useBoardComments(postId);

  // BoardComment 타입을 UniversalComment 타입으로 변환
  const comments = rawComments.map(comment => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    isDeleted: comment.isDeleted,
    parentId: comment.parentId,
    authorId: comment.authorId,
    authorName: comment.authorName,
    replies: comment.replies?.map(reply => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
      isDeleted: reply.isDeleted,
      parentId: reply.parentId,
      authorId: reply.authorId,
      authorName: reply.authorName,
    })) || []
  }));

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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
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
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>게시글</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <Icon name="share-outline" size={20} color={COLORS.text.primary} />
          </TouchableOpacity>
          {isAuthor && (
            <TouchableOpacity onPress={handleEdit} style={styles.headerButton}>
              <Icon name="create-outline" size={20} color={COLORS.text.primary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentInset={{ bottom: keyboardHeight > 0 ? keyboardHeight + 91 : 91 + 20 }}
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.postContainer}>
          {/* 카테고리 및 고정 배지 */}
          <View style={styles.categoryRow}>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(post.category) }]}>
              <Text style={styles.categoryText}>
                {POST_CATEGORY_LABELS[post.category]}
              </Text>
            </View>
            {post.isPinned && (
              <View style={styles.pinnedBadge}>
                <Text style={styles.pinnedText}>📌 고정</Text>
              </View>
            )}
          </View>

          {/* 제목 */}
          <Text style={styles.title}>{post.title}</Text>

          {/* 작성자 정보 및 작성일 */}
          <View style={styles.authorRow}>
            <View style={styles.authorInfo}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorInitial}>
                  {post.authorName.charAt(0)}
                </Text>
              </View>
              <View>
                <Text style={styles.authorName}>{post.authorName}</Text>
                <Text style={styles.postDate}>
                  {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ko })}
                </Text>
              </View>
            </View>
            {isAuthor && (
              <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                <Icon name="trash-outline" size={18} color={COLORS.accent.red} />
              </TouchableOpacity>
            )}
          </View>


          {/* 내용 */}
          <View style={styles.contentContainer}>
            <HashTagText 
              text={post.content}
              onHashtagPress={handleHashtagPress}
              style={styles.contentText}
            />
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
                onAddComment={async (content: string) => addComment(content)}
                onAddReply={async (parentId: string, content: string) => addComment(content, parentId)}
                onUpdateComment={updateComment}
                onDeleteComment={deleteComment}
                submitting={commentsSubmitting}
                currentUserId={user?.uid}
            />
        </View>
      </ScrollView>

      {/* 댓글 입력 */}
      <CommentInput
        onSubmit={async (content: string) => addComment(content)}
        submitting={commentsSubmitting}
        placeholder="댓글을 입력하세요..."
        onKeyboardHeightChange={setKeyboardHeight}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.primary,
  },
  headerTitle: {
    ...TYPOGRAPHY.subtitle1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    marginLeft: 8,
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
    padding: 16,
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
    ...TYPOGRAPHY.caption,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  pinnedBadge: {
    backgroundColor: COLORS.accent.orange + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pinnedText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent.orange,
    fontWeight: '600',
  },
  title: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text.primary,
    marginBottom: 16,
    lineHeight: 28,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
  },
  contentContainer: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  contentText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
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
  commentsSection: {
    
  },
  commentsTitle: {
    ...TYPOGRAPHY.subtitle2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
});
