// 공지 알림 설정 UI
// TODO : V2 UI 변경 (현재는 레거시 UI 사용중 (토글 등도 shared 컴포넌트가 아니라 여기서 직접 구현하고 있음))

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import {WINDOW_WIDTH} from '@gorhom/bottom-sheet';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {
  ToggleSwitch,
} from '@/shared/design-system/components';
import {
  COLORS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';

import {NOTICE_CATEGORIES, getCategorySettingKey} from '../model/constants';

interface NoticeSettingsPanelProps {
  visible: boolean;
  onClose: () => void;
  noticeSettings: {
    noticeNotifications: boolean;
    noticeNotificationsDetail?: Record<string, boolean>;
  };
  onUpdateMaster: (enabled: boolean) => void;
  onUpdateDetail: (key: string, enabled: boolean) => void;
  saving?: boolean;
}

export function NoticeSettingsPanel({
  visible,
  onClose,
  noticeSettings,
  onUpdateMaster,
  onUpdateDetail,
  saving = false,
}: NoticeSettingsPanelProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      backdropOpacity={0.5}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      animationInTiming={280}
      animationOutTiming={280}
      backdropTransitionInTiming={280}
      backdropTransitionOutTiming={280}
      useNativeDriver
      useNativeDriverForBackdrop
      hideModalContentWhileAnimating
      statusBarTranslucent
      style={styles.modal}>
      <View
        style={[
          styles.rightPanel,
          {paddingTop: insets.top, paddingBottom: insets.bottom},
        ]}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>공지 알림 설정</Text>
          <TouchableOpacity onPress={onClose}>
            <Icon name="close" size={24} color={COLORS.text.primary} />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.panelContent}>
            <View style={[styles.panelSection, styles.masterSection]}>
              <Text style={styles.panelSectionTitle}>전체</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.itemLabel}>전체 공지 알림</Text>
                <ToggleSwitch
                  accessibilityLabel="전체 공지 알림"
                  disabled={saving}
                  onValueChange={onUpdateMaster}
                  size="large"
                  value={noticeSettings.noticeNotifications}
                />
              </View>
            </View>

            <View style={styles.panelSection}>
              <Text style={styles.panelSectionTitle}>카테고리별</Text>
              {NOTICE_CATEGORIES.filter(category => category !== '전체').map(
                category => {
                  const key = getCategorySettingKey(category);
                  const enabled =
                    noticeSettings.noticeNotificationsDetail?.[key] !== false;
                  const disabled = !noticeSettings.noticeNotifications;

                  return (
                    <View key={key} style={styles.rowBetween}>
                      <Text
                        style={[
                          styles.itemLabel,
                          disabled && styles.itemDisabled,
                        ]}>
                        {category}
                      </Text>
                      <ToggleSwitch
                        accessibilityLabel={category}
                        disabled={saving || disabled}
                        onValueChange={nextValue => onUpdateDetail(key, nextValue)}
                        size="large"
                        value={enabled}
                      />
                    </View>
                  );
                },
              )}
            </View>

            <View style={[styles.panelSection, styles.keywordSection]}>
              <Text style={styles.panelSectionTitle}>키워드 알림</Text>
              <View style={styles.rowBetween}>
                <Text style={styles.itemLabel}>키워드 알림 사용</Text>
                <ToggleSwitch
                  accessibilityLabel="키워드 알림 사용"
                  onValueChange={() =>
                    Alert.alert(
                      '아직 만들고있어...',
                      '키워드 알림은 아직 구현을 못했어요.\n조금만 기둘..',
                    )
                  }
                  size="large"
                  value={false}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
    margin: 0,
  },
  rightPanel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: WINDOW_WIDTH * 0.7,
    backgroundColor: COLORS.background.surface,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border.default,
    paddingHorizontal: SPACING.lg,
    ...SHADOWS.raised,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  panelTitle: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
  },
  panelContent: {
    paddingVertical: SPACING.md,
  },
  panelSection: {},
  masterSection: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.subtle,
    marginBottom: SPACING.md,
  },
  keywordSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border.subtle,
    paddingTop: SPACING.md,
  },
  panelSectionTitle: {
    color: COLORS.text.secondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
  },
  itemLabel: {
    color: COLORS.text.primary,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  itemDisabled: {
    color: COLORS.text.muted,
  },
});
