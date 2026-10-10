import React, { useState } from 'react';
import TopHeader from './TopHeader.jsx';
import Sidebar from './Sidebar.jsx';
import ToastContainer from '../common/ToastContainer.jsx';
import CreateGroupModal from '../modals/CreateGroupModal.jsx';
import CreateWorkspaceModal from '../modals/CreateWorkspaceModal.jsx';
import UserSearchModal from '../modals/UserSearchModal.jsx';
import ProfileModal from '../modals/ProfileModal.jsx';
import NotificationPanel from '../modals/NotificationPanel.jsx';
import BackendInspectorModal from '../modals/BackendInspectorModal.jsx';

export default function AppLayout({ children }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);

  // Global keyboard shortcut listener: Cmd+K or Ctrl+K opens search
  React.useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Header */}
      <TopHeader
        onOpenSearch={() => setSearchOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        onOpenInspector={() => setInspectorOpen(true)}
        onOpenProfile={() => setProfileOpen(true)}
        onToggleMobileNav={() => setMobileNavOpen(!mobileNavOpen)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex h-full">
          <Sidebar
            onOpenCreateGroup={() => setCreateGroupOpen(true)}
            onOpenCreateWorkspace={() => setCreateWorkspaceOpen(true)}
            onOpenUserSearch={() => setSearchOpen(true)}
            onOpenProfile={() => setProfileOpen(true)}
          />
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileNavOpen && (
          <div className="md:hidden fixed inset-0 z-40 flex">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileNavOpen(false)}
            />
            <div className="relative z-50 h-full w-64">
              <Sidebar
                onOpenCreateGroup={() => {
                  setMobileNavOpen(false);
                  setCreateGroupOpen(true);
                }}
                onOpenCreateWorkspace={() => {
                  setMobileNavOpen(false);
                  setCreateWorkspaceOpen(true);
                }}
                onOpenUserSearch={() => {
                  setMobileNavOpen(false);
                  setSearchOpen(true);
                }}
                onOpenProfile={() => {
                  setMobileNavOpen(false);
                  setProfileOpen(true);
                }}
                onCloseMobileNav={() => setMobileNavOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Central Content */}
        <div className="flex-1 h-full flex flex-col min-w-0">
          {children}
        </div>
      </div>

      {/* Global Modals */}
      <UserSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      <NotificationPanel
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

      <CreateGroupModal
        isOpen={createGroupOpen}
        onClose={() => setCreateGroupOpen(false)}
      />

      <CreateWorkspaceModal
        isOpen={createWorkspaceOpen}
        onClose={() => setCreateWorkspaceOpen(false)}
      />

      <BackendInspectorModal
        isOpen={inspectorOpen}
        onClose={() => setInspectorOpen(false)}
      />

      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
