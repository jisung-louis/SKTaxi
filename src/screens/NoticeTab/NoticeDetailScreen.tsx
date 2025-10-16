import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Linking, Image, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import PageHeader from '../../components/common/PageHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import Icon from 'react-native-vector-icons/Ionicons';
import { Notice } from '../../hooks/useNotices';
import { convertToSubviewURL } from '../../utils/linkConverter';
import RenderHTML from 'react-native-render-html';
import { defaultHTMLElementModels, HTMLContentModel } from 'react-native-render-html';
import { parseHtmlTables } from '../../utils/htmlparser/parseHtmlTables';
import CustomTable from '../../components/htmlparser/CustomTable';
import {
  IMGElementContainer,
  IMGElementContentError,
  IMGElementContentSuccess,
  useIMGElementProps,
  useIMGElementState
} from 'react-native-render-html';

import { HTMLElementModelShape } from 'react-native-render-html';

import { CSSProperties } from 'react';

export const NoticeDetailScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const noticeId: string | undefined = route?.params?.noticeId;
  const { width } = useWindowDimensions();

  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        if (!noticeId) {
          setError('잘못된 접근입니다.');
          setLoading(false);
          return;
        }
        const db = getFirestore();
        const snap = await getDoc(doc(db, 'notices', noticeId));
        if (!snap.exists()) {
          setError('공지사항을 찾을 수 없습니다.');
        } else {
          setNotice({ id: snap.id, ...(snap.data() as any) });
        }
      } catch (e: any) {
        setError(e?.message || '로딩 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [noticeId]);

  const formattedDate = useMemo(() => {
    try {
      const ts: any = (notice as any)?.postedAt;
      if (ts?.toDate) {
        return ts.toDate().toLocaleString('ko-KR', {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        });
      }
      return '';
    } catch {
      return '';
    }
  }, [notice]);

  const htmlSource = useMemo(() => {
    let html = (notice as any)?.contentDetail as string | undefined;
    if (html) {
      html = html
        .replace(/src="\/(.*?)"/g, 'src="https://www.sungkyul.ac.kr/$1"')
        .replace(/src="http:\/\//g, 'src="https://');
      return { html };
    }
    return null;
  }, [notice]);

  const tableHtmls = useMemo(() => {
    if (!notice?.contentDetail) return [];
    return parseHtmlTables(notice.contentDetail);
  }, [notice]);

  const htmlWithoutTables = useMemo(() => {
    if (!notice?.contentDetail) return null;
    const html = notice.contentDetail
      .replace(/<table[\s\S]*?<\/table>/gi, '') // remove all table tags
      .replace(/src="\/(.*?)"/g, 'src="https://www.sungkyul.ac.kr/$1"')
      .replace(/src="http:\/\//g, 'src="https://');
    return { html };
  }, [notice]);





  const CustomImageRenderer = (props: any) => {
    const imgProps = useIMGElementProps(props);
    const state = useIMGElementState(imgProps);
  
    const aspectRatio = state.dimensions.width && state.dimensions.height
      ? state.dimensions.width / state.dimensions.height
      : 1;
  
    // Error fallback
    if (state.type === 'error') {
      return (
        <IMGElementContainer style={{
          ...state.containerStyle,
          width: state.dimensions.width,
          height: state.dimensions.height,
          aspectRatio: aspectRatio,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: COLORS.border.default,
          borderRadius: 8,
          padding: 8,
          backgroundColor: COLORS.background.card,
          overflow: 'hidden',
        }}
        onPress={imgProps.onPress}
        >
        <Text style={{ color: COLORS.text.secondary, fontStyle: 'italic', textAlign: 'center' }}>
          이미지를 불러올 수 없어요.{'\n'}실제 홈페이지에서 확인해주세요!
        </Text>
        </IMGElementContainer>
      );
    }
  
    // Success state
    if (state.type === 'success') {
      return (
        <IMGElementContainer
          style={{
            ...state.containerStyle,
            width: state.dimensions.width,
            height: state.dimensions.height,
            aspectRatio: aspectRatio,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: COLORS.border.default,
            borderRadius: 8,
            padding: 8,
            backgroundColor: COLORS.background.card,
            overflow: 'hidden',
          }}
          onPress={imgProps.onPress}
        >
          <IMGElementContentSuccess {...state} />
        </IMGElementContainer>
      );
    }

    // Loading spinner
    return (
      <IMGElementContainer
        style={{
          ...state.containerStyle,
          width: state.dimensions.width,
          height: state.dimensions.height,
          aspectRatio: aspectRatio,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: COLORS.border.default,
          borderRadius: 8,
          padding: 8,
          backgroundColor: COLORS.background.card,
          overflow: 'hidden',
        }}
        onPress={imgProps.onPress}
      >
        <View style={{ justifyContent: 'center', alignItems: 'center', paddingVertical: 8 }}>
          <ActivityIndicator color={COLORS.accent.green} size="small" />
        </View>
      </IMGElementContainer>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
        <PageHeader onBack={() => navigation.goBack()} title="공지사항" borderBottom />
        {loading ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={COLORS.accent.green} size="large" />
          </View>
        ) : error ? (
          <View style={styles.errorWrap}>
            <Icon name="alert-circle" size={48} color={COLORS.accent.red} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.contentWrap} showsVerticalScrollIndicator={false}>
            <View style={styles.headerBlock}>
              <View style={styles.chipsRow}>
                {!!notice?.department && (
                  <View style={[styles.chip, styles.deptChip]}>
                    <Text style={[styles.chipText, styles.deptChipText]}>{notice?.department}</Text>
                  </View>
                )}
                {!!notice?.category && (
                  <View style={styles.chip}>
                    <Text style={styles.chipText}>{notice?.category}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.title}>{notice?.title}</Text>
              <View style={styles.metaRow}>
                {!!notice?.author && <Text style={styles.metaText}>{notice?.author}</Text>}
                {!!formattedDate && (
                  <View style={styles.metaDotRow}>
                    <View style={styles.dot} />
                    <Text style={styles.metaText}>{formattedDate}</Text>
                  </View>
                )}
              </View>
            </View>
            {!!htmlWithoutTables ? (
              <RenderHTML
                contentWidth={width - 40}
                source={htmlWithoutTables}
                defaultTextProps={{ selectable: true }}
                baseStyle={{ color: COLORS.text.primary, fontSize: 14, lineHeight: 20 }}
                renderers={{ img: CustomImageRenderer }}
                renderersProps={{
                  a: {
                    onPress: (_evt: any, href?: string) => {
                      if (href) Linking.openURL(href);
                      return Promise.resolve();
                    }
                  }
                }}
                //customHTMLElementModels={customHTMLElementModels}
              />
            ) : !!notice?.content && (
              <Text style={styles.bodyText}>{notice?.content}</Text>
            )}

            {tableHtmls.map((tableHtml, index) => (
              <CustomTable key={index} html={tableHtml} />
            ))}

            {!!notice?.link && (
              <TouchableOpacity
                onPress={() => Linking.openURL(convertToSubviewURL(notice?.link))}
                activeOpacity={0.8}
                style={styles.linkCard}
              >
                <Icon name="link-outline" size={18} color={COLORS.accent.green} />
                <Text numberOfLines={1} style={styles.linkText}>{convertToSubviewURL(notice?.link)}</Text>
                <Icon name="open-outline" size={18} color={COLORS.accent.green} />
              </TouchableOpacity>
            )}

            {!!(notice as any)?.contentAttachments?.length && (
              <View style={{ gap: 8 }}>
                {(notice as any).contentAttachments.map((att: any, idx: number) => (
                  <TouchableOpacity
                    key={`${att.downloadUrl || att.previewUrl || idx}`}
                    style={styles.linkCard}
                    activeOpacity={0.8}
                    onPress={() => Linking.openURL(att.previewUrl || att.downloadUrl)}
                  >
                    <Icon name="document-text-outline" size={18} color={COLORS.accent.green} />
                    <Text numberOfLines={1} style={styles.linkText}>{att.name || '첨부파일'}</Text>
                    <Icon name="open-outline" size={18} color={COLORS.accent.green} />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loaderWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    marginTop: 12,
    textAlign: 'center',
  },
  contentWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 48,
    gap: 16,
  },
  headerBlock: {
    gap: 10,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  chip: {
    backgroundColor: COLORS.accent.green + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  chipText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.accent.green,
    fontWeight: '700',
  },
  deptChip: {
    backgroundColor: COLORS.background.card,
    outlineWidth: 1,
    outlineColor: COLORS.border.default,
  },
  deptChipText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontWeight: '700',
  },
  title: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    lineHeight: 28,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaDotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.text.disabled,
  },
  metaText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  bodyText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    lineHeight: 22,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.background.card,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  linkText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.accent.green,
    flex: 1,
  },
});