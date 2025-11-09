import React, { useRef, useState } from 'react';
import { View, StyleSheet, ScrollView, BackHandler, Platform, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from '../../components/common/Text';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import PageHeader from '../../components/common/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { useScreenView } from '../../hooks/useScreenView';
import Icon from 'react-native-vector-icons/Ionicons';
import WebView from 'react-native-webview';
import { WINDOW_HEIGHT, WINDOW_WIDTH } from '@gorhom/bottom-sheet';

export const AccountGuideScreen = () => {
  useScreenView();
  const navigation = useNavigation();
  const webViewRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);

  // 안드로이드 하드웨어 백 버튼 처리
  React.useEffect(() => {
    if (Platform.OS === 'android') {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        if (canGoBack && webViewRef.current) {
          webViewRef.current.goBack();
          return true; // 이벤트 소비
        }
        return false; // 기본 동작 (화면 닫기)
      });

      return () => backHandler.remove();
    }
  }, [canGoBack]);

  const handleNavigationStateChange = (navState: any) => {
    setCanGoBack(navState.canGoBack);
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader 
        onBack={() => {
            navigation.goBack?.();
        }} 
        title="성결대 이메일 발급 방법" 
        borderBottom 
      />
      
      
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        <View style={styles.webViewContainer}>
            <PageHeader
            title="성결대 포탈시스템"
            titleStyle={{ ...TYPOGRAPHY.title3 }}
            backIconSize={28}
            secondIcon='refresh-outline'
            secondIconSize={28}
            secondIconPress={() => {
                webViewRef.current?.reload?.();
            }}
            thirdIcon='chevron-forward-outline'
            thirdIconSize={28}
            thirdIconPress={() => {
                webViewRef.current?.goForward?.();
            }}
            style={{backgroundColor: COLORS.background.tertiary}}
            borderBottom
            onBack={() => {
                webViewRef.current?.goBack?.();
            }}
            rightButton={true}
            rightButtonIcon='globe-outline'
            onRightButtonPress={() => {
                Linking.openURL('https://www.sungkyul.ac.kr/portalLogin/skukr/portalLoginForm.do');
            }}
            />
            <WebView
            ref={webViewRef}
            source={{ uri: 'https://www.sungkyul.ac.kr/portalLogin/skukr/portalLoginForm.do' }}
            onNavigationStateChange={handleNavigationStateChange}
            scrollEnabled={true}
            nestedScrollEnabled={true}
            />
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>성결대 이메일 발급 방법</Text>
          
          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>포탈로그인</Text>
              <Text style={styles.stepDescription}>
                성결대학교 포털시스템에서 통합로그인을 하세요.
              </Text>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>웹메일 클릭</Text>
              <Text style={styles.stepDescription}>
                웹메일을 클릭하세요.
              </Text>
            </View>
            <View style={styles.stepImage}>
                <Image source={require('../../../assets/images/account_guide/step1.jpeg')} style={{ width: '100%', height: '100%' }} resizeMode='cover'/>
            </View>
          </View>

          <View style={styles.stepContainer}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Gmail 클릭 후 이메일 발급</Text>
              <Text style={styles.stepDescription}>
                Gmail을 클릭하고 이메일 발급을 진행하세요.
              </Text>
            </View>
            <View style={styles.stepImage}>
                <Image source={require('../../../assets/images/account_guide/step2.jpeg')} style={{ width: '100%', height: '100%' }} resizeMode='cover'/>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>주의사항</Text>
          <View style={styles.warningContainer}>
            <Icon name="information-circle-outline" size={20} color={COLORS.accent.orange} />
            <Text style={styles.warningText}>
              성결대학교 재학생만 사용할 수 있는 서비스입니다.{'\n'}
              외부인은 사용할 수 없습니다.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  webViewContainer: {
    height: WINDOW_HEIGHT * 0.6,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  title: {
    ...TYPOGRAPHY.title1,
    fontWeight: '700',
    color: COLORS.text.primary,
    marginBottom: 12,
  },
  description: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    lineHeight: 22,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title2,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 16,
  },
  stepContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    ...TYPOGRAPHY.body2,
    fontWeight: '700',
    color: COLORS.background.primary,
    textAlign: 'center',
  },
  stepContent: {
    flex: 1,
  },
  stepImage: {
    width: WINDOW_WIDTH * 0.4,
    height: WINDOW_WIDTH * 0.4,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 12,
  },
  stepTitle: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: 4,
  },
  stepDescription: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  contactText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.accent.blue,
    textDecorationLine: 'underline',
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.accent.orange + '15',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent.orange + '30',
    gap: 12,
  },
  warningText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    flex: 1,
    lineHeight: 20,
  },
});

