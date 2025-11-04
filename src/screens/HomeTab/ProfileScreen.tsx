import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Animated } from 'react-native';
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

export const ProfileScreen = () => {
  useScreenView();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user, signOut, loading } = useAuthContext();
  const fadeOverlay = React.useRef(new Animated.Value(0)).current;
  
  const handleEditProfile = () => {
    navigation.navigate('ProfileEdit');
  };

  const handleAccount = () => {
    navigation.navigate('AccountModification');
  };

  const handleWithdraw = () => {
    Alert.alert(
      '회원탈퇴',
      '정말 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없습니다.',
      [
        { text: '취소', style: 'cancel' },
        { text: '탈퇴', style: 'destructive', onPress: () => Alert.alert('탈퇴 처리', '추후 구현 예정입니다.') },
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

      <Button title="로그아웃" onPress={handleSignOut} style={styles.signOutButton} />
      <View style={styles.footerLine}>
        <TouchableOpacity onPress={handleWithdraw}>
          <Text style={styles.withdrawText}>회원탈퇴</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
      {/* 페이드 오버레이: 항상 렌더, opacity로 시각 제어 */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFillObject, { backgroundColor: COLORS.background.primary, opacity: fadeOverlay }]} />
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
}); 