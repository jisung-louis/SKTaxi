import React from 'react';
import { View, Text, TouchableOpacity, Animated, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../../constants/colors';
import { TYPOGRAPHY } from '../../../constants/typhograpy';
import { BOTTOMSHEET_HANDLE_HEIGHT } from '../../../constants/constants';
import Icon from 'react-native-vector-icons/Ionicons';

export interface TaxiParty {
  id: string;
  departureTime: string;
  departure: string;
  destination: string;
  members: number;
  maxMembers: number;
  tags: string[];
  location: { latitude: number; longitude: number };
}

interface PartyListProps {
  parties: TaxiParty[];
  selectedPartyId: string | null;
  bottomSheetIndex: number;
  onPressParty: (party: TaxiParty, index: number) => void;
}

export const PartyList: React.FC<PartyListProps> = ({
  parties,
  selectedPartyId,
  bottomSheetIndex,
  onPressParty,
}) => {
  const { top, bottom } = useSafeAreaInsets();
  return (
    <View>
      <View style={[styles.headerContainer, { marginTop: top - BOTTOMSHEET_HANDLE_HEIGHT }]}>
        <Text style={[styles.header]}>모집 중인 택시 파티</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Icon name="chevron-down" size={32} color={COLORS.accent.green} />
        </TouchableOpacity>
      </View>
      <ScrollView
        contentContainerStyle={{ paddingBottom: bottomSheetIndex === 0 ? 520 : 220 }}
        showsVerticalScrollIndicator={false}
      >
        {parties.map((party, index) => {
          const isSelected = selectedPartyId === party.id;
          return (
            <TouchableOpacity
              key={party.id}
              onPress={() => onPressParty(party, index)}
              activeOpacity={0.9}
            >
              <Animated.View
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                ]}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.time}>{party.departureTime}</Text>
                  <Text style={styles.members}>{party.members}/{party.maxMembers}명</Text>
                </View>
                <Text style={styles.place}>{party.departure} → {party.destination}</Text>
                <View style={styles.tags}>
                  {party.tags.map(tag => (
                    <Text key={tag} style={styles.tag}>{tag}</Text>
                  ))}
                </View>
                {isSelected && (
                  <View style={styles.detail}>
                    <Text style={styles.detailText}>상세정보: 출발지({party.departure}), 목적지({party.destination})</Text>
                  </View>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  headerButton: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButtonText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
  },
  header: {
    ...TYPOGRAPHY.title1,
    color: COLORS.text.primary,
  },
  card: {
    backgroundColor: COLORS.background.card,
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
    transform: [{ scale: 1 }],
  },
  cardSelected: {
    borderWidth: 2,
    borderColor: COLORS.accent.green,
    transform: [{ scale: 1.05 }],
    shadowColor: COLORS.accent.green,
    shadowOpacity: 0.2,
    elevation: 4,
  },
  time: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text.primary,
  },
  place: {
    fontSize: 16,
    color: COLORS.text.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  members: {
    fontSize: 16,
    color: COLORS.text.secondary,
    fontWeight: '600',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: COLORS.accent.green,
    color: COLORS.text.buttonText,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 4,
    fontSize: 12,
  },
  detail: {
    marginTop: 12,
    padding: 12,
    backgroundColor: COLORS.background.primary,
    borderRadius: 12,
  },
  detailText: {
    color: COLORS.text.primary,
    fontSize: 14,
  },
});


