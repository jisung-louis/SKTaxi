import React, { useMemo } from 'react';
import { Linking } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';

import PageHeader from '@/shared/ui/PageHeader';
import { COLORS } from '@/shared/constants/colors';
import { TYPOGRAPHY } from '@/shared/constants/typography';
import { useScreenView } from '@/shared/hooks/useScreenView';

import { useNotice } from '../hooks/useNotice';
import { NoticeStackParamList } from '../model/navigation';
import { formatNoticePostedAt, normalizeNoticeHtml } from '../model/selectors';

const NoticeDetailWebViewScreen = () => {
  useScreenView();

  const navigation = useNavigation<NativeStackNavigationProp<NoticeStackParamList>>();
  const route =
    useRoute<NativeStackScreenProps<NoticeStackParamList, 'NoticeDetailWebView'>['route']>();
  const noticeId = route.params?.noticeId;
  const { notice } = useNotice(noticeId);

  const subTitle = useMemo(() => {
    const author = notice?.author || '';
    const postedAt = formatNoticePostedAt(notice?.postedAt);
    return `작성자 : ${author}\n작성일 : ${postedAt}`;
  }, [notice?.author, notice?.postedAt]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background.primary }}>
      <PageHeader
        onBack={() => navigation.goBack()}
        title={notice?.title || '공지사항'}
        titleStyle={{ ...TYPOGRAPHY.title3 }}
        subTitle={subTitle}
        subTitleStyle={{ ...TYPOGRAPHY.caption1 }}
        subTitleNumberOfLines={2}
        borderBottom
        rightButton
        rightButtonIcon="globe-outline"
        onRightButtonPress={() => {
          if (notice?.link) {
            Linking.openURL(notice.link);
          }
        }}
      />
      <WebView
        originWhitelist={['*']}
        source={{
          html: normalizeNoticeHtml(notice?.contentDetail) || '<p>공지사항을 찾을 수 없습니다.</p>',
        }}
        contentContainerStyle={{
          paddingBottom: 500,
          backgroundColor: COLORS.background.primary,
        }}
        style={{ flex: 1 }}
      />
    </SafeAreaView>
  );
};

export default NoticeDetailWebViewScreen;
