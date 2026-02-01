import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../components/common/Text';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typhograpy';
import Icon from 'react-native-vector-icons/Ionicons';
import { usePermissionStatus } from '../hooks/common';
import { ensureFcmTokenSaved } from '../lib/fcm';
import { requestLocationPermission } from '../hooks/common/useCurrentLocation';
import { useAuth } from '../hooks/auth';
import { useUserRepository } from '../di';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing, runOnJS } from 'react-native-reanimated';
import { useScreenView } from '../hooks/useScreenView';
import { requestATTPermission } from '../lib/att';
import { Platform } from 'react-native';

interface PermissionOnboardingScreenProps {
  navigation: any;
}

type OnboardingStep = 'intro' | 'notification' | 'att' | 'location' | 'complete';

export const PermissionOnboardingScreen: React.FC<PermissionOnboardingScreenProps> = ({ navigation }) => {
  useScreenView();
  const { user } = useAuth();
  const userRepository = useUserRepository();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('intro');
  const [isLoading, setIsLoading] = useState(false);
  const {
    requestNotificationPermission,
    requestLocationPermission: requestLocation,
    completeOnboarding,
  } = usePermissionStatus();

  // Step transition animation (fade + slight slide)
  const transition = useSharedValue(1);
  const contentAnimatedStyle = useAnimatedStyle(() => ({
    opacity: transition.value,
    transform: [{ translateY: (1 - transition.value) * 12 }],
  }));

  const goToStep = (next: OnboardingStep) => {
    transition.value = withTiming(0, { duration: 300, easing: Easing.out(Easing.cubic) }, (finished) => {
      if (finished) {
        runOnJS(setCurrentStep)(next);
        transition.value = 0;
        transition.value = withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) });
      }
    });
  };

  // 권한이 이미 모두 허용되어 있으면 RootNavigator가 자동으로 Main으로 전환함
  // 별도 네비게이션 불필요

  // 완료 단계에서 자동으로 FCM 토큰 저장 및 온보딩 완료 처리
  useEffect(() => {
    if (currentStep === 'complete') {
      const handleComplete = async () => {
        try {
          await ensureFcmTokenSaved();
          if (user?.uid) {
            // UX: 완료 안내를 잠시 보여주기 위해 1초 지연
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Repository 패턴: 프로필 업데이트
            await userRepository.updateUserProfile(user.uid, { onboarding: { permissionsComplete: true } } as any);
          }
          // 로컬 상태도 완료 처리 (루트 분기 가속)
          completeOnboarding();
        } catch (error) {
          console.warn('완료 처리 실패:', error);
          // UX: 실패 시에도 동일한 지연 후 로컬 완료 처리
          await new Promise(resolve => setTimeout(resolve, 1000));
          // 실패 시에도 로컬 완료 처리 시도 (재시도는 Root 전환 후 가능)
          completeOnboarding();
        }
      };

      handleComplete();
    }
  }, [currentStep, completeOnboarding, user?.uid, userRepository]);

  const handleNotificationPermission = async () => {
    setIsLoading(true);
    try {
      const granted = await requestNotificationPermission();
      // 권한 여부와 관계없이 다음 단계로 애니메이션 전환
      if (Platform.OS === 'ios') {
        goToStep('att');
      } else {
      goToStep('location');
      }
    } catch (error) {
      console.warn('알림 권한 요청 실패:', error);
      if (Platform.OS === 'ios') {
        setCurrentStep('att');
      } else {
        setCurrentStep('location');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleATTPermission = async () => {
    setIsLoading(true);
    try {
      await requestATTPermission();
      // 권한 여부와 관계없이 다음 단계로 애니메이션 전환
      goToStep('location');
    } catch (error) {
      console.warn('ATT 권한 요청 실패:', error);
      setCurrentStep('location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocationPermission = async () => {
    setIsLoading(true);
    try {
      await requestLocation();
      // 권한 여부와 관계없이 완료로 애니메이션 전환
      goToStep('complete');
    } catch (error) {
      console.warn('위치 권한 요청 실패:', error);
      setCurrentStep('complete');
    } finally {
      setIsLoading(false);
    }
  };

  const renderNotificationStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Icon name="notifications" size={80} color={COLORS.accent.green} />
      </View>
      
      <Text style={styles.title}>이 앱이 잘 작동하려면 ...</Text>
      <Text style={styles.subtitle}>알림 허용이 필요해요</Text>
      <View style={styles.featureList}>
        <View style={styles.featureItem}>
          <Icon name="checkmark-circle" size={20} color={COLORS.accent.green} />
          <Text style={styles.featureText}>동승 요청 승인/거절 알림</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="checkmark-circle" size={20} color={COLORS.accent.green} />
          <Text style={styles.featureText}>학교 공지사항 알림</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="checkmark-circle" size={20} color={COLORS.accent.green} />
          <Text style={styles.featureText}>학교 학사일정 알림</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="checkmark-circle" size={20} color={COLORS.accent.green} />
          <Text style={styles.featureText}>파티 채팅 메시지 알림</Text>
        </View>
      </View>

      <Text style={styles.additionalInfo}>세부 알림 설정은 앱 내에서 제어할 수 있어요</Text>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleNotificationPermission}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? '요청 중...' : '알림 허용하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderIntroStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Image 
          source={require('../../assets/icons/skuri_icon.png')} 
          style={styles.introImage}
        />
      </View>
      <Text style={styles.title}>스쿠리에 오신 걸 환영해요</Text>
      <Text style={styles.subtitle}>성결대 학생들의 스마트한 캠퍼스 라이프</Text>

      <View style={styles.featureList}>
        <View style={styles.featureItem}>
          <Icon name="car" size={20} color={COLORS.accent.green} />
          <Text style={styles.featureText}>택시 동승 파티로 택시비 절약</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="notifications" size={20} color={COLORS.accent.green} />
          <Text style={styles.featureText}>학교 공지 알림을 실시간으로</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="calendar" size={20} color={COLORS.accent.green} />
          <Text style={styles.featureText}>학사일정과 시간표를 한 곳에서</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="restaurant" size={20} color={COLORS.accent.green} />
          <Text style={styles.featureText}>오늘의 학식도 확인하고</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="chatbox-ellipses" size={20} color={COLORS.accent.green} />
          <Text style={styles.featureText}>커뮤니티에서 정보를 교류해요</Text>
        </View>
      </View>
      <Text style={styles.additionalInfo}> </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => goToStep('notification')}
        >
          <Text style={styles.primaryButtonText}>시작하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderATTStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Icon name="shield-checkmark" size={80} color={COLORS.accent.orange} />
      </View>
      
      <Text style={styles.title}>개인정보 보호를 위해</Text>
      <Text style={styles.subtitle}>광고 추적 권한 설정이 필요해요</Text>
      
      <View style={styles.featureList}>
        <View style={styles.featureItem}>
          <Icon name="checkmark-circle" size={20} color={COLORS.accent.orange} />
          <Text style={styles.featureText}>맞춤형 콘텐츠 제공</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="checkmark-circle" size={20} color={COLORS.accent.orange} />
          <Text style={styles.featureText}>서비스 개선을 위한 분석</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="checkmark-circle" size={20} color={COLORS.accent.orange} />
          <Text style={styles.featureText}>사용자 경험 최적화</Text>
        </View>
      </View>

      <Text style={styles.additionalInfo}>
        거부하셔도 앱의 모든 기능을 사용할 수 있어요{"\n"}
        설정에서 언제든지 변경할 수 있습니다.
        </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleATTPermission}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? '요청 중...' : '계속하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderLocationStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Icon name="location" size={80} color={COLORS.accent.blue} />
      </View>
      
      <Text style={styles.title}>정확한 위치 정보가 필요해요</Text>
      <Text style={styles.subtitle}>택시 동승을 위해 현재 위치를 확인해요</Text>
      
      <View style={styles.featureList}>
        <View style={styles.featureItem}>
          <Icon name="checkmark-circle" size={20} color={COLORS.accent.blue} />
          <Text style={styles.featureText}>현재 위치 기반 가까운 파티 찾기</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="checkmark-circle" size={20} color={COLORS.accent.blue} />
          <Text style={styles.featureText}>파티 모임장소까지의 거리 계산</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="checkmark-circle" size={20} color={COLORS.accent.blue} />
          <Text style={styles.featureText}>택시 동승 요청 시 출발지/도착지 설정</Text>
        </View>
        <View style={styles.featureItem}>
          <Icon name="checkmark-circle" size={20} color={COLORS.accent.blue} />
          <Text style={styles.featureText}>안전한 동승 파티</Text>
        </View>
      </View>

      <Text style={styles.additionalInfo}>
        내 위치 정보는 단말기 내에서만 활용되며 서버에 저장되지 않아요{"\n"}
        위치정보 권한 거절 시 택시 동승 파티 찾기 기능이 불가능해요
        </Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.primaryButton, isLoading && styles.buttonDisabled]}
          onPress={handleLocationPermission}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? '요청 중...' : '위치 허용하기'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderCompleteStep = () => (
    <View style={styles.stepContainer}>
      <View style={styles.iconContainer}>
        <Icon name="checkmark-circle" size={80} color={COLORS.accent.green} />
      </View>
      
      <Text style={styles.title}>설정이 완료되었어요!</Text>
      <Text style={styles.subtitle}>이제 SKURI의 모든 기능을 사용할 수 있습니다</Text>
      
      <View style={styles.completeMessage}>
        <Text style={styles.completeText}>
          잠시 후 메인 화면으로 이동합니다...
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.content, contentAnimatedStyle]}>
        <View
          style={[
            styles.stepLayer,
            currentStep === 'intro' ? styles.stepVisible : styles.stepHidden,
          ]}
          pointerEvents={currentStep === 'intro' ? 'auto' : 'none'}
        >
          {renderIntroStep()}
        </View>
        <View
          style={[
            styles.stepLayer,
            currentStep === 'notification' ? styles.stepVisible : styles.stepHidden,
          ]}
          pointerEvents={currentStep === 'notification' ? 'auto' : 'none'}
        >
          {renderNotificationStep()}
        </View>
        {Platform.OS === 'ios' && (
          <View
            style={[
              styles.stepLayer,
              currentStep === 'att' ? styles.stepVisible : styles.stepHidden,
            ]}
            pointerEvents={currentStep === 'att' ? 'auto' : 'none'}
          >
            {renderATTStep()}
          </View>
        )}
        <View
          style={[
            styles.stepLayer,
            currentStep === 'location' ? styles.stepVisible : styles.stepHidden,
          ]}
          pointerEvents={currentStep === 'location' ? 'auto' : 'none'}
        >
          {renderLocationStep()}
        </View>
        <View
          style={[
            styles.stepLayer,
            currentStep === 'complete' ? styles.stepVisible : styles.stepHidden,
          ]}
          pointerEvents={currentStep === 'complete' ? 'auto' : 'none'}
        >
          {renderCompleteStep()}
        </View>
      </Animated.View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                width: currentStep === 'intro' ? (Platform.OS === 'ios' ? '20%' : '25%') :
                      currentStep === 'notification' ? (Platform.OS === 'ios' ? '40%' : '50%') :
                      currentStep === 'att' ? '60%' :
                      currentStep === 'location' ? (Platform.OS === 'ios' ? '80%' : '75%') : '100%' 
              }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {currentStep === 'intro' ? (Platform.OS === 'ios' ? '1/5' : '1/4') :
           currentStep === 'notification' ? (Platform.OS === 'ios' ? '2/5' : '2/4') :
           currentStep === 'att' ? '3/5' :
           currentStep === 'location' ? (Platform.OS === 'ios' ? '4/5' : '3/4') : (Platform.OS === 'ios' ? '5/5' : '4/4')}
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    position: 'relative',
  },
  stepContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.background.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  title: {
    ...TYPOGRAPHY.title1,
    fontWeight: 'bold',
    color: COLORS.text.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  additionalInfo: {
    ...TYPOGRAPHY.caption1,
    lineHeight: 18,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: 12,
    marginTop: 36,
  },
  featureList: {
    width: '100%',
    marginTop: 30,
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  featureText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    marginLeft: 12,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: COLORS.accent.green,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: COLORS.background.primary,
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
  },
  completeMessage: {
    backgroundColor: COLORS.background.card,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    marginTop: 48,
  },
  completeText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  stepLayer: {
    position: 'absolute',
    top: 0,
    left: 24,
    right: 24,
    bottom: 0,
  },
  stepVisible: {
    opacity: 1,
  },
  stepHidden: {
    opacity: 0,
  },
  introImage: {
    width: 120,
    height: 120,
    borderRadius: 24,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: COLORS.border.default,
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent.green,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.text.secondary,
  },
});
