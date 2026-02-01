// SKTaxi: Inquiry Repository Firestore 구현체

import firestore, {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { getApp } from '@react-native-firebase/app';

import {
  IInquiryRepository,
  Inquiry,
  CreateInquiryData,
} from '../interfaces/IInquiryRepository';

/**
 * Firestore 기반 Inquiry Repository 구현체
 */
export class FirestoreInquiryRepository implements IInquiryRepository {
  private readonly db: FirebaseFirestoreTypes.Module;
  private readonly inquiriesCollection = 'inquiries';

  constructor() {
    this.db = firestore(getApp());
  }

  async submitInquiry(data: CreateInquiryData): Promise<string> {
    const collectionRef = collection(this.db, this.inquiriesCollection);
    
    const docRef = await addDoc(collectionRef, {
      ...data,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  }

  async getInquiriesByUser(userId: string): Promise<Inquiry[]> {
    const collectionRef = collection(this.db, this.inquiriesCollection);
    const q = query(
      collectionRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map((docSnap: FirebaseFirestoreTypes.QueryDocumentSnapshot) => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate() || new Date(),
    } as Inquiry));
  }

  async getInquiry(inquiryId: string): Promise<Inquiry | null> {
    const docRef = doc(this.db, this.inquiriesCollection, inquiryId);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data();
      return {
        id: snapshot.id,
        ...data,
        createdAt: data?.createdAt?.toDate() || new Date(),
      } as Inquiry;
    }

    return null;
  }
}
