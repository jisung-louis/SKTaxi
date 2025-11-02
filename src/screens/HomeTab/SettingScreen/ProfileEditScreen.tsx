import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, ScrollView, View, TouchableOpacity, TextInput, Alert, TouchableWithoutFeedback, Keyboard, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import PageHeader from '../../../components/common/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useScreenView } from '../../../hooks/useScreenView';
import { setUserProperties } from '../../../lib/analytics';
import { Dropdown } from '../../../components/common/Dropdown';
import { DEPARTMENT_OPTIONS } from '../../../constants/constants';

export const ProfileEditScreen = () => {
  useScreenView();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const user = auth().currentUser;

  const [displayName, setDisplayName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; studentId?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setFetching(true);
        if (!user?.uid) return;
        const snap = await firestore().collection('users').doc(user.uid).get();
        const data = snap.data() as any;
        if (cancelled) return;
        setDisplayName(data?.displayName || user.displayName || '');
        setStudentId(data?.studentId || '');
        setDepartment(data?.department || '');
      } catch {}
      finally {
        if (!cancelled) setFetching(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.uid]);

  const validate = () => {
    const next: { name?: string; studentId?: string } = {};
    if (!displayName.trim()) next.name = '닉네임을 입력해주세요.';
    else if (displayName.trim().length > 7) next.name = '닉네임은 최대 7글자까지 가능합니다.';
    const re = /^20\d{6}$/;
    if (!studentId.trim()) next.studentId = '학번을 입력해주세요.';
    else if (!re.test(studentId.trim())) next.studentId = '학번은 20으로 시작하는 8자리 숫자여야 해요.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = async () => {
    if (!user?.uid) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }
    if (!validate()) {
      const parts: string[] = [];
      if (errors?.name) parts.push('닉네임');
      if (errors?.studentId) parts.push('학번');
      if (parts.length) Alert.alert('알림', `${parts.join(', ')}이 유효하지 않아요`);
      return;
    }
    try {
      setSaving(true);
      // Firestore 업데이트
      await firestore().collection('users').doc(user.uid).set({
        displayName: displayName.trim(),
        studentId: studentId.trim(),
        department: department.trim(),
      }, { merge: true });
      // Auth 표시 이름도 업데이트(옵션)
      try { await user.updateProfile({ displayName: displayName.trim() }); } catch {}
      
      // Analytics: 사용자 속성 업데이트
      await setUserProperties({
        display_name: displayName.trim(),
        department: department.trim() || '',
      });
      
      Alert.alert('완료', '프로필이 저장되었어요.', [{ text: '확인', onPress: () => navigation.goBack() }]);
    } catch (e) {
      Alert.alert('오류', '저장 중 오류가 발생했어요.');
    } finally {
      setSaving(false);
    }
  };

  const onlyDigits = (v: string) => v.replace(/[^0-9]/g, '');

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <SafeAreaView style={styles.container}>
        <PageHeader onBack={() => navigation.goBack()} title="프로필 편집" borderBottom />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
          <View style={styles.section}>
            <View style={styles.avatarRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(displayName || user?.email || '?')[0]}</Text>
              </View>
              <TouchableOpacity style={[styles.photoBtn, fetching && { opacity: 0.6 }]} disabled={fetching} onPress={() => Alert.alert('준비중', '프로필 사진 변경은 곧 지원됩니다.') }>
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
              onChangeText={(v) => {
                const next = v.slice(0, 7);
                setDisplayName(next);
                if (errors?.name) setErrors({ ...errors, name: '' });
              }}
              editable={!fetching && !saving}
            />
            {errors?.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
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
              placeholder={fetching ? '불러오는 중...' : saving ? '저장 중...' : '예: 20251234'}
              placeholderTextColor={COLORS.text.disabled}
              value={studentId}
              onChangeText={(v) => {
                const only = onlyDigits(v).slice(0, 8);
                setStudentId(only);
                if (errors?.studentId) setErrors({ ...errors, studentId: '' });
              }}
              editable={!fetching && !saving}
              keyboardType="number-pad"
            />
            {errors?.studentId ? <Text style={styles.errorText}>{errors.studentId}</Text> : null}
          </View>

          <TouchableOpacity style={[styles.saveButton, (fetching || saving) && styles.saveButtonDisabled]} disabled={fetching || saving} onPress={handleSave}>
            {saving ? (
              <View style={styles.saveButtonContent}>
                <ActivityIndicator size="small" color={COLORS.text.buttonText} style={{ marginRight: 8 }} />
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
});