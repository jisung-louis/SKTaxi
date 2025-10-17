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
  subTitle?: string;
  subTitleStyle?: StyleProp<TextStyle>;
  subTitleNumberOfLines?: number;
  rightButton?: boolean;
  rightButtonIcon?: string;
  onRightButtonPress?: () => void;
  borderBottom?: boolean;
}

const PageHeader = ({ onBack, title, padding = 10, style, titleStyle, subTitle, subTitleStyle, subTitleNumberOfLines=1, rightButton=false, rightButtonIcon='ellipsis-vertical', onRightButtonPress, borderBottom=false }: PageHeaderProps) => {
  return (
    <View style={[styles.container, {paddingHorizontal: padding}, style, borderBottom && styles.borderBottom]}>
      <Icon name="chevron-back" size={36} color={COLORS.text.primary} onPress={onBack} />
      <View style={styles.titleContainer}>
        {title && <Text style={[styles.title, titleStyle]} numberOfLines={1}>{title}</Text>}
        {subTitle && <Text style={[styles.subTitle, subTitleStyle]} numberOfLines={subTitleNumberOfLines}>{subTitle}</Text>}
      </View>
      {rightButton && <Icon name={rightButtonIcon} size={28} color={COLORS.text.primary} style={{ marginRight: 5 }} onPress={onRightButtonPress} />}
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