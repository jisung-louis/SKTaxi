import React, {useRef, useState} from 'react';
import {
  BackHandler,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import WebView from 'react-native-webview';

import type {AuthStackParamList} from '@/app/navigation/types';
import {V2StackHeader} from '@/shared/design-system/components';
import {
  V2_COLORS,
  V2_RADIUS,
  V2_SHADOWS,
  V2_SPACING,
} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks';

import {AccountGuidePortalCard} from '../components/v2/AccountGuidePortalCard';
import {AccountGuideStepCard} from '../components/v2/AccountGuideStepCard';

const PORTAL_URL =
  'https://www.sungkyul.ac.kr/portalLogin/skukr/portalLoginForm.do';

interface GuideStepItem {
  description: string;
  imageSource?: number;
  step: number;
  successMessage?: string;
  title: string;
}

const GUIDE_STEPS: GuideStepItem[] = [
  {
    description: '성결대학교 포털시스템에서 통합로그인을 하세요.',
    step: 1,
    title: '포탈 로그인',
  },
  {
    description: '웹메일을 클릭하세요.',
    imageSource: require('../../../../assets/images/account_guide/step1.jpeg'),
    step: 2,
    title: '웹메일 클릭',
  },
  {
    description: 'Gmail을 클릭하고 이메일 발급을 진행하세요.',
    imageSource: require('../../../../assets/images/account_guide/step2.jpeg'),
    step: 3,
    successMessage: '발급 완료 후 SKURI에서 로그인하세요!',
    title: 'Gmail 클릭 후 이메일 발급',
  },
];

export const AccountGuideScreen = () => {
  useScreenView();

  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  React.useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true;
        }
        return false;
      },
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.container}>
      <V2StackHeader
        onPressBack={() => navigation.goBack()}
        title="성결대 이메일 발급 안내"
      />

      <ScrollView
        contentContainerStyle={styles.contentContainer}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}>
        <View style={styles.webViewContainer}>
          <WebView
            nestedScrollEnabled
            onNavigationStateChange={navState => {
              setCanGoBack(navState.canGoBack);
            }}
            ref={webViewRef}
            scrollEnabled
            source={{uri: PORTAL_URL}}
            startInLoadingState
          />
        </View>

        <AccountGuidePortalCard
          onPressPortal={() => {
            Linking.openURL(PORTAL_URL).catch(() => undefined);
          }}
        />

        <View style={styles.titleSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>이메일 발급 방법</Text>
            <View style={styles.sectionDivider} />
          </View>
          <Text style={styles.sectionSubtitle}>
            아래 단계에 따라 성결대학교 Gmail을 발급받을 수 있어요.
          </Text>
        </View>

        <View style={styles.stepList}>
          {GUIDE_STEPS.map(step => (
            <AccountGuideStepCard
              key={step.step}
              description={step.description}
              imageSource={step.imageSource}
              step={step.step}
              successMessage={step.successMessage}
              title={step.title}
            />
          ))}
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={0.9}
          onPress={() => navigation.goBack()}
          style={styles.backToLoginButton}>
          <Text style={styles.backToLoginLabel}>로그인 화면으로 돌아가기</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backToLoginButton: {
    alignItems: 'center',
    backgroundColor: '#4ADE80',
    borderRadius: V2_RADIUS.lg,
    height: 60,
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#4ADE80',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.24,
    shadowRadius: 8,
  },
  backToLoginLabel: {
    color: V2_COLORS.text.inverse,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22.5,
  },
  container: {
    backgroundColor: V2_COLORS.background.page,
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
    paddingHorizontal: V2_SPACING.lg,
    paddingTop: V2_SPACING.lg,
  },
  sectionDivider: {
    backgroundColor: V2_COLORS.border.default,
    flex: 1,
    height: 1,
    marginLeft: V2_SPACING.md,
  },
  sectionHeaderRow: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  sectionSubtitle: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
  },
  sectionTitle: {
    color: V2_COLORS.text.primary,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  stepList: {
    gap: V2_SPACING.md,
  },
  titleSection: {
    marginBottom: V2_SPACING.md,
    marginTop: 24,
  },
  webViewContainer: {
    ...V2_SHADOWS.card,
    backgroundColor: V2_COLORS.background.surface,
    borderColor: V2_COLORS.border.default,
    borderRadius: V2_RADIUS.lg,
    borderWidth: 1,
    height: 220,
    marginBottom: V2_SPACING.lg,
    overflow: 'hidden',
  },
});
