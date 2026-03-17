import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {NavigationProp, useNavigation} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import Modal from 'react-native-modal';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import type {
  AuthStackParamList,
  RootStackParamList,
} from '@/app/navigation/types';
import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks';

import {AuthFeatureChip} from '../components/v2/AuthFeatureChip';
import {useAuth} from '../hooks/useAuth';

const FEATURE_CHIPS = [
  '🚕 택시 파티',
  '📢 학교 공지',
  '📅 시간표',
  '🍱 학식 메뉴',
];

const getFirebaseErrorMessage = (error: any): string => {
  const firebaseCode = error?.context?.firebaseCode || error?.code;

  const errorMap: Record<string, string> = {
    'auth/wrong-password': '비밀번호가 올바르지 않습니다.',
    'auth/user-not-found': '등록되지 않은 이메일입니다.',
    'auth/invalid-email': '올바른 이메일 형식이 아닙니다.',
    'auth/too-many-requests': '잠시 후 다시 시도해주세요.',
    'auth/invalid-credential':
      '이메일 또는 비밀번호가 올바르지 않습니다.',
    'auth/user-disabled': '비활성화된 계정입니다.',
    'auth/network-request-failed': '네트워크 연결을 확인해주세요.',
  };

  return errorMap[firebaseCode] || '로그인에 실패했습니다.';
};

type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
type LoginNavigation = NavigationProp<RootStackParamList & AuthStackParamList>;

