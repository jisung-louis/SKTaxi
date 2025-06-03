import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { User } from '../types/auth';

// Firebase 인스턴스 (지연 초기화)
let _authInstance: ReturnType<typeof auth> | null = null;
let _firestoreInstance: ReturnType<typeof firestore> | null = null;
let _storageInstance: ReturnType<typeof storage> | null = null;

export const authInstance = () => {
  if (!_authInstance) {
    _authInstance = auth();
  }
  return _authInstance;
};

export const firestoreInstance = () => {
  if (!_firestoreInstance) {
    _firestoreInstance = firestore();
  }
  return _firestoreInstance;
};

export const storageInstance = () => {
  if (!_storageInstance) {
    _storageInstance = storage();
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