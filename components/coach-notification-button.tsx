import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bell } from 'lucide-react'; // You can replace with any bell icon you prefer

interface Notification {
  id: string;
  type: string;
  message: string;
  createdAt: { seconds: number; nanoseconds: number };
  read: boolean;
}

export default function CoachNotificationButton({ coachId }: { coachId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!coachId) return;
    const q = query(
      collection(db, 'coaches', coachId, 'notifications'),
      orderBy('createdAt', 'desc')
    );
    const unsub = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
    });
    return () => unsub();
  }, [coachId]);

  const markAsRead = async (notifId: string) => {
    await updateDoc(doc(db, 'coaches', coachId, 'notifications', notifId), { read: true });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(!open)} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative' }}>
        <Bell />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 0, right: 0, background: 'red', color: 'white',
            borderRadius: '50%', padding: '2px 6px', fontSize: 12
          }}>
            {unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', background: 'white', border: '1px solid #ccc',
          minWidth: 250, zIndex: 10, maxHeight: 300, overflowY: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          {notifications.length === 0 ? (
            <div style={{ padding: 16 }}>No notifications</div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                style={{
                  padding: 12,
                  background: n.read ? '#f9f9f9' : '#e6f7ff',
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer'
                }}
                onClick={() => markAsRead(n.id)}
              >
                {n.message}
                <div style={{ fontSize: 10, color: '#888' }}>
                  {n.createdAt && n.createdAt.seconds ? new Date(n.createdAt.seconds * 1000).toLocaleString() : ''}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
} 