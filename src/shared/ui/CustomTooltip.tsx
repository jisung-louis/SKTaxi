import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, Animated } from 'react-native';

interface CustomTooltipProps {
  visible: boolean;
  text: string;
  onClose: () => void;
  style?: ViewStyle;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ visible, text, onClose, style }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
    } else {
      // 컴포넌트가 사라지면 부모에서 null을 리턴하므로 사전 페이드아웃을 위해 onClose 호출 전에 부모가 visible=false를 전달해야 함
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }).start();
    }
  }, [visible, opacity]);

  if (!visible) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={onClose}
      />
      <Animated.View style={[styles.tooltipBox, style, { opacity }]} pointerEvents="box-none">
        <Text style={styles.tooltipText}>{text}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  tooltipBox: {
    position: 'absolute',
    top: 30,
    left: -60,
    backgroundColor: '#4ADE80', // COLORS.accent.green
    padding: 12,
    borderRadius: 8,
    zIndex: 2,
    minWidth: 180,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  tooltipText: {
    color: '#fff', // COLORS.text.buttonText
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 0,
  },
}); 