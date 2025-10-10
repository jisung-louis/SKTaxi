import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text } from '../components/common/Text';
import { COLORS } from '../constants/colors';
import MapView from 'react-native-maps';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';
import { PartyList } from '../components/section/TaxiTab/PartyList';
import { dummyParties } from '../constants/mock_data/dummyParties'
import { useCurrentLocation } from '../components/section/TaxiTab/hooks/useCurrentLocation';
import { useTaxiBottomSheet } from '../components/section/TaxiTab/hooks/useTaxiBottomSheet';
import { usePartySelection } from '../components/section/TaxiTab/hooks/usePartySelection';
import { BOTTOMSHEET_HANDLE_HEIGHT } from '../constants/constants';

export const TaxiScreen = () => {
  const mapRef = useRef<MapView | null>(null);
  const { location, loading } = useCurrentLocation();
  const { bottomSheetRef, bottomSheetIndex, snapPoints, handleChange } = useTaxiBottomSheet();
  const { selectedPartyId, handleCardPress } = usePartySelection(mapRef, location);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.accent.green} />
          <Text style={{ color: COLORS.text.secondary, marginTop: 16 }}>위치 정보를 불러오는 중...</Text>
        </View>
      ) : location ? (
        <MapView
          ref={mapRef}
          style={{ width: '100%', height: 400 }}
          initialRegion={{
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation={true}
        />
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.text.secondary }}>위치 정보를 가져올 수 없습니다.</Text>
        </View>
      )}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={{ backgroundColor: COLORS.background.primary }}
        handleIndicatorStyle={{ backgroundColor: COLORS.accent.green }}
        handleStyle={{ height: BOTTOMSHEET_HANDLE_HEIGHT }}
        onChange={handleChange}
      >
        <BottomSheetView>
          <PartyList
            parties={dummyParties}
            selectedPartyId={selectedPartyId}
            bottomSheetIndex={bottomSheetIndex}
            onPressParty={(party) => handleCardPress(party)}
          />
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  // Card 관련 스타일은 PartyList로 이동됨
});