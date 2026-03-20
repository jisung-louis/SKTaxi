import React from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {
  Marker,
  type MapPressEvent,
  type Region,
} from 'react-native-maps';
import {CommonActions, useNavigation, useRoute} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';

import {
  COLORS,
  RADIUS,
  SHADOWS,
  SPACING,
} from '@/shared/design-system/tokens';
import {useScreenView} from '@/shared/hooks';

import {useTaxiLocation} from '../hooks/useTaxiLocation';
import type {TaxiStackParamList} from '../model/navigation';

type TaxiLocationPickerNavigationProp = NativeStackNavigationProp<
  TaxiStackParamList,
  'TaxiLocationPicker'
>;

const DEFAULT_REGION: Region = {
  latitude: 37.38965,
  latitudeDelta: 0.02,
  longitude: 126.9325,
  longitudeDelta: 0.02,
};

const getScreenCopy = (kind: 'departure' | 'destination') => {
  if (kind === 'departure') {
    return {
      confirmLabel: '출발지로 선택',
      title: '출발지 선택',
      tooltip: '지도를 눌러 출발 위치를 정확히 선택해주세요.',
    };
  }

  return {
    confirmLabel: '도착지로 선택',
    title: '도착지 선택',
    tooltip: '지도를 눌러 도착 위치를 정확히 선택해주세요.',
  };
};

export const TaxiLocationPickerScreen = () => {
  useScreenView();

  const navigation = useNavigation<TaxiLocationPickerNavigationProp>();
  const route =
    useRoute<
      NativeStackScreenProps<TaxiStackParamList, 'TaxiLocationPicker'>['route']
    >();
  const {location} = useTaxiLocation();
  const {initialLocation, initialName, kind} = route.params;
  const [selectedLocation, setSelectedLocation] = React.useState(
    initialLocation ?? null,
  );

  const copy = React.useMemo(() => getScreenCopy(kind), [kind]);

  const initialRegion = React.useMemo<Region>(() => {
    if (selectedLocation) {
      return {
        latitude: selectedLocation.lat,
        latitudeDelta: DEFAULT_REGION.latitudeDelta,
        longitude: selectedLocation.lng,
        longitudeDelta: DEFAULT_REGION.longitudeDelta,
      };
    }

    if (location) {
      return {
        latitude: location.latitude,
        latitudeDelta: DEFAULT_REGION.latitudeDelta,
        longitude: location.longitude,
        longitudeDelta: DEFAULT_REGION.longitudeDelta,
      };
    }

    return DEFAULT_REGION;
  }, [location, selectedLocation]);

  const handlePressMap = React.useCallback(
    (event: MapPressEvent) => {
      setSelectedLocation({
        lat: event.nativeEvent.coordinate.latitude,
        lng: event.nativeEvent.coordinate.longitude,
        name: initialName.trim(),
      });
    },
    [initialName],
  );

  const handleConfirm = React.useCallback(() => {
    const normalizedName = initialName.trim();

    if (!normalizedName) {
      Alert.alert(
        '위치명 입력 필요',
        '이전 화면에서 위치명을 먼저 입력한 뒤 다시 지도에서 선택해주세요.',
      );
      return;
    }

    if (!selectedLocation) {
      return;
    }

    navigation.dispatch(
      CommonActions.navigate({
        merge: true,
        name: 'Recruit',
        params: {
          selection: {
            kind,
            location: {
              ...selectedLocation,
              name: normalizedName,
            },
          },
          selectionToken: `${kind}-${Date.now()}`,
        },
      }),
    );
    navigation.goBack();
  }, [initialName, kind, navigation, selectedLocation]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity
          accessibilityLabel="뒤로 가기"
          accessibilityRole="button"
          activeOpacity={0.84}
          onPress={navigation.goBack}
          style={styles.headerButton}>
          <Icon color={COLORS.text.primary} name="arrow-back" size={22} />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{copy.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.noticeBanner}>
        <Icon color={COLORS.status.success} name="location" size={18} />
        <Text style={styles.noticeLabel}>{copy.tooltip}</Text>
      </View>

      <View style={styles.mapWrap}>
        <MapView
          initialRegion={initialRegion}
          onPress={handlePressMap}
          style={StyleSheet.absoluteFill}>
          {selectedLocation ? (
            <Marker
              coordinate={{
                latitude: selectedLocation.lat,
                longitude: selectedLocation.lng,
              }}
              pinColor={COLORS.brand.primary}
              title={initialName.trim() || copy.title}
            />
          ) : null}
        </MapView>
      </View>

      <View style={styles.bottomCardWrap}>
        <View style={styles.bottomCard}>
          <Text style={styles.cardLabel}>
            {selectedLocation ? '선택된 위치' : '아직 위치를 선택하지 않았어요'}
          </Text>

          {selectedLocation ? (
            <>
              <Text style={styles.cardTitle}>{initialName.trim()}</Text>
              <Text style={styles.cardMeta}>
                {`${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`}
              </Text>
            </>
          ) : (
            <Text style={styles.cardDescription}>
              지도를 탭해서 정확한 좌표를 지정해주세요.
            </Text>
          )}
        </View>

        <TouchableOpacity
          accessibilityRole="button"
          activeOpacity={selectedLocation ? 0.88 : 1}
          disabled={!selectedLocation}
          onPress={handleConfirm}
          style={[
            styles.confirmButton,
            !selectedLocation && styles.confirmButtonDisabled,
          ]}>
          <Text
            style={[
              styles.confirmButtonLabel,
              !selectedLocation && styles.confirmButtonLabelDisabled,
            ]}>
            {copy.confirmLabel}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bottomCard: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderColor: COLORS.border.subtle,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    gap: 6,
    padding: SPACING.lg,
    ...SHADOWS.raised,
  },
  bottomCardWrap: {
    backgroundColor: 'transparent',
    gap: SPACING.md,
    left: SPACING.lg,
    position: 'absolute',
    right: SPACING.lg,
    bottom: SPACING.lg,
  },
  cardDescription: {
    color: COLORS.text.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  cardLabel: {
    color: COLORS.text.muted,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  },
  cardMeta: {
    color: COLORS.text.secondary,
    fontSize: 13,
    lineHeight: 18,
  },
  cardTitle: {
    color: COLORS.text.primary,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  confirmButton: {
    alignItems: 'center',
    backgroundColor: COLORS.accent.blue,
    borderRadius: RADIUS.lg,
    height: 52,
    justifyContent: 'center',
    ...SHADOWS.floating,
  },
  confirmButtonDisabled: {
    backgroundColor: COLORS.background.subtle,
    shadowOpacity: 0,
  },
  confirmButtonLabel: {
    color: COLORS.text.inverse,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
  },
  confirmButtonLabelDisabled: {
    color: COLORS.text.muted,
  },
  container: {
    backgroundColor: COLORS.background.page,
    flex: 1,
  },
  header: {
    alignItems: 'center',
    backgroundColor: COLORS.background.page,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerButton: {
    alignItems: 'center',
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  headerSpacer: {
    width: 36,
  },
  headerTitle: {
    color: COLORS.text.primary,
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 26,
  },
  mapWrap: {
    flex: 1,
    overflow: 'hidden',
  },
  noticeBanner: {
    alignItems: 'center',
    backgroundColor: COLORS.brand.primaryTint,
    borderBottomColor: COLORS.border.accent,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
  },
  noticeLabel: {
    color: COLORS.status.success,
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
});
