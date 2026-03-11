import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { collection, getFirestore, onSnapshot, query, where } from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  AppHeader,
  GroupedList,
  StatsCard,
  v2Colors,
  v2Radius,
  v2Spacing,
  v2Typography,
} from '../design-system';
import { useScreenView } from '../hooks/useScreenView';
import { useAuthContext } from '../contexts/AuthContext';
import { useUserProfile } from '../hooks/user/useUserProfile';
import { useUserBookmarks } from '../hooks/user/useUserBookmarks';

type MyNavigationProp = NativeStackNavigationProp<any>;

export const MyShellScreen = () => {
  useScreenView();
  const navigation = useNavigation<MyNavigationProp>();
  const insets = useSafeAreaInsets();
  const { signOut, user } = useAuthContext();
  const { bookmarks, loading: bookmarksLoading } = useUserBookmarks();
  const { profile } = useUserProfile();
  const [postCount, setPostCount] = React.useState<number | null>(null);
  const [taxiUsageCount, setTaxiUsageCount] = React.useState<number | null>(null);

  const userId = user?.uid;
  const displayName = React.useMemo(() => {
    const nextName = profile?.displayName?.trim() ?? user?.displayName?.trim();
    return nextName && nextName.length > 0 ? nextName : '이름 미설정';
  }, [profile?.displayName, user?.displayName]);

  const fallbackEmail = React.useMemo(() => {
    const nextEmail = profile?.email?.trim() ?? user?.email?.trim();
    return nextEmail && nextEmail.length > 0 ? nextEmail : null;
  }, [profile?.email, user?.email]);

  const profileSubtitle = React.useMemo(() => {
    const department = profile?.department?.trim() ?? user?.department?.trim();
    if (department) {
      return department;
    }

    return fallbackEmail ?? '프로필 정보가 준비 중입니다';
  }, [fallbackEmail, profile?.department, user?.department]);

  const avatarInitial = React.useMemo(() => {
    const source = displayName !== '이름 미설정' ? displayName : fallbackEmail;
    return source?.[0]?.toUpperCase() ?? 'M';
  }, [displayName, fallbackEmail]);

  const formatCount = React.useCallback((count: number | null) => {
    if (count === null) {
      return '-';
    }

    return new Intl.NumberFormat('ko-KR').format(count);
  }, []);

  React.useEffect(() => {
    if (!userId) {
      setPostCount(0);
      setTaxiUsageCount(0);
      return;
    }

    const db = getFirestore();
    const unsubscribePostCount = onSnapshot(
      query(
        collection(db, 'boardPosts'),
        where('isDeleted', '==', false),
        where('authorId', '==', userId),
      ),
      snapshot => {
        setPostCount(snapshot.size);
      },
      error => {
        console.error('MY 게시글 수 구독 실패:', error);
        setPostCount(0);
      },
    );

    const unsubscribeTaxiUsage = onSnapshot(
      query(collection(db, 'parties'), where('members', 'array-contains', userId)),
      snapshot => {
        setTaxiUsageCount(snapshot.size);
      },
      error => {
        console.error('MY 택시 이용 수 구독 실패:', error);
        setTaxiUsageCount(0);
      },
    );

    return () => {
      unsubscribePostCount();
      unsubscribeTaxiUsage();
    };
  }, [userId]);

  const handleComingSoonPress = React.useCallback((label: string) => {
    Alert.alert(label, '상세 화면은 다음 phase 범위에서 구현합니다.');
  }, []);

  const activityItems = React.useMemo(
    () => [
      {
        key: 'my-posts',
        accessibilityLabel: '내가 쓴 글. 상세 화면은 다음 단계에서 구현합니다.',
        label: '내가 쓴 글',
        icon: <Icon color={v2Colors.accent.blue.base} name="document-text-outline" size={18} />,
        onPress: () => handleComingSoonPress('내가 쓴 글'),
      },
      {
        key: 'bookmarks',
        accessibilityLabel: '북마크. 상세 화면은 다음 단계에서 구현합니다.',
        label: '북마크',
        icon: <Icon color={v2Colors.accent.green.base} name="bookmark-outline" size={18} />,
        onPress: () => handleComingSoonPress('북마크'),
      },
      {
        key: 'taxi-history',
        accessibilityLabel: '택시 이용 내역. 상세 화면은 다음 단계에서 구현합니다.',
        label: '택시 이용 내역',
        icon: (
          <MaterialCommunityIcons
            color={v2Colors.accent.orange.base}
            name="taxi"
            size={18}
          />
        ),
        onPress: () => handleComingSoonPress('택시 이용 내역'),
      },
    ],
    [handleComingSoonPress],
  );

  const settingItems = React.useMemo(
    () => [
      {
        key: 'notifications',
        accessibilityLabel: '알림 설정으로 이동',
        label: '알림 설정',
        icon: <Icon color={v2Colors.accent.purple.base} name="notifications-outline" size={18} />,
        onPress: () => navigation.navigate('NotificationSetting'),
      },
      {
        key: 'account',
        accessibilityLabel: profile?.accountInfo ? '계좌 관리로 이동. 계좌 정보가 등록되어 있습니다.' : '계좌 관리로 이동',
        label: '계좌 관리',
        icon: <Icon color={v2Colors.accent.blue.base} name="card-outline" size={18} />,
        onPress: () => navigation.navigate('AccountModification'),
      },
      {
        key: 'app-settings',
        accessibilityLabel: '앱 설정으로 이동',
        label: '앱 설정',
        icon: <Icon color={v2Colors.text.secondary} name="settings-outline" size={18} />,
        onPress: () => navigation.navigate('Setting'),
      },
    ],
    [navigation, profile?.accountInfo],
  );

  const handleSignOut = React.useCallback(() => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: () => {
          signOut().catch(() => undefined);
        },
      },
    ]);
  }, [signOut]);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.container}>
      <AppHeader
        leftAction={{
          accessibilityLabel: '뒤로가기',
          icon: <Icon color={v2Colors.text.primary} name="chevron-back" size={20} />,
          onPress: () => navigation.goBack(),
        }}
        title="MY"
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(v2Spacing[6], insets.bottom + v2Spacing[4]) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.identitySection}>
          <LinearGradient
            colors={[v2Colors.accent.green.border, v2Colors.accent.green.base]}
            end={{ x: 1, y: 1 }}
            start={{ x: 0, y: 0 }}
            style={styles.avatar}
          >
            <Text style={styles.avatarInitial}>{avatarInitial}</Text>
          </LinearGradient>

          <View style={styles.identityCopy}>
            <Text style={styles.identityName}>{displayName}</Text>
            <Text style={styles.identitySubtitle}>{profileSubtitle}</Text>
            <Pressable
              accessibilityLabel="프로필 수정"
              accessibilityRole="button"
              onPress={() => navigation.navigate('ProfileEdit')}
              style={({ pressed }) => [styles.editButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.editButtonLabel}>프로필 수정</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.statsRow}>
          <StatsCard label="작성한 글" style={styles.statCard} value={formatCount(postCount)} />
          <StatsCard
            label="북마크"
            style={styles.statCard}
            value={bookmarksLoading ? '-' : formatCount(bookmarks.length)}
          />
          <StatsCard label="택시 이용" style={styles.statCard} value={formatCount(taxiUsageCount)} />
        </View>

        <View style={styles.groupSection}>
          <Text style={styles.groupTitle}>내 활동</Text>
          <GroupedList items={activityItems} />
        </View>

        <View style={styles.groupSection}>
          <Text style={styles.groupTitle}>설정</Text>
          <GroupedList items={settingItems} />
        </View>

        <Pressable
          accessibilityLabel="로그아웃"
          accessibilityRole="button"
          onPress={handleSignOut}
          style={({ pressed }) => [styles.logoutButton, pressed && styles.buttonPressed]}
        >
          <Text style={styles.logoutLabel}>로그아웃</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    borderRadius: v2Radius.full,
    height: 80,
    justifyContent: 'center',
    width: 80,
  },
  avatarInitial: {
    ...v2Typography.stat.large,
    color: v2Colors.text.inverse,
  },
  buttonPressed: {
    opacity: 0.72,
  },
  container: {
    backgroundColor: v2Colors.bg.app,
    flex: 1,
  },
  editButton: {
    alignItems: 'center',
    backgroundColor: v2Colors.accent.green.surface,
    borderRadius: v2Radius.md,
    height: 28,
    justifyContent: 'center',
    marginTop: v2Spacing[2],
    paddingHorizontal: 12,
  },
  editButtonLabel: {
    ...v2Typography.meta.medium,
    color: v2Colors.accent.green.strong,
  },
  groupSection: {
    marginTop: v2Spacing[6],
  },
  groupTitle: {
    ...v2Typography.body.medium,
    color: v2Colors.text.primary,
    fontWeight: '700',
    marginBottom: v2Spacing[3],
    paddingHorizontal: 4,
  },
  identityCopy: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 88,
  },
  identityName: {
    ...v2Typography.title.profile,
    color: v2Colors.text.primary,
  },
  identitySection: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: v2Spacing[4],
    minHeight: 88,
  },
  identitySubtitle: {
    ...v2Typography.body.default,
    color: v2Colors.text.secondary,
    marginTop: 4,
  },
  logoutButton: {
    alignItems: 'center',
    backgroundColor: v2Colors.bg.surface,
    borderColor: v2Colors.border.subtle,
    borderRadius: v2Radius.xl,
    borderWidth: 1,
    justifyContent: 'center',
    marginTop: v2Spacing[6],
    minHeight: 53,
  },
  logoutLabel: {
    ...v2Typography.body.medium,
    color: v2Colors.status.destructive.text,
  },
  scrollContent: {
    paddingBottom: v2Spacing[6],
    paddingHorizontal: v2Spacing[4],
    paddingTop: v2Spacing[6],
  },
  statCard: {
    flex: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: v2Spacing[3],
    marginTop: v2Spacing[6],
  },
});
