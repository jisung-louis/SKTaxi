import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';

export type ToggleButtonType = 'like' | 'comment' | 'view' | 'share' | 'bookmark';

interface ToggleButtonProps {
  type: ToggleButtonType;
  isActive?: boolean;
  count: number;
  onPress: () => void;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  showCount?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const ToggleButton: React.FC<ToggleButtonProps> = ({
  type,
  isActive = false,
  count,
  onPress,
  loading = false,
  size = 'medium',
  showCount = true,
  disabled = false,
  style
}) => {
  const getSizeConfig = () => {
    switch (size) {
      case 'small':
        return { iconSize: 16, padding: 8, fontSize: 12 };
      case 'large':
        return { iconSize: 24, padding: 16, fontSize: 16 };
      default:
        return { iconSize: 20, padding: 12, fontSize: 14 };
    }
  };

  const getButtonConfig = () => {
    switch (type) {
      case 'like':
        return {
          activeIcon: 'heart',
          inactiveIcon: 'heart-outline',
          activeColor: COLORS.accent.green,
          inactiveColor: COLORS.text.secondary,
          activeBgColor: COLORS.accent.green + '15',
          inactiveBgColor: COLORS.background.card,
        };
      case 'comment':
        return {
          activeIcon: 'chatbubble',
          inactiveIcon: 'chatbubble-outline',
          activeColor: COLORS.accent.blue || COLORS.accent.green,
          inactiveColor: COLORS.text.secondary,
          activeBgColor: (COLORS.accent.blue || COLORS.accent.green) + '15',
          inactiveBgColor: COLORS.background.card,
        };
      case 'view':
        return {
          activeIcon: 'eye',
          inactiveIcon: 'eye-outline',
          activeColor: COLORS.text.primary,
          inactiveColor: COLORS.text.secondary,
          activeBgColor: COLORS.background.card,
          inactiveBgColor: COLORS.background.card,
        };
      case 'share':
        return {
          activeIcon: 'share-social',
          inactiveIcon: 'share-outline',
          activeColor: COLORS.accent.blue || COLORS.accent.green,
          inactiveColor: COLORS.text.secondary,
          activeBgColor: (COLORS.accent.blue || COLORS.accent.green) + '15',
          inactiveBgColor: COLORS.background.card,
        };
      case 'bookmark':
        return {
          activeIcon: 'bookmark',
          inactiveIcon: 'bookmark-outline',
          activeColor: COLORS.accent.red,
          inactiveColor: COLORS.text.secondary,
          activeBgColor: COLORS.accent.red + '15',
          inactiveBgColor: COLORS.background.card,
        };
      default:
        return {
          activeIcon: 'heart',
          inactiveIcon: 'heart-outline',
          activeColor: COLORS.accent.green,
          inactiveColor: COLORS.text.secondary,
          activeBgColor: COLORS.accent.green + '15',
          inactiveBgColor: COLORS.background.card,
        };
    }
  };

  const { iconSize, padding, fontSize } = getSizeConfig();
  const config = getButtonConfig();
  
  const isDisabled = disabled || loading;
  const currentColor = isActive ? config.activeColor : config.inactiveColor;
  const currentBgColor = isActive ? config.activeBgColor : config.inactiveBgColor;
  const currentIcon = isActive ? config.activeIcon : config.inactiveIcon;

  const isComment = type === 'comment';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          paddingHorizontal: padding,
          paddingVertical: padding / 2,
          backgroundColor: currentBgColor,
          borderColor: isActive ? currentColor : COLORS.border.default,
        },
        style
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
        <>
          <Icon
            name={currentIcon}
            size={isComment ? iconSize - 3 : iconSize}
            color={currentColor}
          />
          {loading ? (
            <ActivityIndicator 
              size="small" 
              color={currentColor}
            />
          ) :
          showCount && (
            <Text style={[
              styles.count,
              { 
                fontSize,
                color: isActive ? currentColor : COLORS.text.secondary,
                fontWeight: isActive ? '700' : '600'
              }
            ]}>
              {count}
            </Text>
          )
        }
        </>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 20,
    minHeight: 36,
  },
  count: {
    ...TYPOGRAPHY.caption1,
    minWidth: 16,
    textAlign: 'center',
  },
});

