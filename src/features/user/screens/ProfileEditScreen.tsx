import React from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {type CampusStackParamList} from '@/app/navigation/types';
import {
  DefaultProfileAvatar,
  SelectionDropdown,
  StackHeader,
  StateCard,
} from '@/shared/design-system/components';
import {COLORS, RADIUS, SPACING} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks/useScreenView';
import {pickImageAsset} from '@/shared/lib/media/pickImageAsset';

import {useProfileEditScreenData} from '../hooks/useProfileEditScreenData';

const PROFILE_EDIT_SCREEN_TITLE = '프로필 수정';
const PROFILE_EDIT_SAVE_LABEL = '저장하기';
const ALLOWED_PROFILE_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const ProfileEditScreen = () => {
  useScreenView();

  const navigation =
    useNavigation<NativeStackNavigationProp<CampusStackParamList>>();
  const {
    data,
    error,
    loading,
    reload,
    removePhoto,
    saveChanges,
    saving,
    uploadPhoto,
  } =
    useProfileEditScreenData();

  const [displayName, setDisplayName] = React.useState('');
  const [studentId, setStudentId] = React.useState('');
  const [department, setDepartment] = React.useState('');
  const [isDropdownOpen, setDropdownOpen] = React.useState(false);

  React.useEffect(() => {
    if (!data) {
      return;
    }

    setDisplayName(data.displayName);
    setStudentId(data.studentId);
    setDepartment(data.department);
  }, [data]);

  const closeDropdown = React.useCallback(() => {
    setDropdownOpen(false);
  }, []);

  const handlePressPhoto = React.useCallback(async () => {
    try {
      const image = await pickImageAsset({
        allowedMimeTypes: ALLOWED_PROFILE_IMAGE_MIME_TYPES,
      });

      if (!image) {
        return;
      }

      await uploadPhoto({
        fileName: image.fileName,
        mimeType: image.mimeType,
        uri: image.uri,
      });
    } catch (caughtError) {
      console.error('프로필 사진 업로드 실패', caughtError);
      const message =
        caughtError instanceof Error && caughtError.message.trim()
          ? caughtError.message
          : '프로필 사진을 변경하지 못했습니다.';
      Alert.alert('오류', message);
    }
  }, [uploadPhoto]);

  const handleRemovePhoto = React.useCallback(() => {
    Alert.alert('프로필 사진 삭제', '현재 프로필 사진을 삭제하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            await removePhoto();
          } catch (caughtError) {
            console.error('프로필 사진 삭제 실패', caughtError);
            const message =
              caughtError instanceof Error && caughtError.message.trim()
                ? caughtError.message
                : '프로필 사진을 삭제하지 못했습니다.';
            Alert.alert('오류', message);
          }
        },
      },
    ]);
  }, [removePhoto]);

  const handleSave = React.useCallback(async () => {
    const trimmedDisplayName = displayName.trim();
    const trimmedStudentId = studentId.trim();

    if (!trimmedDisplayName) {
      Alert.alert('입력 필요', '닉네임을 입력해주세요.');
      return;
    }

    if (trimmedDisplayName.length > 7) {
      Alert.alert('입력 확인', '닉네임은 최대 7글자까지 가능합니다.');
      return;
    }

    if (!/^20\d{6}$/.test(trimmedStudentId)) {
      Alert.alert('입력 확인', '학번은 20으로 시작하는 8자리 숫자여야 합니다.');
      return;
    }

    if (!department.trim()) {
      Alert.alert('입력 필요', '학과를 선택해주세요.');
      return;
    }

    try {
      await saveChanges({
        department: department.trim(),
        displayName: trimmedDisplayName,
        studentId: trimmedStudentId,
      });

      Alert.alert('저장 완료', '프로필이 저장되었습니다.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (caughtError) {
      console.error('프로필 저장 실패', caughtError);
      const message =
        caughtError instanceof Error && caughtError.message.trim()
          ? caughtError.message
          : '프로필을 저장하지 못했습니다.';
      Alert.alert('오류', message);
    }
  }, [department, displayName, navigation, saveChanges, studentId]);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <StackHeader
        onPressBack={() => navigation.goBack()}
        title={PROFILE_EDIT_SCREEN_TITLE}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {loading && !data ? (
          <StateCard
            description="프로필 수정 화면을 준비하고 있습니다."
            icon={<ActivityIndicator color={COLORS.brand.primary} />}
            title="프로필 수정을 불러오는 중"
          />
        ) : null}

        {error && !data ? (
          <StateCard
            actionLabel="다시 시도"
            description={error}
            icon={
              <Icon
                color={COLORS.accent.orange}
                name="alert-circle-outline"
                size={28}
              />
            }
            onPressAction={() => {
              reload().catch(() => undefined);
            }}
            title="프로필 수정 정보를 불러오지 못했습니다"
          />
        ) : null}

        {data ? (
          <>
            <View style={styles.avatarSection}>
              <View style={styles.avatarFrame}>
                {data.photoUrl ? (
                  <Image source={{uri: data.photoUrl}} style={styles.avatarImage} />
                ) : (
                  <DefaultProfileAvatar
                    iconSize={42}
                    size={96}
                    style={styles.avatarFallback}
                  />
                )}

                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.86}
                  disabled={saving}
                  onPress={() => {
                    handlePressPhoto().catch(() => undefined);
                  }}
                  style={styles.cameraButton}>
                  <Icon
                    color={COLORS.text.inverse}
                    name="camera-outline"
                    size={14}
                  />
                </TouchableOpacity>
              </View>

              {data.photoUrl ? (
                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.82}
                  disabled={saving}
                  onPress={handleRemovePhoto}
                  style={styles.removePhotoButton}>
                  <Text style={styles.removePhotoLabel}>사진 삭제</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            <View style={styles.formSection}>
              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>닉네임</Text>
                <TextInput
                  maxLength={7}
                  onChangeText={setDisplayName}
                  onFocus={closeDropdown}
                  placeholder="닉네임 입력"
                  placeholderTextColor={COLORS.text.muted}
                  style={styles.input}
                  value={displayName}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>학번</Text>
                <TextInput
                  keyboardType="number-pad"
                  maxLength={8}
                  onChangeText={value => {
                    setStudentId(value.replace(/[^0-9]/g, ''));
                  }}
                  onFocus={closeDropdown}
                  placeholder="예: 20210001"
                  placeholderTextColor={COLORS.text.muted}
                  style={styles.input}
                  value={studentId}
                />
              </View>

              <View style={styles.fieldBlock}>
                <Text style={styles.fieldLabel}>학과</Text>
                <SelectionDropdown
                  isOpen={isDropdownOpen}
                  maxHeight={208}
                  onPressSelect={value => {
                    setDepartment(value);
                    setDropdownOpen(false);
                  }}
                  onRequestClose={closeDropdown}
                  onPressTrigger={() => {
                    Keyboard.dismiss();
                    setDropdownOpen(current => !current);
                  }}
                  options={data.departmentOptions}
                  selectedValue={department}
                />
              </View>
            </View>

            <TouchableOpacity
              accessibilityRole="button"
              activeOpacity={0.9}
              disabled={saving}
              onPress={handleSave}
              style={styles.saveButton}>
              {saving ? (
                <ActivityIndicator
                  color={COLORS.text.inverse}
                  size="small"
                  style={styles.saveSpinner}
                />
              ) : null}
              <Text style={styles.saveLabel}>
                {saving ? '저장 중...' : PROFILE_EDIT_SAVE_LABEL}
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: COLORS.background.page,
    flex: 1,
  },
  content: {
    paddingHorizontal: SPACING.lg,
    paddingTop: 32,
    paddingBottom: 40,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarFrame: {
    position: 'relative',
  },
  avatarImage: {
    borderRadius: 9999,
    height: 96,
    width: 96,
  },
  avatarFallback: {
    flexShrink: 0,
  },
  cameraButton: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primary,
    borderRadius: 9999,
    bottom: 0,
    height: 32,
    justifyContent: 'center',
    right: 0,
    position: 'absolute',
    width: 32,
  },
  removePhotoButton: {
    marginTop: 14,
  },
  removePhotoLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    textDecorationLine: 'underline',
  },
  formSection: {
  },
  fieldBlock: {
    marginBottom: 20,
  },
  fieldLabel: {
    color: COLORS.text.tertiary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background.surface,
    borderColor: COLORS.border.default,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    color: COLORS.text.primary,
    fontSize: 14,
    height: 50,
    lineHeight: 18,
    paddingHorizontal: 17,
    paddingVertical: 15,
  },
  saveButton: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primary,
    borderRadius: RADIUS.lg,
    flexDirection: 'row',
    height: 52,
    justifyContent: 'center',
    marginTop: 32,
  },
  saveSpinner: {
    marginRight: 8,
  },
  saveLabel: {
    color: COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
