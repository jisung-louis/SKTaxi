import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { MainTabParamList } from '../../navigations/types';
import { useNotices, useRecentNotices } from '../../hooks/notice';

export const NoticeSection: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { markAsRead } = useNotices('전체');
  const [noticeType, setNoticeType] = useState<'학교 공지사항' | '내 과 공지사항'>('학교 공지사항');
  const [isNoticeDropdownOpen, setIsNoticeDropdownOpen] = useState(false);

  // SKTaxi: Repository 패턴을 통한 최근 공지사항 조회
  const { notices: recentNotices, loading: loadingNotices } = useRecentNotices(10);

  return (
    <View style={styles.section}>
      <View style={[styles.sectionHeader, { position: 'relative' }]}>
        <View style={styles.sectionTitleContainer}>
          <Icon name="megaphone" size={20} color={COLORS.accent.blue} />
          <TouchableOpacity
            style={styles.sectionDropdownContainer}
            activeOpacity={0.8}
            onPress={() => setIsNoticeDropdownOpen(v => !v)}
          >
            <Text style={styles.sectionTitle}>{noticeType}</Text>
            <Icon
              name={isNoticeDropdownOpen ? 'chevron-up-outline' : 'chevron-down-outline'}
              size={18}
              color={COLORS.text.primary}
            />
          </TouchableOpacity>
        </View>
        {isNoticeDropdownOpen && (
          <View style={styles.dropdownMenu}>
            {(['학교 공지사항'] as const).map(label => (
              <TouchableOpacity
                key={label}
                style={[styles.dropdownItem, noticeType === label && styles.dropdownItemSelected]}
                onPress={() => {
                  setNoticeType(label);
                  setIsNoticeDropdownOpen(false);
                }}
              >
                <Text style={[styles.dropdownItemText, noticeType === label && styles.dropdownItemTextSelected]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <TouchableOpacity
          style={styles.sectionActionButton}
          onPress={() => navigation.navigate('공지', { screen: 'NoticeMain' })}
        >
          <Text style={styles.sectionAction}>모두 보기</Text>
          <Icon name="chevron-forward" size={16} color={COLORS.accent.green} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={recentNotices}
        keyExtractor={(it) => it.id}
        renderItem={({ item }) =>
          <TouchableOpacity
            style={styles.noticeCard}
            activeOpacity={0.8}
            onPress={() => {
              markAsRead(item.id);
              navigation.navigate('공지', { screen: 'NoticeDetail', params: { noticeId: item.id } });
            }}
          >
            <View style={styles.noticeCardHeader}>
              <View style={styles.noticeHeaderLeft}>
                <View style={styles.noticeIconContainer}>
                  <Icon name="document-text" size={16} color={COLORS.accent.blue} />
                </View>
                {!!item.category && (
                  <View style={styles.noticeChip}>
                    <Text style={styles.noticeChipText}>{item.category}</Text>
                  </View>
                )}
              </View>
              <Icon name="chevron-forward" size={16} color={COLORS.text.secondary} />
            </View>

            <Text style={styles.noticeCardTitle} numberOfLines={2}>{item.title}</Text>
            {!!item.content && (
              <Text style={styles.noticeCardSubtitle} numberOfLines={3}>{item.content}</Text>
            )}

            <View style={styles.noticeMetaRow}>
              <View style={styles.noticeMetaLeft}>
                <Icon name="time-outline" size={12} color={COLORS.text.secondary} />
                <Text style={styles.noticeTimeText} numberOfLines={1}>
                  {(() => {
                    try {
                      const d: any = (item as any)?.postedAt;
                      const dt = d?.toDate ? d.toDate() : (d ? new Date(d) : null);
                      return dt ? dt.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit'}) + ' ' + dt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit'}) : '';
                    } catch { return ''; }
                  })()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        snapToInterval={232}
        decelerationRate="fast"
        snapToAlignment="start"
        ListEmptyComponent={() =>
          <View style={styles.emptyContainer}>
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyText}>{loadingNotices ? '공지사항을 불러오는 중...' : '현재 공지 정보가 없습니다.'}</Text>
            </View>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 16,
    gap: 16,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    fontWeight: '700',
  },
  sectionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sectionAction: {
    ...TYPOGRAPHY.body2,
    color: COLORS.accent.green,
    fontWeight: '600',
  },
  sectionDropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 36,
    left: 0,
    backgroundColor: COLORS.background.dropdown,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    paddingVertical: 6,
    minWidth: 180,
    zIndex: 1000,
  },
  dropdownItem: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dropdownItemSelected: {
    backgroundColor: COLORS.accent.green + '20',
  },
  dropdownItemText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  dropdownItemTextSelected: {
    color: COLORS.accent.green,
    fontWeight: '600',
  },
  noticeCard: {
    width: 220,
    height: 180,
    borderRadius: 16,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  noticeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  noticeHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  noticeIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.accent.blue + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noticeChip: {
    backgroundColor: COLORS.accent.blue + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.accent.blue + '40',
  },
  noticeChipText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.accent.blue,
    fontWeight: '700',
  },
  noticeCardTitle: {
    ...TYPOGRAPHY.body1,
    fontWeight: '700',
    color: COLORS.text.primary,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  noticeCardSubtitle: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontSize: 12,
  },
  noticeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  noticeMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  noticeTimeText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontSize: 11,
  },
  emptyContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  emptyTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
});
