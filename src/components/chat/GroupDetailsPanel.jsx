import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { formatDateHeader } from '../../utils/dateUtils.js';
import UserAvatar from '../common/UserAvatar.jsx';
import {
  X,
  Hash,
  Users,
  UserPlus,
  ShieldAlert,
  Calendar,
  LogOut,
  Pin,
  Check,
} from 'lucide-react';

export default function GroupDetailsPanel({ onClose, onOpenPinnedList }) {
  const { user } = useAuth();
  const { members: workspaceMembers } = useWorkspace();
  const {
    currentConversation,
    pinnedMessages,
    addMemberToGroup,
    removeMemberFromGroup,
  } = useChat();

  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  if (!currentConversation) return null;

  const isGroup = currentConversation.type === 'GROUP';
  const isCreator = currentConversation.createdBy === user?.uid;

  // Resolve members in this conversation
  const participantIds = currentConversation.participantIds || [];
  const groupMembers = workspaceMembers.filter((m) => participantIds.includes(m.uid));
  const nonGroupMembers = workspaceMembers.filter((m) => !participantIds.includes(m.uid));

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    await addMemberToGroup(selectedUserId);
    setSelectedUserId('');
    setShowAddMember(false);
  };

  const handleRemoveMember = async (targetUserId) => {
    await removeMemberFromGroup(targetUserId);
  };

  return (
    <aside className="w-72 h-full flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shrink-0 select-none overflow-y-auto">
      {/* Header */}
      <div className="h-14 px-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {isGroup ? 'Channel Details' : 'Conversation Info'}
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
          aria-label="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Channel Identity */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Hash className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {currentConversation.name || 'Direct Conversation'}
              </h4>
              <p className="text-[11px] text-slate-400">
                {isGroup ? 'Public Channel' : 'Direct Conversation'}
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {currentConversation.description || 'No description provided for this channel.'}
          </p>

          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Created {formatDateHeader(currentConversation.createdAt)}</span>
          </div>
        </div>

        {/* Quick Links / Pinned Messages */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onOpenPinnedList}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Pin className="w-3.5 h-3.5 text-amber-500" />
              <span>Pinned Messages</span>
            </span>
            <span className="text-[11px] text-slate-400 tabular-nums">
              {pinnedMessages.length}
            </span>
          </button>
        </div>

        {/* Members Section */}
        {isGroup && (
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Members ({groupMembers.length})
              </span>
              <button
                onClick={() => setShowAddMember(!showAddMember)}
                className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                <UserPlus className="w-3 h-3" />
                <span>Add</span>
              </button>
            </div>

            {/* Add Member Dropdown */}
            {showAddMember && (
              <div className="mb-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <label className="text-[11px] font-medium text-slate-600 dark:text-slate-300 block">
                  Select workspace member:
                </label>
                {nonGroupMembers.length === 0 ? (
                  <p className="text-[11px] text-slate-400">
                    All workspace members are already in this channel.
                  </p>
                ) : (
                  <>
                    <select
                      value={selectedUserId}
                      onChange={(e) => setSelectedUserId(e.target.value)}
                      className="w-full p-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-hidden"
                    >
                      <option value="">Choose a member...</option>
                      {nonGroupMembers.map((m) => (
                        <option key={m.uid} value={m.uid}>
                          {m.displayName} ({m.email})
                        </option>
                      ))}
                    </select>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowAddMember(false)}
                        className="px-2 py-1 text-[11px] text-slate-500 hover:text-slate-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleAddMember}
                        disabled={!selectedUserId}
                        className="px-3 py-1 text-[11px] font-semibold text-white bg-indigo-600 rounded-md disabled:opacity-50"
                      >
                        Add Member
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Members List */}
            <div className="space-y-1">
              {groupMembers.map((m) => {
                const isMemberCreator = m.uid === currentConversation.createdBy;
                const isSelf = m.uid === user?.uid;

                return (
                  <div
                    key={m.uid}
                    className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar user={m} size="sm" showStatus />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate flex items-center gap-1">
                          <span>{m.displayName}</span>
                          {isMemberCreator && (
                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">
                              [Creator]
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          {m.statusMessage || m.status}
                        </div>
                      </div>
                    </div>

                    {(isCreator && !isSelf) && (
                      <button
                        onClick={() => handleRemoveMember(m.uid)}
                        title="Remove member"
                        className="text-slate-400 hover:text-rose-500 p-1 text-xs"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Leave Channel */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleRemoveMember(user?.uid)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Leave Channel</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
