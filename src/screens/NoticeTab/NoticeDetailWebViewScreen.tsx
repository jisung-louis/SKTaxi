import React, { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useRoute } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { NoticeStackParamList } from '../../navigations/types';
import { useNotice } from '../../hooks/notice';
import { COLORS } from '../../constants/colors';
import PageHeader from '../../components/common/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { Linking } from 'react-native';
import { useScreenView } from '../../hooks/useScreenView';

const NoticeDetailWebViewScreen = () => {
  useScreenView();
  const navigation = useNavigation<NativeStackNavigationProp<NoticeStackParamList>>();
  const route = useRoute<NativeStackScreenProps<NoticeStackParamList, 'NoticeDetailWebView'>['route']>();
  const noticeId: string | undefined = route?.params?.noticeId;

  // Repository 패턴 적용 훅
  const { notice } = useNotice(noticeId);

  const processedHtml = notice?.contentDetail
    ?.replace(/src="\/(.*?)"/g, 'src="https://www.sungkyul.ac.kr/$1"')
    ?.replace(/src="http:\/\//g, 'src="https://');

  const subTitle = useMemo(() => {
    const author = notice?.author || '';
    const postedAt = notice?.postedAt?.toDate().toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
    return `작성자 : ${author}\n작성일 : ${postedAt}`;
  }, [notice?.author, notice?.postedAt]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
      <PageHeader 
        onBack={() => navigation.goBack()} 
        title={notice?.title || '공지사항'} 
        titleStyle={{ ...TYPOGRAPHY.title3 }} 
        subTitle={subTitle}
        subTitleStyle={{ ...TYPOGRAPHY.caption1, }}
        subTitleNumberOfLines={2}
        borderBottom 
        rightButton={true}
        rightButtonIcon="globe-outline"
        onRightButtonPress={() => {
          if (notice?.link) {
            Linking.openURL(notice.link);
          }
        }}
      />{/* TODO: 페이지헤더 아래쪽 투명화 그라데이션 넣어보기 */}
        <WebView
          originWhitelist={['*']}
          source={{ html: processedHtml || '<p>공지사항을 찾을 수 없습니다.</p>' }}
          contentContainerStyle={{ paddingBottom: 500, backgroundColor: COLORS.background.primary }}
          style={{ flex: 1 }}
        />
    </SafeAreaView>
  );
};

export default NoticeDetailWebViewScreen;