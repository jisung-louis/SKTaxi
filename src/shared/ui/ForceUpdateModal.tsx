import React from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import { COLORS } from '@/shared/constants/colors';
import { TYPOGRAPHY } from '@/shared/constants/typography';
import { openAppStore } from '@/shared/lib/device/openAppStore';
import type { VersionModalConfig } from '@/shared/types/version';

interface ForceUpdateModalProps {
  visible: boolean;
  config?: VersionModalConfig;
}

export const ForceUpdateModal: React.FC<ForceUpdateModalProps> = ({ visible, config }) => {
  const handleButtonPress = () => {
    if (config?.buttonUrl) {
      openAppStore(config.buttonUrl);
      return;
    }

    openAppStore();
  };

  const iconName = config?.icon || 'cloud-download-outline';
  const title = config?.title || '업데이트가 필요해요!';
  const message = config?.message || '새로운 버전이 출시되었습니다.\n앱을 최신 버전으로 업데이트해주세요.';
  const showButton = config?.showButton !== undefined ? config.showButton : true;
  const buttonText = config?.buttonText || (
    Platform.OS === 'ios' ? 'App Store에서 업데이트' : 'Play Store에서 업데이트'
  );

  return (
    <Modal
      visible={visible}
      transparent={false}
      animationType="fade"
      statusBarTranslucent
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon name={iconName} size={64} color={COLORS.accent.blue} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {showButton && (
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleButtonPress}
              activeOpacity={0.8}
            >
              <Text style={styles.updateButtonText}>{buttonText}</Text>
            </TouchableOpacity>
          )}

          {showButton && (
            <Text style={styles.note}>
              업데이트 후 앱을 다시 실행해주세요.
            </Text>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  updateButton: {
    backgroundColor: COLORS.accent.blue,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  updateButtonText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.buttonText,
    fontWeight: '600',
  },
  note: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.tertiary,
    textAlign: 'center',
  },
});
