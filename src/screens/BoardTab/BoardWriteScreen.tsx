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
  Platform,
  FlatList
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
import { useImageUpload } from '../../hooks/useImageUpload';
import { ImageSelector } from '../../components/board/ImageSelector';

export const BoardWriteScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState<BoardFormData>({
    title: '',
    content: '',
    category: 'general',
    isAnonymous: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // 이미지 업로드 훅
  const {
    selectedImages,
    uploading: imageUploading,
    pickImages,
    removeImage,
    reorderImages,
    uploadImages,
    clearImages,
  } = useImageUpload({ maxImages: 10 });

  const handleTitleChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, title: text }));
  }, []);

  const handleContentChange = useCallback((text: string) => {
    setFormData(prev => ({ ...prev, content: text }));
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setFormData(prev => ({ ...prev, category }));
  }, []);

  const toggleAnonymous = useCallback(() => {
    setFormData(prev => ({ ...prev, isAnonymous: !prev.isAnonymous }));
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

      // 먼저 게시글 문서 생성
      const postData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        category: formData.category,
        authorId: user.uid,
        authorName: user.displayName || '익명',
        authorProfileImage: user.photoURL || null,
        isAnonymous: !!formData.isAnonymous,
        viewCount: 0,
        likeCount: 0,
        commentCount: 0,
        bookmarkCount: 0,
        isPinned: false,
        isDeleted: false,
        images: [], // 초기에는 빈 배열
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'boardPosts'), postData);
      const postId = docRef.id;

      // 익명 설정이면 anonId 업데이트
      if (formData.isAnonymous) {
        await docRef.update({
          anonId: `${postId}:${user.uid}`,
          isAnonymous: true,
          updatedAt: serverTimestamp(),
        });
      }

      // 이미지가 있으면 업로드
      if (selectedImages.length > 0) {
        try {
          const uploadedImages = await uploadImages(postId);
          
          // 업로드된 이미지 정보로 게시글 업데이트
          const imageData = uploadedImages.map(img => ({
            url: img.remoteUrl!,
            width: img.width,
            height: img.height,
            thumbUrl: img.thumbUrl,
            size: img.size,
            mime: img.mime,
          }));

          await docRef.update({
            images: imageData,
            updatedAt: serverTimestamp(),
          });
        } catch (imageError) {
          console.error('이미지 업로드 실패:', imageError);
          Alert.alert('경고', '이미지 업로드에 실패했지만 게시글은 작성되었습니다.');
        }
      }
      
      // 이미지 초기화
      clearImages();
      
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
  }, [user, formData, navigation, selectedImages, uploadImages, clearImages]);

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
          <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
            <Icon name="close" size={40} color={COLORS.text.secondary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>글쓰기</Text>
            <Text style={styles.headerSubtitle}>새로운 이야기를 공유해보세요</Text>
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
              {submitting || imageUploading ? '작성중...' : '완료'}
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

        {/* 익명 작성 */}
        <View style={[styles.section, { marginTop: 16 }]}>
          <View style={styles.anonymousToggleContainer}>
            <View style={styles.anonymousToggleLeft}>
              <Icon 
                name="eye-off-outline" 
                size={20} 
                color={formData.isAnonymous ? COLORS.accent.blue : COLORS.text.secondary} 
              />
              <Text style={styles.anonymousToggleText}>익명으로 작성</Text>
            </View>
            <TouchableOpacity 
              style={[
                styles.toggleButton,
                formData.isAnonymous && styles.toggleButtonActive
              ]} 
              onPress={toggleAnonymous}
            >
              <View style={[
                styles.toggleCircle,
                formData.isAnonymous && styles.toggleCircleActive
              ]} />
            </TouchableOpacity>
          </View>
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
    minHeight: 56,
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
  anonymousToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.secondary,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border.primary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  anonymousToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anonymousToggleText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  toggleButton: {
    width: 52,
    height: 28,
    borderRadius: 16,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1.5,
    borderColor: COLORS.border.dark,
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.accent.blue,
    borderColor: COLORS.accent.blue,
  },
  toggleCircle: {
    width: 20,
    height: 20,
    borderRadius: 12,
    backgroundColor: COLORS.text.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  toggleCircleActive: {
    alignSelf: 'flex-end',
  },
});
