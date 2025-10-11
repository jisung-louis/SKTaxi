import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typhograpy';

export const HomeScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
      <Text style={styles.text}>HomeScreen</Text>
      <Text style={styles.text}>HomeScreen</Text>
      <Text style={styles.text}>HomeScreen</Text>
      <Text style={styles.text}>HomeScreen</Text>
      <Text style={styles.text}>HomeScreen</Text>
      <Text style={styles.text}>HomeScreen</Text>
      <Text style={styles.text}>HomeScreen</Text>
      <Text style={styles.text}>HomeScreen</Text>
      <Text style={styles.text}>HomeScreen</Text>
      <Text style={styles.text}>HomeScreen</Text>
      <Text style={styles.text}>HomeScreen</Text>
      <Text style={styles.text}>HomeScreen</Text>
      <Text style={styles.text}>HomeScreen</Text>
      <Text style={styles.text}>HomeScreen</Text>
      <Text style={styles.text}>HomeScreen</Text>
      <Text style={styles.text}>HomeScreen</Text>
      </ScrollView>
    </SafeAreaView >
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text.secondary,
  },
});