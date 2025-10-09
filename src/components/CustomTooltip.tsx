import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface CustomTooltipProps {
  visible: boolean;
  text: string;
  onClose: () => void;
  style?: ViewStyle;
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({ visible, text, onClose, style }) => {
  if (!visible) return null;
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <View style={styles.overlay} pointerEvents="auto">
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
      </View>
      <View style={[styles.tooltipBox, style]} pointerEvents="box-none">
        <Text style={styles.tooltipText}>{text}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
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