import React, { useRef, useEffect } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { formatDateHeader } from '../../utils/dateUtils.js';
import MessageBubble from './MessageBubble.jsx';
import LoadingSpinner from '../common/LoadingSpinner.jsx';
import { MessageSquare, Pin } from 'lucide-react';

export default function MessageList({
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
  onTogglePin,
  showPinnedList,
}) {
  const {
    messages,
    pinnedMessages,
    loadingMessages,
    currentConversation,
    messageSearchQuery,
  } = useChat();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!messageSearchQuery) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, messageSearchQuery]);

  if (loadingMessages) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Pinned Messages Tab View
  if (showPinnedList) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">
          <Pin className="w-4 h-4 text-amber-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Pinned Messages ({pinnedMessages.length})
          </h2>
        </div>

        {pinnedMessages.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            No pinned messages in this channel yet.
          </div>
        ) : (
          <div className="space-y-2">
            {pinnedMessages.map((msg) => (
              <MessageBubble
                key={msg.messageId}
                message={msg}
                onReply={onReply}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleReaction={onToggleReaction}
                onTogglePin={onTogglePin}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
          <MessageSquare className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {messageSearchQuery
            ? 'No messages match your search'
            : `Welcome to #${currentConversation?.name || 'conversation'}`}
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          {messageSearchQuery
            ? 'Try searching with different keywords.'
            : 'This is the start of this conversation history. Send a message below to kick things off!'}
        </p>
      </div>
    );
  }

  // Group messages chronologically with date headers
  let lastDateHeader = '';

  return (
    <div className="flex-1 overflow-y-auto py-3 space-y-1">
      {messages.map((msg) => {
        const currentDateHeader = formatDateHeader(msg.createdAt);
        const showHeader = currentDateHeader !== lastDateHeader;
        if (showHeader) {
          lastDateHeader = currentDateHeader;
        }

        return (
          <React.Fragment key={msg.messageId}>
            {showHeader && (
              <div className="relative my-4 text-center select-none">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                </div>
                <span className="relative px-3 py-1 bg-white dark:bg-slate-900 text-[11px] font-semibold text-slate-500 dark:text-slate-400 rounded-full border border-slate-200 dark:border-slate-800 shadow-2xs">
                  {currentDateHeader}
                </span>
              </div>
            )}
            <MessageBubble
              message={msg}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleReaction={onToggleReaction}
              onTogglePin={onTogglePin}
            />
          </React.Fragment>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}
