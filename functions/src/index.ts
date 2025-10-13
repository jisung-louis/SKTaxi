import * as admin from 'firebase-admin';
import { onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore';

admin.initializeApp();
const db = admin.firestore();
const fcm = admin.messaging();

export const onJoinRequestCreate = onDocumentCreated('joinRequests/{requestId}', async (event) => {
  const snap = event.data;
  if (!snap) return;
  const req = snap.data() as any;
  const leaderId = req?.leaderId as string | undefined;
  if (!leaderId) return;

  const userDoc = await db.doc(`users/${leaderId}`).get();
  const tokens: string[] = (userDoc.get('fcmTokens') || []) as string[];
  if (!tokens.length) return;

  const message = {
    tokens,
    notification: {
      title: '동승 요청이 도착했어요',
      body: '앱에서 확인하고 수락/거절을 선택해주세요.',
    },
    data: {
      type: 'join_request',
      partyId: String(req?.partyId || ''),
      requestId: String(event.params.requestId || ''),
      requesterId: String(req?.requesterId || ''),
    },
    apns: { payload: { aps: { sound: 'default' } } },
    android: { priority: 'high' as const },
  };

  await fcm.sendEachForMulticast(message as any);
});

// SKTaxi: 파티 삭제 시 멤버들에게 알림 전송
export const onPartyDelete = onDocumentDeleted('parties/{partyId}', async (event) => {
  const snap = event.data;
  if (!snap) return;
  const partyData = snap.data() as any;
  const members = partyData?.members as string[] | undefined;
  const leaderId = partyData?.leaderId as string | undefined;
  
  if (!members || !Array.isArray(members) || members.length <= 1) return; // 리더만 있으면 알림 불필요

  // SKTaxi: 리더를 제외한 멤버들에게만 알림 전송
  const memberIds = members.filter((memberId: string) => memberId !== leaderId);
  if (memberIds.length === 0) return;

  // SKTaxi: 멤버들의 FCM 토큰 수집
  const tokens: string[] = [];
  for (const memberId of memberIds) {
    try {
      const userDoc = await db.doc(`users/${memberId}`).get();
      const userTokens = (userDoc.get('fcmTokens') || []) as string[];
      tokens.push(...userTokens);
    } catch (error) {
      console.error(`Error getting tokens for user ${memberId}:`, error);
    }
  }

  if (tokens.length === 0) return;

  const message = {
    tokens,
    notification: {
      title: '파티가 해체되었어요',
      body: '리더가 파티를 해체했습니다.',
    },
    data: {
      type: 'party_deleted',
      partyId: String(event.params.partyId || ''),
    },
    apns: { payload: { aps: { sound: 'default' } } },
    android: { priority: 'high' as const },
  };

  await fcm.sendEachForMulticast(message as any);
});
