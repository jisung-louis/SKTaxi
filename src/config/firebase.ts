import { getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const ALLOWED_EMAIL_DOMAINS = ['sungkyul.ac.kr'];
 
// SKTaxi: 모듈식 초기화 - getApp()을 사용
export const authInstance = auth(getApp());
export const db = firestore(getApp());