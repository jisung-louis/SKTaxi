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
  Platform,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { BOARD_CATEGORIES } from '../../constants/board';
import { BoardFormData } from '../../types/board';
import { useBoardEdit } from '../../hooks/board';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ErrorMessage } from '../../components/common/ErrorMessage';
import { ImageSelector } from '../../components/board/ImageSelector';
import { useScreenView } from '../../hooks/useScreenView';

interface BoardEditScreenProps {
  route: {
    params: {
      postId: string;
    };
  };
}

export const BoardEditScreen: React.FC<BoardEditScreenProps> = () => {
  useScreenView();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const postId = route?.params?.postId;

  const [formData, setFormData] = useState<BoardFormData>({
    title: '',
    content: '',
    category: 'general',
  });

  // Repository 패턴 적용 훅
  const {
    post,
    loading,
    error,
    updatePost,
    submitting,
    selectedImages,
    imageUploading,
    pickImages,
    removeImage,
    reorderImages,
  } = useBoardEdit(postId);

  // 게시글 로드 시 폼 데이터 초기화
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title,
        content: post.content,
        category: post.category,
      });
    }
  }, [post]);

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
    if (!postId) return;

    if (!formData.title.trim()) {
      Alert.alert('오류', '제목을 입력해주세요.');
      return;
    }

    if (!formData.content.trim()) {
      Alert.alert('오류', '내용을 입력해주세요.');
      return;
    }

    try {
      await updatePost(formData);

      Alert.alert(
        '성공',
        '게시글이 수정되었습니다.',
        [
          {
            text: '확인',
            onPress: () => navigation.reset({
              index: 1,
              routes: [
                { name: 'BoardMain' },
                { name: 'BoardDetail', params: { postId } },
              ],
            })
          }
        ]
      );
    } catch (err) {
      console.error('게시글 수정 실패:', err);
      Alert.alert('오류', err instanceof Error ? err.message : '게시글 수정에 실패했습니다.');
    }
  }, [postId, formData, navigation, updatePost]);

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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Icon name="close" size={40} color={COLORS.text.secondary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>글 수정</Text>
            <Text style={styles.headerSubtitle}>게시글을 불러오는 중...</Text>
          </View>
          <View style={styles.headerButton} />
        </View>
        <LoadingSpinner style={styles.loading} />
      </SafeAreaView>
    );
  }

  if (error || !post) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerButton}>
            <Icon name="close" size={40} color={COLORS.text.secondary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>글 수정</Text>
            <Text style={styles.headerSubtitle}>오류가 발생했습니다</Text>
          </View>
          <View style={styles.headerButton} />
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
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Icon name="close" size={40} color={COLORS.text.secondary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>글 수정</Text>
            <Text style={styles.headerSubtitle}>게시글을 수정해보세요</Text>
          </View>
          <TouchableOpacity 
            onPress={handleSubmit} 
            disabled={submitting || imageUploading || !formData.title.trim() || !formData.content.trim()}
            style={[
              styles.submitButton,
              (!formData.title.trim() || !formData.content.trim() || submitting || imageUploading) && styles.submitButtonDisabled
            ]}
          >
            <Icon 
              name={submitting || imageUploading ? "hourglass-outline" : "checkmark"} 
              size={20} 
              color={(!formData.title.trim() || !formData.content.trim() || submitting || imageUploading) ? COLORS.text.disabled : COLORS.text.white} 
            />
            <Text style={[
              styles.submitText,
              (!formData.title.trim() || !formData.content.trim() || submitting || imageUploading) && styles.submitTextDisabled
            ]}>
              {submitting || imageUploading ? '수정중...' : '완료'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 카테고리 선택 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="grid-outline" size={20} color={COLORS.accent.blue} />
              <Text style={styles.sectionTitle}>카테고리</Text>
            </View>
            <FlatList
              data={BOARD_CATEGORIES}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.categoryContainer}
              renderItem={({ item: category }) => (
                <TouchableOpacity
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
                    {category.shortName}
                  </Text>
                  {formData.category === category.id && (
                    <Icon name="checkmark" size={16} color={COLORS.accent.blue} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>

          {/* 제목 입력 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="create-outline" size={20} color={COLORS.accent.blue} />
              <Text style={styles.sectionTitle}>제목</Text>
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.titleInput}
                placeholder="제목을 입력하세요"
                value={formData.title}
                onChangeText={handleTitleChange}
                placeholderTextColor={COLORS.text.secondary}
                maxLength={100}
              />
              <View style={styles.charCountContainer}>
                <Text style={styles.charCount}>{formData.title.length}/100</Text>
              </View>
            </View>
          </View>

          {/* 내용 입력 */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="document-text-outline" size={20} color={COLORS.accent.blue} />
              <Text style={styles.sectionTitle}>내용</Text>
            </View>
            <View style={styles.inputContainer}>
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
              <View style={styles.charCountContainer}>
                <Text style={styles.charCount}>{formData.content.length}/2000</Text>
              </View>
            </View>
          </View>

          {/* 이미지 선택 */}
          <View style={styles.section}>
            <View style={[styles.sectionHeader, { marginBottom: 2 }]}>
              <Icon name="camera-outline" size={20} color={COLORS.accent.blue} />
              <Text style={styles.sectionTitle}>이미지</Text>
            </View>
            <ImageSelector
              selectedImages={selectedImages}
              onPickImages={pickImages}
              onRemoveImage={removeImage}
              onReorderImages={reorderImages}
              maxImages={10}
              uploading={imageUploading}
            />
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  headerButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '700',
    marginBottom: 2,
  },
  headerSubtitle: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.accent.blue,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: COLORS.accent.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.background.secondary,
    shadowOpacity: 0,
    elevation: 0,
  },
  submitText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.white,
    fontWeight: 'bold',
    marginLeft: 6,
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
    padding: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    marginLeft: 8,
    fontWeight: 'bold',
  },
  inputContainer: {
    position: 'relative',
  },
  charCountContainer: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: COLORS.background.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryContainer: {
    gap: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: COLORS.background.secondary,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryItemSelected: {
    backgroundColor: COLORS.accent.blue + '15',
    borderColor: COLORS.accent.blue,
    shadowColor: COLORS.accent.blue,
    shadowOpacity: 0.2,
    elevation: 2,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  categoryText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: '500',
  },
  categoryTextSelected: {
    color: COLORS.accent.blue,
    fontWeight: '700',
  },
  titleInput: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    borderWidth: 2,
    borderColor: COLORS.border.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  charCount: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  contentInput: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    borderWidth: 2,
    borderColor: COLORS.border.primary,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
