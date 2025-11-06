import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import Icon from 'react-native-vector-icons/Ionicons';
import { openAppStore } from '../../lib/versionCheck';

interface ForceUpdateModalProps {
  visible: boolean;
  message?: string;
}

export const ForceUpdateModal: React.FC<ForceUpdateModalProps> = ({ visible, message }) => {
  const handleUpdate = () => {
    openAppStore();
  };

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
            <Icon name="cloud-download-outline" size={64} color={COLORS.accent.blue} />
          </View>
          
          <Text style={styles.title}>업데이트가 필요해요!</Text>
          
          <Text style={styles.message}>
            {message || '새로운 버전이 출시되었습니다.\n앱을 최신 버전으로 업데이트해주세요.'}
          </Text>
          
          <TouchableOpacity 
            style={styles.updateButton} 
            onPress={handleUpdate}
            activeOpacity={0.8}
          >
            <Text style={styles.updateButtonText}>
              {Platform.OS === 'ios' ? 'App Store에서 업데이트' : 'Play Store에서 업데이트'}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.note}>
            업데이트 후 앱을 다시 실행해주세요.
          </Text>
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





