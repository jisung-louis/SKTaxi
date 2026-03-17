import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {type CampusStackParamList} from '@/app/navigation/types';
import {
  V2SettingsRow,
  V2SettingsSection,
  V2StackHeader,
  V2StateCard,
} from '@/shared/design-system/components';
import {V2_COLORS, V2_SPACING} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks/useScreenView';

import {useNotificationSettingsScreenData} from '../hooks/useNotificationSettingsScreenData';

export const NotificationSettingsScreen = () => {
  useScreenView();

  const navigation = useNavigation<NativeStackNavigationProp<CampusStackParamList>>();
  const {data, error, loading, reload, toggleAll, toggleItem} =
    useNotificationSettingsScreenData();

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <V2StackHeader
        onPressBack={() => navigation.goBack()}
        title="알림 설정"
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}>
        {loading && !data ? (
          <V2StateCard
            description="알림 설정을 준비하고 있습니다."
            icon={<ActivityIndicator color={V2_COLORS.brand.primary} />}
            title="알림 설정을 불러오는 중"
          />
        ) : null}

        {error && !data ? (
          <V2StateCard
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
            title="알림 설정을 불러오지 못했습니다"
          />
        ) : null}

        {data ? (
          <>
            <V2SettingsSection style={styles.masterSection}>
              <V2SettingsRow
                accessoryType="toggle"
                iconBackgroundColor={data.master.iconBackgroundColor}
                iconColor={data.master.iconColor}
                iconName={data.master.iconName}
                minHeight={72}
                onToggle={toggleAll}
                subtitle={data.master.subtitle}
                title={data.master.title}
                titleWeight="700"
                toggleValue={data.master.value}
              />
            </V2SettingsSection>

            <V2SettingsSection style={styles.detailSection} title="세부 알림 설정">
              {data.items.map((item, index) => (
                <V2SettingsRow
                  key={item.key}
                  accessoryType="toggle"
                  disabled={item.disabled}
                  iconBackgroundColor={item.iconBackgroundColor}
                  iconColor={item.iconColor}
                  iconName={item.iconName}
                  minHeight={73}
                  onToggle={nextValue => toggleItem(item.key, nextValue)}
                  showDivider={index < data.items.length - 1}
                  subtitle={item.subtitle}
                  subtitleNumberOfLines={2}
                  title={item.title}
                  titleWeight="700"
                  toggleValue={item.value}
                />
              ))}
            </V2SettingsSection>

            <Text style={styles.footerText}>기기의 알림 설정이 꺼져 있으면 알림을 받을 수 없어요.</Text>
            <Text style={styles.footerText}>기기 설정에서 알림 권한을 허용해주세요.</Text>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: 20,
    paddingBottom: 32,
  },
  masterSection: {
    marginBottom: 20,
  },
  detailSection: {
    marginBottom: 20,
  },
  footerText: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 20,
    paddingHorizontal: 16,
    textAlign: 'center',
  },
});
