import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/common/Text';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { useAuth } from '../../hooks/useAuth';
import { updateUserProfile } from '../../libs/firebase';

export const CompleteProfileScreen = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    if (!displayName.trim() || !studentId.trim()) {
      Alert.alert('알림', '닉네임과 학번을 모두 입력해주세요.');
      return;
    }
    if (displayName.trim().length > 7) {
      Alert.alert('알림', '닉네임은 7자 이하로 입력해주세요.');
      return;
    }
    try {
      setLoading(true);
      await updateUserProfile(user.uid, {
        displayName: displayName.trim(),
        studentId: studentId.trim(),
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
            <Text style={styles.subtitle}>닉네임과 학번을 입력해주세요</Text>
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

            <Text style={styles.labelWithGap}>학번</Text>
            <TextInput
              style={styles.input}
              value={studentId}
              onChangeText={setStudentId}
              placeholder="예: 20231234"
              keyboardType="numeric"
              placeholderTextColor={COLORS.text.disabled}
            />

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
  },
  labelWithGap: { 
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary, 
    marginBottom: 8, 
    marginTop: 16,
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


