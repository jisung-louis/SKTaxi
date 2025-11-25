import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Animated, ActivityIndicator, TextInput } from 'react-native';
import { COLORS } from '../../constants/colors';
import { useAuthContext } from '../../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../../components/common/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import Button from '../../components/common/Button';
import { useScreenView } from '../../hooks/useScreenView';
import { withdrawUser } from '../../utils/withdrawUtils';
import auth from '@react-native-firebase/auth';
import Modal from 'react-native-modal';

export const ProfileScreen = () => {
  useScreenView();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user, signOut, loading } = useAuthContext();
  const fadeOverlay = React.useRef(new Animated.Value(0)).current;
  const [withdrawing, setWithdrawing] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  
  const handleEditProfile = () => {
    navigation.navigate('ProfileEdit');
  };

  const handleAccount = () => {
    navigation.navigate('AccountModification');
  };

  /**
   * 사용자의 로그인 방식 확인
   */
  const getUserLoginProvider = (): 'google' | 'email' | 'unknown' => {
    const currentUser = auth().currentUser;
    if (!currentUser) return 'unknown';
    
    const providerData = currentUser.providerData;
    const hasGoogleProvider = providerData.some(provider => provider.providerId === 'google.com');
    const hasEmailProvider = providerData.some(provider => provider.providerId === 'password');
    
    if (hasGoogleProvider) return 'google';
    if (hasEmailProvider) return 'email';
    return 'unknown';
  };

  const handleWithdraw = () => {
    const loginProvider = getUserLoginProvider();
    
    // 이메일/비밀번호 로그인인 경우 비밀번호 입력 모달 표시
    if (loginProvider === 'email') {
      setPasswordModalVisible(true);
      return;
    }
    
    // Google 로그인인 경우 바로 확인 다이얼로그 표시
    Alert.alert(
      '회원탈퇴',
      '정말 탈퇴하시겠습니까?\n\n탈퇴 시 다음 정보가 삭제됩니다:\n• 프로필 정보\n• 작성한 게시글 및 댓글 (익명화 처리)\n• 택시 파티 참여 내역\n• 즐겨찾기 및 개인 설정\n\n이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: handleConfirmWithdraw,
        },
      ]
    );
  };

  const handleConfirmWithdraw = async (password?: string) => {
    if (!user?.uid) {
      Alert.alert('오류', '로그인이 필요합니다.');
      return;
    }

    try {
      setWithdrawing(true);
      
      // 화면을 부드럽게 덮는 페이드 인
      await new Promise<void>((resolve) => {
        Animated.timing(fadeOverlay, { toValue: 1, duration: 220, useNativeDriver: true }).start(() => resolve());
      });

      // 회원탈퇴 처리 (비밀번호가 있으면 전달)
      await withdrawUser(user.uid, password);
      
      // 탈퇴 성공 시 자동으로 로그아웃 처리됨 (Auth 계정 삭제로 인해)
      // 추가 로그아웃 호출은 불필요하지만, 안전을 위해 시도
      try {
        await signOut();
      } catch (e) {
        // 이미 계정이 삭제되어 signOut이 실패할 수 있음 (무시)
      }
    } catch (error: any) {
      // 실패 시 페이드 되돌림
      Animated.timing(fadeOverlay, { toValue: 0, duration: 180, useNativeDriver: true }).start();
      
      const errorMessage = error?.message || '회원탈퇴 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.';
      Alert.alert('오류', errorMessage);
      console.error('회원탈퇴 실패:', error);
    } finally {
      setWithdrawing(false);
      setPasswordModalVisible(false);
      setPassword('');
    }
  };

  const handlePasswordModalConfirm = () => {
    if (!password) {
      Alert.alert('입력 필요', '비밀번호를 입력해주세요.');
      return;
    }
    
    // 비밀번호 모달 닫고 확인 다이얼로그 표시
    setPasswordModalVisible(false);
    Alert.alert(
      '회원탈퇴',
      '정말 탈퇴하시겠습니까?\n\n탈퇴 시 다음 정보가 삭제됩니다:\n• 프로필 정보\n• 작성한 게시글 및 댓글 (익명화 처리)\n• 택시 파티 참여 내역\n• 즐겨찾기 및 개인 설정\n\n이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel', onPress: () => setPassword('') },
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: () => handleConfirmWithdraw(password),
        },
      ]
    );
  };

  const handleConfirmSignOut = async () => {
    // 화면을 부드럽게 덮는 페이드 인 후 로그아웃 실행
    await new Promise<void>((resolve) => {
      Animated.timing(fadeOverlay, { toValue: 1, duration: 220, useNativeDriver: true }).start(() => resolve());
    });
    try {
      await signOut();
    } catch (e) {
      // 실패 시 페이드 되돌림
      Animated.timing(fadeOverlay, { toValue: 0, duration: 180, useNativeDriver: true }).start();
      Alert.alert('오류', '로그아웃에 실패했어요. 잠시 후 다시 시도해주세요.');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠습니까?',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: handleConfirmSignOut,
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <PageHeader onBack={() => navigation.goBack()} title="내 프로필" borderBottom />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
      <View style={styles.profileSection}>
        <View style={styles.profileRow}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.displayName?.[0] || user?.email?.[0] || '?'}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{loading ? '불러오는 중...' : (user?.displayName || '이름 없음')}</Text>
            <Text style={styles.subText}>{user?.email || '이메일 정보 없음'}</Text>
            <View style={styles.subTextContainer}>
              <Text style={styles.subText}>{user?.department || '학과 정보 없음'}</Text>
              <Text style={styles.subText}>•</Text>
              <Text style={styles.subText}>{user?.studentId || '학번 정보 없음'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editBtn} onPress={handleEditProfile}>
            <Icon name="create-outline" size={18} color={COLORS.accent.green} />
            <Text style={styles.editBtnText}>편집</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={handleAccount}>
          <View style={styles.menuLeft}>
            <Icon name="card-outline" size={18} color={COLORS.text.primary} />
            <Text style={styles.menuText}>계좌번호 등록 / 수정</Text>
          </View>
          <Icon name="chevron-forward" size={18} color={COLORS.text.secondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Setting')}>
          <View style={styles.menuLeft}>
            <Icon name="settings-outline" size={18} color={COLORS.text.primary} />
            <Text style={styles.menuText}>설정</Text>
          </View>
          <Icon name="chevron-forward" size={18} color={COLORS.text.secondary} />
        </TouchableOpacity>
      </View>

      <Button 
        title="로그아웃" 
        onPress={handleSignOut} 
        style={styles.signOutButton}
        disabled={withdrawing || loading}
      />
      <View style={styles.footerLine}>
        <TouchableOpacity 
          onPress={handleWithdraw}
          disabled={withdrawing || loading}
          style={withdrawing && { opacity: 0.6 }}
        >
          {withdrawing ? (
            <View style={styles.withdrawLoadingContainer}>
              <ActivityIndicator size="small" color={COLORS.text.secondary} style={{ marginRight: 8 }} />
              <Text style={styles.withdrawText}>탈퇴 처리 중...</Text>
            </View>
          ) : (
            <Text style={styles.withdrawText}>회원탈퇴</Text>
          )}
        </TouchableOpacity>
      </View>
      </ScrollView>
      {/* 페이드 오버레이: 항상 렌더, opacity로 시각 제어 */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: COLORS.background.primary, opacity: fadeOverlay }]} />
      
      {/* 비밀번호 입력 모달 (이메일/비밀번호 로그인 사용자용) */}
      <Modal
        isVisible={passwordModalVisible}
        onBackdropPress={() => (!passwordLoading ? setPasswordModalVisible(false) : null)}
        onBackButtonPress={() => (!passwordLoading ? setPasswordModalVisible(false) : null)}
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
          <Text style={styles.modalTitle}>재인증 필요</Text>
          <Text style={styles.modalDescription}>
            회원탈퇴를 위해 비밀번호를 입력해주세요.
          </Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="비밀번호"
            secureTextEntry
            placeholderTextColor={COLORS.text.disabled}
            style={styles.input}
            editable={!passwordLoading}
            autoFocus
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalCancel]}
              onPress={() => (!passwordLoading ? setPasswordModalVisible(false) : null)}
              disabled={passwordLoading}
            >
              <Text style={styles.modalCancelText}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalConfirm, passwordLoading && styles.loginButtonDisabled]}
              onPress={handlePasswordModalConfirm}
              disabled={passwordLoading}
            >
              {passwordLoading ? (
                <ActivityIndicator size="small" color={COLORS.text.buttonText} />
              ) : (
                <Text style={styles.modalConfirmText}>확인</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  contentContainer: {
  },
  profileSection: {
    marginHorizontal: 20,
    paddingVertical: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.light,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarContainer: {
    width: 70,
    height: 70,
    borderRadius: 40,
    backgroundColor: COLORS.accent.green,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    color: COLORS.text.buttonText,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  subTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  subText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.accent.green,
    backgroundColor: COLORS.background.card,
  },
  editBtnText: {
    color: COLORS.accent.green,
    fontWeight: '600',
  },
  menuSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuText: {
    ...TYPOGRAPHY.body1,
    fontWeight: '500',
    color: COLORS.text.primary,
  },
  signOutButton: {
    margin: 16,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  footerLine: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  withdrawText: {
    color: COLORS.text.secondary,
    ...TYPOGRAPHY.body2,
    textDecorationLine: 'underline',
  },
  withdrawLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 8,
  },
  modalDescription: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
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