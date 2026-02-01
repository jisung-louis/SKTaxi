import { useState } from 'react';
import MapView from 'react-native-maps';

interface LocationLike { latitude: number; longitude: number }

export const usePartySelection = (
  mapRef: React.RefObject<MapView | null>,
  currentLocation: LocationLike | null,
) => {
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);

  const handleCardPress = (party: any) => {
    if (selectedPartyId === party?.id) {
      setSelectedPartyId(null);
      if (currentLocation) {
        mapRef.current?.animateToRegion({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
      return;
    }

    setSelectedPartyId(party?.id);
    const latitude = party?.location?.latitude ?? party?.departure?.lat;
    const longitude = party?.location?.longitude ?? party?.departure?.lng;
    if (typeof latitude === 'number' && typeof longitude === 'number') {
      mapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  return { selectedPartyId, setSelectedPartyId, handleCardPress } as const;
};
