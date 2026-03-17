import React from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import {SafeAreaView} from 'react-native-safe-area-context';

import {
  V2StateCard,
} from '@/shared/design-system/components';
import {V2_COLORS} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks/useScreenView';

import {BoardComposeForm} from '../components/v2/BoardComposeForm';
import {BoardComposeHeader} from '../components/v2/BoardComposeHeader';
import {useBoardEdit} from '../hooks/useBoardEdit';
import type {BoardStackParamList} from '../model/navigation';
import type {BoardFormData, BoardPostCategoryId} from '../model/types';

const getImageIdentity = (value?: string | null) => value ?? '';

export const BoardEditScreen = () => {
  useScreenView();

  const navigation =
    useNavigation<NativeStackNavigationProp<BoardStackParamList>>();
  const route =
    useRoute<
      NativeStackScreenProps<BoardStackParamList, 'BoardEdit'>['route']
    >();
  const postId = route.params?.postId;

  const [formData, setFormData] = React.useState<BoardFormData>({
    category: 'general',
    content: '',
    isAnonymous: true,
    title: '',
  });
  const {
    error,
    imageUploading,
    loading,
    pickImages,
    post,
    removeImage,
    reorderImages,
    selectedImages,
    submitting,
    updatePost,
  } = useBoardEdit(postId);

  React.useEffect(() => {
    if (!post) {
      return;
    }

    setFormData({
      category: post.category,
      content: post.content,
      isAnonymous: post.isAnonymous ?? false,
      title: post.title,
    });
  }, [post]);

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

  const hasDraftChanges = React.useMemo(() => {
    if (!post) {
      return false;
    }

    const originalImages = (post.images ?? []).map(image =>
      getImageIdentity(image.url),
    );
    const currentImages = selectedImages.map(image =>
      getImageIdentity(image.remoteUrl ?? image.localUri),
    );

    return (
      formData.title !== post.title ||
      formData.content !== post.content ||
      formData.category !== post.category ||
      !!formData.isAnonymous !== !!post.isAnonymous ||
      originalImages.join('|') !== currentImages.join('|')
    );
  }, [formData, post, selectedImages]);

  const handleClose = React.useCallback(() => {
    if (!hasDraftChanges) {
      navigation.goBack();
      return;
    }

    Alert.alert(
      '수정 취소',
      '수정 중인 내용이 있습니다. 정말 취소하시겠습니까?',
      [
        {text: '계속 수정', style: 'cancel'},
        {
          text: '취소',
          style: 'destructive',
          onPress: () => navigation.goBack(),
        },
      ],
    );
  }, [hasDraftChanges, navigation]);

  const handleSubmit = React.useCallback(async () => {
    if (!postId) {
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
      await updatePost(formData);

      navigation.reset({
        index: 1,
        routes: [
          {name: 'BoardMain'},
          {name: 'BoardDetail', params: {postId}},
        ],
      });
    } catch (loadError) {
      Alert.alert(
        '오류',
        loadError instanceof Error
          ? loadError.message
          : '게시글 수정에 실패했습니다.',
      );
    }
  }, [formData, navigation, postId, updatePost]);

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
          submitLabel="수정 완료"
          title="글 수정"
        />

        {loading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator color={V2_COLORS.brand.primary} size="large" />
          </View>
        ) : error || !post ? (
          <View style={styles.centeredState}>
            <V2StateCard
              actionLabel="뒤로 가기"
              description={error ?? '게시글을 찾을 수 없습니다.'}
              icon={
                <Icon
                  color={V2_COLORS.accent.orange}
                  name="alert-circle-outline"
                  size={28}
                />
              }
              onPressAction={() => navigation.goBack()}
              title="게시글을 불러오지 못했습니다"
            />
          </View>
        ) : (
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
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  centeredState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: V2_COLORS.background.surface,
    flex: 1,
  },
  formWrap: {
    flex: 1,
  },
});
