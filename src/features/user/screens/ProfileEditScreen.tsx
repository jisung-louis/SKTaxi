import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Dropdown } from '@/shared/ui/Dropdown';
import PageHeader from '@/shared/ui/PageHeader';
import { COLORS } from '@/shared/constants/colors';
import { DEPARTMENT_OPTIONS } from '@/shared/constants/departments';
import { TYPOGRAPHY } from '@/shared/constants/typography';
import { useAuth } from '@/features/auth';
import { useScreenView } from '@/shared/hooks/useScreenView';

import { useUserProfile } from '../hooks/useUserProfile';

export const ProfileEditScreen = () => {
  useScreenView();

  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuth();
  const {
    profile,
    loading: profileLoading,
    saveProfileChanges,
    saving,
  } = useUserProfile();

  const [displayName, setDisplayName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [previousDepartment, setPreviousDepartment] = useState('');
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState<{
    name?: string;
    studentId?: string;
  }>({});

  useEffect(() => {
    if (profileLoading) {
      setFetching(true);
      return;
    }

    if (profile) {
      setDisplayName(profile.displayName || user?.displayName || '');
      setStudentId(profile.studentId || '');
      const initialDepartment = profile.department || '';
      setDepartment(initialDepartment);
      setPreviousDepartment(initialDepartment);
    }

    setFetching(false);
  }, [profile, profileLoading, user?.displayName]);

  const validate = () => {
    const nextErrors: { name?: string; studentId?: string } = {};

    if (!displayName.trim()) {
      nextErrors.name = '닉네임을 입력해주세요.';
    } else if (displayName.trim().length > 7) {
      nextErrors.name = '닉네임은 최대 7글자까지 가능합니다.';
    }

    const studentIdRegex = /^20\d{6}$/;
    if (!studentId.trim()) {
      nextErrors.studentId = '학번을 입력해주세요.';
    } else if (!studentIdRegex.test(studentId.trim())) {
      nextErrors.studentId =
        '학번은 20으로 시작하는 8자리 숫자여야 해요.';
    }

    setErrors(nextErrors);
    return nextErrors;
  };

  const handleSave = async () => {
    if (!user?.uid) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      const invalidFields: string[] = [];
      if (nextErrors.name) {
        invalidFields.push('닉네임');
      }
      if (nextErrors.studentId) {
        invalidFields.push('학번');
      }

      Alert.alert('알림', `${invalidFields.join(', ')}을 확인해주세요.`);
      return;
    }

    try {
      await saveProfileChanges({
        displayName,
        studentId,
        department,
        previousDepartment,
      });

      setPreviousDepartment(department.trim());

      Alert.alert('완료', '프로필이 저장되었어요.', [
        {
          text: '확인',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      const message =
        error?.message && typeof error.message === 'string'
          ? error.message
          : '저장 중 오류가 발생했어요.';
      Alert.alert('오류', message);
    }
  };

  const onlyDigits = (value: string) => value.replace(/[^0-9]/g, '');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <PageHeader
          onBack={() => navigation.goBack()}
          title="프로필 편집"
          borderBottom
        />
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.section}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {(displayName || user?.email || '?')[0]}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.photoBtn, fetching && styles.disabledButton]}
                disabled={fetching}
                onPress={() =>
                  Alert.alert('준비중', '프로필 사진 변경은 곧 지원됩니다.')
                }
              >
                <Text style={styles.photoBtnText}>사진 변경 (준비중)</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>닉네임</Text>
            <TextInput
              style={styles.input}
              placeholder={fetching ? '불러오는 중...' : '닉네임(최대 7글자)'}
              placeholderTextColor={COLORS.text.disabled}
              value={displayName}
              onChangeText={value => {
                const next = value.slice(0, 7);
                setDisplayName(next);
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: '' }));
                }
              }}
              editable={!fetching && !saving}
            />
            {errors.name ? (
              <Text style={styles.errorText}>{errors.name}</Text>
            ) : null}
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>학과</Text>
            <Dropdown
              value={department}
              options={DEPARTMENT_OPTIONS}
              onSelect={setDepartment}
              placeholder="학과를 선택해주세요"
              modalTitle="학과 선택"
              disabled={fetching || saving}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.label}>학번</Text>
            <TextInput
              style={styles.input}
              placeholder={
                fetching
                  ? '불러오는 중...'
                  : saving
                    ? '저장 중...'
                    : '예: 20251234'
              }
              placeholderTextColor={COLORS.text.disabled}
              value={studentId}
              onChangeText={value => {
                const only = onlyDigits(value).slice(0, 8);
                setStudentId(only);
                if (errors.studentId) {
                  setErrors(prev => ({ ...prev, studentId: '' }));
                }
              }}
              editable={!fetching && !saving}
              keyboardType="number-pad"
            />
            {errors.studentId ? (
              <Text style={styles.errorText}>{errors.studentId}</Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={[
              styles.saveButton,
              (fetching || saving) && styles.saveButtonDisabled,
            ]}
            disabled={fetching || saving}
            onPress={handleSave}
          >
            {saving ? (
              <View style={styles.saveButtonContent}>
                <ActivityIndicator
                  size="small"
                  color={COLORS.text.buttonText}
                  style={styles.spinner}
                />
                <Text style={styles.saveButtonText}>저장 중...</Text>
              </View>
            ) : (
              <Text style={styles.saveButtonText}>저장하기</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  section: {
    marginBottom: 16,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: COLORS.text.buttonText,
    fontWeight: '700',
    fontSize: 22,
  },
  photoBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  photoBtnText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
  },
  label: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: 14,
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 6,
  },
  saveButton: {
    backgroundColor: COLORS.accent.green,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginVertical: 24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: COLORS.text.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
  spinner: {
    marginRight: 8,
  },
});

