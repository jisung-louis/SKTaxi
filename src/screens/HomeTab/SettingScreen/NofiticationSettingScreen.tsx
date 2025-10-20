import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, ScrollView, View, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import PageHeader from '../../../components/common/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../hooks/useAuth';
import { getFirestore, doc, getDoc, setDoc } from '@react-native-firebase/firestore';

interface NotificationSettings {
  allNotifications: boolean;
  partyNotifications: boolean;
  noticeNotifications: boolean;
  systemNotifications: boolean;
  marketingNotifications: boolean;
}

export const NofiticationSettingScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuth();
  const [settings, setSettings] = useState<NotificationSettings>({
    allNotifications: true,
    partyNotifications: true,
    noticeNotifications: true,
    systemNotifications: true,
    marketingNotifications: false,
  });
  const [loading, setLoading] = useState(true);

  // 알림 설정 로드
  useEffect(() => {
    const loadNotificationSettings = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const notificationSettings = userData?.notificationSettings;
          
          if (notificationSettings) {
            setSettings(prev => ({ ...prev, ...notificationSettings }));
          }
        }
      } catch (error) {
        console.error('알림 설정 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNotificationSettings();
  }, [user?.uid]);

  // 알림 설정 저장
  const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
    if (!user?.uid) return;

    const newSettings = { ...settings, [key]: value };
    
    // allNotifications가 false가 되면 모든 알림을 끔
    if (key === 'allNotifications' && !value) {
      newSettings.partyNotifications = false;
      newSettings.noticeNotifications = false;
      newSettings.systemNotifications = false;
      newSettings.marketingNotifications = false;
    }
    
    // allNotifications가 true가 되면 모든 알림을 켜짐
    if (key === 'allNotifications' && value) {
      newSettings.partyNotifications = true;
      newSettings.noticeNotifications = true;
      newSettings.systemNotifications = true;
      newSettings.marketingNotifications = true;
    }
    
    // 개별 알림 변경 시에는 allNotifications를 자동으로 조정하지 않음
    // 사용자가 직접 allNotifications를 조작할 때만 다른 알림들을 제어

    setSettings(newSettings);

    try {
      const db = getFirestore();
      await setDoc(doc(db, 'users', user.uid), {
        notificationSettings: newSettings
      }, { merge: true });
    } catch (error) {
      console.error('알림 설정 저장 실패:', error);
      // 실패 시 원래 상태로 복구
      setSettings(settings);
    }
  };

  const SettingItem = ({ 
    title, 
    description, 
    icon, 
    value, 
    onValueChange, 
    disabled = false 
  }: {
    title: string;
    description: string;
    icon: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <View style={[styles.settingItem, disabled && styles.settingItemDisabled]}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={20} color={disabled ? COLORS.text.disabled : COLORS.accent.green} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, disabled && styles.disabledText]}>{title}</Text>
          <Text style={[styles.settingDescription, disabled && styles.disabledText]}>{description}</Text>
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: COLORS.border.default, true: COLORS.accent.green + '40' }}
        thumbColor={value ? COLORS.accent.green : COLORS.text.disabled}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader onBack={() => navigation.goBack()} title="알림 설정" borderBottom />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>설정을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader onBack={() => navigation.goBack()} title="알림 설정" borderBottom />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        
        {/* 전체 알림 설정 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>전체 알림</Text>
          <SettingItem
            title="모든 알림"
            description="모든 알림을 한 번에 켜거나 끌 수 있습니다"
            icon="notifications"
            value={settings.allNotifications}
            onValueChange={(value) => updateSetting('allNotifications', value)}
          />
        </View>

        {/* 택시 파티 관련 알림 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>택시 파티</Text>
          <SettingItem
            title="파티 알림"
            description="새로운 파티 생성, 파티 참여 요청, 파티 상태 변경 알림"
            icon="car"
            value={settings.partyNotifications}
            onValueChange={(value) => updateSetting('partyNotifications', value)}
            disabled={!settings.allNotifications}
          />
        </View>

        {/* 공지사항 알림 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>공지사항</Text>
          <SettingItem
            title="공지사항 알림"
            description="새로운 공지사항, 중요한 공지사항 알림"
            icon="document-text"
            value={settings.noticeNotifications}
            onValueChange={(value) => updateSetting('noticeNotifications', value)}
            disabled={!settings.allNotifications}
          />
        </View>

        {/* 시스템 알림 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>시스템</Text>
          <SettingItem
            title="시스템 알림"
            description="앱 업데이트, 서비스 점검, 보안 관련 알림"
            icon="settings"
            value={settings.systemNotifications}
            onValueChange={(value) => updateSetting('systemNotifications', value)}
            disabled={!settings.allNotifications}
          />
        </View>

        {/* 마케팅 알림 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>마케팅</Text>
          <SettingItem
            title="마케팅 알림"
            description="이벤트, 프로모션, 추천 서비스 알림"
            icon="gift"
            value={settings.marketingNotifications}
            onValueChange={(value) => updateSetting('marketingNotifications', value)}
            disabled={!settings.allNotifications}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            알림 설정을 변경하면 즉시 적용됩니다.
          </Text>
        </View>
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
    paddingVertical: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '700',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  settingItemDisabled: {
    opacity: 0.5,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.accent.green + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    lineHeight: 18,
  },
  disabledText: {
    color: COLORS.text.disabled,
  },
  footer: {
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  footerText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});