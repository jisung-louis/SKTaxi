import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';

interface PageHeaderProps {
  onBack: () => void;
  title?: string;
  padding?: number;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  backIconSize?: number;
  secondIcon?: string;
  secondIconSize?: number;
  secondIconPress?: () => void;
  thirdIcon?: string;
  thirdIconSize?: number;
  thirdIconPress?: () => void;
  subTitle?: string;
  subTitleStyle?: StyleProp<TextStyle>;
  subTitleNumberOfLines?: number;
  rightButton?: boolean;
  rightButtonIcon?: string;
  rightButtons?: React.ReactNode[];
  onRightButtonPress?: () => void;
  onRightButtonsPress?: (index: number | undefined) => void;
  borderBottom?: boolean;
}

const PageHeader = ({ onBack, title, padding = 10, style, secondIcon, secondIconSize=28, secondIconPress, thirdIcon, thirdIconSize=28, thirdIconPress, titleStyle, backIconSize=36, subTitle, subTitleStyle, subTitleNumberOfLines=1, rightButton=false, rightButtonIcon='ellipsis-vertical', rightButtons, onRightButtonPress, onRightButtonsPress, borderBottom=false }: PageHeaderProps) => {
  return (
    <View style={[styles.container, {paddingHorizontal: padding}, style, borderBottom && styles.borderBottom]}>
      <Icon name="chevron-back" size={backIconSize} color={COLORS.text.primary} onPress={onBack} />
      {secondIcon && <Icon name={secondIcon} size={secondIconSize} color={COLORS.text.primary} onPress={secondIconPress} style={{ marginLeft: 8 }} />}
      {thirdIcon && <Icon name={thirdIcon} size={thirdIconSize} color={COLORS.text.primary} onPress={thirdIconPress} style={{ marginLeft: 8 }} />}
      <View style={styles.titleContainer}>
        {title && <Text style={[styles.title, titleStyle]} numberOfLines={1}>{title}</Text>}
        {subTitle && <Text style={[styles.subTitle, subTitleStyle]} numberOfLines={subTitleNumberOfLines}>{subTitle}</Text>}
      </View>
      {rightButton && <Icon name={rightButtonIcon} size={28} color={COLORS.text.primary} style={{ marginRight: 5 }} onPress={onRightButtonPress} />}
      {rightButtons && rightButtons.map((button, index) => (
        <TouchableOpacity style={{ marginRight: index === rightButtons.length - 1 ? 10 : 20 }} key={index} onPress={() => onRightButtonsPress?.(index as number)}>
          {button}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 10,
    gap: 2,
  },
  title: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text.primary,
  },
  subTitle: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
});

export default PageHeader;