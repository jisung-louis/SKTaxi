import React from 'react';
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  V2_COLORS,
  V2_RADIUS,
  V2_TYPOGRAPHY,
} from '@/shared/design-system/tokens';
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
            <Icon name={iconName} size={64} color={V2_COLORS.accent.blue} />
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
    backgroundColor: V2_COLORS.background.page,
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
    ...V2_TYPOGRAPHY.title2,
    color: V2_COLORS.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    ...V2_TYPOGRAPHY.body1,
    color: V2_COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  updateButton: {
    backgroundColor: V2_COLORS.accent.blue,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: V2_RADIUS.md,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  updateButtonText: {
    ...V2_TYPOGRAPHY.body1,
    color: V2_COLORS.text.inverse,
    fontWeight: '600',
  },
  note: {
    ...V2_TYPOGRAPHY.caption1,
    color: V2_COLORS.text.tertiary,
    textAlign: 'center',
  },
});
