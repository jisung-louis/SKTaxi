// SKTaxi: 남은 시간 표시 컴포넌트
// SRP: 남은 시간 플로팅 UI 렌더링 담당

import React from 'react';
import { Text, StyleSheet, View, ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';

interface TaxiTimeRemainingProps {
    timeText: string;
    style?: ViewStyle | any; // Animated style
    topInset: number;
}

export function TaxiTimeRemaining({ timeText, style, topInset }: TaxiTimeRemainingProps) {
    if (!timeText) return null;

    return (
        <Animated.View style={[
            styles.floatingContentContainer,
            { top: topInset },
            style
        ]}>
            <Text style={styles.floatingContentText}>{timeText}</Text>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    floatingContentContainer: {
        position: 'absolute',
        left: 48,
        right: 48,
        zIndex: 100000,
        backgroundColor: COLORS.background.primary,
        paddingVertical: 10,
        paddingHorizontal: 24,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: COLORS.border.default,
        shadowColor: COLORS.background.primary,
        shadowOpacity: 0.75,
        shadowRadius: 10,
        elevation: 5,
    },
    floatingContentText: {
        color: COLORS.text.primary,
        ...TYPOGRAPHY.body1,
        fontWeight: '600',
        textAlign: 'center',
    },
});
