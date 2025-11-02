import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
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
import Button from '../../components/common/Button';
import CustomImageRenderer from '../../components/htmlRender/CustomImageRenderer';
//import CustomTableRenderer from '../../components/htmlRender/CustomTableRenderer';
import { WebView } from 'react-native-webview';
import { domNodeToHTMLString } from 'react-native-render-html';
import { ToggleButton } from '../../components/common/ToggleButton';
import { useNoticeLike } from '../../hooks/useNoticeLike';
import CommentInput, { CommentInputRef } from '../../components/common/CommentInput';
import UniversalCommentList from '../../components/common/UniversalCommentList';
import { useNoticeComments } from '../../hooks/useNoticeComments';
import { useAuth } from '../../hooks/useAuth';
import { useScreenView } from '../../hooks/useScreenView';

export const NoticeDetailScreen = () => {
  useScreenView();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const noticeId: string | undefined = route?.params?.noticeId;
  const { width } = useWindowDimensions();
  const { user } = useAuth();

  const [notice, setNotice] = useState<Notice | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [replyingTo, setReplyingTo] = useState<{ commentId: string; authorName: string; isAnonymous: boolean } | null>(null);
  const commentInputRef = useRef<CommentInputRef>(null);

  // 좋아요 기능
  const { isLiked, likeCount, loading: likeLoading, toggleLike } = useNoticeLike(noticeId || '');
  
  // 댓글 기능
  const { 
    comments: rawComments, 
    loading: commentsLoading, 
    submitting: commentsSubmitting,
    addComment, 
    addReply, 
    updateComment, 
    deleteComment 
  } = useNoticeComments(noticeId || '');

  const handleReply = useCallback((commentId: string, authorName: string, isAnonymous: boolean) => {
    setReplyingTo({ commentId, authorName, isAnonymous });
    // 답글 모드로 전환 후 TextInput에 포커싱
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 100);
  }, []);

  const handleCancelReply = useCallback(() => {
    setReplyingTo(null);
  }, []);

  // Comment 타입을 UniversalComment 타입으로 변환
  const comments = rawComments.map(comment => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    isDeleted: comment.isDeleted,
    parentId: comment.parentId,
    authorId: comment.userId,
    authorName: comment.userDisplayName,
    isAnonymous: comment.isAnonymous,
    anonId: comment.anonId,
    anonymousOrder: comment.anonymousOrder,
    replies: comment.replies?.map(reply => ({
      id: reply.id,
      content: reply.content,
      createdAt: reply.createdAt,
      updatedAt: reply.updatedAt,
      isDeleted: reply.isDeleted,
      parentId: reply.parentId,
      authorId: reply.userId,
      authorName: reply.userDisplayName,
      isAnonymous: reply.isAnonymous,
      anonId: reply.anonId,
      anonymousOrder: reply.anonymousOrder,
    })) || []
  }));

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

  
  // const renderTableToWebView = (props: any) => {
  //   const {tnode} = props;
  //   const html = domNodeToHTMLString(tnode?.domNode);
  //   return <WebView source={{ html }} style={{ width: '100%', height: 'auto' }} contentContainerStyle={{ paddingBottom: 4 }} originWhitelist={['*']} />;
  // };


