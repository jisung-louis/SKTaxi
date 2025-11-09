import React, { useState, useEffect, useMemo } from 'react';
import { Text, StyleSheet, ScrollView, View, TouchableOpacity, ActivityIndicator, Linking, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import PageHeader from '../../../components/common/PageHeader';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { getFirestore, doc, getDoc } from '@react-native-firebase/firestore';
import { formatDistanceToNow, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useScreenView } from '../../../hooks/useScreenView';

const WINDOW_WIDTH = Dimensions.get('window').width;
const WINDOW_HEIGHT = Dimensions.get('window').height;

interface AppNotice {
  id: string;
  title: string;
  content: string;
  category: 'update' | 'service' | 'event' | 'policy';
  priority: 'urgent' | 'normal' | 'info';
  publishedAt: Date;
  updatedAt?: Date;
  imageUrl?: string;
  actionUrl?: string;
}

const CATEGORY_LABELS = {
  update: '앱 업데이트',
  service: '서비스 공지',
  event: '이벤트',
  policy: '정책 변경',
};

const PRIORITY_LABELS = {
  urgent: '긴급',
  normal: '일반',
  info: '정보',
};

const PRIORITY_COLORS = {
  urgent: COLORS.accent.red,
  normal: COLORS.accent.blue,
  info: COLORS.text.secondary,
};

export const AppNoticeDetailScreen = () => {
  useScreenView();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const noticeId = route?.params?.noticeId;
  
  const [notice, setNotice] = useState<AppNotice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isEdited = useMemo(() => {
    return notice?.updatedAt && notice?.updatedAt > notice?.publishedAt;
  }, [notice]);

  useEffect(() => {
    const loadNotice = async () => {
      if (!noticeId) {
        setError('공지사항 ID가 없습니다.');
        setLoading(false);
        return;
      }

      try {
        const db = getFirestore();
        const noticeDoc = await getDoc(doc(db, 'appNotices', noticeId));
        
        if (!noticeDoc.exists()) {
          setError('공지사항을 찾을 수 없습니다.');
        } else {
          const data = noticeDoc.data();
          setNotice({
            id: noticeDoc.id,
            ...data,
            publishedAt: data?.publishedAt?.toDate() || new Date(),
            updatedAt: data?.updatedAt ? data?.updatedAt.toDate?.() || new Date(data?.updatedAt) : undefined,
          } as AppNotice);
        }
      } catch (err) {
        console.error('공지사항 로드 실패:', err);
        setError('공지사항을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadNotice();
  }, [noticeId]);

  const handleActionPress = () => {
    if (notice?.actionUrl) {
      Linking.openURL(notice.actionUrl);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader onBack={() => navigation.goBack()} title="공지사항" borderBottom />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent.blue} />
          <Text style={styles.loadingText}>공지사항을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !notice) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader onBack={() => navigation.goBack()} title="공지사항" borderBottom />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={COLORS.accent.red} />
          <Text style={styles.errorText}>{error || '공지사항을 찾을 수 없습니다.'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
            <Text style={styles.retryButtonText}>돌아가기</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <PageHeader onBack={() => navigation.goBack()} title="공지사항" borderBottom />
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        {/* 헤더 정보 */}
        <View style={styles.headerSection}>
          <View style={styles.noticeHeader}>
            <View style={styles.noticeLeft}>
              <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[notice.priority] }]}>
                <Text style={styles.priorityText}>{PRIORITY_LABELS[notice.priority]}</Text>
              </View>
              <Text style={styles.categoryText}>{CATEGORY_LABELS[notice.category]}</Text>
            </View>
            <View style={styles.noticeRight}>
                <Text style={styles.dateText}>운영자</Text>
                <Text style={styles.dateText}>•</Text>
                <Text style={styles.dateText}>{format(isEdited ? notice.updatedAt! : notice.publishedAt!, 'yyyy.MM.dd')}</Text>
                {isEdited && (
                  <>
                    <Text style={styles.dateText}>•</Text>
                    <Text style={styles.dateText}>수정됨</Text>
                  </>
                )}
            </View>
          </View>
          
          <Text style={styles.title}>{notice.title}</Text>
        </View>

        {/* 이미지 (있는 경우) */}
        {notice.imageUrl && (
          <View style={styles.imageSection}>
            <Image
              source={
                { uri: notice.imageUrl }
              }
              style={styles.noticeImage}
              resizeMode="cover"
            />
          </View>
        )}

        {/* 본문 내용 */}
        <View style={styles.contentSection}>
          <Text style={styles.content}>{notice.content}</Text>
        </View>

        {/* 액션 버튼 (링크가 있는 경우) */}
        {notice.actionUrl && (
          <TouchableOpacity style={styles.actionButton} onPress={handleActionPress}>
            <Icon name="link-outline" size={20} color={COLORS.accent.blue} />
            <Text style={styles.actionButtonText}>자세히 보기</Text>
            <Icon name="open-outline" size={16} color={COLORS.accent.blue} />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 16,
  },
  errorText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.accent.blue,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  noticeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priorityText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  categoryText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  noticeRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.disabled,
  },
  title: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text.primary,
    fontWeight: '700',
    lineHeight: 32,
  },
  imageSection: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: COLORS.background.secondary,
    width: '100%',
    height: WINDOW_WIDTH,
  },
  noticeImage: {
    width: '100%',
    height: WINDOW_WIDTH,
    backgroundColor: COLORS.background.secondary,
  },
  contentSection: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  content: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    lineHeight: 24,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.accent.blue + '10',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.accent.blue + '30',
  },
  actionButtonText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.accent.blue,
    fontWeight: '600',
  },
});
