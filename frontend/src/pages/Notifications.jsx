import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import AnimatedSection from '../components/AnimatedSection';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      if (id === 'all') {
        setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      } else {
        setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  if (loading) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
      <div className="w-16 h-16 border-4 border-accent-warm border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-[calc(100vh-64px)] pb-12">
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <AnimatedSection>
          <div className="flex justify-between items-end mb-8 border-b border-glass-border pb-4">
            <div>
              <h1 className="text-3xl font-heading font-bold text-text-primary flex items-center gap-3">
                Notifications
                {unreadCount > 0 && (
                  <span className="bg-error text-bg-base text-sm font-bold px-2.5 py-0.5 rounded-full shadow-[0_0_10px_rgba(255,82,82,0.4)]">
                    {unreadCount}
                  </span>
                )}
              </h1>
            </div>
            {unreadCount > 0 && (
              <button 
                onClick={() => markAsRead('all')}
                className="text-sm font-bold text-accent-warm hover:text-accent-warm-muted transition-colors flex items-center gap-1 hover:bg-accent-warm/10 px-3 py-1.5 rounded-lg"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                Mark all as read
              </button>
            )}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={100} direction="up">
          <div className="glass-card overflow-hidden">
            {notifications.length > 0 ? (
              <ul className="divide-y divide-glass-border">
                {notifications.map((notification, idx) => (
                  <li 
                    key={notification._id} 
                    className={`p-6 transition-all duration-300 cursor-pointer flex gap-5 ${!notification.isRead ? 'bg-accent-warm/5 hover:bg-accent-warm/10' : 'hover:bg-bg-surface/50'}`}
                    onClick={() => !notification.isRead && markAsRead(notification._id)}
                  >
                    <div className="flex-shrink-0 mt-1">
                      {notification.type === 'inquiry' ? (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner ${!notification.isRead ? 'bg-accent-sky/20 text-accent-sky border border-accent-sky/30' : 'bg-bg-surface border border-glass-border text-text-secondary'}`}>
                          💬
                        </div>
                      ) : notification.type === 'roommate_match' ? (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner ${!notification.isRead ? 'bg-accent-violet/20 text-accent-violet border border-accent-violet/30' : 'bg-bg-surface border border-glass-border text-text-secondary'}`}>
                          ✨
                        </div>
                      ) : (
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-inner ${!notification.isRead ? 'bg-accent-rose/20 text-accent-rose border border-accent-rose/30' : 'bg-bg-surface border border-glass-border text-text-secondary'}`}>
                          🔔
                        </div>
                      )}
                    </div>
                    <div className="flex-1 pt-1">
                      <p className={`text-base ${!notification.isRead ? 'font-bold text-text-primary' : 'text-text-secondary'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-text-tertiary font-medium mt-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {new Date(notification.createdAt).toLocaleString(undefined, {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="flex-shrink-0 self-center">
                        <div className="w-3 h-3 rounded-full bg-accent-warm shadow-[0_0_8px_rgba(212,165,116,0.6)]"></div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-16 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-bg-surface rounded-full flex items-center justify-center text-3xl mb-6 border border-glass-border animate-float text-accent-teal">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <p className="text-text-primary font-bold font-heading text-2xl mb-2">You're all caught up!</p>
                <p className="text-text-secondary text-lg">No new notifications to show.</p>
              </div>
            )}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Notifications;
