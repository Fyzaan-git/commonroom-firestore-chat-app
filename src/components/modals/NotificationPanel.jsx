import React from 'react';
import { useNotification } from '../../context/NotificationContext.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { formatRelativeTime } from '../../utils/dateUtils.js';
import { X, Bell, Check, MessageSquare, AtSign, Smile } from 'lucide-react';

export default function NotificationPanel({ isOpen, onClose }) {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const { conversations, selectConversation } = useChat();

  if (!isOpen) return null;

  const handleNotificationClick = (notif) => {
    markAsRead(notif.notificationId);
    if (notif.conversationId) {
      const conv = conversations.find((c) => c.conversationId === notif.conversationId);
      if (conv) selectConversation(conv);
    }
    onClose();
  };

  const getIcon = (type) => {
    switch (type) {
      case 'DIRECT_MESSAGE':
        return <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />;
      case 'CHANNEL_MENTION':
        return <AtSign className="w-3.5 h-3.5 text-blue-500" />;
      case 'REACTION':
        return <Smile className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end sm:p-4 bg-slate-900/30 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notification-center-title"
        className="w-full sm:w-96 sm:max-w-md h-full sm:h-auto sm:max-h-[80vh] bg-white dark:bg-slate-900 sm:rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 id="notification-center-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 tabular-nums">
                {unreadCount} unread
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
              >
                Mark all read
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {notifications.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No notifications at this time.
            </div>
          ) : (
            notifications.map((notif) => (
              <button
                key={notif.notificationId}
                onClick={() => handleNotificationClick(notif)}
                className={`w-full flex items-start gap-3 p-2.5 rounded-lg text-left transition-colors ${
                  notif.isRead
                    ? 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-600 dark:text-slate-400'
                    : 'bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-slate-900 dark:text-slate-100'
                }`}
              >
                <div className="p-1.5 rounded-md bg-white dark:bg-slate-800 shadow-2xs mt-0.5 shrink-0">
                  {getIcon(notif.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs leading-snug break-words">
                    {notif.content}
                  </div>
                  <div className="mt-1 text-[10px] text-slate-400 tabular-nums">
                    {formatRelativeTime(notif.createdAt)}
                  </div>
                </div>
                {!notif.isRead && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
