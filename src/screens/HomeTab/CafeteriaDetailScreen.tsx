import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import IconFA6 from 'react-native-vector-icons/FontAwesome6';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import PageHeader from '../../components/common/PageHeader';
import { useCafeteriaMenu } from '../../hooks/setting';
import { CAFETERIA_CATEGORIES } from '../../types/cafeteria';
import { useScreenView } from '../../hooks/useScreenView';

export const CafeteriaDetailScreen = () => {
  useScreenView();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<any>();
  const { menu, menuToday, loading, error, weekDisplayName, currentDate } = useCafeteriaMenu();
  
  const scrollViewRef = useRef<ScrollView>(null);
  const [categoryPositions, setCategoryPositions] = useState<{ [key: string]: number }>({});
  const [isContentLoaded, setIsContentLoaded] = useState(false);
  const scrollToCategoryParam = route?.params?.scrollToCategory;

  // 카테고리 위치 저장
  const handleCategoryLayout = (categoryId: string, event: any) => {
    const { y } = event.nativeEvent.layout;
    setCategoryPositions(prev => {
      const newPositions = {
        ...prev,
        [categoryId]: y
      };
      
      // 모든 카테고리 위치가 측정되었는지 확인
      const allCategories = ['rollNoodles', 'theBab', 'fryRice'];
      const allPositionsMeasured = allCategories.every(cat => 
        newPositions[cat] !== undefined
      );
      
      if (allPositionsMeasured) {
        setIsContentLoaded(true);
      }
      
      return newPositions;
    });
  };

  // 카테고리로 스크롤하는 함수 (실제 위치)
  const scrollToCategory = (categoryId: string) => {
    const targetY = categoryPositions[categoryId];
    if (targetY !== undefined && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: targetY - 20, animated: true });
    }
  };

  // 파라미터로 받은 카테고리로 자동 스크롤 (정확한 로딩 완료 감지)
  React.useEffect(() => {
    if (scrollToCategoryParam && isContentLoaded && categoryPositions[scrollToCategoryParam] !== undefined) {
      // 모든 카테고리 위치가 측정되고 콘텐츠가 로드된 후 스크롤
      scrollToCategory(scrollToCategoryParam);
    }
  }, [scrollToCategoryParam, isContentLoaded, categoryPositions]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader onBack={() => navigation.goBack()} title="이번 주 학식" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.accent.red} />
          <Text style={styles.loadingText}>학식 메뉴를 불러오는 중...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !menu || !menuToday) {
    return (
      <SafeAreaView style={styles.container}>
        <PageHeader onBack={() => navigation.goBack()} title="이번 주 학식" />
        <View style={styles.errorContainer}>
          <Icon name="restaurant-outline" size={48} color={COLORS.text.tertiary} />
          <Text style={styles.errorTitle}>학식 메뉴를 불러올 수 없습니다</Text>
          <Text style={styles.errorText}>잠시 후 다시 시도해주세요.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 날짜 포맷팅 (YYYY-MM-DD -> YYYY년 MM월 DD일)
  const formatDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-');
    return `${year}년 ${parseInt(month)}월 ${parseInt(day)}일`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <PageHeader onBack={() => navigation.goBack()} title="이번 주 학식" />
      
      <ScrollView 
        ref={scrollViewRef} 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => {
          // ScrollView 콘텐츠 크기가 변경되었을 때 (렌더링 완료)
          if (scrollToCategoryParam && !isContentLoaded) {
            // 약간의 지연을 두어 onLayout 이벤트가 완료되도록 함
            setTimeout(() => {
              setIsContentLoaded(true);
            }, 100);
          }
        }}
      >
        {/* 주간 정보 */}
        <View style={styles.weekInfo}>
          <Text style={styles.weekTitle}>{weekDisplayName} 학식</Text>
          <Text style={styles.weekDate}>{menu.weekStart} ~ {menu.weekEnd}</Text>
          <Text style={styles.todayDate}>오늘 ({formatDate(currentDate)})</Text>
        </View>

        {/* 메뉴 카테고리별 표시 */}
        {CAFETERIA_CATEGORIES.map((category) => {
          const items = menuToday[category.id as keyof typeof menuToday] as string[];
          return (
            <View 
              key={category.id} 
              style={styles.categorySection}
              onLayout={(event) => handleCategoryLayout(category.id, event)}
            >
              <TouchableOpacity 
                style={styles.categoryHeader}
                onPress={() => scrollToCategory(category.id)}
                activeOpacity={0.7}
              >
                <View style={styles.categoryTitleContainer}>
                    {category.id === 'theBab' ? 
                    <IconFA6 name={category.icon} size={24} color={category.color} /> : 
                    <Icon name={category.icon} size={24} color={category.color} />
                    }
                  <Text style={styles.categoryTitle}>{category.name}</Text>
                </View>
                <View style={styles.categoryRight}>
                  <Text style={styles.categoryCount}>{items.length}개</Text>
                  <Icon name="chevron-up" size={16} color={COLORS.text.secondary} />
                </View>
              </TouchableOpacity>
              
              <View style={styles.menuItems}>
                {items.map((item, index) => {
                  const isTakeout = item.includes('ⓣ');
                  const cleanItemName = item.replace('ⓣ', '').trim();
                  
                  return (
                    <View key={index} style={styles.menuItem}>
                      <View style={[styles.menuItemDot, { backgroundColor: category.color }]} />
                      <Text style={styles.menuItemText}>{cleanItemName}</Text>
                      {isTakeout && (
                        <View style={styles.takeoutBadge}>
                          <Icon name="bag-outline" size={12} color={COLORS.text.buttonText} />
                          <Text style={styles.takeoutText}>테이크아웃</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        {/* 하단 여백 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
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
    paddingHorizontal: 16,
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
    gap: 16,
  },
  errorTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  errorText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
  weekInfo: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
  },
  weekTitle: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text.primary,
    fontWeight: '700',
    marginBottom: 8,
  },
  weekDate: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    marginBottom: 4,
  },
  todayDate: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.accent.green,
    fontWeight: '600',
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
  },
  categoryTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    fontWeight: '600',
  },
  categoryRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryCount: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    backgroundColor: COLORS.background.tertiary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  menuItems: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  menuItemText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    flex: 1,
  },
  takeoutBadge: {
    backgroundColor: COLORS.accent.green,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    shadowColor: COLORS.accent.green,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  takeoutText: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.buttonText,
    fontWeight: '700',
    fontSize: 10,
  },
  bottomSpacer: {
    height: 24,
  },
});
