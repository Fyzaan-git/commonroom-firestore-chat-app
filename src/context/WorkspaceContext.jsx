import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { workspacesApi } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';
import { localBackendEngine } from '../api/localBackendEngine.js';

const WorkspaceContext = createContext(null);

export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWorkspaces = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setCurrentWorkspace(null);
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const list = await workspacesApi.list();
      setWorkspaces(list);

      if (list.length > 0) {
        // Keep current or select first
        const found = currentWorkspace ? list.find(w => w.workspaceId === currentWorkspace.workspaceId) : list[0];
        const selected = found || list[0];
        setCurrentWorkspace(selected);

        const mems = await workspacesApi.getMembers(selected.workspaceId);
        setMembers(mems);
      } else {
        setCurrentWorkspace(null);
        setMembers([]);
      }
    } catch (err) {
      console.error('Error loading workspaces', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWorkspaces();
  }, [loadWorkspaces]);

  // Live subscriber to DB changes
  useEffect(() => {
    const unsub = localBackendEngine.subscribe(() => {
      if (user && currentWorkspace) {
        workspacesApi.getMembers(currentWorkspace.workspaceId).then(setMembers).catch(() => {});
      }
    });
    return unsub;
  }, [user, currentWorkspace]);

  const selectWorkspace = async (workspace) => {
    setCurrentWorkspace(workspace);
    try {
      const mems = await workspacesApi.getMembers(workspace.workspaceId);
      setMembers(mems);
    } catch (err) {
      console.error('Error loading workspace members', err);
    }
  };

  const createWorkspace = async (name, description) => {
    const created = await workspacesApi.create({ name, description });
    await loadWorkspaces();
    setCurrentWorkspace(created);
    return created;
  };

  const addMember = async (userId, role = 'MEMBER') => {
    if (!currentWorkspace) return;
    await workspacesApi.addMember(currentWorkspace.workspaceId, { userId, role });
    const mems = await workspacesApi.getMembers(currentWorkspace.workspaceId);
    setMembers(mems);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        members,
        loading,
        selectWorkspace,
        createWorkspace,
        addMember,
        refreshWorkspaces: loadWorkspaces,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return context;
}
