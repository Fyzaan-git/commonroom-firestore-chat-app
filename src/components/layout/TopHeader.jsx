import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useNotification } from '../../context/NotificationContext.jsx';
import UserAvatar from '../common/UserAvatar.jsx';
import { Sun, Moon, Bell, Search, Terminal, Menu } from 'lucide-react';

export default function TopHeader({
  onOpenSearch,
  onOpenNotifications,
  onOpenInspector,
  onOpenProfile,
  onToggleMobileNav,
}) {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { unreadCount } = useNotification();

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 flex items-center justify-between gap-4 z-20 shrink-0">
      {/* Brand & Mobile menu */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileNav}
          className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg"
          aria-label="Toggle navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-indigo-600 text-white flex items-center justify-center text-xs font-black">
            CR
          </span>
          CommonRoom
        </span>
      </div>

      {/* Search Affordance */}
      <div className="flex-1 max-w-md mx-2 hidden sm:block">
        <button
          onClick={onOpenSearch}
          className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
        >
          <span className="flex items-center gap-2 truncate">
            <Search className="w-3.5 h-3.5" />
            <span>Search team members, channels, and messages...</span>
          </span>
          <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 shadow-xs">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Action Zone */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Backend & Architecture Inspector */}
        <button
          onClick={onOpenInspector}
          title="Spring Boot 3 & Firestore Inspector"
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 rounded-lg transition-colors whitespace-nowrap"
        >
          <Terminal className="w-3.5 h-3.5 text-indigo-500" />
          <span className="hidden lg:inline">Backend Inspector</span>
        </button>

        {/* Notifications */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={`Notifications (${unreadCount} unread)`}
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center tabular-nums">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* User profile avatar */}
        {user && (
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="User profile settings"
          >
            <UserAvatar user={user} size="sm" showStatus />
          </button>
        )}
      </div>
    </header>
  );
}
