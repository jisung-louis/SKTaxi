import { useRef, useState } from 'react';
import MapView from 'react-native-maps';

interface LocationLike {
  latitude: number;
  longitude: number;
}

interface PartyLike {
  id: string;
  location: LocationLike;
}

export const usePartySelection = <T extends PartyLike>(
  mapRef: React.RefObject<MapView | null>,
  currentLocation: LocationLike | null,
) => {
  const [selectedPartyId, setSelectedPartyId] = useState<string | null>(null);

  const handleCardPress = (party: T) => {
    if (selectedPartyId === party.id) {
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

    setSelectedPartyId(party.id);
    mapRef.current?.animateToRegion({
      latitude: party.location.latitude,
      longitude: party.location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  return { selectedPartyId, setSelectedPartyId, handleCardPress } as const;
};


