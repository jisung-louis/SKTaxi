import React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {invalidateData} from '@/app/data-freshness/dataInvalidation';
import {BOARD_WRITE_INVALIDATION_KEYS} from '@/app/data-freshness/invalidationKeys';
import {useAuth} from '@/features/auth';
import {COLORS} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks/useScreenView';

import {BoardComposeForm} from '../components/BoardComposeForm';
import {BoardComposeHeader} from '../components/BoardComposeHeader';
import {useBoardWrite} from '../hooks/useBoardWrite';
import type {BoardStackParamList} from '../model/navigation';
import type {BoardFormData, BoardPostCategoryId} from '../model/types';

export const BoardWriteScreen = () => {
  useScreenView();

  const navigation =
    useNavigation<NativeStackNavigationProp<BoardStackParamList>>();
  const {user} = useAuth();
  const [formData, setFormData] = React.useState<BoardFormData>({
    category: 'general',
    content: '',
    isAnonymous: true,
    title: '',
  });
  const {
    createPost,
    imageUploading,
    pickImages,
    removeImage,
    reorderImages,
    selectedImages,
    submitting,
  } = useBoardWrite();

  const handleChangeTitle = React.useCallback((value: string) => {
    setFormData(previous => ({...previous, title: value}));
  }, []);

  const handleChangeContent = React.useCallback((value: string) => {
    setFormData(previous => ({...previous, content: value}));
  }, []);

  const handleSelectCategory = React.useCallback(
    (category: BoardPostCategoryId) => {
      setFormData(previous => ({...previous, category}));
    },
    [],
  );

  const handleToggleAnonymous = React.useCallback(() => {
    setFormData(previous => ({
      ...previous,
      isAnonymous: !previous.isAnonymous,
    }));
  }, []);

  const handleClose = React.useCallback(() => {
    const hasDraft =
      formData.title.trim().length > 0 ||
      formData.content.trim().length > 0 ||
      selectedImages.length > 0 ||
      formData.category !== 'general' ||
      !formData.isAnonymous;

    if (!hasDraft) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      '작성 취소',
      '작성 중인 내용이 있습니다. 정말 취소하시겠습니까?',
      [
        {text: '계속 작성', style: 'cancel'},
        {
          text: '취소',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  }, [formData, navigation, selectedImages.length]);

  const handleSubmit = React.useCallback(async () => {
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
      const postId = await createPost(formData);
      invalidateData(BOARD_WRITE_INVALIDATION_KEYS);

      navigation.reset({
        index: 1,
        routes: [
          {name: 'BoardMain'},
          {name: 'BoardDetail', params: {postId}},
        ],
      });
    } catch (error) {
      Alert.alert(
        '오류',
        error instanceof Error ? error.message : '게시글 작성에 실패했습니다.',
      );
    }
  }, [createPost, formData, navigation, user]);

  const submitEnabled =
    !submitting &&
    !imageUploading &&
    formData.title.trim().length > 0 &&
    formData.content.trim().length > 0;

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <BoardComposeHeader
          onPressClose={handleClose}
          onPressSubmit={handleSubmit}
          submitEnabled={submitEnabled}
          submitLabel="등록"
          title="글쓰기"
        />

        <View style={styles.formWrap}>
          <BoardComposeForm
            category={formData.category}
            content={formData.content}
            contentPlaceholder="내용을 입력하세요..."
            isAnonymous={!!formData.isAnonymous}
            onChangeContent={handleChangeContent}
            onChangeTitle={handleChangeTitle}
            onPickImages={pickImages}
            onRemoveImage={removeImage}
            onReorderImages={reorderImages}
            onSelectCategory={handleSelectCategory}
            onToggleAnonymous={handleToggleAnonymous}
            selectedImages={selectedImages}
            title={formData.title}
            titlePlaceholder="제목을 입력하세요"
            uploadingImages={imageUploading}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.surface,
    flex: 1,
  },
  formWrap: {
    flex: 1,
  },
});
