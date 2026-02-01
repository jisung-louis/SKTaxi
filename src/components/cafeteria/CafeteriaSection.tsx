import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import IconFA6 from 'react-native-vector-icons/FontAwesome6';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { useCafeteriaMenu } from '../../hooks/setting';
import { CAFETERIA_CATEGORIES } from '../../types/cafeteria';

export const CafeteriaSection = () => {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { menu, menuToday, loading, error, weekDisplayName } = useCafeteriaMenu();

  const handleViewAll = () => {
    navigation.navigate('CafeteriaDetail');
  };

  const handleCategoryPress = (categoryId: string) => {
    navigation.navigate('CafeteriaDetail', { scrollToCategory: categoryId });
  };

  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="restaurant" size={20} color={COLORS.accent.red} />
            <Text style={styles.sectionTitle}>이번 주 학식</Text>
          </View>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.accent.red} />
          <Text style={styles.loadingText}>학식 메뉴를 불러오는 중...</Text>
        </View>
      </View>
    );
  }

  if (error || !menu || !menuToday) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Icon name="restaurant" size={20} color={COLORS.accent.red} />
            <Text style={styles.sectionTitle}>이번 주 학식</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>이번 주 학식 메뉴 정보가 아직 없어요.</Text>
          <Text style={styles.emptySubtext}>조금만 기다려주세요!</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Icon name="restaurant" size={20} color={COLORS.accent.red} />
          <Text style={styles.sectionTitle}>이번 주 학식</Text>
        </View>
        <TouchableOpacity style={styles.sectionActionButton} onPress={handleViewAll}>
          <Text style={styles.sectionAction}>자세히 보기</Text>
          <Icon name="chevron-forward" size={16} color={COLORS.accent.green} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.weekInfo}>
        <Text style={styles.weekText}>{weekDisplayName} • {menu.weekStart.slice(5, 7)}월 {menu.weekStart.slice(8, 10)}일 ~ {menu.weekEnd.slice(5, 7)}월 {menu.weekEnd.slice(8, 10)}일</Text>
      </View>

      <View style={styles.menuPreview}>
        {CAFETERIA_CATEGORIES.map((category) => {
          const items = menuToday[category.id as keyof typeof menuToday] as string[];
          return (
            <TouchableOpacity key={category.id} style={styles.categoryItem} activeOpacity={0.7} onPress={() => handleCategoryPress(category.id)}>
              <View style={styles.categoryHeader}>
                {category.id === 'theBab' ? 
                <IconFA6 name={category.icon} size={16} color={category.color} /> : 
                <Icon name={category.icon} size={16} color={category.color} />
                }
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>({items.length}개)</Text>
              </View>
              <View style={styles.menuItems}>
                {items.slice(0, 3).map((item, index) => {
                  const isTakeout = item.includes('ⓣ');
                  const cleanItemName = item.replace('ⓣ', '').trim();
                  
                  return (
                    <View key={index} style={styles.menuItemRow}>
                      <Text style={styles.menuItem} numberOfLines={1}>
                        • {cleanItemName}
                      </Text>
                      {isTakeout && (
                        <View style={styles.takeoutBadge}>
                          <Icon name="bag-outline" size={10} color={COLORS.text.buttonText} />
                          <Text style={styles.takeoutText}>테이크아웃</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
                {items.length > 3 && (
                  <Text style={styles.moreText}>+{items.length - 3}개 더</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
  weekInfo: {
    marginBottom: 16,
  },
  weekText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontWeight: '500',
  },
  menuPreview: {
    gap: 12,
  },
  categoryItem: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 12,
    padding: 16,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  categoryName: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  categoryCount: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
  },
  menuItems: {
    gap: 4,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuItem: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    flex: 1,
  },
  takeoutBadge: {
    backgroundColor: COLORS.accent.green,
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    shadowColor: COLORS.accent.green,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  takeoutText: {
    ...TYPOGRAPHY.caption2,
    color: COLORS.text.buttonText,
    fontWeight: '700',
    fontSize: 9,
  },
  moreText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.accent.blue,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 20,
  },
  loadingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  emptySubtext: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.tertiary,
  },
});
