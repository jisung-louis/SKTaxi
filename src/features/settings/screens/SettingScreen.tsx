import React from 'react';
import {
  ScrollView,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';

import {type CampusStackParamList} from '@/app/navigation/types';
import {
  V2SettingsRow,
  V2SettingsSection,
  V2StackHeader,
} from '@/shared/design-system/components';
import {V2_COLORS, V2_SPACING} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks/useScreenView';

import {useAppSettingData} from '../hooks/useAppSettingData';

export const SettingScreen = () => {
  useScreenView();

  const navigation = useNavigation<NativeStackNavigationProp<CampusStackParamList>>();
  const {data} = useAppSettingData();

  const handlePressRow = React.useCallback(
    (actionKey: string) => {
      switch (actionKey) {
        case 'termsOfUse':
          navigation.navigate('TermsOfUse');
          return;
        case 'privacyPolicy':
          navigation.navigate('PrivacyPolicy');
          return;
        default:
          return;
      }
    },
    [navigation],
  );

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <V2StackHeader
        onPressBack={() => navigation.goBack()}
        title="앱 설정"
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        {data.sections.map(section => (
          <V2SettingsSection key={section.id} style={styles.section} title={section.title}>
            {section.items.map((item, index) => (
              <V2SettingsRow
                key={item.id}
                accessoryType={item.accessoryType}
                disabled={item.disabled}
                iconBackgroundColor={item.iconBackgroundColor}
                iconBoxSize={36}
                iconColor={item.iconColor}
                iconName={item.iconName}
                minHeight={index === 0 && section.items.length === 1 ? 70 : 68}
                onPress={
                  item.accessoryType === 'chevron'
                    ? () => handlePressRow(item.actionKey)
                    : undefined
                }
                showDivider={index < section.items.length - 1}
                subtitle={item.subtitle}
                title={item.title}
                titleWeight="500"
                toggleValue={item.toggleValue}
                valueLabel={item.valueLabel}
              />
            ))}
          </V2SettingsSection>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  content: {
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: V2_SPACING.xxl,
  },
});
