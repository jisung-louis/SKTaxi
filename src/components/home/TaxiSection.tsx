import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import { MainTabParamList } from '../../navigations/types';
import { useParties, useMyParty, usePendingJoinRequest, useJoinRequest } from '../../hooks/party';
import { useAuth } from '../../hooks/auth';
import { formatKoreanAmPmTime } from '../../utils/datetime';
import Button from '../common/Button';
import { logEvent } from '../../lib/analytics';

export const TaxiSection: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const { parties } = useParties();
  const { user } = useAuth();
  const { pendingRequest } = usePendingJoinRequest();
  const { hasParty, partyId: myPartyId } = useMyParty();
  const { createJoinRequest, cancelJoinRequest } = useJoinRequest();

  const handlePartyCardPress = async (party: any) => {
    if (hasParty && party.id !== myPartyId) {
      Alert.alert('알림', '이미 다른 파티에 소속되어 있어요. 파티를 탈퇴하고 다시 요청해주세요.');
      return;
    }

    if (party.id === myPartyId) {
      Alert.alert('알림', '이미 이 파티에 참여하고 있어요.');
      return;
    }

    if (pendingRequest?.partyId === party.id && pendingRequest?.requestId) {
      navigation.navigate('택시', {
        screen: 'AcceptancePending',
        params: { party, requestId: pendingRequest.requestId },
      });
      return;
    }

    if (pendingRequest?.partyId && pendingRequest?.requestId) {
      const confirmCancel = await new Promise<boolean>((resolve) => {
        Alert.alert(
          '동승 요청 취소',
          '이미 동승을 요청한 파티가 있어요. 그 요청을 취소하고 이 파티에 동승요청을 할까요?',
          [
            { text: '취소', style: 'cancel', onPress: () => resolve(false) },
            { text: '확인', onPress: () => resolve(true) },
          ]
        );
      });

      if (!confirmCancel) return;

      // SKTaxi: 기존 요청 취소 (Repository 패턴)
      try {
        await cancelJoinRequest(pendingRequest.requestId);
      } catch (e) {
        console.warn('기존 요청 취소 실패:', e);
      }
    }

    if (party.status === 'open') {
      if (!user?.uid) {
        Alert.alert('오류', '로그인이 필요합니다.');
        return;
      }

      Alert.alert(
        '동승 요청',
        `${party.departure.name} → ${party.destination.name}로 가는 ${formatKoreanAmPmTime(party.departureTime)} 출발 파티에 동승 요청을 할까요?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '요청 보내기',
            onPress: async () => {
              try {
                // SKTaxi: 동승 요청 생성 (Repository 패턴)
                const requestId = await createJoinRequest(party.id, party.leaderId);

                await logEvent('party_join_requested', {
                  party_id: party.id,
                  request_id: requestId,
                });

                Alert.alert('요청 전송', '방장에게 요청을 보냈어요.');

                navigation.navigate('택시', {
                  screen: 'AcceptancePending',
                  params: { party, requestId },
                });
              } catch (error) {
                console.error('동승 요청 전송 실패:', error);
                Alert.alert('오류', '동승 요청 전송에 실패했습니다.');
              }
            },
          },
        ]
      );
    } else if (party.status === 'closed') {
      Alert.alert('알림', '이 파티는 모집이 마감되었어요');
    } else if (party.status === 'arrived') {
      Alert.alert('알림', '이 파티는 이미 목적지에 도착했어요');
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleContainer}>
          <Icon name="car" size={20} color={COLORS.accent.green} />
          <Text style={styles.sectionTitle}>현재 모집중인 택시 파티</Text>
        </View>
        <TouchableOpacity
          style={styles.sectionActionButton}
          onPress={() => navigation.navigate('택시', { screen: 'TaxiMain' })}
        >
          <Text style={styles.sectionAction}>모두 보기</Text>
          <Icon name="chevron-forward" size={16} color={COLORS.accent.green} />
        </TouchableOpacity>
      </View>
      <FlatList
        data={parties}
        keyExtractor={(it) => it.id as string}
        renderItem={({ item }) =>
          <TouchableOpacity
            style={[styles.card, (item.status === 'arrived' || item.status === 'closed') && styles.cardDisabled]}
            activeOpacity={0.8}
            key={item.id as string}
            onPress={() => handlePartyCardPress(item)}
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <View style={styles.routeContainer}>
                  <View style={styles.locationDot} />
                  <Text style={styles.cardTitle}>{item.departure.name}</Text>
                </View>
                <Icon name="arrow-forward" size={16} color={COLORS.text.secondary} />
                <View style={styles.routeContainer}>
                  <View style={[styles.locationDot, styles.destinationDot]} />
                  <Text style={styles.cardTitle}>{item.destination.name}</Text>
                </View>
              </View>
            </View>
            <View style={styles.cardBodyContainer}>
              {item.detail ? (
                <View style={styles.detailContainer}>
                  <Icon name="chatbubble-outline" size={14} color={COLORS.text.secondary} style={{ flex:1 }} />
                  <Text style={[styles.cardSubtitle, { flex: 12 }]} numberOfLines={1}>{item.detail}</Text>
                </View>
              ) : null}
              <View style={styles.statusBadgeContainer}>
                <View style={styles.timeContainer}>
                  <Icon name="time-outline" size={14} color={COLORS.accent.green} />
                  <Text style={styles.cardTimeText}>{formatKoreanAmPmTime(item.departureTime)} 출발</Text>
                </View>
                <View style={[styles.statusBadge, (item.status === 'arrived' || item.status === 'closed') && styles.statusBadgeDisabled]}>
                  <Text style={[styles.statusText, (item.status === 'arrived' || item.status === 'closed') && styles.statusTextDisabled]}>
                    {item.status === 'arrived' ? '도착완료' : item.status === 'closed' ? '모집마감' : `${(item.members.length)}/${item.maxMembers}명`}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        ListEmptyComponent={() =>
          <View style={styles.emptyContainer}>
            <Image source={require('../../../assets/images/empty_taxi_party.png')} style={styles.emptyImage} />
            <View style={styles.emptyTextContainer}>
              <Text style={styles.emptyText}>모집 중인 파티가 없어요</Text>
              <Text style={styles.emptyText}>첫 번째 파티를 만들어보세요!</Text>
              <Button
                title="파티 만들기"
                onPress={() => navigation.navigate('택시', { screen: 'TaxiMain' })}
                size="small"
                style={styles.emptyButton}
              />
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
  card: {
    width: 220,
    height: 130,
    borderRadius: 20,
    backgroundColor: COLORS.background.card,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    padding: 18,
    paddingBottom: 12,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.background.surface,
  },
  cardTitle: {
    ...TYPOGRAPHY.body1,
    fontWeight: '600',
    color: COLORS.text.primary,
    fontSize: 14,
  },
  cardSubtitle: {
    ...TYPOGRAPHY.caption1,
    color: COLORS.text.secondary,
    fontSize: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  routeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.accent.green,
  },
  destinationDot: {
    backgroundColor: COLORS.accent.blue,
  },
  statusBadge: {
    backgroundColor: COLORS.accent.green + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeDisabled: {
    backgroundColor: COLORS.accent.red + '20',
  },
  statusText: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '600',
    color: COLORS.accent.green,
    fontSize: 11,
  },
  statusTextDisabled: {
    color: COLORS.accent.red,
  },
  cardBodyContainer: {
    gap: 8,
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardTimeText: {
    ...TYPOGRAPHY.caption1,
    fontWeight: '600',
    color: COLORS.text.primary,
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  emptyImage: {
    width: 140,
    height: 140,
  },
  emptyTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.secondary,
  },
  emptyButton: {
    marginTop: 16,
    width: '80%',
  },
});
