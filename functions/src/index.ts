import * as admin from 'firebase-admin';
import { onDocumentCreated, onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { setGlobalOptions } from 'firebase-functions/v2/options';

// SKTaxi: 모든 함수 기본 리전을 Firestore 리전과 동일하게 설정
setGlobalOptions({ region: 'asia-northeast3' });

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

  const resp = await fcm.sendEachForMulticast(message as any);
  // SKTaxi: 실패한 토큰 정리
  const failedTokens: string[] = [];
  resp.responses.forEach((r, idx) => {
    if (!r.success) failedTokens.push((message as any).tokens[idx]);
  });
  if (failedTokens.length) {
    await db.runTransaction(async (tx) => {
      const ref = db.doc(`users/${leaderId}`);
      const snapUser = await tx.get(ref);
      const cur: string[] = (snapUser.get('fcmTokens') || []) as string[];
      const next = cur.filter((t) => !failedTokens.includes(t));
      tx.update(ref, { fcmTokens: next });
    });
  }
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

  const resp2 = await fcm.sendEachForMulticast(message as any);
  // SKTaxi: 실패한 토큰 정리 (멤버 전원)
  const deadTokens: string[] = [];
  resp2.responses.forEach((r, idx) => {
    if (!r.success) deadTokens.push((message as any).tokens[idx]);
  });
  if (deadTokens.length) {
    // 각 멤버 문서에서 죽은 토큰 제거
    await Promise.all(memberIds.map(async (uid) => {
      try {
        const userRef = db.doc(`users/${uid}`);
        const userSnap = await userRef.get();
        const cur: string[] = (userSnap.get('fcmTokens') || []) as string[];
        const next = cur.filter((t) => !deadTokens.includes(t));
        if (next.length !== cur.length) await userRef.update({ fcmTokens: next });
      } catch {}
    }));
  }
});
