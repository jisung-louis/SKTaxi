// SKTaxi: 회원탈퇴 유틸 - v22 Modular API

import {
  getFirestore,
  doc,
  getDocs,
  collection,
  query,
  where,
  writeBatch,
  deleteDoc,
  serverTimestamp,
  arrayRemove,
} from '@react-native-firebase/firestore';
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

type DocumentSnapshot = FirebaseFirestoreTypes.QueryDocumentSnapshot;
import {
  getAuth,
  GoogleAuthProvider,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const BATCH_SIZE = 450; // Firestore 배치 제한 (500개) 여유를 두고 450개

// Firebase 인스턴스
const db = getFirestore();
const auth = getAuth();

/**
 * 사용자 문서 및 하위 컬렉션 삭제
 */
async function deleteUserDocument(uid: string): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);

    // 하위 컬렉션: chatRoomNotifications
    const chatRoomNotificationsRef = collection(userRef, 'chatRoomNotifications');
    const chatRoomNotificationsSnap = await getDocs(chatRoomNotificationsRef);

    if (!chatRoomNotificationsSnap.empty) {
      const batch = writeBatch(db);
      chatRoomNotificationsSnap.docs.forEach((docSnap: DocumentSnapshot) => batch.delete(docSnap.ref));
      await batch.commit();
      console.log(`✅ chatRoomNotifications ${chatRoomNotificationsSnap.size}개 삭제 완료`);
    }

    // 사용자 문서 삭제
    await deleteDoc(userRef);
    console.log(`✅ 사용자 문서 삭제 완료: ${uid}`);
  } catch (error) {
    console.warn('⚠️ 사용자 문서 삭제 실패:', error);
    throw error;
  }
}

/**
 * 모든 채팅방에서 사용자 제거
 */
