import React from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {SafeAreaView, useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {useScreenView} from '@/shared/hooks';
import {
  V2_COLORS,
  V2_SPACING,
} from '@/shared/design-system/tokens';

import {AuthActionButton} from '../components/v2/AuthActionButton';
import {OnboardingFeatureCard} from '../components/v2/OnboardingFeatureCard';
import {OnboardingProgressDots} from '../components/v2/OnboardingProgressDots';
import {usePermissionOnboarding} from '../hooks/usePermissionOnboarding';
import {usePermissionOnboardingStatus} from '../hooks/usePermissionOnboardingStatus';
import {PermissionOnboardingStep} from '../model/types';
import {ONBOARDING_STEP_VIEW_DATA} from '../model/onboardingViewData';

const IOS_STEP_SEQUENCE: PermissionOnboardingStep[] = [
  'intro',
  'notification',
  'att',
  'location',
  'complete',
];

const ANDROID_STEP_SEQUENCE: PermissionOnboardingStep[] = [
  'intro',
  'notification',
  'location',
  'complete',
];

const COMPLETE_DECORATIONS = [
  {backgroundColor: '#FACC15', left: 222, size: 24, top: 10},
  {backgroundColor: '#60A5FA', left: 100, size: 12, top: 26},
  {backgroundColor: '#F472B6', left: 104, size: 16, top: 134},
] as const;

export const PermissionOnboardingScreen = () => {
  useScreenView();

  const insets = useSafeAreaInsets();
  const stepSequence =
    Platform.OS === 'ios' ? IOS_STEP_SEQUENCE : ANDROID_STEP_SEQUENCE;
  const [currentStep, setCurrentStep] =
    React.useState<PermissionOnboardingStep>('intro');
  const [requesting, setRequesting] = React.useState(false);
  const {
    completeOnboarding,
    requestLocationPermission,
    requestNotificationPermission,
  } = usePermissionOnboardingStatus();
  const {completing, finalizeOnboarding} = usePermissionOnboarding();
  const transition = useSharedValue(1);

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: transition.value,
    transform: [{translateY: (1 - transition.value) * 18}],
  }));

  const goToStep = React.useCallback(
    (nextStep: PermissionOnboardingStep) => {
      transition.value = withTiming(
        0,
        {
          duration: 220,
          easing: Easing.out(Easing.cubic),
        },
        finished => {
          if (!finished) {
            return;
          }

          runOnJS(setCurrentStep)(nextStep);
          transition.value = 0;
          transition.value = withTiming(1, {
            duration: 260,
            easing: Easing.out(Easing.cubic),
          });
        },
      );
    },
    [transition],
  );

  const activeStepIndex = Math.max(stepSequence.indexOf(currentStep), 0);
  const currentViewData = ONBOARDING_STEP_VIEW_DATA[currentStep];

  const handlePressPrimary = React.useCallback(async () => {
    if (currentStep === 'intro') {
      goToStep('notification');
      return;
    }

    if (currentStep === 'notification') {
      try {
        setRequesting(true);
        await requestNotificationPermission();
      } catch (error) {
        console.warn('알림 권한 요청 실패:', error);
      } finally {
        setRequesting(false);
      }

      goToStep(Platform.OS === 'ios' ? 'att' : 'location');
      return;
    }

    if (currentStep === 'att') {
      try {
        setRequesting(true);
        const {requestATTPermission} = await import('@/shared/lib/permissions/att');
        await requestATTPermission();
      } catch (error) {
        console.warn('ATT 권한 요청 실패:', error);
      } finally {
        setRequesting(false);
      }

      goToStep('location');
      return;
    }

    if (currentStep === 'location') {
      try {
        setRequesting(true);
        await requestLocationPermission();
      } catch (error) {
        console.warn('위치 권한 요청 실패:', error);
      } finally {
        setRequesting(false);
      }

      goToStep('complete');
      return;
    }

    await finalizeOnboarding(completeOnboarding);
  }, [
    completeOnboarding,
    currentStep,
    finalizeOnboarding,
    goToStep,
    requestLocationPermission,
    requestNotificationPermission,
  ]);

  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={[styles.progressWrap, {paddingTop: insets.top + 16}]}>
          <OnboardingProgressDots
            activeColor={currentViewData.heroColor}
            activeIndex={activeStepIndex}
            total={stepSequence.length}
          />
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            {paddingBottom: 144 + insets.bottom, paddingTop: insets.top + 64},
          ]}
          showsVerticalScrollIndicator={false}>
          <Animated.View style={contentAnimatedStyle}>
            <View style={styles.heroSection}>
              {currentStep === 'complete' ? (
                <View style={styles.completeHeroWrap}>
                  {COMPLETE_DECORATIONS.map(decoration => (
                    <View
                      key={`${decoration.left}-${decoration.top}`}
                      style={[
                        styles.completeDecoration,
                        {
                          backgroundColor: decoration.backgroundColor,
                          height: decoration.size,
                          left: decoration.left,
                          top: decoration.top,
                          width: decoration.size,
                        },
                      ]}
                    />
                  ))}
                  <View
                    style={[
                      styles.completeHero,
                      {backgroundColor: currentViewData.heroColor},
                    ]}>
                    <View style={styles.completeInnerCircle}>
                      <Icon
                        color={currentViewData.heroColor}
                        name={currentViewData.heroIconName}
                        size={32}
                      />
                    </View>
                  </View>
                </View>
              ) : (
                <View
                  style={[
                    styles.heroBox,
                    {
                      backgroundColor: currentViewData.heroColor,
                      shadowColor: currentViewData.heroColor,
                    },
                  ]}>
                  <Icon
                    color={V2_COLORS.text.inverse}
                    name={currentViewData.heroIconName}
                    size={36}
                  />
                </View>
              )}
            </View>

            {currentViewData.kicker ? (
              <Text style={styles.kicker}>{currentViewData.kicker}</Text>
            ) : null}

            <Text style={styles.title}>{currentViewData.title}</Text>
            {currentViewData.subtitle ? (
              <Text style={styles.subtitle}>{currentViewData.subtitle}</Text>
            ) : (
              <View style={styles.subtitleSpace}/>
            )}

            <View style={styles.featureList}>
              {currentViewData.features.map(feature => (
                <OnboardingFeatureCard
                  iconColor={currentViewData.heroColor}
                  iconName={feature.iconName}
                  key={feature.label}
                  label={feature.label}
                />
              ))}
            </View>

            {currentViewData.footerLines?.length ? (
              <View style={styles.footerNoteWrap}>
                {currentViewData.footerLines.map(line => (
                  <Text key={line} style={styles.footerNote}>
                    {line}
                  </Text>
                ))}
              </View>
            ) : null}
          </Animated.View>
        </ScrollView>

        <View
          style={styles.bottomActionWrap}>
          <AuthActionButton
            colors={currentViewData.buttonColors}
            disabled={false}
            label={currentViewData.actionLabel}
            loading={requesting || completing}
            onPress={handlePressPrimary}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: V2_COLORS.background.surface,
    flex: 1,
  },
  screen: {
    backgroundColor: V2_COLORS.background.surface,
    flex: 1,
  },
  progressWrap: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    left: 0,
    paddingBottom: 12,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 20,
  },
  scrollContent: {
    paddingHorizontal: V2_SPACING.xxl,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  heroBox: {
    alignItems: 'center',
    borderRadius: 24,
    height: 96,
    justifyContent: 'center',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.35,
    shadowRadius: 24,
    width: 96,
    elevation: 10,
  },
  completeHeroWrap: {
    alignItems: 'center',
    height: 152,
    justifyContent: 'center',
    width: '100%',
  },
  completeDecoration: {
    borderRadius: 9999,
    opacity: 0.82,
    position: 'absolute',
  },
  completeHero: {
    alignItems: 'center',
    borderRadius: 9999,
    height: 112,
    justifyContent: 'center',
    shadowColor: '#4ADE80',
    shadowOffset: {width: 0, height: 16},
    shadowOpacity: 0.35,
    shadowRadius: 32,
    width: 112,
    elevation: 12,
  },
  completeInnerCircle: {
    alignItems: 'center',
    backgroundColor: V2_COLORS.background.surface,
    borderRadius: 9999,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  kicker: {
    color: V2_COLORS.text.muted,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  title: {
    color: V2_COLORS.text.primary,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: V2_COLORS.text.tertiary,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 32,
    minHeight: 22,
    textAlign: 'center',
    height: 22,
  },
  subtitleSpace: {
    marginBottom: 32,
  },
  featureList: {
    gap: 12,
  },
  footerNoteWrap: {
    marginTop: 20,
  },
  footerNote: {
    color: V2_COLORS.text.muted,
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
  },
  bottomActionWrap: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderTopColor: V2_COLORS.border.subtle,
    borderTopWidth: 1,
    bottom: 0,
    left: 0,
    paddingHorizontal: V2_SPACING.xxl,
    paddingTop: 17,
    position: 'absolute',
    right: 0,
    paddingBottom: 20,
  },
});