const TableToWebView = (props: any) => {
  const { tnode } = props;
  const [height, setHeight] = useState(100);
  const TARGET_WIDTH = Math.max(0, width - 40);

  const html = useMemo(() => {
    try {
      const inner = domNodeToHTMLString(tnode.domNode as any) || '<div></div>';
      return `
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>
          html, body { margin:0; padding:0; background:transparent; }
          table { border-collapse: collapse; }
        </style>
        <div id="wrap">${inner}</div>
      `;
    } catch {
      return '<div></div>';
    }
  }, [tnode]);

  const injectedJS = `
    (function() {
      var TARGET_W = ${TARGET_WIDTH};
      var S = 1;
      function applyScale() {
        var el = document.getElementById('wrap');
        if (!el) return 0;
        var naturalW = el.scrollWidth || el.offsetWidth || 0;
        if (!naturalW) return 0;
        S = TARGET_W > 0 ? (TARGET_W / naturalW) : 1;
        el.style.transformOrigin = 'top left';
        el.style.transform = 'scale(' + S + ')';
        el.style.width = naturalW + 'px';
        var rawH = el.scrollHeight || el.offsetHeight || 0;
        var scaledH = Math.ceil(rawH * S);
        if (scaledH > 0 && window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(String(scaledH));
        }
        return scaledH;
      }
      function schedule() { setTimeout(applyScale, 0); }
      schedule();
      window.addEventListener('load', schedule);
      try { new ResizeObserver(applyScale).observe(document.body); } catch (_) {}
    })();
    true;
  `;

  const onMessage = useCallback((e: any) => {
    const h = Number(e?.nativeEvent?.data);
    if (Number.isFinite(h) && h > 0) setHeight(h);
  }, []);

  return (
      <WebView
        originWhitelist={['*']}
        source={{ html }}
        injectedJavaScript={injectedJS}
        onMessage={onMessage}
        style={{ width: '100%', height }}
        scrollEnabled
      />
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
          <ScrollView 
            contentContainerStyle={styles.contentWrap} 
            showsVerticalScrollIndicator={false}
            contentInset={{ bottom: keyboardHeight > 0 ? keyboardHeight + 91 : 91 - 20 }}
            contentInsetAdjustmentBehavior="never"
          >
            <View style={styles.noticeContainer}>
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
              {!!htmlSource ? (
                <RenderHTML
                  contentWidth={width - 40}
                  source={htmlSource}
                  defaultTextProps={{ selectable: true }}
                  baseStyle={{ color: COLORS.text.primary, fontSize: 14, lineHeight: 20 }}
                  tagsStyles={{
                    td: { fontSize: 10, lineHeight: 14 },
                    th: { fontSize: 10, lineHeight: 14 },
                  }}
                  renderers={{ 
                    img: CustomImageRenderer,
                    //table: CustomTableRenderer,
                    table: TableToWebView,
                  }}
                  renderersProps={{
                    a: {
                      onPress: (_evt: any, href?: string) => {
                        if (href) Linking.openURL(href);
                        return Promise.resolve();
                      }
                    }
                  }}
                />
              ) : !!notice?.content && (
                <Text style={styles.bodyText}>{notice?.content}</Text>
              )}


              {!!(notice as any)?.contentAttachments?.length && (
                <View style={styles.attachmentsCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Icon name="attach-outline" size={16} color={COLORS.text.secondary} />
                    <Text style={{ ...TYPOGRAPHY.body2, color: COLORS.text.secondary }}>첨부파일</Text>
                  </View>
                  <View style={{ gap: 10 }}>
                    {(notice as any).contentAttachments.map((att: any, idx: number) => (
                      <View key={`${att.downloadUrl || idx}`} style={styles.attachmentRow}>
                        <TouchableOpacity 
                          onPress={() => Linking.openURL(att.downloadUrl)}
                          activeOpacity={0.85}
                          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}
                        >
                          <Icon name="document-text-outline" size={18} color={COLORS.accent.green} />
                          <Text numberOfLines={1} style={styles.attachmentName} >{att.name || '첨부파일'}</Text>
                        </TouchableOpacity>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          {!!att.previewUrl && (
                            <TouchableOpacity
                              onPress={() => Linking.openURL(att.previewUrl)}
                              activeOpacity={0.85}
                              style={styles.chipButton}
                            >
                              <Icon name="eye-outline" size={14} color={COLORS.accent.green} />
                              <Text style={styles.chipButtonText}>바로보기</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {!!notice?.link && (
                <TouchableOpacity
                  //onPress={() => Linking.openURL(convertToSubviewURL(notice?.link))}
                  onPress={() => navigation.navigate('NoticeDetailWebView', { noticeId: noticeId })}
                  activeOpacity={0.8}
                  style={styles.linkCard}
                >
                  <Icon name="link-outline" size={18} color={COLORS.accent.green} />
                  <Text numberOfLines={1} style={styles.linkText}>{convertToSubviewURL(notice?.link)}</Text>
                  <Icon name="open-outline" size={18} color={COLORS.accent.green} />
                </TouchableOpacity>
              )}
              <View style={styles.interactionRow}>
                <ToggleButton
                  type="like"
                  isActive={isLiked}
                  count={likeCount}
                  onPress={toggleLike}
                  loading={likeLoading}
                  size="medium"
                />
                <ToggleButton
                  type="comment"
                  count={comments.length + comments.reduce((sum, comment) => sum + (comment.replies?.length || 0), 0)}
                  onPress={() => {}}
                  size="medium"
                  disabled={true}
                />
              </View>
              
            </View>
            {/* 좋아요 / 댓글 기능 */}
              <UniversalCommentList
                comments={comments}
                loading={commentsLoading}
                onAddComment={(content) => addComment({ content })}
                onAddReply={addReply}
                onUpdateComment={updateComment}
                onDeleteComment={deleteComment}
                submitting={commentsSubmitting}
                currentUserId={user?.uid}
                onReply={handleReply}
                replyingToCommentId={replyingTo?.commentId}
              />
            
          </ScrollView>
        )}
        
        
        {/* 댓글 섹션 */}
        <CommentInput
          ref={commentInputRef}
          onSubmit={async (content: string, isAnonymous?: boolean) => {
            if (replyingTo) {
              await addReply(replyingTo.commentId, content, isAnonymous);
              setReplyingTo(null);
            } else {
              await addComment({ content, isAnonymous });
            }
          }}
          submitting={commentsSubmitting}
          placeholder={replyingTo ? `${replyingTo.isAnonymous ? '익명' : replyingTo.authorName}님에게 답글...` : "댓글을 입력하세요..."}
          parentId={replyingTo?.commentId}
          onKeyboardHeightChange={setKeyboardHeight}
          onCancelReply={handleCancelReply}
        />
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
    paddingTop: 16,
    paddingBottom: 30,
    gap: 16,
  },
  noticeContainer: {
    paddingHorizontal: 20,
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
    ...TYPOGRAPHY.caption1,
    color: COLORS.accent.green,
    flex: 1,
  },
  attachmentsCard: {
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    borderRadius: 12,
    padding: 12,
  },
  attachmentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  attachmentName: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.primary,
    flex: 1,
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: COLORS.text.primary,
  },
  chipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.accent.green + '1A',
    borderWidth: 1,
    borderColor: COLORS.accent.green,
  },
  chipButtonText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.accent.green,
    fontWeight: '700',
  },
  chipButtonAlt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  chipButtonAltText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  interactionContainer: {
  },
  interactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 8,
  },
});