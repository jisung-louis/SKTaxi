import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, ScrollView, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import PageHeader from '../../../components/common/PageHeader';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { getFirestore, collection, query, orderBy, onSnapshot } from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { ja, ko } from 'date-fns/locale';

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

export const AppNoticeScreen = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const [notices, setNotices] = useState<AppNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirestore();
    const noticesRef = collection(db, 'appNotices');
    const q = query(noticesRef, orderBy('publishedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot: FirebaseFirestoreTypes.QuerySnapshot) => {
      const noticesData: AppNotice[] = [];
      snapshot.forEach((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => {
        const data: any = docSnap.data();
        noticesData.push({
          id: docSnap.id,
          ...data,
          publishedAt: data.publishedAt?.toDate() || new Date(),
          updatedAt: data.updatedAt ? data.updatedAt.toDate?.() || new Date(data.updatedAt) : undefined,
        } as AppNotice);
      });
      setNotices(noticesData);
      setLoading(false);
    }, (error) => {
      console.error('공지사항 로드 실패:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredNotices = selectedCategory 
    ? notices.filter(notice => notice.category === selectedCategory)
    : notices;

  const NoticeItem = ({ notice }: { notice: AppNotice }) => (
    <TouchableOpacity 
      style={styles.noticeItem}
      onPress={() => navigation.navigate('AppNoticeDetail', { noticeId: notice.id })}
    >
      <View style={styles.noticeHeader}>
        <View style={styles.noticeLeft}>
          <View style={[styles.priorityBadge, { backgroundColor: PRIORITY_COLORS[notice.priority] }]}>
            <Text style={styles.priorityText}>{PRIORITY_LABELS[notice.priority]}</Text>
          </View>
          <Text style={styles.categoryText}>{CATEGORY_LABELS[notice.category]}</Text>
        </View>
        <View style={styles.dateContainer}>
          <Text style={styles.dateText}>
            {formatDistanceToNow(notice.publishedAt, { addSuffix: true, locale: ko })}
          </Text>
          {!!notice.updatedAt && notice.updatedAt > notice.publishedAt && (
            <>
              <Text style={styles.dateText}>•</Text>
              <Text style={styles.dateText}>수정됨</Text>
            </>
          )}
        </View>
      </View>
      <Text style={styles.noticeTitle} numberOfLines={1} ellipsizeMode="tail">{notice.title}</Text>
      <Text style={styles.noticeContent} numberOfLines={2}>
        {notice.content}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader onBack={() => navigation.goBack()} title="앱 공지사항" borderBottom />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent.blue} />
          <Text style={styles.loadingText}>공지사항을 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader onBack={() => navigation.goBack()} title="앱 공지사항" borderBottom />
      
      {/* 카테고리 필터 */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity
            style={[styles.filterButton, !selectedCategory && styles.filterButtonActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.filterButtonText, !selectedCategory && styles.filterButtonTextActive]}>
              전체
            </Text>
          </TouchableOpacity>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <TouchableOpacity
              key={key}
              style={[styles.filterButton, selectedCategory === key && styles.filterButtonActive]}
              onPress={() => setSelectedCategory(selectedCategory === key ? null : key)}
            >
              <Text style={[styles.filterButtonText, selectedCategory === key && styles.filterButtonTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* 공지사항 목록 */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentContainer}>
        {filteredNotices.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="document-outline" size={48} color={COLORS.text.disabled} />
            <Text style={styles.emptyText}>공지사항이 없습니다</Text>
          </View>
        ) : (
          filteredNotices.map((notice) => (
            <NoticeItem key={notice.id} notice={notice} />
          ))
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
  filterContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border.default,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.background.secondary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  filterButtonActive: {
    backgroundColor: COLORS.accent.blue + '15',
    borderColor: COLORS.accent.blue,
  },
  filterButtonText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: COLORS.accent.blue,
    fontWeight: '600',
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  noticeItem: {
    backgroundColor: COLORS.background.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  noticeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noticeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  categoryText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.disabled,
  },
  noticeTitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 22,
    flex: 1,
    minWidth: 0,
  },
  noticeContent: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.disabled,
  },
});