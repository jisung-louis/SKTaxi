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
  AcceptancePending: { party: Party }; // party 객체를 파라미터로 받음
  Recruit: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
}; 