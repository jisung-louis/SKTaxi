/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import React from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigation } from '@/app/navigation/AppNavigation';
import { AppProviders } from '@/app/providers/AppProviders';
import { AppRuntimeHost } from '@/app/bootstrap/AppRuntimeHost';
import { useAppBootstrap } from '@/app/bootstrap/useAppBootstrap';
import { ForceUpdateModal } from '@/shared/ui/ForceUpdateModal';
import '@/shared/lib/firebase';

const AppContent = () => {
  const { forceUpdateRequired, modalConfig } = useAppBootstrap();

  return (
    <>
      <AppProviders>
        <AppNavigation>
          <AppRuntimeHost />
        </AppNavigation>
      </AppProviders>
      <ForceUpdateModal
        visible={forceUpdateRequired}
        config={modalConfig}
      />
    </>
  );
};

const App = () => {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <AppContent />
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