async function removeFromChatRooms(uid: string): Promise<void> {
  try {
    const chatRoomsRef = collection(db, 'chatRooms');
    const q = query(chatRoomsRef, where('members', 'array-contains', uid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log('ℹ️ 참여 중인 채팅방이 없습니다.');
      return;
    }

    const batch = writeBatch(db);
    snapshot.docs.forEach((docSnap: DocumentSnapshot) => {
      batch.update(docSnap.ref, {
        members: arrayRemove(uid),
        updatedAt: serverTimestamp(),
      });
    });

    await batch.commit();
    console.log(`✅ ${snapshot.size}개 채팅방에서 제거 완료`);
  } catch (error) {
    console.warn('⚠️ 채팅방 제거 실패:', error);
    // 실패해도 계속 진행
  }
}

/**
 * 택시 파티 관련 데이터 처리
 */
async function handlePartyMembership(uid: string): Promise<void> {
  try {
    // 1. 리더인 파티 처리
    const partiesRef = collection(db, 'parties');
    const leaderPartiesQuery = query(partiesRef, where('leaderId', '==', uid));
    const leaderPartiesSnap = await getDocs(leaderPartiesQuery);

    if (!leaderPartiesSnap.empty) {
      // 리더인 파티는 하드 삭제 대신 종료 상태로 전환 (소프트 삭제)
      const batch = writeBatch(db);
      leaderPartiesSnap.docs.forEach((docSnap: DocumentSnapshot) => {
        batch.update(docSnap.ref, {
          status: 'ended',
          endReason: 'withdrawed',
          endedAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
      console.log(`✅ 리더인 파티 ${leaderPartiesSnap.size}개 종료(ended) 처리 완료`);
    }

    // 2. 멤버인 파티에서 제거
    const memberPartiesQuery = query(partiesRef, where('members', 'array-contains', uid));
    const memberPartiesSnap = await getDocs(memberPartiesQuery);

    if (!memberPartiesSnap.empty) {
      const batch = writeBatch(db);
      memberPartiesSnap.docs.forEach((docSnap: DocumentSnapshot) => {
        batch.update(docSnap.ref, {
          members: arrayRemove(uid),
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
      console.log(`✅ 멤버인 파티 ${memberPartiesSnap.size}개에서 제거 완료`);
    }

    // 3. 동승 요청 삭제 (requesterId 또는 leaderId가 uid인 경우)
    const joinRequestsRef = collection(db, 'joinRequests');
    const requesterRequestsQuery = query(joinRequestsRef, where('requesterId', '==', uid));
    const leaderRequestsQuery = query(joinRequestsRef, where('leaderId', '==', uid));
    const requesterRequestsSnap = await getDocs(requesterRequestsQuery);
    const leaderRequestsSnap = await getDocs(leaderRequestsQuery);

    const allRequests = [...requesterRequestsSnap.docs, ...leaderRequestsSnap.docs];
    if (allRequests.length > 0) {
      // 중복 제거
      const uniqueRequests = Array.from(new Map(allRequests.map(docSnap => [docSnap.id, docSnap])).values());

      for (let i = 0; i < uniqueRequests.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const slice = uniqueRequests.slice(i, i + BATCH_SIZE);
        slice.forEach((docSnap: DocumentSnapshot) => batch.delete(docSnap.ref));
        await batch.commit();
      }
      console.log(`✅ 동승 요청 ${uniqueRequests.length}개 삭제 완료`);
    }

    // 4. 파티 채팅 알림 설정 삭제
    const partiesSnap = await getDocs(partiesRef);
    for (const partyDoc of partiesSnap.docs) {
      try {
        const notificationSettingsRef = doc(partyDoc.ref, 'notificationSettings', uid);
        await deleteDoc(notificationSettingsRef).catch(() => {}); // 없으면 무시
      } catch (error) {
        // 개별 실패는 무시
      }
    }
    console.log('✅ 파티 채팅 알림 설정 삭제 완료');
  } catch (error) {
    console.warn('⚠️ 파티 멤버십 처리 실패:', error);
    // 실패해도 계속 진행
  }
}

/**
 * 게시판 콘텐츠 익명화
 */
async function anonymizeBoardContent(uid: string): Promise<void> {
  try {
    // 1. 게시글 익명화
    const postsRef = collection(db, 'boardPosts');
    const postsQuery = query(postsRef, where('authorId', '==', uid));
    const postsSnap = await getDocs(postsQuery);

    if (!postsSnap.empty) {
      for (let i = 0; i < postsSnap.docs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const slice = postsSnap.docs.slice(i, i + BATCH_SIZE);
        slice.forEach((docSnap: DocumentSnapshot) => {
          batch.update(docSnap.ref, {
            authorId: 'deleted_user',
            authorName: '탈퇴한 사용자',
            authorProfileImage: null,
            isDeleted: true,
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
      }
      console.log(`✅ 게시글 ${postsSnap.docs.length}개 익명화 완료`);
    }

    // 2. 댓글 익명화
    const commentsRef = collection(db, 'boardComments');
    const commentsQuery = query(commentsRef, where('authorId', '==', uid));
    const commentsSnap = await getDocs(commentsQuery);

    if (!commentsSnap.empty) {
      for (let i = 0; i < commentsSnap.docs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const slice = commentsSnap.docs.slice(i, i + BATCH_SIZE);
        slice.forEach((docSnap: DocumentSnapshot) => {
          batch.update(docSnap.ref, {
            authorId: 'deleted_user',
            authorName: '탈퇴한 사용자',
            authorProfileImage: null,
            isDeleted: true,
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
      }
      console.log(`✅ 댓글 ${commentsSnap.docs.length}개 익명화 완료`);
    }
  } catch (error) {
    console.warn('⚠️ 게시판 콘텐츠 익명화 실패:', error);
    // 실패해도 계속 진행
  }
}

/**
 * 공지사항 관련 데이터 처리
 */
async function handleNoticeData(uid: string): Promise<void> {
  try {
    // 공지 읽음 상태는 공지가 많아서 성능 문제로 삭제하지 않음

    // 공지 댓글 익명화
    const noticeCommentsRef = collection(db, 'noticeComments');
    const noticeCommentsQuery = query(noticeCommentsRef, where('userId', '==', uid));
    const noticeCommentsSnap = await getDocs(noticeCommentsQuery);

    if (!noticeCommentsSnap.empty) {
      for (let i = 0; i < noticeCommentsSnap.docs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const slice = noticeCommentsSnap.docs.slice(i, i + BATCH_SIZE);
        slice.forEach((docSnap: DocumentSnapshot) => {
          batch.update(docSnap.ref, {
            userId: 'deleted_user',
            userDisplayName: '탈퇴한 사용자',
            isDeleted: true,
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
      }
      console.log(`✅ 공지 댓글 ${noticeCommentsSnap.docs.length}개 익명화 완료`);
    }
  } catch (error) {
    console.warn('⚠️ 공지사항 데이터 처리 실패:', error);
    // 실패해도 계속 진행
  }
}

/**
 * 기타 개인 데이터 삭제
 */
async function deletePersonalData(uid: string): Promise<void> {
  try {
    // 1. 즐겨찾기 삭제
    const bookmarksRef = collection(db, 'userBookmarks');
    const bookmarksQuery = query(bookmarksRef, where('userId', '==', uid));
    const bookmarksSnap = await getDocs(bookmarksQuery);

    if (!bookmarksSnap.empty) {
      for (let i = 0; i < bookmarksSnap.docs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const slice = bookmarksSnap.docs.slice(i, i + BATCH_SIZE);
        slice.forEach((docSnap: DocumentSnapshot) => batch.delete(docSnap.ref));
        await batch.commit();
      }
      console.log(`✅ 즐겨찾기 ${bookmarksSnap.docs.length}개 삭제 완료`);
    }

    // 2. 시간표 삭제
    const timetablesRef = collection(db, 'userTimetables');
    const timetablesQuery = query(timetablesRef, where('userId', '==', uid));
    const timetablesSnap = await getDocs(timetablesQuery);

    if (!timetablesSnap.empty) {
      for (let i = 0; i < timetablesSnap.docs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const slice = timetablesSnap.docs.slice(i, i + BATCH_SIZE);
        slice.forEach((docSnap: DocumentSnapshot) => batch.delete(docSnap.ref));
        await batch.commit();
      }
      console.log(`✅ 시간표 ${timetablesSnap.docs.length}개 삭제 완료`);
    }

    // 3. 차단 목록 삭제 (내가 차단한 사용자)
    const blocksRef = doc(db, 'blocks', uid);
    const blockedUsersRef = collection(blocksRef, 'blockedUsers');
    const blocksSnap = await getDocs(blockedUsersRef);

    if (!blocksSnap.empty) {
      const batch = writeBatch(db);
      blocksSnap.docs.forEach((docSnap: DocumentSnapshot) => batch.delete(docSnap.ref));
      await batch.commit();
      console.log(`✅ 차단 목록 ${blocksSnap.docs.length}개 삭제 완료`);
    }

    // 4. 다른 사용자가 나를 차단한 경우 처리 (blocks/{otherUid}/blockedUsers/{uid})
    // 이건 collectionGroup 쿼리가 필요하지만, 탈퇴 시에는 무시해도 됨

    // 5. 사용자 알림 삭제
    const notificationsRef = collection(db, 'userNotifications', uid, 'notifications');
    const notificationsSnap = await getDocs(notificationsRef);

    if (!notificationsSnap.empty) {
      for (let i = 0; i < notificationsSnap.docs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const slice = notificationsSnap.docs.slice(i, i + BATCH_SIZE);
        slice.forEach((docSnap: DocumentSnapshot) => batch.delete(docSnap.ref));
        await batch.commit();
      }
      console.log(`✅ 사용자 알림 ${notificationsSnap.docs.length}개 삭제 완료`);
    }

    // 6. 문의 데이터 익명화 (운영상 필요하므로 삭제하지 않고 익명화)
    const inquiriesRef = collection(db, 'inquiries');
    const inquiriesQuery = query(inquiriesRef, where('userId', '==', uid));
    const inquiriesSnap = await getDocs(inquiriesQuery);

    if (!inquiriesSnap.empty) {
      for (let i = 0; i < inquiriesSnap.docs.length; i += BATCH_SIZE) {
        const batch = writeBatch(db);
        const slice = inquiriesSnap.docs.slice(i, i + BATCH_SIZE);
        slice.forEach((docSnap: DocumentSnapshot) => {
          batch.update(docSnap.ref, {
            userId: 'deleted_user',
            userEmail: 'deleted@example.com',
            userName: '탈퇴한 사용자',
            userRealname: null,
            userStudentId: null,
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();
      }
      console.log(`✅ 문의 데이터 ${inquiriesSnap.docs.length}개 익명화 완료`);
    }
  } catch (error) {
    console.warn('⚠️ 개인 데이터 삭제 실패:', error);
    // 실패해도 계속 진행
  }
}

/**
 * Google로 재인증 (계정 삭제 전 필수)
 */
async function reauthenticateWithGoogle(): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('로그인이 필요합니다.');
    }

    console.log('🔐 Google 재인증 중...');

    // Google Sign-In으로 재인증
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const result: any = await GoogleSignin.signIn();

    const idToken: string | null | undefined = result?.data?.idToken || result?.idToken;

    if (!idToken) {
      throw new Error('재인증에 실패했습니다. 다시 시도해주세요.');
    }

    // Firebase Auth에 재인증
    const credential = GoogleAuthProvider.credential(idToken);
    await reauthenticateWithCredential(currentUser, credential);

    console.log('✅ Google 재인증 완료');
  } catch (error: any) {
    const code = error?.code || error?.status;
    if (code === 'SIGN_IN_CANCELLED' || code === 'sign_in_cancelled') {
      throw new Error('재인증이 취소되었습니다.');
    }
    throw error;
  }
}

/**
 * 이메일/비밀번호로 재인증 (계정 삭제 전 필수)
 */
async function reauthenticateWithEmailPassword(password: string): Promise<void> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      throw new Error('로그인이 필요합니다.');
    }

    console.log('🔐 이메일/비밀번호 재인증 중...');

    // 이메일/비밀번호로 재인증
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);

    console.log('✅ 이메일/비밀번호 재인증 완료');
  } catch (error: any) {
    if (error?.code === 'auth/wrong-password') {
      throw new Error('비밀번호가 올바르지 않습니다.');
    }
    if (error?.code === 'auth/invalid-credential') {
      throw new Error('비밀번호가 올바르지 않습니다.');
    }
    throw error;
  }
}

/**
 * 사용자의 로그인 방식 확인 및 재인증
 */
async function reauthenticateUser(password?: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('로그인이 필요합니다.');
  }

  // 사용자의 provider 확인
  const providerData = currentUser.providerData;
  const hasGoogleProvider = providerData.some(provider => provider.providerId === 'google.com');
  const hasEmailProvider = providerData.some(provider => provider.providerId === 'password');

  if (hasGoogleProvider) {
    // Google로 로그인한 경우
    await reauthenticateWithGoogle();
  } else if (hasEmailProvider) {
    // 이메일/비밀번호로 로그인한 경우
    if (!password) {
      throw new Error('비밀번호가 필요합니다.');
    }
    await reauthenticateWithEmailPassword(password);
  } else {
    throw new Error('지원하지 않는 로그인 방식입니다.');
  }
}

/**
 * 메인 회원탈퇴 함수
 * @param uid 사용자 UID
 * @param password 이메일/비밀번호 로그인 사용자의 경우 비밀번호 (선택)
 */
export async function withdrawUser(uid: string, password?: string): Promise<void> {
  if (!uid) {
    throw new Error('사용자 UID가 필요합니다.');
  }

  const currentUser = auth.currentUser;
  if (!currentUser || currentUser.uid !== uid) {
    throw new Error('본인만 탈퇴할 수 있습니다.');
  }

  console.log(`🚀 회원탈퇴 프로세스 시작: ${uid}`);

  try {
    // 0. 재인증 (계정 삭제 전 필수)
    console.log('📝 0단계: 재인증 중...');
    await reauthenticateUser(password);

    // 1. 채팅방에서 제거
    console.log('📝 1단계: 채팅방에서 제거 중...');
    await removeFromChatRooms(uid);

    // 2. 파티 멤버십 처리
    console.log('📝 2단계: 파티 멤버십 처리 중...');
    await handlePartyMembership(uid);

    // 3. 게시판 콘텐츠 익명화
    console.log('📝 3단계: 게시판 콘텐츠 익명화 중...');
    await anonymizeBoardContent(uid);

    // 4. 공지사항 데이터 처리
    console.log('📝 4단계: 공지사항 데이터 처리 중...');
    await handleNoticeData(uid);

    // 5. 개인 데이터 삭제
    console.log('📝 5단계: 개인 데이터 삭제 중...');
    await deletePersonalData(uid);

    // 6. 사용자 문서 삭제
    console.log('📝 6단계: 사용자 문서 삭제 중...');
    await deleteUserDocument(uid);

    // 7. Google Sign-In 연결 해제
    console.log('📝 7단계: Google Sign-In 연결 해제 중...');
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.warn('⚠️ Google Sign-In 해제 실패 (무시):', error);
    }

    // 8. Firebase Auth 계정 삭제 (마지막 단계)
    console.log('📝 8단계: Firebase Auth 계정 삭제 중...');
    await currentUser.delete();

    console.log('✅ 회원탈퇴 완료');
  } catch (error) {
    console.error('❌ 회원탈퇴 실패:', error);
    throw error;
  }
}
