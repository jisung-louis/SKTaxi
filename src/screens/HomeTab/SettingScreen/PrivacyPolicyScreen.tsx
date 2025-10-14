import React from 'react';
import { Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import PageHeader from '../../../components/common/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export const PrivacyPolicyScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  return (
    <SafeAreaView style={styles.container}>
        <PageHeader onBack={() => navigation.goBack()} title="개인정보 처리방침" borderBottom />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
            <Text style={styles.title}>PrivacyPolicyScreen</Text>
            <Text style={styles.description}>PrivacyPolicyScreen</Text>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  contentContainer: {
    paddingHorizontal: 16,
  },
  title: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text.primary,
  },
  description: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
});