export const LoginScreen = (_props: LoginScreenProps) => {
  useScreenView();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<LoginNavigation>();

  const [loading, setLoading] = useState(false);
  const [adminVisible, setAdminVisible] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminLoading, setAdminLoading] = useState(false);
  const {
    refreshAuthToken,
    signInWithEmailAndPassword,
    signInWithGoogle,
  } = useAuth();

  const handlePressGoogleLogin = React.useCallback(async () => {
    try {
      setLoading(true);
      const {firstLogin} = await signInWithGoogle();
      if (__DEV__) {
        const firebaseIdToken = await refreshAuthToken();
        console.log('[DEV] Firebase ID Token:', firebaseIdToken);
      }
      if (firstLogin) {
        navigation.navigate('CompleteProfile');
      }
    } catch (error: any) {
      const code = error?.code;
      const message = error?.message || '';
      if (code === 'auth/cancelled') {
        return;
      }
      Alert.alert('로그인 실패', message || '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }, [navigation, refreshAuthToken, signInWithGoogle]);

  const handlePressAdminLogin = React.useCallback(async () => {
    try {
      setAdminLoading(true);
      if (!adminEmail || !adminPassword) {
        Alert.alert('입력 필요', '이메일과 비밀번호를 입력해주세요.');
        return;
      }
      await signInWithEmailAndPassword(adminEmail, adminPassword);
      if (__DEV__) {
        const firebaseIdToken = await refreshAuthToken();
        console.log('[DEV] Firebase ID Token:', firebaseIdToken);
      }
      setAdminVisible(false);
    } catch (error: any) {
      Alert.alert(
        '관리자 로그인 실패',
        error?.message || getFirebaseErrorMessage(error),
      );
    } finally {
      setAdminLoading(false);
    }
  }, [
    adminEmail,
    adminPassword,
    refreshAuthToken,
    signInWithEmailAndPassword,
  ]);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <View style={styles.screen}>
        <View style={styles.heroSection}>
          <ImageBackground
            resizeMode="cover"
            source={require('../../../../assets/images/login/login_main.png')}
            style={styles.heroImage}>
            <View style={[styles.brandPill, {marginTop: insets.top + 8}]}>
              <Text style={styles.brandPillText}>SKURI</Text>
            </View>

            <LinearGradient
              colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.96)', '#FFFFFF']}
              locations={[0, 0.55, 1]}
              style={styles.heroGradient}
            />
          </ImageBackground>
        </View>

        <View style={styles.contentSection}>
          <View style={styles.brandRow}>
            <View style={styles.brandIconBox}>
              <Icon color={V2_COLORS.text.inverse} name="car-sport" size={22} />
            </View>

            <View>
              <Text style={styles.brandTitle}>SKURI</Text>
              <Text style={styles.brandSubtitle}>성결대학교 캠퍼스 라이프</Text>
            </View>
          </View>

          <View style={styles.copyBlock}>
            <Text style={styles.copyLine}>택시 동승부터 공지사항, 학사일정까지</Text>
            <Text style={styles.copyAccentLine}>성결대 학생이라면 모두 한 곳에서.</Text>
          </View>

          <View style={styles.featureChipGroup}>
            {FEATURE_CHIPS.map(chip => (
              <AuthFeatureChip key={chip} label={chip} />
            ))}
          </View>

          <View style={styles.ctaBlock}>
            <TouchableOpacity
              accessibilityHint="성결대학교 이메일로 로그인합니다"
              accessibilityLabel="성결대 이메일로 로그인하기"
              accessibilityRole="button"
              activeOpacity={0.92}
              disabled={loading}
              onPress={handlePressGoogleLogin}
              style={[
                styles.googleButton,
                loading ? styles.buttonDisabled : undefined,
              ]}>
              {loading ? (
                <ActivityIndicator color={V2_COLORS.text.inverse} size="small" />
              ) : (
                <Icon color={V2_COLORS.text.inverse} name="logo-google" size={20} />
              )}
              <Text style={styles.googleButtonText}>
                {loading ? '로그인 중...' : '성결대 이메일로 로그인하기'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.helperText}>
              성결대학교 이메일(@sungkyul.ac.kr)로만 이용 가능해요
            </Text>

            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate('AccountGuide')}
              style={styles.guideLink}>
              <Text style={styles.guideLinkText}>성결대 이메일이 없나요?</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          accessibilityHint="관리자 이메일/비밀번호 로그인 모달을 엽니다"
          accessibilityLabel="관리자 로그인"
          activeOpacity={0.85}
          onPress={() => setAdminVisible(true)}
          style={styles.adminFab}>
          <Icon
            color={V2_COLORS.text.inverse}
            name="shield-checkmark"
            size={16}
          />
          <Text style={styles.adminFabText}>관리자</Text>
        </TouchableOpacity>

        <Modal
          animationIn="zoomIn"
          animationInTiming={280}
          animationOut="zoomOut"
          animationOutTiming={280}
          avoidKeyboard
          backdropTransitionInTiming={280}
          backdropTransitionOutTiming={280}
          hardwareAccelerated
          hideModalContentWhileAnimating
          isVisible={adminVisible}
          onBackButtonPress={() =>
            !adminLoading ? setAdminVisible(false) : null
          }
          onBackdropPress={() => (!adminLoading ? setAdminVisible(false) : null)}
          useNativeDriver
          useNativeDriverForBackdrop>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>관리자 로그인</Text>

            <TextInput
              autoCapitalize="none"
              editable={!adminLoading}
              keyboardType="email-address"
              onChangeText={setAdminEmail}
              placeholder="이메일"
              placeholderTextColor={V2_COLORS.text.muted}
              style={styles.input}
              value={adminEmail}
            />

            <TextInput
              editable={!adminLoading}
              onChangeText={setAdminPassword}
              placeholder="비밀번호"
              placeholderTextColor={V2_COLORS.text.muted}
              secureTextEntry
              style={styles.input}
              value={adminPassword}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.9}
                disabled={adminLoading}
                onPress={() => (!adminLoading ? setAdminVisible(false) : null)}
                style={[styles.modalButton, styles.modalCancel]}>
                <Text style={styles.modalCancelText}>취소</Text>
              </TouchableOpacity>

              <TouchableOpacity
                accessibilityRole="button"
                activeOpacity={0.9}
                disabled={adminLoading}
                onPress={handlePressAdminLogin}
                style={[
                  styles.modalButton,
                  styles.modalConfirm,
                  adminLoading ? styles.buttonDisabled : undefined,
                ]}>
                {adminLoading ? (
                  <ActivityIndicator color={V2_COLORS.text.inverse} size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>로그인</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  adminFab: {
    alignItems: 'center',
    backgroundColor: 'rgba(16,16,16,0.88)',
    borderColor: 'rgba(16,16,16,0.88)',
    borderRadius: 16,
    borderWidth: 1,
    bottom: 16,
    flexDirection: 'row',
    gap: 6,
    height: 32,
    justifyContent: 'center',
    paddingHorizontal: 10,
    position: 'absolute',
    right: 16,
    ...V2_SHADOWS.card,
  },
  adminFabText: {
    color: V2_COLORS.text.inverse,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  brandIconBox: {
    alignItems: 'center',
    backgroundColor: '#4ADE80',
    borderRadius: 16,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    shadowColor: '#4ADE80',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
    width: 48,
  },
  brandPill: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderColor: 'rgba(255,255,255,0.72)',
    borderRadius: V2_RADIUS.pill,
    borderWidth: 1,
    height: 43,
    justifyContent: 'center',
    marginLeft: V2_SPACING.xl,
    paddingHorizontal: 17,
    ...V2_SHADOWS.card,
  },
  brandPillText: {
    color: V2_COLORS.brand.primaryStrong,
    fontSize: 16,
    fontStyle: 'italic',
    fontWeight: '700',
    letterSpacing: 0.4,
    lineHeight: 24,
  },
  brandRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  brandSubtitle: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  brandTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  container: {
    backgroundColor: V2_COLORS.background.surface,
    flex: 1,
  },
  contentSection: {
    backgroundColor: V2_COLORS.background.surface,
    flex: 1,
    paddingHorizontal: V2_SPACING.xxl,
  },
  copyAccentLine: {
    color: V2_COLORS.brand.primary,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  copyBlock: {
    marginTop: 24,
  },
  copyLine: {
    color: V2_COLORS.text.strong,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  ctaBlock: {
    marginTop: 48,
  },
  featureChipGroup: {
    columnGap: V2_SPACING.sm,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 24,
    rowGap: V2_SPACING.sm,
  },
  googleButton: {
    alignItems: 'center',
    backgroundColor: '#4ADE80',
    borderRadius: 16,
    flexDirection: 'row',
    gap: V2_SPACING.md,
    height: 56,
    justifyContent: 'center',
    shadowColor: '#4ADE80',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.24,
    shadowRadius: 14,
  },
  googleButtonText: {
    color: V2_COLORS.text.inverse,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22.5,
  },
  guideLink: {
    alignItems: 'center',
    marginTop: V2_SPACING.md,
  },
  guideLinkText: {
    color: V2_COLORS.brand.primary,
    fontSize: 14,
    lineHeight: 20,
    textDecorationLine: 'underline',
  },
  helperText: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: V2_SPACING.md,
    textAlign: 'center',
  },
  heroGradient: {
    bottom: 0,
    height: 128,
    left: 0,
    position: 'absolute',
    right: 0,
  },
  heroImage: {
    flex: 1,
  },
  heroSection: {
    height: 390,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.default,
    borderRadius: 10,
    borderWidth: 1,
    color: V2_COLORS.text.primary,
    fontSize: 14,
    height: 40,
    lineHeight: 20,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalButton: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  modalCancel: {
    backgroundColor: V2_COLORS.background.subtle,
    borderColor: V2_COLORS.border.default,
    borderWidth: 1,
  },
  modalCancelText: {
    color: V2_COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  modalCard: {
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.default,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
  },
  modalConfirm: {
    backgroundColor: V2_COLORS.brand.primary,
  },
  modalConfirmText: {
    color: V2_COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  modalTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 20,
  },
  screen: {
    flex: 1,
  },
});
