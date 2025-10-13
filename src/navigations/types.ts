import { NavigatorScreenParams } from '@react-navigation/native';
import { Party } from '../types/party';

export type RootStackParamList = {
  Main: NavigatorScreenParams<MainTabParamList>;
  Auth: undefined;
};

export type MainTabParamList = {
  홈: undefined;
  택시: undefined;
  게시판: undefined;
  공지: undefined;
};

export type TaxiStackParamList = {
  TaxiMain: undefined;
  AcceptancePending: { party: Party; requestId: string }; // SKTaxi: 요청 문서 id 추가 전달
  Recruit: undefined;
  MapSearch: {
    type: 'departure' | 'destination';
    onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  };
  Chat: { partyId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
}; 