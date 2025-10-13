import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PageHeader from '../../components/common/PageHeader';
import { COLORS } from '../../constants/colors';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { TaxiStackParamList } from '../../navigations/types';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import Icon from 'react-native-vector-icons/Ionicons';
import Button from '../../components/common/Button';
import { BOTTOM_TAB_BAR_HEIGHT } from '../../constants/constants';

type AcceptancePendingScreenNavigationProp = NativeStackNavigationProp<TaxiStackParamList, 'AcceptancePending'>;
type AcceptancePendingScreenRouteProp = RouteProp<TaxiStackParamList, 'AcceptancePending'>;

export const AcceptancePendingScreen = () => {
  const navigation = useNavigation<AcceptancePendingScreenNavigationProp>();
  const route = useRoute<AcceptancePendingScreenRouteProp>();
  const { party } = route.params;
  const insets = useSafeAreaInsets();
  const onBack = () => {
    navigation.goBack();
  };
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: BOTTOM_TAB_BAR_HEIGHT + insets.bottom }]}
        showsVerticalScrollIndicator={false}
        >
          {/* 상단 상태 카드 */}
          <View style={styles.statusCard}>
            <View style={styles.statusIconContainer}>
              <Icon name="hourglass-outline" size={32} color={COLORS.accent.green} />
            </View>
            <ActivityIndicator size="large" color={COLORS.accent.green} style={{marginBottom: 16}} />
            <Text style={styles.statusTitle}>수락 대기중</Text>
            <Text style={styles.statusSubtitle}>
              파티장의 동승 요청 수락을{'\n'}
              기다리고 있습니다
            </Text>
            <Button title="취소하기" onPress={onBack} style={styles.button} />
            <Button title="방장과 1:1 채팅" onPress={onBack} style={styles.button} />
          </View>

          {/* 파티 정보 카드 */}
          <View style={styles.partyCard}>
            <Text style={styles.cardTitle}>파티 정보</Text>
            
            <View style={styles.routeContainer}>
              <View style={styles.routeItem}>
                <View style={styles.routeIconContainer}>
                  <Icon name="radio-button-on" size={16} color={COLORS.accent.green} />
                </View>
                <Text style={styles.routeText}>{party.departure}</Text>
              </View>
              
              <View style={styles.routeLine} />
              
              <View style={styles.routeItem}>
                <View style={styles.routeIconContainer}>
                  <Icon name="location" size={16} color={COLORS.accent.green} />
                </View>
                <Text style={styles.routeText}>{party.destination}</Text>
              </View>
            </View>

            <View style={styles.partyDetails}>
              <View style={styles.detailRow}>
                <Icon name="time-outline" size={20} color={COLORS.text.secondary} />
                <Text style={styles.detailLabel}>출발시간</Text>
                <Text style={styles.detailValue}>{party.departureTime}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Icon name="person-outline" size={20} color={COLORS.text.secondary} />
                <Text style={styles.detailLabel}>파티장</Text>
                <Text style={styles.detailValue}>{party.leader}</Text>
              </View>
              
              <View style={styles.detailRow}>
                <Icon name="people-outline" size={20} color={COLORS.text.secondary} />
                <Text style={styles.detailLabel}>인원</Text>
                <Text style={styles.detailValue}>{party.members}/{party.maxMembers}명</Text>
              </View>
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
  content: {
    flexGrow: 1,
    padding: 20,
    gap: 24,
  },
  // 상태 카드 스타일
  statusCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: COLORS.accent.green + '20',
  },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.accent.green + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    ...TYPOGRAPHY.title2,
    color: COLORS.text.primary,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusSubtitle: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },

  // 파티 카드 스타일
  partyCard: {
    backgroundColor: COLORS.background.card,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  cardTitle: {
    ...TYPOGRAPHY.title3,
    color: COLORS.text.primary,
    fontWeight: '600',
    marginBottom: 20,
  },

  // 경로 표시 스타일
  routeContainer: {
    marginBottom: 10,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '500',
    flex: 1,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: COLORS.accent.green + '40',
    marginLeft: 11,
    marginVertical: 4,
  },

  // 파티 상세 정보 스타일
  partyDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailLabel: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    minWidth: 60,
  },
  detailValue: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    fontWeight: '500',
    flex: 1,
  },

  // 로딩 영역 스타일
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    ...TYPOGRAPHY.body2,
    color: COLORS.text.secondary,
    marginTop: 12,
  },
  button: {
    height: 40,
    borderRadius: 12,
    marginTop: 16,
  },
});