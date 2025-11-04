import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/common/Text';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile, getUserProfile, createUserProfile } from '../../libs/firebase';
import { useScreenView } from '../../hooks/useScreenView';
import { Dropdown } from '../../components/common/Dropdown';
import { DEPARTMENT_OPTIONS } from '../../constants/constants';
import { setUserProperties } from '../../lib/analytics';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

export const CompleteProfileScreen = () => {
  useScreenView();
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    if (!ageConfirmed || !termsAccepted) {
      Alert.alert('동의 필요', '계정 사용 전에 18세 이상 확인과 이용약관(EULA 포함) 동의가 필요합니다.');
      return;
    }
    if (!displayName.trim() || !studentId.trim() || !department.trim()) {
      Alert.alert('알림', '닉네임과 학번, 학과를 모두 입력해주세요.');
      return;
    }
    if (displayName.trim().length > 7) {
      Alert.alert('알림', '닉네임은 7자 이하로 입력해주세요.');
      return;
    }
    try {
      setLoading(true);
      // 사용자 문서가 없으면 먼저 생성
      const existing = await getUserProfile(user.uid);
      if (!existing) {
        await createUserProfile(user.uid, {
          uid: user.uid,
          email: user.email ?? null,
          displayName: displayName.trim(),
          studentId: studentId.trim(),
          department: department.trim(),
          photoURL: user.photoURL ?? null,
          onboarding: { permissionsComplete: false },
          agreements: {
            termsAccepted: true,
            ageConfirmed: true,
            termsVersion: '2025-10-29',
            acceptedAt: new Date().toISOString(),
          },
        } as any);
      }
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        studentId: studentId.trim(),
        department: department.trim(),
      } as any);
      await updateUserProfile(user.uid, {
        agreements: {
          termsAccepted: true,
          ageConfirmed: true,
          termsVersion: '2025-10-29',
          acceptedAt: new Date().toISOString(),
        } as any,
      } as any);
      
      // Analytics: 사용자 속성 설정
      await setUserProperties({
        display_name: displayName.trim(),
        department: department.trim(),
        // studentId는 개인 식별 정보이므로 Analytics에 저장하지 않음
      });
      
      // 프로필 완료 후 RootNavigator가 자동으로 Main으로 전환함
      // 별도 네비게이션 불필요
    } catch (e) {
      Alert.alert('오류', '프로필 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <View style={{ flex: 1 }}>
          <View style={styles.header}>
            <Text style={styles.title}>프로필 설정</Text>
            <Text style={styles.subtitle}>닉네임, 학과, 학번을 입력해주세요</Text>
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
              <Text style={styles.labelDescription}>학과별 맞춤 공지사항 알림을 받을 수 있어요</Text>
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
              <Text style={styles.labelDescription}>학번은 공개되지 않아요</Text>
            </View>
            <TextInput
              style={styles.input}
              value={studentId}
              onChangeText={setStudentId}
              placeholder="예: 20231234"
              keyboardType="numeric"
              placeholderTextColor={COLORS.text.disabled}
            />

            {/* 동의 체크박스 */}
            <View style={[styles.checkRow, { marginTop: 24 }]}> 
              <TouchableOpacity
                accessibilityRole="checkbox"
                accessibilityState={{ checked: ageConfirmed }}
                style={[styles.checkBox, ageConfirmed && styles.checkBoxChecked]}
                onPress={() => setAgeConfirmed((v) => !v)}
              >
                {ageConfirmed && <Icon name="checkmark" size={14} color={COLORS.background.primary} />}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setAgeConfirmed((v) => !v)} accessibilityRole="button">
                <Text style={styles.checkLabel}>성결대 학생이고 19세 이상이에요.</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.checkRow}> 
              <TouchableOpacity
                accessibilityRole="checkbox"
                accessibilityState={{ checked: termsAccepted }}
                style={[styles.checkBox, termsAccepted && styles.checkBoxChecked]}
                onPress={() => setTermsAccepted((v) => !v)}
              >
                {termsAccepted && <Icon name="checkmark" size={14} color={COLORS.background.primary} />}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setTermsAccepted((v) => !v)} accessibilityRole="button">
                <Text style={styles.checkLabel}>이용약관(EULA 포함)에 동의해요.</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  try { (navigation as any).navigate?.('TermsOfUseForAuth'); } catch {}
                }}
                accessibilityLabel="이용 약관 보기"
              >
                <Text style={styles.linkText}> 약관 보기</Text>
              </TouchableOpacity>
            </View>


            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
              <Text style={styles.saveButtonText}>{loading ? '저장 중...' : '완료'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background.primary,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
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
  linkText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.accent.green,
    fontWeight: '700',
  },
  header: { 
    paddingHorizontal: 24, 
    paddingTop: 32, 
    paddingBottom: 24,
    gap: 8,
  },
  title: { 
    ...TYPOGRAPHY.title1,
    color: COLORS.text.primary, 
  },
  subtitle: { 
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
  form: { 
    paddingHorizontal: 24,
  },
  label: { 
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary, 
    marginBottom: 8,
    fontWeight: '600',
  },
  labelWithGap: { 
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary, 
    marginBottom: 8, 
    marginTop: 16,
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
});


