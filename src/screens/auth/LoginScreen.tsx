import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, Image, TextInput } from 'react-native';
import { Text } from '../../components/common/Text';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import Icon from 'react-native-vector-icons/Ionicons';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import Modal from 'react-native-modal';
import { authInstance } from '../../libs/firebase';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';
import { useScreenView } from '../../hooks/useScreenView';

export const LoginScreen = ({ navigation }: any) => {
  useScreenView();
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle } = useAuth();
  const [adminVisible, setAdminVisible] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);

  // Reanimated shared values
  const largeCircleScale = useSharedValue(1);
  const smallCircleScale = useSharedValue(1);

  useEffect(() => {
    largeCircleScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 4000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 4000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );

    smallCircleScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 5000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.0, { duration: 5000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [largeCircleScale, smallCircleScale]);

  const largeCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: largeCircleScale.value }],
  }));

  const smallCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: smallCircleScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Decorative background circles (Reanimated) */}
        <Animated.View style={[styles.bgCircleLarge, largeCircleStyle]} />
        <Animated.View style={[styles.bgCircleSmall, smallCircleStyle]} />
        <View style={styles.header}>
          <View style={styles.logoMark}>
            <Icon name="car" size={28} color={COLORS.background.primary} />
          </View>
          <Text style={styles.title}>SKURI Taxi</Text>
          <Text style={styles.subtitle}>성결대 학생들을 위한 스마트한 캠퍼스 라이프</Text>
          <Text style={styles.subtitleSecondary}>택시 동승자 찾기 • 실시간 공지 • 시간표 • 학사일정</Text>
        </View>

        <View style={styles.body}>
          <Image source={require('../../../assets/icons/skuri_icon.png')} style={{ width: WINDOW_WIDTH * 0.5, height: WINDOW_WIDTH * 0.5, borderRadius: 24 }} />
        </View>

        <View style={styles.form}>
          <TouchableOpacity 
            style={[styles.googleButton, loading && styles.loginButtonDisabled]}
            onPress={async () => {
              try {
                setLoading(true);
                const { firstLogin } = await signInWithGoogle();
                if (firstLogin) {
                  navigation.navigate('CompleteProfile');
                }
              } catch (e: any) {
                const code = e?.code;
                const message: string = e?.message || '';
                if (code === 'auth/cancelled') {
                  // 사용자가 로그인 플로우를 취소한 경우: 조용히 무시
                  return;
                }
                Alert.alert('로그인 실패', message || '다시 시도해주세요.');
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            accessibilityLabel="성결대 이메일로 로그인하기"
            accessibilityHint="성결대학교 이메일로 로그인합니다"
          >
            <View style={styles.googleIconBadge}>
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.accent.green} />
              ) : (
                <Icon name="logo-google" size={18} color={COLORS.accent.green} />
              )}
            </View>
            <Text style={styles.googleButtonText}>{loading ? '로그인 중...' : '성결대 이메일로 로그인하기'}</Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>성결대학교 이메일(@sungkyul.ac.kr)만 사용할 수 있어요</Text>
        </View>

        {/* Admin floating button */}
        <TouchableOpacity
          style={styles.adminFab}
          onPress={() => setAdminVisible(true)}
          accessibilityLabel="관리자 로그인"
          accessibilityHint="관리자 이메일/비밀번호 로그인 모달을 엽니다"
        >
          <Icon name="shield-checkmark" size={16} color={COLORS.background.primary} />
          <Text style={styles.adminFabText}>관리자</Text>
        </TouchableOpacity>

        {/* Admin login modal */}
        <Modal
          isVisible={adminVisible}
          onBackdropPress={() => (!adminLoading ? setAdminVisible(false) : null)}
          onBackButtonPress={() => (!adminLoading ? setAdminVisible(false) : null)}
          useNativeDriver
          hideModalContentWhileAnimating
          animationIn="zoomIn"
          animationOut="zoomOut"
          animationInTiming={280}
          animationOutTiming={280}
          backdropTransitionInTiming={280}
          backdropTransitionOutTiming={280}
          useNativeDriverForBackdrop
          avoidKeyboard
          hardwareAccelerated
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>관리자 로그인</Text>
            <TextInput
              value={adminEmail}
              onChangeText={setAdminEmail}
              placeholder="이메일"
              placeholderTextColor={COLORS.text.disabled}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
              editable={!adminLoading}
            />
            <TextInput
              value={adminPassword}
              onChangeText={setAdminPassword}
              placeholder="비밀번호"
              secureTextEntry
              placeholderTextColor={COLORS.text.disabled}
              style={styles.input}
              editable={!adminLoading}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalCancel]}
                onPress={() => (!adminLoading ? setAdminVisible(false) : null)}
                disabled={adminLoading}
              >
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalConfirm, adminLoading && styles.loginButtonDisabled]}
                onPress={async () => {
                  try {
                    setAdminLoading(true);
                    if (!adminEmail || !adminPassword) {
                      Alert.alert('입력 필요', '이메일과 비밀번호를 입력해주세요.');
                      return;
                    }
                    await authInstance().signInWithEmailAndPassword(adminEmail.trim(), adminPassword);
                    setAdminVisible(false);
                  } catch (e: any) {
                    const message: string = e?.message || '다시 시도해주세요.';
                    Alert.alert('관리자 로그인 실패', message);
                  } finally {
                    setAdminLoading(false);
                  }
                }}
                disabled={adminLoading}
              >
                {adminLoading ? (
                  <ActivityIndicator size="small" color={COLORS.text.buttonText} />
                ) : (
                  <Text style={styles.modalConfirmText}>로그인</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
  bgCircleLarge: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: COLORS.accent.green + '20',
  },
  bgCircleSmall: {
    position: 'absolute',
    top: 120,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.accent.blue + '15',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.accent.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.text.secondary,
  },
  subtitleSecondary: {
    fontSize: 13,
    color: COLORS.text.secondary,
    opacity: 0.8,
    marginTop: 4,
  },
  body: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24 + 24,
    shadowColor: COLORS.accent.green,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 12 },
    elevation: 2,
  },
  form: {
    paddingHorizontal: 24,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  googleButton: {
    backgroundColor: COLORS.accent.green,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: COLORS.accent.green,
  },
  googleIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleButtonText: {
    color: COLORS.text.buttonText,
    fontSize: 16,
    fontWeight: '700',
  },
  helperText: {
    color: COLORS.text.secondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
  adminFab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: COLORS.background.whiteSecondary,
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  adminFabText: {
    color: COLORS.text.blackSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  modalCard: {
    backgroundColor: COLORS.background.primary,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  modalTitle: {
    ...TYPOGRAPHY.title2,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 20,
  },
  input: {
    ...TYPOGRAPHY.body2,
    height: 40,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    backgroundColor: COLORS.background.card,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.text.primary,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  modalButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  modalCancel: {
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  modalConfirm: {
    backgroundColor: COLORS.accent.green,
  },
  modalCancelText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  modalConfirmText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.buttonText,
    fontWeight: '700',
  },
});