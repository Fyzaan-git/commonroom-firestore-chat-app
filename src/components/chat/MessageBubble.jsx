import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { formatTimestamp } from '../../utils/dateUtils.js';
import UserAvatar from '../common/UserAvatar.jsx';
import {
  Reply,
  Smile,
  Pin,
  MoreHorizontal,
  Edit2,
  Trash2,
  Copy,
  Check,
} from 'lucide-react';

const QUICK_EMOJIS = ['👍', '❤️', '🚀', '🎉', '👀'];

export default function MessageBubble({
  message,
  onReply,
  onEdit,
  onDelete,
  onToggleReaction,
  onTogglePin,
}) {
  const { user } = useAuth();
  const { members } = useWorkspace();
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  const isAuthor = user?.uid === message.senderId;
  const isDeleted = Boolean(message.deleted);

  // Look up sender details
  const sender = members.find((m) => m.uid === message.senderId) || {
    displayName: isAuthor ? user?.displayName : 'Team Member',
    photoURL: isAuthor ? user?.photoURL : null,
    status: 'OFFLINE',
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    if (editText.trim() && editText.trim() !== message.text) {
      onEdit(message.messageId, editText.trim());
    }
    setIsEditing(false);
  };

  // Group reactions by emoji
  const groupedReactions = (message.reactions || []).reduce((acc, r) => {
    if (!acc[r.emoji]) {
      acc[r.emoji] = { count: 0, hasReacted: false, users: [] };
    }
    acc[r.emoji].count += 1;
    if (r.userId === user?.uid) {
      acc[r.emoji].hasReacted = true;
    }
    acc[r.emoji].users.push(r.userId);
    return acc;
  }, {});

  // Simple rich text formatting parser (code, bold, italic)
  const renderFormattedText = (text) => {
    if (isDeleted) {
      return <span className="italic text-slate-400 dark:text-slate-500">{text}</span>;
    }

    // Check for code blocks
    if (text.includes('```')) {
      const parts = text.split('```');
      return (
        <div>
          {parts.map((part, index) => {
            if (index % 2 === 1) {
              return (
                <pre
                  key={index}
                  className="my-1.5 p-2.5 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto selection:bg-indigo-600"
                >
                  <code>{part.trim()}</code>
                </pre>
              );
            }
            return <span key={index}>{renderInlineStyles(part)}</span>;
          })}
        </div>
      );
    }

    return renderInlineStyles(text);
  };

  const renderInlineStyles = (str) => {
    // Basic inline code backticks `code`
    if (str.includes('`')) {
      const parts = str.split('`');
      return parts.map((part, i) =>
        i % 2 === 1 ? (
          <code
            key={i}
            className="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-mono text-xs"
          >
            {part}
          </code>
        ) : (
          part
        )
      );
    }
    return str;
  };

  return (
    <div
      className={`group relative flex items-start gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors ${
        message.pinned ? 'bg-amber-50/40 dark:bg-amber-950/20' : ''
      }`}
    >
      {/* Sender Avatar */}
      <UserAvatar user={sender} size="md" className="mt-0.5" />

      {/* Message Body */}
      <div className="flex-1 min-w-0">
        {/* Reply Citation */}
        {message.replyToText && (
          <div className="mb-1.5 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
            <Reply className="w-3 h-3 rotate-180" />
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {message.replyToSenderName || 'Original message'}:
            </span>
            <span className="truncate max-w-md">{message.replyToText}</span>
          </div>
        )}

        {/* Sender Name, Timestamp, Pinned marker */}
        <div className="flex items-baseline gap-2 leading-none">
          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
            {sender.displayName}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">
            {formatTimestamp(message.createdAt)}
          </span>
          {message.pinned && (
            <span className="flex items-center gap-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
              <Pin className="w-2.5 h-2.5" />
              Pinned
            </span>
          )}
        </div>

        {/* Message Content or Edit Input */}
        <div className="mt-1 text-sm text-slate-800 dark:text-slate-200 break-words leading-relaxed">
          {isEditing ? (
            <form onSubmit={handleSaveEdit} className="mt-1.5 space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full p-2.5 text-xs rounded-lg border border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-hidden resize-none"
                rows={3}
                autoFocus
              />
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              {renderFormattedText(message.text)}
              {message.edited && !isDeleted && (
                <span className="ml-1 text-[10px] text-slate-400 dark:text-slate-500 select-none">
                  (edited)
                </span>
              )}
            </>
          )}
        </div>

        {/* Emoji Reactions Bar */}
        {Object.keys(groupedReactions).length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1">
            {Object.entries(groupedReactions).map(([emoji, item]) => (
              <button
                key={emoji}
                onClick={() => onToggleReaction(message.messageId, emoji)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors border ${
                  item.hasReacted
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/60 dark:border-indigo-800 dark:text-indigo-300'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-300'
                }`}
                title={`Reaction: ${emoji}`}
              >
                <span>{emoji}</span>
                <span className="font-semibold text-[10px] tabular-nums">{item.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Floating Hover Action Toolbar */}
      {!isDeleted && !isEditing && (
        <div className="absolute right-4 -top-3.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center gap-0.5 p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md z-10">
          {/* Quick Emojis */}
          <div className="flex items-center gap-0.5 pr-1 border-r border-slate-200 dark:border-slate-800">
            {QUICK_EMOJIS.slice(0, 3).map((emoji) => (
              <button
                key={emoji}
                onClick={() => onToggleReaction(message.messageId, emoji)}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-xs transition-transform active:scale-125"
                title={`React ${emoji}`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {/* Reply */}
          <button
            onClick={() => onReply(message, sender.displayName)}
            className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Reply to message"
          >
            <Reply className="w-3.5 h-3.5" />
          </button>

          {/* Pin */}
          <button
            onClick={() => onTogglePin(message.messageId)}
            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
              message.pinned ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'
            }`}
            title={message.pinned ? 'Unpin message' : 'Pin message'}
          >
            <Pin className="w-3.5 h-3.5" />
          </button>

          {/* Copy text */}
          <button
            onClick={handleCopy}
            className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Copy message text"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>

          {/* Edit (Author only) */}
          {isAuthor && (
            <button
              onClick={() => {
                setEditText(message.text);
                setIsEditing(true);
              }}
              className="p-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit message"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete (Author only) */}
          {isAuthor && (
            <button
              onClick={() => onDelete(message.messageId)}
              className="p-1 text-rose-500 hover:text-rose-700 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
              title="Delete message"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
