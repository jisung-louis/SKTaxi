import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { COLORS } from '../../constants/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import PageHeader from '../../components/common/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { useScreenView } from '../../hooks/useScreenView';
import { getCurrentAppVersion } from '../../lib/versionCheck';
import crashlytics from '@react-native-firebase/crashlytics';

export const SettingScreen = () => {
  useScreenView();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [appVersion, setAppVersion] = useState<string>('0.1.0');

  useEffect(() => {
    const version = getCurrentAppVersion();
    setAppVersion(version);
  }, []);

  const handleNotice = () => {
    navigation.navigate('AppNotice');
  };

  const handleNotification = () => {
    navigation.navigate('NotificationSetting');
  };

  const handleInquiry = (type?: string) => {
    navigation.navigate('Inquiries', { type });
  };

  const handleTerms = () => {
    navigation.navigate('TermsOfUse');
  };

  const handlePrivacy = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleAppVersion = () => {
    Alert.alert('앱 버전', `SKURI Taxi v${appVersion}`);
  };

  const handleAbout = () => {
    Linking.openURL('https://www.skuri.kr').catch((err) => {
      console.error('웹사이트 열기 실패:', err);
      Alert.alert('오류', '웹사이트를 열 수 없습니다.');
    });
  };

  const handleCrashTest = () => {
    Alert.alert(
      'Crashlytics 테스트',
      '강제 크래시를 발생시켜 Crashlytics 업로드를 확인할까요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '강제 크래시',
          style: 'destructive',
          onPress: async () => {
            await crashlytics().log('Manual crash test triggered on SettingScreen');
            crashlytics().crash();
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <PageHeader onBack={() => navigation.goBack()} title="설정" borderBottom />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        {/* 공지 및 알림 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>공지 및 알림</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.menuItem} onPress={handleNotice}>
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Icon name="megaphone" size={20} color={COLORS.accent.blue} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuText}>앱 공지사항</Text>
                  <Text style={styles.menuSubtext}>새로운 소식과 업데이트를 확인하세요</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={18} color={COLORS.text.secondary} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.menuItem} onPress={handleNotification}>
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Icon name="notifications" size={20} color={COLORS.accent.green} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuText}>알림 설정</Text>
                  <Text style={styles.menuSubtext}>푸시 알림을 관리하세요</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={18} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 지원 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>지원</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.menuItem} onPress={() => handleInquiry('feature')}>
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Icon name="bulb" size={20} color={COLORS.accent.orange} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuText}>앱 기능 아이디어 제안</Text>
                  <Text style={styles.menuSubtext}>SKURI에 추가됐으면 하는 기능을 제안해주세요</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={18} color={COLORS.text.secondary} />
            </TouchableOpacity>

            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.menuItem} onPress={() => handleInquiry('bug')}>
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Icon name="bug" size={20} color={COLORS.accent.red} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuText}>버그 신고</Text>
                  <Text style={styles.menuSubtext}>발견하셨다면 커피쿠폰 쏴 드릴 수도.. ㅎㅎ</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={18} color={COLORS.text.secondary} />
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.menuItem} onPress={() => handleInquiry()}>
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Icon name="chatbubble" size={20} color={COLORS.accent.blue} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuText}>기타 문의</Text>
                  <Text style={styles.menuSubtext}>계정 관련, 서비스 관련 문의사항을 보내주세요</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={18} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 법적 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>법적 정보</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.menuItem} onPress={handleTerms}>
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Icon name="document-text" size={20} color={COLORS.text.secondary} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuText}>이용약관</Text>
                  <Text style={styles.menuSubtext}>서비스 이용약관을 확인하세요</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={18} color={COLORS.text.secondary} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.menuItem} onPress={handlePrivacy}>
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Icon name="shield-checkmark" size={20} color={COLORS.text.secondary} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuText}>개인정보 처리방침</Text>
                  <Text style={styles.menuSubtext}>개인정보 보호정책을 확인하세요</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={18} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 앱 정보 섹션 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>앱 정보</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.menuItem} onPress={handleAppVersion}>
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Icon name="information-circle" size={20} color={COLORS.text.secondary} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuText}>앱 버전</Text>
                  <Text style={styles.menuSubtext}>현재 버전: v{appVersion}</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={18} color={COLORS.text.secondary} />
            </TouchableOpacity>
            
            <View style={styles.divider} />
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleAbout}
              onLongPress={handleCrashTest}
              delayLongPress={600}
            >
              <View style={styles.menuLeft}>
                <View style={styles.iconContainer}>
                  <Icon name="apps" size={20} color={COLORS.text.secondary} />
                </View>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuText}>앱 정보</Text>
                  <Text style={styles.menuSubtext}>SKURI Taxi에 대해 알아보세요</Text>
                </View>
              </View>
              <Icon name="chevron-forward" size={18} color={COLORS.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title4,
    color: COLORS.text.primary,
    fontWeight: '700',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
    gap: 4,
  },
  menuText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  menuSubtext: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginLeft: 56,
  },
  bottomSpacer: {
    height: 40,
  },
});