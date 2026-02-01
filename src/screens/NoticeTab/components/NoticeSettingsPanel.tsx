// SKTaxi: 공지사항 설정 패널 컴포넌트 - SRP 분리
// NoticeScreen에서 분리된 알림 설정 사이드 패널

import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import Modal from 'react-native-modal';
import Icon from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WINDOW_WIDTH } from '@gorhom/bottom-sheet';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import { NOTICE_CATEGORIES, getCategorySettingKey } from '../constants/noticeCategories';

interface NoticeSettingsPanelProps {
    visible: boolean;
    onClose: () => void;
    noticeSettings: {
        noticeNotifications: boolean;
        noticeNotificationsDetail?: Record<string, boolean>;
    };
    onUpdateMaster: (enabled: boolean) => void;
    onUpdateDetail: (key: string, enabled: boolean) => void;
}

/**
 * 공지사항 알림 설정 사이드 패널
 * SRP: 알림 설정 UI만 담당
 */
export function NoticeSettingsPanel({
    visible,
    onClose,
    noticeSettings,
    onUpdateMaster,
    onUpdateDetail,
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
            style={{ margin: 0, justifyContent: 'flex-start', alignItems: 'flex-end' }}
        >
            <View style={[styles.rightPanel, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <View style={styles.panelHeader}>
                    <Text style={styles.panelTitle}>공지 알림 설정</Text>
                    <TouchableOpacity onPress={onClose}>
                        <Icon name="close" size={24} color={COLORS.text.primary} />
                    </TouchableOpacity>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <View style={styles.panelContent}>
                        {/* 전체 알림 설정 */}
                        <View style={[styles.panelSection, styles.masterSection]}>
                            <Text style={styles.panelSectionTitle}>전체</Text>
                            <View style={styles.rowBetween}>
                                <Text style={styles.itemLabel}>전체 공지 알림</Text>
                                <TouchableOpacity
                                    onPress={() => onUpdateMaster(!noticeSettings.noticeNotifications)}
                                    style={[styles.toggle, noticeSettings.noticeNotifications && styles.toggleOn]}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.knob, noticeSettings.noticeNotifications && styles.knobOn]} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* 카테고리별 설정 */}
                        <View style={styles.panelSection}>
                            <Text style={styles.panelSectionTitle}>카테고리별</Text>
                            {NOTICE_CATEGORIES.filter(c => c !== '전체').map((cat) => {
                                const key = getCategorySettingKey(cat);
                                const enabled = noticeSettings.noticeNotificationsDetail?.[key] !== false;
                                const disabled = !noticeSettings.noticeNotifications;
                                return (
                                    <View key={key} style={styles.rowBetween}>
                                        <Text style={[styles.itemLabel, disabled && styles.itemDisabled]}>{cat}</Text>
                                        <TouchableOpacity
                                            onPress={() => !disabled && onUpdateDetail(key, !enabled)}
                                            style={[styles.toggle, enabled && styles.toggleOn, disabled && styles.toggleDisabled]}
                                            activeOpacity={0.8}
                                            disabled={disabled}
                                        >
                                            <View style={[styles.knob, enabled && styles.knobOn]} />
                                        </TouchableOpacity>
                                    </View>
                                );
                            })}
                        </View>

                        {/* 키워드 알림 (미구현) */}
                        <View style={[styles.panelSection, styles.keywordSection]}>
                            <Text style={styles.panelSectionTitle}>키워드 알림</Text>
                            <View style={styles.rowBetween}>
                                <Text style={styles.itemLabel}>키워드 알림 사용</Text>
                                <TouchableOpacity
                                    onPress={() => Alert.alert('아직 만들고있어...', '키워드 알림은 아직 구현을 못했어요.\n조금만 기둘..')}
                                    style={styles.toggle}
                                    activeOpacity={0.8}
                                >
                                    <View style={styles.knob} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    rightPanel: {
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: WINDOW_WIDTH * 0.7,
        backgroundColor: COLORS.background.card,
        borderLeftWidth: 1,
        borderLeftColor: COLORS.border.default,
        paddingHorizontal: 16,
    },
    panelHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.default,
    },
    panelTitle: {
        ...TYPOGRAPHY.title3,
        color: COLORS.text.primary,
        fontWeight: '700',
    },
    panelContent: {
        paddingVertical: 12,
    },
    panelSection: {},
    masterSection: {
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border.dark,
        marginBottom: 12,
    },
    keywordSection: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border.dark,
        paddingTop: 12,
    },
    panelSectionTitle: {
        ...TYPOGRAPHY.caption1,
        color: COLORS.text.secondary,
        fontWeight: '600',
    },
    rowBetween: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
    },
    itemLabel: {
        ...TYPOGRAPHY.body1,
        fontWeight: '500',
        color: COLORS.text.primary,
    },
    itemDisabled: {
        color: COLORS.text.disabled,
    },
    toggle: {
        width: 48,
        height: 28,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: COLORS.border.default,
        backgroundColor: COLORS.background.primary,
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    toggleOn: {
        backgroundColor: COLORS.accent.green + '33',
        borderColor: COLORS.accent.green,
    },
    toggleDisabled: {
        opacity: 0.5,
    },
    knob: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: COLORS.border.default,
        transform: [{ translateX: 0 }],
    },
    knobOn: {
        backgroundColor: COLORS.accent.green,
        transform: [{ translateX: 20 }],
    },
});
