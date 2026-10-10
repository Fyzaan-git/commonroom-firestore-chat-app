import React, { useState, useRef } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import {
  Send,
  Bold,
  Italic,
  Code,
  FileCode,
  Smile,
  X,
  Reply,
} from 'lucide-react';

const COMMON_EMOJIS = ['👍', '❤️', '🔥', '🚀', '🎉', '😊', '🙌', '💯', '✨', '👏'];

export default function MessageComposer({ replyingTo, onCancelReply }) {
  const { currentConversation, sendMessage } = useChat();
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef(null);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!text.trim() || sending) return;

    try {
      setSending(true);
      await sendMessage(text.trim(), replyingTo);
      setText('');
      if (onCancelReply) onCancelReply();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (err) {
      console.error('Failed to send message', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e) => {
    setText(e.target.value);
    // Auto-adjust height
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  const insertFormatting = (prefix, suffix = prefix) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = text.substring(start, end);
    const replacement = `${prefix}${selected || 'text'}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setText(newText);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + prefix.length, start + prefix.length + (selected.length || 4));
    }, 0);
  };

  const handleAddEmoji = (emoji) => {
    setText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const channelPlaceholder =
    currentConversation?.type === 'GROUP'
      ? `Message #${currentConversation?.name || 'channel'}...`
      : `Message ${currentConversation?.name || 'conversation'}...`;

  return (
    <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40 relative">
      {/* Replying Banner */}
      {replyingTo && (
        <div className="mb-2 flex items-center justify-between px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Reply className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="font-semibold text-indigo-900 dark:text-indigo-200">
              Replying to {replyingTo.senderName}:
            </span>
            <span className="text-slate-600 dark:text-slate-300 truncate max-w-sm">
              {replyingTo.text}
            </span>
          </div>
          <button
            onClick={onCancelReply}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded"
            aria-label="Cancel reply"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Composer Input Box */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
        {/* Formatting Toolbar */}
        <div className="flex items-center justify-between px-3 pt-2 pb-1 border-b border-slate-100 dark:border-slate-800/80 text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => insertFormatting('**')}
              className="p-1 hover:text-slate-800 dark:hover:text-slate-100 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Bold (**text**)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*')}
              className="p-1 hover:text-slate-800 dark:hover:text-slate-100 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Italic (*text*)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('`')}
              className="p-1 hover:text-slate-800 dark:hover:text-slate-100 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Inline Code (`code`)"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('```\n', '\n```')}
              className="p-1 hover:text-slate-800 dark:hover:text-slate-100 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Code block (```...```)"
            >
              <FileCode className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1 hover:text-slate-800 dark:hover:text-slate-100 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Insert Emoji"
            >
              <Smile className="w-3.5 h-3.5" />
            </button>

            {/* Quick Emoji Dropdown */}
            {showEmojiPicker && (
              <div className="absolute bottom-8 right-0 p-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl z-20 flex gap-1">
                {COMMON_EMOJIS.map((e) => (
                  <button
                    key={e}
                    onClick={() => handleAddEmoji(e)}
                    className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-base active:scale-125 transition-transform"
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={channelPlaceholder}
          rows={1}
          className="w-full px-3 py-2 text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden resize-none max-h-48 leading-relaxed"
        />

        {/* Bottom Status & Send */}
        <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-100 dark:border-slate-800/60 text-xs text-slate-400">
          <span className="text-[11px] hidden sm:inline">
            <kbd className="font-mono text-[10px]">Enter</kbd> to send, <kbd className="font-mono text-[10px]">Shift+Enter</kbd> for new line
          </span>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!text.trim() || sending}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all whitespace-nowrap ${
              text.trim() && !sending
                ? 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-xs'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Send</span>
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
