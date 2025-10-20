import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { doc, getDoc, updateDoc, serverTimestamp } from '@react-native-firebase/firestore';

import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { BOARD_CATEGORIES } from '../../constants/board';
import { BoardFormData, BoardPost } from '../../types/board';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';

interface BoardEditScreenProps {
  route: {
    params: {
      postId: string;
    };
  };
}

export const BoardEditScreen: React.FC<BoardEditScreenProps> = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const { user } = useAuth();
  const postId = route?.params?.postId;

  const [post, setPost] = useState<BoardPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<BoardFormData>({
    title: '',
    content: '',
    category: 'general',
  });

  // 게시글 로드
  useEffect(() => {
    const loadPost = async () => {
      if (!postId || !user) return;

      try {
        setLoading(true);
        setError(null);

        const postRef = doc(db, 'boardPosts', postId);
        const snapshot = await getDoc(postRef);

        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data) {
            const postData = {
              id: snapshot.id,
              ...data,
              createdAt: data.createdAt?.toDate() || new Date(),
              updatedAt: data.updatedAt?.toDate() || new Date(),
              lastCommentAt: data.lastCommentAt?.toDate(),
            } as BoardPost;

            // 작성자 확인
            if (postData.authorId !== user.uid) {
              setError('수정 권한이 없습니다.');
              return;
            }

            setPost(postData);
            setFormData({
              title: postData.title,
              content: postData.content,
              category: postData.category,
            });
          }
        } else {
          setError('게시글을 찾을 수 없습니다.');
        }
      } catch (err) {
        console.error('게시글 로드 실패:', err);
        setError('게시글을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [postId, user]);

  const handleTitleChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, title: text }));
  }, []);

  const handleContentChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, content: text }));
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setFormData(prev => ({ ...prev, category }));
  }, []);


  const handleSubmit = useCallback(async () => {
    if (!postId || !user) return;

    if (!formData.title.trim()) {
      Alert.alert('오류', '제목을 입력해주세요.');
      return;
    }

    if (!formData.content.trim()) {
      Alert.alert('오류', '내용을 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);

      const postRef = doc(db, 'boardPosts', postId);
      await updateDoc(postRef, {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        updatedAt: serverTimestamp(),
      });

      Alert.alert(
        '성공', 
        '게시글이 수정되었습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('BoardDetail', { postId })
          }
        ]
      );

    } catch (err) {
      console.error('게시글 수정 실패:', err);
      Alert.alert('오류', '게시글 수정에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }, [postId, user, formData, navigation]);

  const handleCancel = useCallback(() => {
    const hasChanges = 
      formData.title !== post?.title ||
      formData.content !== post?.content ||
      formData.category !== post?.category;

    if (hasChanges) {
      Alert.alert(
        '수정 취소',
        '수정 중인 내용이 있습니다. 정말 취소하시겠습니까?',
        [
          { text: '계속 수정', style: 'cancel' },
          { text: '취소', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [formData, post, navigation]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>글 수정</Text>
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
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>글 수정</Text>
          <View style={styles.headerRight} />
        </View>
        <ErrorMessage message={error || '게시글을 찾을 수 없습니다.'} />
      </SafeAreaView>
    );
  }

  const selectedCategory = BOARD_CATEGORIES.find(cat => cat.id === formData.category);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel}>
            <Text style={styles.cancelText}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>글 수정</Text>
          <TouchableOpacity 
            onPress={handleSubmit} 
            disabled={submitting || !formData.title.trim() || !formData.content.trim()}
          >
            <Text style={[
              styles.submitText,
              (!formData.title.trim() || !formData.content.trim() || submitting) && styles.submitTextDisabled
            ]}>
              {submitting ? '수정중...' : '완료'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 카테고리 선택 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>카테고리</Text>
            <View style={styles.categoryContainer}>
              {BOARD_CATEGORIES.map((category) => (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryItem,
                    formData.category === category.id && styles.categoryItemSelected
                  ]}
                  onPress={() => handleCategoryChange(category.id)}
                >
                  <View style={[styles.categoryDot, { backgroundColor: category.color }]} />
                  <Text style={[
                    styles.categoryText,
                    formData.category === category.id && styles.categoryTextSelected
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* 제목 입력 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>제목</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="제목을 입력하세요"
              value={formData.title}
              onChangeText={handleTitleChange}
              placeholderTextColor={COLORS.text.secondary}
              maxLength={100}
            />
            <Text style={styles.charCount}>{formData.title.length}/100</Text>
          </View>


          {/* 내용 입력 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>내용</Text>
            <TextInput
              style={styles.contentInput}
              placeholder="내용을 입력하세요"
              value={formData.content}
              onChangeText={handleContentChange}
              placeholderTextColor={COLORS.text.secondary}
              multiline
              textAlignVertical="top"
              maxLength={2000}
            />
            <Text style={styles.charCount}>{formData.content.length}/2000</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  cancelText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
  headerTitle: {
    ...TYPOGRAPHY.subtitle1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  submitText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.accent.blue,
    fontWeight: '600',
  },
  submitTextDisabled: {
    color: COLORS.text.disabled,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...TYPOGRAPHY.subtitle2,
    color: COLORS.text.primary,
    marginBottom: 12,
    fontWeight: '600',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryItemSelected: {
    backgroundColor: COLORS.accent.blue + '20',
    borderWidth: 1,
    borderColor: COLORS.accent.blue,
  },
  categoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  categoryText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
  },
  categoryTextSelected: {
    color: COLORS.accent.blue,
    fontWeight: '600',
  },
  titleInput: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  charCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
    textAlign: 'right',
    marginTop: 4,
  },
  contentInput: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
    minHeight: 200,
  },
});
