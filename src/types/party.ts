export interface Party {
  id: string;
  departureTime: string;
  departure: string;
  destination: string;
  members: number;
  maxMembers: number;
  leader: string;
  tags: string[];
  location: { latitude: number; longitude: number };
  description: string; // 상세 위치, 부가 설명 등
}