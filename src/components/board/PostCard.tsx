import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { BoardPost } from '../../types/board';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { POST_CATEGORY_LABELS } from '../../constants/board';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import Icon from 'react-native-vector-icons/Ionicons';

interface PostCardProps {
  post: BoardPost;
  onPress: (post: BoardPost) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onPress,
}) => {

  const handlePress = () => {
    onPress(post);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'general': return COLORS.accent.blue;
      case 'question': return COLORS.accent.green;
      case 'review': return COLORS.accent.orange;
      case 'announcement': return COLORS.accent.red;
      default: return COLORS.text.secondary;
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      {/* <View style={styles.header}>
        <View style={styles.categoryContainer}>
          <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(post.category) }]}>
            <Text style={styles.categoryText}>
              {POST_CATEGORY_LABELS[post.category]}
            </Text>
          </View>
          {post.isPinned && (
            <View style={styles.pinnedBadge}>
              <Text style={styles.pinnedText}>📌</Text>
            </View>
          )}
        </View>
        <Text style={styles.timeText}>
          {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ko })}
        </Text>
      </View> */}

      <View style={styles.body}>
        <View style={styles.bodyLeft}>
          <View style={styles.titleContainer}>
            {post.isPinned && (
              <View style={styles.pinnedBadge}>
                <Text style={styles.pinnedText}>📌</Text>
              </View>
            )}
            <Text style={styles.title} numberOfLines={1}>
              {post.title}
            </Text>
          </View>

          <Text style={styles.content} numberOfLines={3}>
            {post.content}
          </Text>
        </View>

        {/* 이미지 썸네일 */}
        {post.images && post.images.length > 0 && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: post.images[0].thumbUrl || post.images[0].url }}
              style={styles.imageThumbnail}
              resizeMode="cover"
            />
            {post.images.length > 1 && (
              <View style={styles.moreImagesBadge}>
                <Text style={styles.moreImagesText}>+{post.images.length - 1}</Text>
              </View>
            )}
          </View>
        )}
      </View>


      <View style={styles.footer}>
        <View style={styles.authorContainer}>
          {/* <View style={[styles.authorAvatar, post.isAnonymous && styles.anonymousAvatar]}>
            <Text style={styles.authorInitial}>
              {post.isAnonymous ? '익' : post.authorName.charAt(0)}
            </Text>
          </View> */}
          <Text style={styles.authorName}>{post.isAnonymous ? '익명' : post.authorName}</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.timeText}>
            {formatDistanceToNow(post.createdAt, { addSuffix: true, locale: ko })}
          </Text>
        </View>

        <View style={styles.statsContainer}>
          {post.likeCount > 0 && (
            <View style={styles.statItem}>
              <Icon name="heart-outline" size={12} color={COLORS.accent.red} />
              <Text style={[styles.statText, { color: COLORS.accent.red }]}>{post.likeCount}</Text>
            </View>
          )}
          {post.commentCount > 0 && (
            <View style={styles.statItem}>
              <Icon name="chatbubble-outline" size={12} color={COLORS.accent.blue} />
              <Text style={[styles.statText, { color: COLORS.accent.blue }]}>{post.commentCount}</Text>
            </View>
          )}
          {post.bookmarkCount > 0 && (
            <View style={styles.statItem}>
              <Icon name="bookmark-outline" size={12} color={COLORS.accent.orange} />
              <Text style={[styles.statText, { color: COLORS.accent.orange }]}>{post.bookmarkCount}</Text>
            </View>
          )}
          <View style={styles.statItem}>
            <Icon name="eye-outline" size={12} color={COLORS.text.secondary} />
            <Text style={[styles.statText, { color: COLORS.text.secondary }]}>{post.viewCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
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
    paddingVertical: 8,
    borderRadius: 24,
  },
  pinnedText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.accent.orange,
    fontWeight: '600',
  },
  timeText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.tertiary,
  },
  body: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bodyLeft: {
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: 'bold',
    lineHeight: 22,
  },
  content: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  authorInitial: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  authorName: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.tertiary,
  },
  separator: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.tertiary,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  statText: {
    ...TYPOGRAPHY.caption1,
    marginLeft: 4,
  },
  imageContainer: {
    position: 'relative',
  },
  imageThumbnail: {
    width: 91,
    height: 91,
    borderRadius: 8,
    backgroundColor: COLORS.background.secondary,
  },
  moreImagesBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreImagesText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  anonymousAvatar: {
    backgroundColor: COLORS.text.secondary,
  },
});

