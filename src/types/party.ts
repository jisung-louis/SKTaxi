// SKTaxi: Firestore 저장 스키마와 동일하게 Party 타입을 정규화합니다.
// 중복 정의를 피하기 위해 firestore 타입을 재노출합니다.
import { Party as FirestoreParty } from './firestore';

export type Party = FirestoreParty;