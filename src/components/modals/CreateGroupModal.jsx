import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import { useWorkspace } from '../../context/WorkspaceContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import UserAvatar from '../common/UserAvatar.jsx';
import { X, Hash, Users, Check } from 'lucide-react';

export default function CreateGroupModal({ isOpen, onClose }) {
  const { createGroup } = useChat();
  const { members } = useWorkspace();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleUser = (uid) => {
    setSelectedUserIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      await createGroup(name.trim(), description.trim(), selectedUserIds);
      addToast(`Channel #${name.trim()} created successfully`, 'success');
      onClose();
      setName('');
      setDescription('');
      setSelectedUserIds([]);
    } catch (err) {
      addToast(err.message || 'Failed to create channel', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-channel-title"
        className="w-full max-w-md p-6 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Hash className="w-4 h-4" />
            </div>
            <h3 id="create-channel-title" className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Create a Channel
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Channel Name
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-mono">
                #
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replaceAll(/\s+/g, '-'))}
                placeholder="e.g. project-apollo"
                className="w-full pl-7 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this channel about?"
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Add Members <span className="text-slate-400 font-normal">({selectedUserIds.length} selected)</span>
            </label>
            <div className="max-h-36 overflow-y-auto space-y-1 p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40">
              {members.map((m) => {
                const isSelected = selectedUserIds.includes(m.uid);
                return (
                  <button
                    type="button"
                    key={m.uid}
                    onClick={() => toggleUser(m.uid)}
                    className={`w-full flex items-center justify-between p-1.5 rounded-lg text-xs transition-colors ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <UserAvatar user={m} size="xs" />
                      <span>{m.displayName}</span>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!name.trim() || submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
            >
              {submitting ? 'Creating...' : 'Create Channel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
