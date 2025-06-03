import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const ALLOWED_EMAIL_DOMAINS = ['sungkyul.ac.kr'];
 
export const authInstance = auth();
export const db = firestore(); 