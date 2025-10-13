import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, LayoutAnimation, UIManager } from 'react-native';
import { Text } from '../../components/common/Text';
import { COLORS } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { validateEmail } from '../../utils/validation';
import PageHeader from '../../components/common/PageHeader';

// 컴포넌트 최상단에서 Android LayoutAnimation 활성화
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const [emailCode, setEmailCode] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // emailSent, emailVerified 상태 변경 시 LayoutAnimation 트리거
  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [emailSent, emailVerified]);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('알림', '모든 항목을 입력해주세요.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('알림', '비밀번호가 일치하지 않습니다.');
      return;
    }
    try {
      setLoading(true);
      await signUp({
        email,
        password,
        displayName: name,
        phoneNumber: phone,
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
        />
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>이름</Text>
              <TextInput
                style={styles.input}
                placeholder="이름을 입력하세요"
                placeholderTextColor={COLORS.text.disabled}
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>이메일 (@sungkyul.ac.kr)</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="성결대 이메일을 입력하세요"
                  placeholderTextColor={COLORS.text.disabled}
                  value={email}
                  onChangeText={setEmail}
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
              <Text style={styles.label}>전화번호</Text>
              <TextInput
                style={styles.input}
                placeholder="전화번호를 입력하세요"
                placeholderTextColor={COLORS.text.disabled}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 입력하세요"
                placeholderTextColor={COLORS.text.disabled}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 다시 입력하세요"
                placeholderTextColor={COLORS.text.disabled}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />
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
  header: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: COLORS.text.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
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
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  loginLink: {
    color: COLORS.accent.green,
    fontSize: 14,
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
}); 