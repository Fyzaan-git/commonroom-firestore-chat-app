import React from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import UserAvatar from '../common/UserAvatar.jsx';
import {
  Hash,
  Users,
  Pin,
  Search,
  Info,
  X,
} from 'lucide-react';

export default function ChatHeader({
  onToggleDetails,
  showDetails,
  onTogglePinnedList,
  showPinnedList,
}) {
  const { user } = useAuth();
  const {
    currentConversation,
    pinnedMessages,
    messageSearchQuery,
    setMessageSearchQuery,
  } = useChat();

  if (!currentConversation) return null;

  const isGroup = currentConversation.type === 'GROUP';
  const memberCount = currentConversation.participantIds ? currentConversation.participantIds.length : 1;

  const headerTitle = isGroup
    ? currentConversation.name
    : currentConversation.name || 'Direct Conversation';

  return (
    <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between gap-3 shrink-0">
      {/* Title & Info */}
      <div className="flex items-center gap-2.5 min-w-0">
        {isGroup ? (
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0">
            <Hash className="w-4 h-4" />
          </div>
        ) : (
          <UserAvatar name={headerTitle} size="sm" showStatus />
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
              {headerTitle}
            </h1>
            {isGroup && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline tabular-nums">
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {currentConversation.description || (isGroup ? 'Channel discussion' : 'Direct 1-on-1 messaging')}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-1.5 shrink-0">
        {/* Chat Search Filter */}
        <div className="relative hidden md:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={messageSearchQuery}
            onChange={(e) => setMessageSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-36 lg:w-44 pl-8 pr-7 py-1 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all outline-hidden"
          />
          {messageSearchQuery && (
            <button
              onClick={() => setMessageSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Pinned Messages Button */}
        <button
          onClick={onTogglePinnedList}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            showPinnedList || pinnedMessages.length > 0
              ? 'text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="View pinned messages"
        >
          <Pin className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Pinned</span>
          {pinnedMessages.length > 0 && (
            <span className="ml-0.5 text-[10px] font-bold tabular-nums">
              ({pinnedMessages.length})
            </span>
          )}
        </button>

        {/* Details / Members Button */}
        <button
          onClick={onToggleDetails}
          className={`p-2 rounded-lg transition-colors ${
            showDetails
              ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title="Channel details and members"
          aria-label="Toggle details panel"
        >
          {isGroup ? <Users className="w-4 h-4" /> : <Info className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}
