import {
  requestLocationPermission,
  useCurrentLocation,
} from '@/shared/hooks';

export function useTaxiLocation() {
  const locationState = useCurrentLocation();

  return {
    ...locationState,
    requestPermission: requestLocationPermission,
  } as const;
}
