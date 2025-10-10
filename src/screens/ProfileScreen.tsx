import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
//import { Text } from '../components/common/Text';
import { COLORS } from '../constants/colors';
import { useAuthContext } from '../contexts/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';

export const ProfileScreen = () => {
  const { user, signOut } = useAuthContext();

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
          onPress: signOut,
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.displayName?.[0] || user?.email?.[0] || '?'}
          </Text>
        </View>
        <Text style={styles.name}>{user?.displayName || '이름 없음'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>내 정보 수정</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>알림 설정</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>이용약관</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>개인정보처리방침</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>로그아웃</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.accent.green,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 32,
    color: COLORS.text.buttonText,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
  menuSection: {
    padding: 16,
  },
  menuItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  menuText: {
    fontSize: 16,
    color: COLORS.text.primary,
  },
  signOutButton: {
    margin: 16,
    padding: 16,
    backgroundColor: COLORS.accent.green,
    borderRadius: 8,
    alignItems: 'center',
  },
  signOutText: {
    color: COLORS.text.buttonText,
    fontSize: 16,
    fontWeight: '600',
  },
}); 