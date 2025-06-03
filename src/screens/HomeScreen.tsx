import React, { useEffect, useState, useRef, useMemo } from 'react';
import { View, StyleSheet, Platform, PermissionsAndroid, Dimensions, ActivityIndicator, TouchableOpacity, Animated, ScrollView } from 'react-native';
import { Text } from '../components/common/Text';
import { COLORS } from '../constants/colors';
import Geolocation from 'react-native-geolocation-service';
import MapView from 'react-native-maps';
import BottomSheet, {BottomSheetView} from '@gorhom/bottom-sheet';

interface Location {
  latitude: number;
  longitude: number;
}

const { width, height } = Dimensions.get('window');

const dummyParties = [
  {
    id: '1',
    departureTime: '오전 08:50',
    departure: '가천대 정문',
    destination: 'ai 공학관',
    members: 3,
    maxMembers: 4,
    tags: ['#아침', '#등교', '#빠른출발'],
    location: { latitude: 37.4501, longitude: 127.1287 },
  },
  {
    id: '2',
    departureTime: '오후 01:30',
    departure: '성결대 정문',
    destination: '기숙사',
    members: 2,
    maxMembers: 4,
    tags: ['#점심', '#기숙사', '#여유'],
    location: { latitude: 37.3921, longitude: 126.9487 },
  },
  {
    id: '3',
    departureTime: '오후 06:10',
    departure: '정왕역',
    destination: '가천대',
    members: 4,
    maxMembers: 4,
    tags: ['#퇴근', '#만차', '#정시출발'],
    location: { latitude: 37.3614, longitude: 126.9357 },
  },
  {
    id: '4',
    departureTime: '오전 09:00',
    departure: '수원역',
    destination: '수원시청',
    members: 1,
    maxMembers: 3,
    tags: ['#아침', '#출근', '#빠른출발'],
    location: { latitude: 37.2659, longitude: 127.0004 },
  },
  {
    id: '5',
    departureTime: '오후 02:00',
    departure: '인천대입구역',
    destination: '인천대학교',
    members: 2,
    maxMembers: 4,
    tags: ['#등교', '#여유', '#학생'],
    location: { latitude: 37.3861, longitude: 126.6399 },
  },
  {
    id: '6',
    departureTime: '오후 05:30',
    departure: '강남역',
    destination: '서울역',
    members: 3,
    maxMembers: 4,
    tags: ['#퇴근', '#빠른출발', '#정시출발'],
    location: { latitude: 37.4981, longitude: 127.0276 },
  },
  {
    id: '7',
    departureTime: '오전 10:00',
    departure: '부천역',
    destination: '부천시청',
    members: 1,
    maxMembers: 3,
    tags: ['#아침', '#출근', '#여유'],
    location: { latitude: 37.4854, longitude: 126.7827 },
  },
  {
    id: '8',
    departureTime: '오후 03:00',
    departure: '일산역',
    destination: '일산동구청',
    members: 2,
    maxMembers: 4,
    tags: ['#등교', '#여유', '#학생'],
    location: { latitude: 37.6821, longitude: 126.7698 },
  },
  {
    id: '9',
    departureTime: '오후 07:00',
    departure: '분당역',
    destination: '분당구청',
    members: 3,
    maxMembers: 4,
    tags: ['#퇴근', '#빠른출발', '#정시출발'],
    location: { latitude: 37.3519, longitude: 127.1087 },
  }
];

export const HomeScreen = () => {
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);
  const [bottomSheetIndex, setBottomSheetIndex] = useState(0);
  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['40%', '80%'], []);

  const requestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      const auth = await Geolocation.requestAuthorization('whenInUse');
      return auth === 'granted';
    }
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  };

  const getLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        setLoading(false);
        return;
      }
      Geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLoading(false);
        },
        (error) => {
          console.error('위치 정보를 가져오는데 실패했습니다:', error);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.error('위치 권한 요청 실패:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleCardPress = (party: typeof dummyParties[0],index:number) => {
    if (selectedPartyId === party.id) {
      // 카드가 다시 눌렸을 때 선택 해제 및 현재 위치로 포커스
      setSelectedPartyId(null);
      if (location) {
        mapRef.current?.animateToRegion({
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
      return;
    }

    setSelectedPartyId(party.id);
    mapRef.current?.animateToRegion({
      latitude: party.location.latitude,
      longitude: party.location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.accent.green} />
          <Text style={{ color: COLORS.text.secondary, marginTop: 16 }}>위치 정보를 불러오는 중...</Text>
        </View>
      ) : location ? (
        <MapView
          ref={mapRef}
          style={{ width: '100%', height: height * 0.6 }}
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
        onChange={(index) => {
          if (index > 1) {
            bottomSheetRef.current?.snapToIndex(1);
          } else {
            setBottomSheetIndex(index);
          }
        }}
      >
        <BottomSheetView>
          <Text style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: COLORS.text.primary,
            marginHorizontal: 16,
            marginTop: 8,
            marginBottom: 24,
          }}>
            모집 중인 택시 파티
          </Text>
          <ScrollView
            contentContainerStyle={{ paddingBottom: bottomSheetIndex === 0 ? 520 : 220 }}
            showsVerticalScrollIndicator={false}
          >
          {dummyParties.map((party,index) => {
            const isSelected = selectedPartyId === party.id;
            return (
              <TouchableOpacity
                key={party.id}
                onPress={() => handleCardPress(party,index)}
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
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
};

const styles = StyleSheet.create({
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