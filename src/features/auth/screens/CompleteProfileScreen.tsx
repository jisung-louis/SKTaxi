import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { Dropdown } from '@/components/common/Dropdown';
import { Text } from '@/components/common/Text';
import { DEPARTMENT_OPTIONS } from '@/constants/constants';
import { COLORS } from '@/shared/constants/colors';
import { TYPOGRAPHY } from '@/shared/constants/typography';
import { useScreenView } from '@/shared/hooks';

import { useCompleteProfile } from '../hooks/useCompleteProfile';

export const CompleteProfileScreen = () => {
  useScreenView();

  const navigation = useNavigation<any>();
  const { loading, submitProfile } = useCompleteProfile();
  const [displayName, setDisplayName] = useState('');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSave = async () => {
    try {
      await submitProfile({
        displayName,
        department,
        studentId,
        ageConfirmed,
        termsAccepted,
      });
    } catch (error: any) {
      Alert.alert(
        '오류',
        error?.message ||
          '프로필 저장에 실패했습니다. 다시 시도해주세요.',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback
        onPress={Keyboard.dismiss}
        accessible={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>프로필 설정</Text>
            <Text style={styles.subtitle}>
              닉네임, 학과, 학번을 입력해주세요
            </Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>닉네임</Text>
            <TextInput
              style={styles.input}
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="닉네임을 입력하세요"
              placeholderTextColor={COLORS.text.disabled}
              maxLength={7}
            />

            <View style={styles.labelGroup}>
              <Text style={styles.labelWithGap}>학과</Text>
              <Text style={styles.labelDescription}>
                학과별 맞춤 공지사항 알림을 받을 수 있어요
              </Text>
            </View>
            <Dropdown
              value={department}
              options={DEPARTMENT_OPTIONS}
              onSelect={setDepartment}
              placeholder="학과를 선택해주세요"
              modalTitle="학과 선택"
            />

            <View style={styles.labelGroup}>
              <Text style={styles.labelWithGap}>학번</Text>
              <Text style={styles.labelDescription}>
                학번은 공개되지 않아요
              </Text>
            </View>
            <TextInput
              style={styles.input}
              value={studentId}
              onChangeText={setStudentId}
              placeholder="예: 20231234"
              keyboardType="numeric"
              placeholderTextColor={COLORS.text.disabled}
            />

            <View style={styles.checkRow}>
              <TouchableOpacity
                accessibilityRole="checkbox"
                accessibilityState={{ checked: ageConfirmed }}
                style={[
                  styles.checkBox,
                  ageConfirmed && styles.checkBoxChecked,
                ]}
                onPress={() => setAgeConfirmed(value => !value)}
              >
                {ageConfirmed && (
                  <Icon
                    name="checkmark"
                    size={14}
                    color={COLORS.background.primary}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAgeConfirmed(value => !value)}
                accessibilityRole="button"
              >
                <Text style={styles.checkLabel}>
                  성결대 학생이고 19세 이상이에요.
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.checkRow}>
              <TouchableOpacity
                accessibilityRole="checkbox"
                accessibilityState={{ checked: termsAccepted }}
                style={[
                  styles.checkBox,
                  termsAccepted && styles.checkBoxChecked,
                ]}
                onPress={() => setTermsAccepted(value => !value)}
              >
                {termsAccepted && (
                  <Icon
                    name="checkmark"
                    size={14}
                    color={COLORS.background.primary}
                  />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setTermsAccepted(value => !value)}
                accessibilityRole="button"
              >
                <Text style={styles.checkLabel}>
                  이용약관(EULA 포함)에 동의해요.
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate?.('TermsOfUseForAuth');
                }}
                accessibilityLabel="이용 약관 보기"
              >
                <Text style={styles.linkText}> 약관 보기</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? '저장 중...' : '완료'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  checkBox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border.dark,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.primary,
    marginRight: 8,
  },
  checkBoxChecked: {
    backgroundColor: COLORS.accent.green,
    borderColor: COLORS.accent.green,
  },
  checkLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
  },
  form: {
    paddingHorizontal: 24,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
    gap: 8,
  },
  input: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: 14,
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    height: 48,
  },
  label: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    marginBottom: 8,
    fontWeight: '600',
  },
  labelDescription: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.disabled,
    marginBottom: 8,
    marginTop: 4,
  },
  labelGroup: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  labelWithGap: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    marginBottom: 8,
    marginTop: 16,
    fontWeight: '600',
  },
  linkText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.accent.green,
    fontWeight: '700',
  },
  saveButton: {
    backgroundColor: COLORS.accent.green,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: COLORS.text.buttonText,
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
  },
  subtitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
  title: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text.primary,
  },
});
