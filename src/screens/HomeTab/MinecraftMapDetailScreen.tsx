// SKTaxi: Minecraft 서버 지도 화면
//
// ⚠️ 특수 케이스 - Firebase Realtime Database 사용:
// 이 화면은 마인크래프트 서버의 실시간 지도 URL을 가져옵니다.
// Firebase Realtime Database는 마인크래프트 서버 연동용 별도 시스템으로,
// Spring 마이그레이션 대상이 아닙니다.

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { WebView } from 'react-native-webview';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { useScreenView } from '../../hooks/useScreenView';
import database from '@react-native-firebase/database';

export const MinecraftMapDetailScreen = () => {
  useScreenView();
  const navigation = useNavigation();
  const [mapUri, setMapUri] = useState<string | null>(null);

  useEffect(() => {
    const mapUriRef = database().ref('serverStatus/mapUri');

    const handleMapUri = mapUriRef.on('value', (snap) => {
      if (snap.exists()) {
        setMapUri(snap.val() as string);
      } else {
        setMapUri(null);
      }
    });

    return () => {
      mapUriRef.off('value', handleMapUri);
    };
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Icon name="arrow-back" size={24} color={COLORS.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>서버 지도</Text>
        {/* 오른쪽 여백 맞추기용 더미 뷰 */}
        <View style={styles.headerRightSpacer} />
      </View>

      {/* Fullscreen WebView */}
      <View style={styles.webViewWrapper}>
        {mapUri && mapUri !== 'null' ? (
          <WebView
            source={{ uri: mapUri }}
            style={styles.webView}
            startInLoadingState
            javaScriptEnabled
            domStorageEnabled
          />
        ) : (
          <View style={styles.mapLoadingContainer}>
            <Icon name="map-outline" size={64} color={COLORS.text.disabled} />
            <Text style={styles.mapLoadingText}>지도가 준비중이에요{'\n'}조금만 기다려주세요!</Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
    backgroundColor: COLORS.background.primary,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerRightSpacer: {
    width: 32,
  },
  webViewWrapper: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  webView: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  mapLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
    gap: 16,
  },
  mapLoadingText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});


