import React from 'react';
import { getInitials, getAvatarColor } from '../../utils/stringUtils.js';

export default function UserAvatar({
  user,
  name,
  photoURL,
  status,
  size = 'md',
  className = '',
  showStatus = false,
}) {
  const displayName = (user && user.displayName) || name || 'Unknown';
  const avatarUrl = (user && user.photoURL) || photoURL;
  const userStatus = (user && user.status) || status || 'OFFLINE';

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-11 h-11 text-sm',
    xl: 'w-16 h-16 text-lg font-bold',
  };

  const statusSizeClasses = {
    xs: 'w-1.5 h-1.5 border-[1px]',
    sm: 'w-2 h-2 border-[1.5px]',
    md: 'w-2.5 h-2.5 border-2',
    lg: 'w-3 h-3 border-2',
    xl: 'w-4 h-4 border-2',
  };

  const statusColor = {
    ONLINE: 'bg-emerald-500',
    AWAY: 'bg-amber-500',
    OFFLINE: 'bg-slate-400',
  }[userStatus] || 'bg-slate-400';

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          referrerPolicy="no-referrer"
          className={`${sizeClasses[size]} rounded-lg object-cover ring-1 ring-slate-200/50 dark:ring-slate-700/50`}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}

      {/* Initials Fallback if image absent or failed */}
      <div
        className={`${sizeClasses[size]} rounded-lg font-medium flex items-center justify-center ${getAvatarColor(
          displayName
        )} ${avatarUrl ? 'absolute inset-0 -z-10' : ''}`}
        aria-hidden="true"
      >
        {getInitials(displayName)}
      </div>

      {showStatus && (
        <span
          title={`Status: ${userStatus}`}
          className={`absolute -bottom-0.5 -right-0.5 rounded-full border-white dark:border-slate-900 ${statusSizeClasses[size]} ${statusColor}`}
          aria-label={`Status: ${userStatus}`}
        />
      )}
    </div>
  );
}
