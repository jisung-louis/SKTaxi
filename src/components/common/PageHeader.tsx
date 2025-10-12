import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';

interface PageHeaderProps {
  onBack: () => void;
  title?: string;
  padding?: number;
}

const PageHeader = ({ onBack, title, padding = 10 }: PageHeaderProps) => {
  return (
    <View style={[styles.container, {paddingHorizontal: padding}]}>
      <Icon name="chevron-back" size={36} color={COLORS.text.primary} onPress={onBack} />
      {title && <Text style={styles.title}>{title}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text.primary,
    flex: 1,
    marginLeft: 10,
  },
});

export default PageHeader;