import { getApp } from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
// SKTaxi: FCM 토큰 저장을 위한 messaging 의존성 사용을 대비해 lib 경로 통일 유지
import { User } from '../types/auth';

// Firebase 인스턴스 (지연 초기화)
let _authInstance: ReturnType<typeof auth> | null = null;
let _firestoreInstance: ReturnType<typeof firestore> | null = null;
let _storageInstance: ReturnType<typeof storage> | null = null;

export const authInstance = () => {
  if (!_authInstance) {
    // SKTaxi: RNFirebase v22 권고에 따라 getApp()으로 초기화
    _authInstance = auth(getApp());
  }
  return _authInstance;
};

export const firestoreInstance = () => {
  if (!_firestoreInstance) {
    // SKTaxi: getApp()으로 Firestore 인스턴스 생성
    _firestoreInstance = firestore(getApp());
  }
  return _firestoreInstance;
};

export const storageInstance = () => {
  if (!_storageInstance) {
    // SKTaxi: getApp()으로 Storage 인스턴스 생성
    _storageInstance = storage(getApp());
  }
  return _storageInstance;
};

// 사용자 프로필 가져오기
export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const userDoc = await firestoreInstance().collection('users').doc(uid).get();
    if (!userDoc.exists) return null;
    return userDoc.data() as User;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// 사용자 프로필 업데이트
export const updateUserProfile = async (uid: string, data: Partial<User>): Promise<void> => {
  try {
    await firestoreInstance().collection('users').doc(uid).update(data);
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// 사용자 프로필 생성
export const createUserProfile = async (uid: string, data: User): Promise<void> => {
  try {
    await firestoreInstance().collection('users').doc(uid).set(data);
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}; 