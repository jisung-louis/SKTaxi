// SKTaxi: Firebase 설정 - v22 Modular API
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';

export const ALLOWED_EMAIL_DOMAINS = ['sungkyul.ac.kr'];

// SKTaxi: 모듈식 초기화 - getAuth(), getFirestore() 사용
export const authInstance = getAuth();
export const db = getFirestore();
