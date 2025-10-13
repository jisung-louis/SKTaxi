import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';

interface SurfaceProps {
    color?: string;
    height?: number;
    margin?: number;
    style?: ViewStyle;
}

const Surface = ({ color, height, margin, style }: SurfaceProps) => {
    return (
        <View style={[styles.container, { backgroundColor: color, height, marginVertical: margin }, style]}/>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.border.default,
    },
});

export default Surface;