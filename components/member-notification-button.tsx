import { useEffect, useState } from 'react';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, where, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bell, FileText, Video, Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface Notification {
  id: string;
  type: 'new_post' | 'new_workout' | 'new_blog' | 'new_feedback' | 'new_feed';
  title: string;
  message: string;
  coachId: string;
  coachName: string;
  postId?: string;
  feedbackRequestId?: string;
  data?: any;
  createdAt: { seconds: number; nanoseconds: number };
  read: boolean;
}

export default function MemberNotificationButton({ memberId }: { memberId: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!memberId) return;
    
    const q = query(
      collection(db, 'members', memberId, 'notifications'),
      orderBy('createdAt', 'desc')
    );
    
    const unsub = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification)));
    });
    
    return () => unsub();
  }, [memberId]);

  const markAsRead = async (notifId: string) => {
    await updateDoc(doc(db, "members", memberId, "notifications", notifId), { read: true });
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.read);
    const batch = writeBatch(db);
    
    unreadNotifications.forEach(notification => {
      const notificationRef = doc(db, "members", memberId, "notifications", notification.id);
      batch.update(notificationRef, { read: true });
    });
    
    await batch.commit();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_workout':
        return <Video className="h-4 w-4 text-blue-600" />;
      case 'new_blog':
        return <FileText className="h-4 w-4 text-green-600" />;
      case 'new_feedback':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'new_feed':
        return <MessageSquare className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'new_workout':
        return 'bg-blue-50 border-blue-200';
      case 'new_blog':
        return 'bg-green-50 border-green-200';
      case 'new_feedback':
        return 'bg-yellow-50 border-yellow-200';
      case 'new_feed':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>
      
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-xs text-gray-500">
                            {notification.createdAt && notification.createdAt.seconds 
                              ? new Date(notification.createdAt.seconds * 1000).toLocaleString()
                              : 'Just now'
                            }
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {notification.coachName}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 