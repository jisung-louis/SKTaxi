import React from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import Modal from 'react-native-modal';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {type CampusStackParamList} from '@/app/navigation/types';
import {useAuth, useAuthLoginProvider} from '@/features/auth';
import {StateCard} from '@/shared/design-system/components';
import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks/useScreenView';

import {MyPageMenuSection} from '../components/MyPageMenuSection';
import {MyPageStatCard} from '../components/MyPageStatCard';
import {useMyPageData} from '../hooks/useMyPageData';
import type {MyPageMenuItemViewData} from '../model/myPageViewData';
import {withdrawCurrentUser} from '../services/userProfileService';

export const MyScreen = () => {
  useScreenView();

  const navigation = useNavigation<NativeStackNavigationProp<CampusStackParamList>>();
  const insets = useSafeAreaInsets();
  const {loading: authLoading, signOut, user} = useAuth();
  const loginProvider = useAuthLoginProvider();
  const {data, error, loading, reload} = useMyPageData();

  const [password, setPassword] = React.useState('');
  const [passwordModalVisible, setPasswordModalVisible] = React.useState(false);
  const [withdrawing, setWithdrawing] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);

  const openAction = React.useCallback(
    (actionKey: MyPageMenuItemViewData['actionKey']) => {
      switch (actionKey) {
        case 'profileEdit':
          navigation.navigate('ProfileEdit');
          return;
        case 'myPosts':
          navigation.navigate('MyPosts');
          return;
        case 'bookmarks':
          navigation.navigate('Bookmarks');
          return;
        case 'taxiHistory':
          navigation.navigate('TaxiHistory');
          return;
        case 'notificationSettings':
          navigation.navigate('NotificationSettings');
          return;
        case 'accountManagement':
          navigation.navigate('AccountModification');
          return;
        case 'inquiries':
          navigation.navigate('Inquiries', {type: 'service'});
          return;
        case 'appSettings':
          navigation.navigate('Setting');
          return;
        default:
          Alert.alert('구현 예정', '추후 구현 예정입니다.');
      }
    },
    [navigation],
  );

  const handlePressMenuItem = React.useCallback(
    (item: MyPageMenuItemViewData) => {
      openAction(item.actionKey);
    },
    [openAction],
  );

  const handleConfirmWithdraw = React.useCallback(
    async (confirmPassword?: string) => {
      if (!user?.uid) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      try {
        setWithdrawing(true);

        await withdrawCurrentUser({
          password: confirmPassword,
          userId: user.uid,
        });

        try {
          await signOut();
        } catch {
          // 계정 삭제 후 signOut 실패는 무시
        }
      } catch (caughtError: any) {
        const message =
          caughtError?.message ||
          '회원탈퇴 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
        Alert.alert('오류', message);
      } finally {
        setWithdrawing(false);
        setPasswordModalVisible(false);
        setPassword('');
      }
    },
    [signOut, user?.uid],
  );

  const handleWithdraw = React.useCallback(() => {
    if (loginProvider === 'email') {
      setPasswordModalVisible(true);
      return;
    }

    Alert.alert(
      '회원탈퇴',
      '정말 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
      [
        {text: '취소', style: 'cancel'},
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: () => {
            handleConfirmWithdraw().catch(() => undefined);
          },
        },
      ],
    );
  }, [handleConfirmWithdraw, loginProvider]);

  const handleConfirmPasswordModal = React.useCallback(() => {
    if (!password.trim()) {
      Alert.alert('입력 필요', '비밀번호를 입력해주세요.');
      return;
    }

    setPasswordModalVisible(false);
    Alert.alert(
      '회원탈퇴',
      '정말 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
      [
        {
          text: '취소',
          style: 'cancel',
          onPress: () => setPasswordModalVisible(true),
        },
        {
          text: '탈퇴하기',
          style: 'destructive',
          onPress: () => {
            handleConfirmWithdraw(password).catch(() => undefined);
          },
        },
      ],
    );
  }, [handleConfirmWithdraw, password]);

  const handleSignOut = React.useCallback(() => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      {text: '취소', style: 'cancel'},
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          try {
            setSigningOut(true);
            await signOut();
          } catch {
            Alert.alert(
              '오류',
              '로그아웃에 실패했습니다. 잠시 후 다시 시도해주세요.',
            );
          } finally {
            setSigningOut(false);
          }
        },
      },
    ]);
  }, [signOut]);

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {paddingBottom: insets.bottom + 28, paddingTop: insets.top + 16},
          ]}
          showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            accessibilityLabel="뒤로 가기"
            accessibilityRole="button"
            activeOpacity={0.82}
            onPress={() => navigation.goBack()}
            style={styles.backButton}>
            <Icon color={V2_COLORS.text.primary} name="arrow-back" size={22} />
          </TouchableOpacity>

          {loading && !data ? (
            <StateCard
              description="마이페이지를 준비하고 있습니다."
              icon={<ActivityIndicator color={V2_COLORS.brand.primary} />}
              style={styles.stateCard}
              title="마이페이지를 불러오는 중"
            />
          ) : null}

          {error && !data ? (
            <StateCard
              actionLabel="다시 시도"
              description={error}
              icon={
                <Icon
                  color={V2_COLORS.accent.orange}
                  name="alert-circle-outline"
                  size={28}
                />
              }
              onPressAction={() => {
                reload().catch(() => undefined);
              }}
              style={styles.stateCard}
              title="마이페이지를 불러오지 못했습니다"
            />
          ) : null}

          {data ? (
            <>
              <View style={styles.profileSection}>
                <LinearGradient
                  colors={['#4ADE80', '#22C55E']}
                  end={{x: 1, y: 1}}
                  start={{x: 0, y: 0}}
                  style={styles.avatar}>
                  <Text style={styles.avatarLabel}>{data.profile.avatarLabel}</Text>
                </LinearGradient>

                <View style={styles.profileBody}>
                  <Text style={styles.displayName}>{data.profile.displayName}</Text>
                  <Text style={styles.subtitle}>{data.profile.subtitle}</Text>

                  <TouchableOpacity
                    accessibilityRole="button"
                    activeOpacity={0.82}
                    onPress={() => navigation.navigate('ProfileEdit')}
                    style={styles.editButton}>
                    <Text style={styles.editButtonLabel}>
                      {data.profile.editLabel}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.statsRow}>
                {data.stats.map(item => (
                  <MyPageStatCard
                    key={item.id}
                    item={item}
                    onPress={stat => openAction(stat.actionKey)}
                  />
                ))}
              </View>

              {data.sections.map(section => (
                <MyPageMenuSection
                  key={section.id}
                  onPressItem={handlePressMenuItem}
                  section={section}
                />
              ))}

              <View style={styles.logoutSection}>
                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.82}
                  disabled={authLoading || signingOut || withdrawing}
                  onPress={handleSignOut}
                  style={[
                    styles.logoutButton,
                    authLoading || signingOut || withdrawing
                      ? styles.disabledButton
                      : undefined,
                  ]}>
                  {signingOut ? (
                    <ActivityIndicator color={V2_COLORS.status.danger} />
                  ) : (
                    <Text style={styles.logoutLabel}>로그아웃</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  accessibilityRole="button"
                  activeOpacity={0.78}
                  disabled={authLoading || signingOut || withdrawing}
                  onPress={handleWithdraw}
                  style={styles.withdrawButton}>
                  {withdrawing ? (
                    <View style={styles.withdrawLoadingRow}>
                      <ActivityIndicator
                        color={V2_COLORS.status.danger}
                        size="small"
                      />
                      <Text style={styles.withdrawLabel}>처리 중...</Text>
                    </View>
                  ) : (
                    <Text style={styles.withdrawLabel}>회원탈퇴</Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          ) : null}
        </ScrollView>
      </View>

      <Modal
        animationIn="zoomIn"
        animationOut="zoomOut"
        backdropTransitionInTiming={220}
        backdropTransitionOutTiming={220}
        hideModalContentWhileAnimating
        isVisible={passwordModalVisible}
        onBackButtonPress={() =>
          !withdrawing ? setPasswordModalVisible(false) : null
        }
        onBackdropPress={() =>
          !withdrawing ? setPasswordModalVisible(false) : null
        }
        useNativeDriver
        useNativeDriverForBackdrop>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>재인증 필요</Text>
          <Text style={styles.modalDescription}>
            회원탈퇴를 위해 비밀번호를 입력해주세요.
          </Text>

          <TextInput
            autoFocus
            editable={!withdrawing}
            onChangeText={setPassword}
            placeholder="비밀번호"
            placeholderTextColor={V2_COLORS.text.muted}
            secureTextEntry
            style={styles.passwordInput}
            value={password}
          />

          <View style={styles.modalButtonRow}>
            <TouchableOpacity
              activeOpacity={0.82}
              disabled={withdrawing}
              onPress={() => setPasswordModalVisible(false)}
              style={styles.modalCancelButton}>
              <Text style={styles.modalCancelLabel}>취소</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.82}
              disabled={withdrawing}
              onPress={handleConfirmPasswordModal}
              style={[
                styles.modalConfirmButton,
                withdrawing ? styles.disabledButton : undefined,
              ]}>
              {withdrawing ? (
                <ActivityIndicator color={V2_COLORS.text.inverse} size="small" />
              ) : (
                <Text style={styles.modalConfirmLabel}>확인</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  container: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  content: {
    paddingHorizontal: V2_SPACING.lg,
  },
  backButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    marginBottom: V2_SPACING.lg,
    width: 36,
  },
  stateCard: {
    marginTop: V2_SPACING.xs,
  },
  profileSection: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: V2_SPACING.lg,
    marginBottom: V2_SPACING.xxl,
  },
  avatar: {
    alignItems: 'center',
    borderRadius: V2_RADIUS.pill,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  avatarLabel: {
    color: V2_COLORS.text.inverse,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  profileBody: {
    flex: 1,
  },
  displayName: {
    color: V2_COLORS.text.primary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 4,
  },
  subtitle: {
    color: V2_COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: V2_SPACING.sm,
  },
  editButton: {
    alignSelf: 'flex-start',
    backgroundColor: V2_COLORS.brand.primaryTint,
    borderRadius: V2_RADIUS.sm,
    paddingHorizontal: V2_SPACING.md,
    paddingVertical: 6,
  },
  editButtonLabel: {
    color: V2_COLORS.brand.primaryStrong,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  statsRow: {
    flexDirection: 'row',
    gap: V2_SPACING.md,
    marginBottom: V2_SPACING.xxl,
  },
  logoutSection: {
    marginTop: V2_SPACING.sm,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.lg,
    height: 53,
    justifyContent: 'center',
    ...V2_SHADOWS.card,
  },
  logoutLabel: {
    color: V2_COLORS.status.danger,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
  withdrawButton: {
    alignSelf: 'flex-end',
    marginTop: V2_SPACING.sm,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  withdrawLabel: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    textDecorationLine: 'underline',
  },
  withdrawLoadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
  modalCard: {
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: V2_RADIUS.lg,
    padding: V2_SPACING.xl,
  },
  modalTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: V2_SPACING.xs,
  },
  modalDescription: {
    color: V2_COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: V2_SPACING.lg,
  },
  passwordInput: {
    backgroundColor: V2_COLORS.background.subtle,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.md,
    borderWidth: 1,
    color: V2_COLORS.text.primary,
    fontSize: 14,
    height: 48,
    lineHeight: 20,
    paddingHorizontal: V2_SPACING.md,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: V2_SPACING.sm,
    justifyContent: 'flex-end',
    marginTop: V2_SPACING.lg,
  },
  modalCancelButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.subtle,
    borderRadius: V2_RADIUS.md,
    height: 40,
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: V2_SPACING.md,
  },
  modalCancelLabel: {
    color: V2_COLORS.text.secondary,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  modalConfirmButton: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.brand.primary,
    borderRadius: V2_RADIUS.md,
    height: 40,
    justifyContent: 'center',
    minWidth: 72,
    paddingHorizontal: V2_SPACING.md,
  },
  modalConfirmLabel: {
    color: V2_COLORS.text.inverse,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
});
