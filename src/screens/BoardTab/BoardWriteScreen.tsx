import React, { useState, useCallback } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { addDoc, collection, serverTimestamp } from '@react-native-firebase/firestore';

import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { BOARD_CATEGORIES } from '../../constants/board';
import { BoardFormData } from '../../types/board';
import { useAuth } from '../../hooks/useAuth';
import { db } from '../../config/firebase';

export const BoardWriteScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<BoardFormData>({
    title: '',
    content: '',
    category: 'general',
  });
  const [submitting, setSubmitting] = useState(false);

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
    if (!user) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

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

      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        authorId: user.uid,
        authorName: user.displayName || '익명',
        authorProfileImage: user.photoURL || null,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        bookmarkCount: 0,
        isPinned: false,
        isDeleted: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'boardPosts'), postData);
      
      Alert.alert(
        '성공', 
        '게시글이 작성되었습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('BoardDetail', { postId: docRef.id })
          }
        ]
      );

    } catch (err) {
      console.error('게시글 작성 실패:', err);
      Alert.alert('오류', '게시글 작성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }, [user, formData, navigation]);

  const handleCancel = useCallback(() => {
    if (formData.title.trim() || formData.content.trim()) {
      Alert.alert(
        '작성 취소',
        '작성 중인 내용이 있습니다. 정말 취소하시겠습니까?',
        [
          { text: '계속 작성', style: 'cancel' },
          { text: '취소', style: 'destructive', onPress: () => navigation.goBack() }
        ]
      );
    } else {
      navigation.goBack();
    }
  }, [formData, navigation]);

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
          <Text style={styles.headerTitle}>글쓰기</Text>
          <TouchableOpacity 
            onPress={handleSubmit} 
            disabled={submitting || !formData.title.trim() || !formData.content.trim()}
          >
            <Text style={[
              styles.submitText,
              (!formData.title.trim() || !formData.content.trim() || submitting) && styles.submitTextDisabled
            ]}>
              {submitting ? '작성중...' : '완료'}
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
  submitText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.accent.blue,
    fontWeight: '600',
  },
  submitTextDisabled: {
    color: COLORS.text.disabled,
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
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.secondary,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.border.primary,
  },
  tagInput: {
    flex: 1,
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  tagAddButton: {
    padding: 4,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent.blue + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent.blue,
    marginRight: 4,
  },
  tagRemoveButton: {
    padding: 2,
  },
  tagHint: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text.secondary,
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
