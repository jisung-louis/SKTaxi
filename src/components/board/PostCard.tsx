import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
      <View style={styles.header}>
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
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {post.title}
      </Text>

      <Text style={styles.content} numberOfLines={3}>
        {post.content}
      </Text>


      <View style={styles.footer}>
        <View style={styles.authorContainer}>
          <View style={styles.authorAvatar}>
            <Text style={styles.authorInitial}>
              {post.authorName.charAt(0)}
            </Text>
          </View>
          <Text style={styles.authorName}>{post.authorName}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Icon name="eye-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{post.viewCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="heart-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{post.likeCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="chatbubble-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{post.commentCount}</Text>
          </View>
          <View style={styles.statItem}>
            <Icon name="bookmark-outline" size={16} color={COLORS.text.secondary} />
            <Text style={styles.statText}>{post.bookmarkCount}</Text>
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
    marginBottom: 8,
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
    ...TYPOGRAPHY.caption,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  pinnedBadge: {
    marginLeft: 4,
  },
  pinnedText: {
    fontSize: 12,
  },
  timeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  title: {
    ...TYPOGRAPHY.subtitle1,
    color: COLORS.text.primary,
    marginBottom: 8,
    lineHeight: 22,
  },
  content: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: 12,
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
    ...TYPOGRAPHY.caption,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  authorName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
});

