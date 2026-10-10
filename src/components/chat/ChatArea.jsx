import React, { useState } from 'react';
import { useChat } from '../../context/ChatContext.jsx';
import ChatHeader from './ChatHeader.jsx';
import MessageList from './MessageList.jsx';
import MessageComposer from './MessageComposer.jsx';
import GroupDetailsPanel from './GroupDetailsPanel.jsx';
import ConfirmDialog from '../common/ConfirmDialog.jsx';

export default function ChatArea() {
  const {
    currentConversation,
    editMessage,
    deleteMessage,
    toggleReaction,
    togglePin,
  } = useChat();

  const [showDetails, setShowDetails] = useState(false);
  const [showPinnedList, setShowPinnedList] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [deleteCandidateId, setDeleteCandidateId] = useState(null);

  if (!currentConversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 text-sm">
        Select a channel or direct message to begin chatting.
      </div>
    );
  }

  const handleReply = (msg, senderName) => {
    setReplyingTo({
      messageId: msg.messageId,
      senderName,
      text: msg.text,
    });
  };

  const handleCancelReply = () => {
    setReplyingTo(null);
  };

  const handleDeleteRequest = (messageId) => {
    setDeleteCandidateId(messageId);
  };

  const handleConfirmDelete = async () => {
    if (deleteCandidateId) {
      await deleteMessage(deleteCandidateId);
      setDeleteCandidateId(null);
    }
  };

  return (
    <main className="flex-1 h-full flex overflow-hidden bg-white dark:bg-slate-900">
      {/* Central Chat View */}
      <div className="flex-1 h-full flex flex-col min-w-0">
        <ChatHeader
          onToggleDetails={() => setShowDetails(!showDetails)}
          showDetails={showDetails}
          onTogglePinnedList={() => setShowPinnedList(!showPinnedList)}
          showPinnedList={showPinnedList}
        />

        <MessageList
          onReply={handleReply}
          onEdit={editMessage}
          onDelete={handleDeleteRequest}
          onToggleReaction={toggleReaction}
          onTogglePin={togglePin}
          showPinnedList={showPinnedList}
        />

        <MessageComposer
          replyingTo={replyingTo}
          onCancelReply={handleCancelReply}
        />
      </div>

      {/* Right Details Panel */}
      {showDetails && (
        <GroupDetailsPanel
          onClose={() => setShowDetails(false)}
          onOpenPinnedList={() => setShowPinnedList(true)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteCandidateId)}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action will mark it as deleted."
        confirmLabel="Delete"
        isDestructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteCandidateId(null)}
      />
    </main>
  );
}
