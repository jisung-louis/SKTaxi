import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Alert, TouchableOpacity, Text, TextInput, Platform, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import MapView, { Marker, Region } from 'react-native-maps';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typhograpy';
import Button from '../../components/common/Button';
import PageHeader from '../../components/common/PageHeader';
import { useCurrentLocation } from '../../hooks/common/useCurrentLocation';
import { useScreenView } from '../../hooks/useScreenView';

interface MapSearchScreenProps {
  navigation: any;
  route: {
    params: {
      type: 'departure' | 'destination';
      onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
    };
  };
}

export const MapSearchScreen: React.FC<MapSearchScreenProps> = ({ navigation, route }) => {
  useScreenView();
  const { type, onLocationSelect } = route.params;
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();
  
  // 기본 위치: 초기에는 성결대 근처, 마운트 시 현재 위치로 이동
  const [region, setRegion] = useState<Region>({
    latitude: 37.38131,
    longitude: 126.9288,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const { location } = useCurrentLocation();

  useEffect(() => {
    if (!location) return;
    const next: Region = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(next);
    requestAnimationFrame(() => {
      mapRef.current?.animateToRegion(next, 400);
    });
  }, [location]);
  
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address: string;
  } | null>(null);
  const [regionName, setRegionName] = useState('');

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({
      latitude,
      longitude,
      address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, // 간단한 주소 표시
    });
  };

  const handleConfirm = () => {
    if (!selectedLocation) {
      Alert.alert('알림', '지도에서 위치를 선택해주세요.');
      return;
    }
    if (!regionName.trim()) {
      Alert.alert('알림', '지역 명칭을 입력해주세요.');
      return;
    }
    const address = regionName.trim();
    onLocationSelect({ ...selectedLocation, address });
    navigation.goBack();
  };

  const onBack = () => {
    navigation.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <PageHeader 
            onBack={onBack}
            title={type === 'departure' ? '출발지 선택' : '도착지 선택'}
            style={{padding: 16}}
        />
        
        <View style={styles.mapContainer}>
            <MapView
            ref={mapRef}
            style={styles.map}
            region={region}
            onRegionChangeComplete={setRegion}
            onPress={handleMapPress}
            showsUserLocation={true}
            showsMyLocationButton={true}
            >
            {selectedLocation && (
                <Marker
                coordinate={selectedLocation}
                title="선택된 위치"
                description={selectedLocation.address}
                />
            )}
            </MapView>
        </View>

            <KeyboardAvoidingView 
            style={styles.bottomContainer}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 140 : 0}
            >
            <View style={styles.selectedLocationNameContainer}>
            <TextInput
                style={styles.selectedLocationNameText}
                value={regionName}
                onChangeText={(text) => {
                    if (text.length <= 5) {
                        setRegionName(text);
                    }
                }}
                placeholder={type === 'departure' ? '출발지 지역 명칭을 입력하세요 (최대 5글자)' : '도착지 지역 명칭을 입력하세요 (최대 5글자)'}
                placeholderTextColor={COLORS.text.secondary}
                maxLength={5}
            />
            </View>
            
            <View style={styles.buttonContainer}>
            <Button
                title="취소"
                onPress={onBack}
                style={styles.cancelButton}
                textStyle={styles.cancelButtonText}
            />
            <Button
                title="확인"
                onPress={handleConfirm}
                style={styles.confirmButton}
            />
            </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background.card,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.border.default,
    zIndex: 10000000,
    height: 180,
  },
  selectedLocationNameContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: COLORS.background.primary,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border.default,
    minHeight: 45,
  },
  selectedLocationNameText: {
    ...TYPOGRAPHY.body1,
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
    borderWidth: 1,
    borderColor: COLORS.border.default,
  },
  cancelButtonText: {
    color: COLORS.text.primary,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.accent.green,
  },
});
