import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationsApi } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';
import { localBackendEngine } from '../api/localBackendEngine.js';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    try {
      const list = await notificationsApi.list();
      setNotifications(list);
      setUnreadCount(list.filter(n => !n.isRead).length);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  useEffect(() => {
    const unsub = localBackendEngine.subscribe(() => {
      loadNotifications();
    });
    return unsub;
  }, [loadNotifications]);

  const markAsRead = async (id) => {
    await notificationsApi.markRead(id);
    setNotifications(prev =>
      prev.map(n => (n.notificationId === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        refreshNotifications: loadNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotification must be used within NotificationProvider');
  return context;
}
