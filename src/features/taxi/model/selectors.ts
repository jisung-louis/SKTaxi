import { Party } from './types';

export const getPartyCreatedAtMs = (party: Party): number => {
  const createdAt = (party as any).createdAt;

  if (!createdAt) {
    return 0;
  }

  if (typeof createdAt === 'number') {
    return createdAt;
  }

  if (typeof createdAt?.toMillis === 'function') {
    return createdAt.toMillis();
  }

  const parsed = new Date(createdAt);
  return Number.isFinite(parsed.getTime()) ? parsed.getTime() : 0;
};

export const getPartyTimeRemainingText = (departureTime: string): string => {
  const now = new Date();
  const departure = new Date(departureTime);
  const diffMs = departure.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);
  const remainingMinutes = diffMinutes % 60;

  if (diffMs <= 0) {
    return `출발 시간이 ${-diffMinutes}분 지났어요`;
  }

  if (diffHours > 0) {
    return `출발 시간이 ${diffHours}시간 ${remainingMinutes}분 남았어요`;
  }

  return `출발 시간이 ${diffMinutes}분 남았어요`;
};

export const getPartyTitle = (party: Party | null): string => {
  if (!party) {
    return '채팅';
  }

  const departureName = party.departure?.name;
  const destinationName = party.destination?.name;

  if (!departureName || !destinationName) {
    return '채팅';
  }

  return `${departureName} → ${destinationName} 택시 파티`;
};

const toRad = (degree: number) => (degree * Math.PI) / 180;

export const getDistanceMeters = (
  latitudeA?: number,
  longitudeA?: number,
  latitudeB?: number,
  longitudeB?: number,
): number => {
  if (
    [latitudeA, longitudeA, latitudeB, longitudeB].some(
      value => typeof value !== 'number' || !Number.isFinite(value as number),
    )
  ) {
    return Number.POSITIVE_INFINITY;
  }

  const earthRadius = 6371000;
  const deltaLatitude = toRad((latitudeB as number) - (latitudeA as number));
  const deltaLongitude = toRad((longitudeB as number) - (longitudeA as number));
  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(toRad(latitudeA as number)) *
      Math.cos(toRad(latitudeB as number)) *
      Math.sin(deltaLongitude / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
};
