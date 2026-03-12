import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import PageHeader from '@/components/common/PageHeader';
import { TermsOfUseContent } from '@/features/settings';
import { COLORS } from '@/shared/constants/colors';
import { useScreenView } from '@/shared/hooks';

export const TermsOfUseForAuthScreen = () => {
  useScreenView();

  const navigation =
    useNavigation<NativeStackNavigationProp<any>>();

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader
        onBack={() => navigation.goBack()}
        title="이용 약관"
        borderBottom
      />
      <ScrollView
        showsVerticalScrollIndicator
        contentContainerStyle={styles.contentContainer}
      >
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
