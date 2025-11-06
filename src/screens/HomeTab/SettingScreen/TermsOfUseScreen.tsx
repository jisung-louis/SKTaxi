import React from 'react';
import { StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants/colors';
import PageHeader from '../../../components/common/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useScreenView } from '../../../hooks/useScreenView';
import TermsOfUseContent from '../../components/TermsOfUseContent';

export const TermsOfUseScreen = () => {
  useScreenView();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  return (
    <SafeAreaView style={styles.container}>
        <PageHeader onBack={() => navigation.goBack()} title="이용 약관" borderBottom />
        <ScrollView showsVerticalScrollIndicator contentContainerStyle={styles.contentContainer}>
          <TermsOfUseContent />
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
    paddingVertical: 16,
  },
});
