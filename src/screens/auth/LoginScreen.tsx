import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Text } from '../../components/common/Text';
import { COLORS } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { FirebaseError } from 'firebase/app';

export const LoginScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('알림', '이메일과 비밀번호를 모두 입력해주세요.');
      return;
    }

    try {
      setLoading(true);
      await signIn({ email, password });
    } catch (error: unknown) {
      let errorMessage = '로그인 중 오류가 발생했습니다.';
      
      if ((error as FirebaseError).code) {
        const firebaseError = error as FirebaseError;
        switch (firebaseError.code) {
          case 'auth/invalid-email':
            errorMessage = '유효하지 않은 이메일 형식입니다.';
            break;
          case 'auth/user-disabled':
            errorMessage = '비활성화된 계정입니다.';
            break;
          case 'auth/user-not-found':
            errorMessage = '등록되지 않은 이메일입니다.';
            break;
          case 'auth/wrong-password':
            errorMessage = '잘못된 비밀번호입니다.';
            break;
          case 'auth/too-many-requests':
            errorMessage = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
            break;
          case 'auth/network-request-failed':
            errorMessage = '네트워크 연결을 확인해주세요.';
            break;
          case 'auth/invalid-credential':
            errorMessage = '로그인 정보가 유효하지 않습니다. 다시 확인해주세요.';
            break;
          default:
            errorMessage = `로그인 실패: ${firebaseError.message}`;
        }
      }
      
      Alert.alert('로그인 실패', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Text style={styles.title}>로그인</Text>
          <Text style={styles.subtitle}>SK택시에 오신 것을 환영합니다</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="이메일을 입력하세요"
              placeholderTextColor={COLORS.text.disabled}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
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

          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading}
          >
            <Text style={styles.forgotPasswordText}>비밀번호를 잊으셨나요?</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? '로그인 중...' : '로그인'}
            </Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>계정이 없으신가요? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Register')}
              disabled={loading}
            >
              <Text style={styles.registerLink}>회원가입</Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingTop: 32,
    paddingBottom: 48,
  },
  title: {
    fontSize: 32,
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPasswordText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: COLORS.accent.green,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButtonText: {
    color: COLORS.text.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    color: COLORS.text.secondary,
    fontSize: 14,
  },
  registerLink: {
    color: COLORS.accent.green,
    fontSize: 14,
    fontWeight: '600',
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
});