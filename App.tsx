/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import React from 'react';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import { Platform, StyleSheet } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigation } from '@/app/navigation/AppNavigation';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRuntimeHost } from '@/app/bootstrap/AppRuntimeHost';
import { StartupModalHost } from '@/app/bootstrap/StartupModalHost';
import '@/shared/lib/firebase';

if (Platform.OS === 'android') {
  Geolocation.setRNConfiguration({
    locationProvider: 'playServices',
  });
}

const AppContent = () => {
  return (
    <AppProviders>
      <AppNavigation>
        <AppRuntimeHost />
        <StartupModalHost />
      </AppNavigation>
    </AppProviders>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <AppContent />
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});

export default App;
