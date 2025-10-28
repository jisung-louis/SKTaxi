import { useState, useEffect } from 'react';
import { getFirestore, collection, query, orderBy, limit, onSnapshot, doc, updateDoc, Timestamp, deleteDoc, getDocs, writeBatch } from '@react-native-firebase/firestore';
import { useAuth } from './useAuth';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  data: any;
  isRead: boolean;
  readAt?: any;
  createdAt: any;
  icon?: string;
  iconColor?: string;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const notificationsRef = collection(db, 'userNotifications', user.uid, 'notifications');
    const q = query(notificationsRef, orderBy('createdAt', 'desc'), limit(50));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const notificationsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Notification[];
        setNotifications(notificationsData);
        setLoading(false);
      },
      (err) => {
        console.error('알림 로드 실패:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const db = getFirestore();
      const notificationRef = doc(
        db, 
        'userNotifications', 
        user.uid, 
        'notifications', 
        notificationId
      );
      
      await updateDoc(notificationRef, {
        isRead: true,
        readAt: Timestamp.now(),
      });
    } catch (err) {
      console.error('알림 읽음 처리 실패:', err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    const unreadNotifications = notifications.filter(n => !n.isRead);
    await Promise.all(unreadNotifications.map(n => markAsRead(n.id)));
  };

  const deleteNotification = async (notificationId: string) => {
    if (!user) return;
    
    try {
      const db = getFirestore();
      const notificationRef = doc(db, 'userNotifications', user.uid, 'notifications', notificationId);
      await deleteDoc(notificationRef);
    } catch (err) {
      console.error('알림 삭제 실패:', err);
      throw err; // 원본 에러를 그대로 전달
    }
  };

  const deleteAllNotifications = async () => {
    if (!user) return;
    
    try {
      const db = getFirestore();
      const notificationsRef = collection(db, 'userNotifications', user.uid, 'notifications');
      
      // 모든 알림 문서 가져오기
      const snapshot = await getDocs(notificationsRef);
      
      // 배치로 모든 문서 삭제
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
    } catch (err) {
      console.error('모든 알림 삭제 실패:', err);
      throw err;
    }
  };

  return {
    notifications,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    unreadCount: notifications.filter(n => !n.isRead).length,
  };
};

