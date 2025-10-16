import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, LayoutAnimation, UIManager } from 'react-native';
import { Text } from '../../components/common/Text';
import { COLORS } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail } from '../../utils/validation';
import PageHeader from '../../components/common/PageHeader';
import { TYPOGRAPHY } from '../../constants/typhograpy';

// 컴포넌트 최상단에서 Android LayoutAnimation 활성화
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [studentId, setStudentId] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const [emailCode, setEmailCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [nicknameError, setNicknameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [studentIdError, setStudentIdError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // emailSent, emailVerified 상태 변경 시 LayoutAnimation 트리거
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [emailSent, emailVerified]);

  const handleRegister = async () => {
    const emailRegex = /^[^\s@]+@sungkyul\.ac\.kr$/i;
    const studentIdRegex = /^20\d{6}$/; // 20 + 6자리 = 총 8자리

    const nextNicknameError = !nickname.trim()
      ? '닉네임을 입력해주세요.'
      : nickname.trim().length > 7
        ? '닉네임은 최대 7글자까지 가능합니다.'
        : '';

    const nextEmailError = !email.trim()
      ? '이메일을 입력해주세요.'
      : !emailRegex.test(email.trim())
        ? '성결대 이메일(@sungkyul.ac.kr)만 사용 가능합니다.'
        : '';

    const nextStudentIdError = !studentId.trim()
      ? '학번을 입력해주세요.'
      : !studentIdRegex.test(studentId.trim())
        ? '학번은 20으로 시작하는 8자리 숫자여야 해요.'
        : '';

    const nextPasswordError = !password.trim()
      ? '비밀번호를 입력해주세요.'
      : password.length < 8
        ? '비밀번호는 8자 이상이어야 해요.'
        : '';

    const nextConfirmError = !confirmPassword.trim()
      ? '비밀번호 확인을 입력해주세요.'
      : confirmPassword !== password
        ? '비밀번호가 일치하지 않습니다.'
        : '';

    setNicknameError(nextNicknameError);
    setEmailError(nextEmailError);
    setStudentIdError(nextStudentIdError);
    setPasswordError(nextPasswordError);
    setConfirmPasswordError(nextConfirmError);

    const hasError = !!(nextNicknameError || nextEmailError || nextStudentIdError || nextPasswordError || nextConfirmError);
    if (hasError) {
      const invalids: string[] = [];
      if (nextNicknameError) invalids.push('닉네임');
      if (nextEmailError) invalids.push('이메일');
      if (nextStudentIdError) invalids.push('학번');
      if (nextPasswordError || nextConfirmError) invalids.push('비밀번호');

      const msg = invalids.length === 4
        ? '모든 값이 유효하지 않아요'
        : `${invalids.join(', ')}가 유효하지 않아요`;
      Alert.alert('알림', msg);
      return;
    }
    try {
      setLoading(true);
      await signUp({
        email,
        password,
        displayName: nickname,
        studentId: studentId,
      });
      Alert.alert('회원가입 완료', '회원가입이 성공적으로 완료되었습니다.', [
        { text: '확인', onPress: () => navigation.navigate('Login') },
      ]);
    } catch (error: unknown) {
      let errorMessage = '회원가입 중 오류가 발생했습니다.';
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof (error as any).message === 'string'
      ) {
        errorMessage = (error as any).message;
      }
      Alert.alert('회원가입 실패', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 더미 이메일 인증코드 발송
  const handleSendEmailCode = () => {
    if (!email.trim()) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }
    if (!validateEmail(email)) {
      Alert.alert('알림', '성결대학교 이메일(@sungkyul.ac.kr)만 인증이 가능합니다.');
      return;
    }
    setEmailSent(true);
    Alert.alert('인증코드 발송', '입력하신 이메일로 인증코드가 발송되었습니다. (더미)');
  };

  // 더미 이메일 인증코드 확인
  const handleVerifyEmailCode = () => {
    if (!emailCode.trim()) {
      Alert.alert('알림', '인증코드를 입력해주세요.');
      return;
    }
    setEmailVerified(true);
    Alert.alert('인증 성공', '이메일 인증이 완료되었습니다. (더미)');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <PageHeader
          onBack={() => navigation.goBack()}
          title="회원가입"
          padding={16}
          style={{ paddingBottom: 24 }}
          borderBottom
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>닉네임</Text>
              <TextInput
                style={styles.input}
                placeholder="닉네임을 입력하세요 (최대 7글자)"
                placeholderTextColor={COLORS.text.disabled}
                value={nickname}
                onChangeText={(v) => {
                  const next = v.slice(0, 7);
                  setNickname(next);
                  if (next.length === 0) setNicknameError('닉네임을 입력해주세요.');
                  else if (next.length > 7) setNicknameError('닉네임은 최대 7글자까지 가능합니다.');
                  else setNicknameError('');
                }}
                editable={!loading}
              />
              {nicknameError ? <Text style={styles.errorText}>{nicknameError}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>이메일 (@sungkyul.ac.kr)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="성결대 이메일을 입력하세요"
                  placeholderTextColor={COLORS.text.disabled}
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    const ok = /^[^\s@]+@sungkyul\.ac\.kr$/i.test(v);
                    if (v.length === 0) setEmailError('이메일을 입력해주세요.');
                    else if (!ok) setEmailError('성결대 이메일(@sungkyul.ac.kr)만 사용 가능합니다.');
                    else setEmailError('');
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading && !emailVerified}
                />
                <TouchableOpacity
                  style={[styles.emailButton, emailSent && { opacity: 0.7 }]}
                  onPress={handleSendEmailCode}
                  disabled={loading || emailSent || emailVerified}
                >
                  <Text style={styles.emailButtonText}>{emailSent ? '발송됨' : '인증코드 발송'}</Text>
                </TouchableOpacity>
              </View>
              {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
            </View>

            {emailSent && !emailVerified && (
              <View style={styles.inputContainer}>
                <Text style={styles.label}>인증코드</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="인증코드를 입력하세요"
                    placeholderTextColor={COLORS.text.disabled}
                    value={emailCode}
                    onChangeText={setEmailCode}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    style={styles.emailButton}
                    onPress={handleVerifyEmailCode}
                    disabled={loading}
                  >
                    <Text style={styles.emailButtonText}>인증 확인</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>학번</Text>
              <TextInput
                style={styles.input}
                placeholder="학번을 입력하세요 (예 : 20251234)"
                placeholderTextColor={COLORS.text.disabled}
                value={studentId}
                onChangeText={(v) => {
                  const onlyDigits = v.replace(/[^0-9]/g, '').slice(0, 8);
                  setStudentId(onlyDigits);
                  const re = /^20\d{6}$/;
                  if (onlyDigits.length === 0) setStudentIdError('학번을 입력해주세요.');
                  else if (!re.test(onlyDigits)) setStudentIdError('학번은 20으로 시작하는 8자리 숫자여야 해요.');
                  else setStudentIdError('');
                }}
                keyboardType="number-pad"
                editable={!loading}
              />
              {studentIdError ? <Text style={styles.errorText}>{studentIdError}</Text> : null}
            </View>

            {/* 계좌 정보 등록 */}
            {/* <View style={[styles.inputContainer, { marginTop: -8 }]}> 
              <Text style={styles.label}>계좌 정보 (선택)</Text>
              <TextInput
                style={styles.input}
                placeholder="은행명"
                placeholderTextColor={COLORS.text.disabled}
                value={bankName}
                onChangeText={setBankName}
                editable={!loading}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="계좌번호"
                placeholderTextColor={COLORS.text.disabled}
                value={accountNumber}
                onChangeText={setAccountNumber}
                keyboardType="number-pad"
                editable={!loading}
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="예금주"
                placeholderTextColor={COLORS.text.disabled}
                value={accountHolder}
                onChangeText={setAccountHolder}
                editable={!loading}
              />
            </View> */}

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 입력하세요 (8자 이상)"
                placeholderTextColor={COLORS.text.disabled}
                value={password}
                onChangeText={(v) => {
                  setPassword(v);
                  if (v.length === 0) setPasswordError('비밀번호를 입력해주세요.');
                  else if (v.length < 8) setPasswordError('비밀번호는 8자 이상이어야 해요.');
                  else setPasswordError('');
                }}
                secureTextEntry
                editable={!loading}
              />
              {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 다시 입력하세요"
                placeholderTextColor={COLORS.text.disabled}
                value={confirmPassword}
                onChangeText={(v) => {
                  setConfirmPassword(v);
                  if (v.length === 0) setConfirmPasswordError('비밀번호 확인을 입력해주세요.');
                  else if (v !== password) setConfirmPasswordError('비밀번호가 일치하지 않습니다.');
                  else setConfirmPasswordError('');
                }}
                secureTextEntry
                editable={!loading}
              />
              {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
            </View>

            <TouchableOpacity style={[styles.registerButton, loading && { opacity: 0.7 }]} onPress={handleRegister} disabled={loading}>
              <Text style={styles.registerButtonText}>{loading ? '회원가입 중...' : '회원가입'}</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>이미 계정이 있으신가요? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
                <Text style={styles.loginLink}>로그인</Text>
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
  keyboardView: {
    flex: 1,
  },
  form: {
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: 16,
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    minHeight: 48,
  },
  registerButton: {
    backgroundColor: COLORS.accent.green,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 24,
  },
  registerButtonText: {
    color: COLORS.text.buttonText,
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: COLORS.text.secondary,
    ...TYPOGRAPHY.body2,
  },
  loginLink: {
    color: COLORS.accent.green,
    ...TYPOGRAPHY.body2,
    fontWeight: '600',
  },
  emailButton: {
    backgroundColor: COLORS.accent.green,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginLeft: 8,
  },
  emailButtonText: {
    color: COLORS.text.buttonText,
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 6,
  },
}); 