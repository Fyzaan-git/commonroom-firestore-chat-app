import React, { useState } from 'react';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useChat } from '../../context/ChatContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import UserAvatar from '../common/UserAvatar.jsx';
import {
  Hash,
  Plus,
  ChevronDown,
  Building2,
  Check,
  LogOut,
  Settings,
  Circle,
} from 'lucide-react';

export default function Sidebar({
  onOpenCreateGroup,
  onOpenCreateWorkspace,
  onOpenUserSearch,
  onOpenProfile,
  onCloseMobileNav,
}) {
  const { user, logout, updateProfile } = useAuth();
  const { workspaces, currentWorkspace, selectWorkspace } = useWorkspace();
  const {
    channels,
    directMessages,
    currentConversation,
    selectConversation,
  } = useChat();

  const [showWorkspaceMenu, setShowWorkspaceMenu] = useState(false);
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  const handleSelectConv = (conv) => {
    selectConversation(conv);
    if (onCloseMobileNav) onCloseMobileNav();
  };

  const getOtherParticipant = (dm) => {
    if (!user || !dm.participantIds) return null;
    const otherId = dm.participantIds.find((id) => id !== user.uid) || user.uid;
    // Look up from local engine or current workspace members
    return otherId;
  };

  const handleStatusChange = async (newStatus) => {
    setShowStatusMenu(false);
    try {
      await updateProfile({ status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside className="w-64 h-full flex flex-col bg-slate-50 dark:bg-slate-900/60 border-r border-slate-200 dark:border-slate-800 shrink-0 select-none">
      {/* Workspace Switcher Header */}
      <div className="relative p-3 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setShowWorkspaceMenu(!showWorkspaceMenu)}
          className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors text-left"
          aria-expanded={showWorkspaceMenu}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {currentWorkspace ? currentWorkspace.name.substring(0, 2).toUpperCase() : 'CW'}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate leading-tight">
                {currentWorkspace ? currentWorkspace.name : 'Select Workspace'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {currentWorkspace?.description || 'Team Workspace'}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        </button>

        {/* Workspace Dropdown */}
        {showWorkspaceMenu && (
          <div className="absolute top-16 left-3 right-3 z-30 p-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl">
            <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Workspaces
            </div>
            <div className="max-h-48 overflow-y-auto space-y-0.5">
              {workspaces.map((ws) => {
                const isSelected = currentWorkspace?.workspaceId === ws.workspaceId;
                return (
                  <button
                    key={ws.workspaceId}
                    onClick={() => {
                      selectWorkspace(ws);
                      setShowWorkspaceMenu(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                  </button>
                );
              })}
            </div>
            <div className="pt-1.5 mt-1 border-t border-slate-100 dark:border-slate-700/60">
              <button
                onClick={() => {
                  setShowWorkspaceMenu(false);
                  onOpenCreateWorkspace();
                }}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>Create New Workspace</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Channels */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Channels
            </span>
            <button
              onClick={onOpenCreateGroup}
              title="Create channel"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
              aria-label="Create new channel"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {channels.map((ch) => {
              const isActive = currentConversation?.conversationId === ch.conversationId;
              return (
                <button
                  key={ch.conversationId}
                  onClick={() => handleSelectConv(ch)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Hash
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <span className="truncate">{ch.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Direct Messages */}
        <div>
          <div className="flex items-center justify-between px-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Direct Messages
            </span>
            <button
              onClick={onOpenUserSearch}
              title="New direct message"
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded transition-colors"
              aria-label="Start direct message"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-0.5">
            {directMessages.map((dm) => {
              const isActive = currentConversation?.conversationId === dm.conversationId;
              // Derive title or partner name
              const partnerId = getOtherParticipant(dm);
              const dmTitle = dm.name || (partnerId === user?.uid ? 'Notes to self' : 'Direct Conversation');

              return (
                <button
                  key={dm.conversationId}
                  onClick={() => handleSelectConv(dm)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="relative">
                    <UserAvatar name={dmTitle} size="xs" />
                  </div>
                  <span className="truncate">{dmTitle}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Footer Card */}
      {user && (
        <div className="relative p-2.5 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2.5 min-w-0 text-left flex-1"
            >
              <UserAvatar user={user} size="sm" showStatus />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {user.displayName}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {user.statusMessage || user.status}
                </div>
              </div>
            </button>

            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
              title="Change presence status"
              aria-label="Presence status"
            >
              <Circle className="w-3.5 h-3.5 fill-current text-slate-400" />
            </button>
          </div>

          {/* Presence Menu */}
          {showStatusMenu && (
            <div className="absolute bottom-16 right-3 w-40 p-1.5 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-30">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase">
                Presence Status
              </div>
              <button
                onClick={() => handleStatusChange('ONLINE')}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Online</span>
              </button>
              <button
                onClick={() => handleStatusChange('AWAY')}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Away</span>
              </button>
              <button
                onClick={() => handleStatusChange('OFFLINE')}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                <span>Appear Offline</span>
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
              <button
                onClick={() => {
                  setShowStatusMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
