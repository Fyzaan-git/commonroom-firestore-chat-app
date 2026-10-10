import React, { useState, useMemo } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import UserAvatar from '../common/UserAvatar.jsx';
import { Search, Hash, MessageSquare, X } from 'lucide-react';

export default function UserSearchModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const { members } = useWorkspace();
  const { channels, selectConversation, startDirectMessage } = useChat();

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, people, channels

  if (!isOpen) return null;

  const filteredMembers = members.filter((m) => {
    if (m.uid === user?.uid) return false;
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      m.displayName?.toLowerCase().includes(q) ||
      m.email?.toLowerCase().includes(q) ||
      m.statusMessage?.toLowerCase().includes(q)
    );
  });

  const filteredChannels = channels.filter((ch) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      ch.name?.toLowerCase().includes(q) ||
      ch.description?.toLowerCase().includes(q)
    );
  });

  const handleSelectUser = async (targetUser) => {
    await startDirectMessage(targetUser);
    onClose();
  };

  const handleSelectChannel = (ch) => {
    selectConversation(ch);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global search dialog"
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[75vh]"
      >
        {/* Search Input Bar */}
        <div className="relative p-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search team members or channels..."
            className="w-full text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded ml-1"
          >
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              Esc
            </kbd>
          </button>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center gap-1 px-3 py-2 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('people')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'people'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            People ({filteredMembers.length})
          </button>
          <button
            onClick={() => setFilter('channels')}
            className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
              filter === 'channels'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Channels ({filteredChannels.length})
          </button>
        </div>

        {/* Search Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-4">
          {/* People Section */}
          {(filter === 'all' || filter === 'people') && filteredMembers.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Team Members
              </div>
              <div className="space-y-0.5">
                {filteredMembers.map((m) => (
                  <button
                    key={m.uid}
                    onClick={() => handleSelectUser(m)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar user={m} size="sm" showStatus />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          {m.displayName}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {m.email} · {m.statusMessage || m.status}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1 shrink-0">
                      <MessageSquare className="w-3 h-3" />
                      Direct Message
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Channels Section */}
          {(filter === 'all' || filter === 'channels') && filteredChannels.length > 0 && (
            <div>
              <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Channels
              </div>
              <div className="space-y-0.5">
                {filteredChannels.map((ch) => (
                  <button
                    key={ch.conversationId}
                    onClick={() => handleSelectChannel(ch)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                        <Hash className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                          #{ch.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {ch.description || 'Public Channel'}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      Jump to channel
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredMembers.length === 0 && filteredChannels.length === 0 && (
            <div className="text-center py-10 text-xs text-slate-400">
              No results found for "{query}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
