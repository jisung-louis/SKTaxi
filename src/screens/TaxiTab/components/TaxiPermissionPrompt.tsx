// SKTaxi: 위치 권한 요청 컴포넌트
// SRP: 권한 없을 때의 UI 렌더링 담당

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import { WINDOW_HEIGHT, BOTTOM_TAB_BAR_HEIGHT, WINDOW_WIDTH } from '../../../constants/constants';

interface TaxiPermissionPromptProps {
    onRequestPermission: () => void;
}

export function TaxiPermissionPrompt({ onRequestPermission }: TaxiPermissionPromptProps) {
    return (
        <SafeAreaView style={styles.container}>
            <Icon name="location-outline" size={64} color={COLORS.text.secondary} />
            <Text style={styles.title}>
                위치 권한이 필요해요
            </Text>
            <Text style={styles.description}>
                택시 동승을 위해 현재 위치가 필요합니다.{'\n'}
                설정에서 위치 권한을 허용해주세요.
            </Text>
            <TouchableOpacity
                style={styles.button}
                onPress={onRequestPermission}
            >
                <Text style={styles.buttonText}>권한 허용하기</Text>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        height: WINDOW_HEIGHT - BOTTOM_TAB_BAR_HEIGHT - WINDOW_WIDTH,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background.tertiary,
    },
    title: {
        color: COLORS.text.primary,
        ...TYPOGRAPHY.title3,
        fontWeight: '600',
        marginTop: 12,
        textAlign: 'center',
    },
    description: {
        color: COLORS.text.secondary,
        ...TYPOGRAPHY.body2,
        lineHeight: 20,
        marginTop: 8,
        textAlign: 'center',
    },
    button: {
        backgroundColor: COLORS.accent.green,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 10,
        marginTop: 16,
    },
    buttonText: {
        color: COLORS.background.primary,
        ...TYPOGRAPHY.body2,
        fontWeight: '600',
    },
});
