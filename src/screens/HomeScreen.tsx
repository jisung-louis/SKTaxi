import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typhograpy';
import Button from '../components/common/Button';

export const HomeScreen = () => {
  return (
    <View style={styles.container}>
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
      <Button title="테스트" onPress={() => console.log('테스트')} />
    </View >
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