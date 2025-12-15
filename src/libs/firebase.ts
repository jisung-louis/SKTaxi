import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
// SKTaxi: FCM 토큰 저장을 위한 messaging 의존성 사용을 대비해 lib 경로 통일 유지
import { User } from '../types/auth';

// Firebase 인스턴스 (지연 초기화)
let _authInstance: ReturnType<typeof getAuth> | null = null;
let _firestoreInstance: ReturnType<typeof getFirestore> | null = null;
let _storageInstance: ReturnType<typeof storage> | null = null;

export const authInstance = () => {
  if (!_authInstance) {
    // SKTaxi: RNFirebase v22 권고에 따라 getApp()으로 초기화
    _authInstance = getAuth(getApp());
  }
  return _authInstance;
};

export const firestoreInstance = () => {
  if (!_firestoreInstance) {
    // SKTaxi: getApp()으로 Firestore 인스턴스 생성
    _firestoreInstance = getFirestore(getApp());
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

// 닉네임 중복 여부 검증
export const assertDisplayNameAvailable = async (rawDisplayName: string): Promise<void> => {
  const displayName = rawDisplayName.trim();
  if (!displayName) {
    throw new Error('닉네임을 입력해주세요.');
  }

  const current = authInstance()?.currentUser;
  if (!current) {
    throw new Error('로그인이 필요합니다.');
  }

  try {
    const db = firestoreInstance();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('displayName', '==', displayName));
    const snap = await getDocs(q);

    const conflict = snap.docs.find(
      (docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => docSnap.id !== current.uid
    );
    if (conflict) {
      throw new Error('이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
    }
  } catch (error) {
    // Firestore 에러가 아닌, 중복 에러는 그대로 위에서 던짐
    if (error instanceof Error && error.message.includes('이미 사용 중인 닉네임')) {
      throw error;
    }
    console.error('Error checking displayName duplication:', error);
    throw new Error('닉네임 중복 확인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
};

// 사용자 프로필 가져오기
export const getUserProfile = async (uid: string): Promise<User | null> => {
  try {
    const db = firestoreInstance();
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) return null;
    return userDoc.data() as User;
  } catch (error) {
    console.error('Error getting user profile:', error);
    return null;
  }
};

// 사용자 프로필 업데이트
export const updateUserProfile = async (uid: string, data: Partial<User>): Promise<void> => {
  try {
    const db = firestoreInstance();
    await updateDoc(doc(db, 'users', uid), { ...data, updatedAt: serverTimestamp() });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// 사용자 프로필 생성
export const createUserProfile = async (uid: string, data: User): Promise<void> => {
  try {
    const db = firestoreInstance();
    const current = authInstance()?.currentUser;

    // 안전 가드: 로그인되어 있고, 본인 uid에만 작성
    if (!current || current.uid !== uid) {
      console.error('createUserProfile: auth mismatch or not signed in', { currentUid: current?.uid, targetUid: uid });
      throw new Error('Not signed in or UID mismatch');
    }
    console.log('📍 Firestore path:', `users/${uid}`);
    const dbAppName = (db as any).app?.name || 'unknown';
    console.log('🔥 Firestore App Name:', dbAppName);
    await setDoc(
      doc(db, 'users', uid),
      {
        ...data,
        onboarding: {
          permissionsComplete: (data as any)?.onboarding?.permissionsComplete ?? false,
        },
        joinedAt: (data as any).joinedAt ?? serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};