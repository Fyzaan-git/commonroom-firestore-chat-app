/**
 * Unified API Client for CommonRoom
 * 
 * Supports both:
 * 1. Live Java Spring Boot 3 REST Backend (default: http://localhost:8080/api)
 * 2. In-Browser Firestore Database Engine (Active for standalone preview)
 * 
 * Configurable via VITE_API_BASE_URL or dynamic runtime toggle in the Inspector.
 */

import { localBackendEngine } from './localBackendEngine.js';

const STORAGE_MODE_KEY = 'commonroom_api_mode';
const STORAGE_TOKEN_KEY = 'commonroom_jwt_token';
const STORAGE_USER_KEY = 'commonroom_current_user';

export const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
};

export const getApiMode = () => {
  return localStorage.getItem(STORAGE_MODE_KEY) || 'browser';
};

export const setApiMode = (mode) => {
  localStorage.setItem(STORAGE_MODE_KEY, mode);
};

export const getStoredToken = () => {
  return localStorage.getItem(STORAGE_TOKEN_KEY);
};

export const setStoredAuth = (token, user) => {
  if (token) localStorage.setItem(STORAGE_TOKEN_KEY, token);
  else localStorage.removeItem(STORAGE_TOKEN_KEY);

  if (user) localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_USER_KEY);
};

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Standard HTTP fetcher targeting Spring Boot backend
 */
async function springBootFetch(endpoint, options = {}) {
  const baseUrl = getApiBaseUrl();
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = (data && data.message) || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }

  return data ? data.data : null;
}

// ==========================================
// API MODULES
// ==========================================

export const authApi = {
  async register(payload) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch('/auth/register', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn('Spring Boot connection failed, falling back to browser engine', err);
      }
    }
    return localBackendEngine.registerUser(payload);
  },

  async login(payload) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch('/auth/login', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.warn('Spring Boot connection failed, falling back to browser engine', err);
      }
    }
    return localBackendEngine.loginUser(payload);
  },

  async me() {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch('/auth/me');
      } catch (err) {
        console.warn('Spring Boot connection failed', err);
      }
    }
    const stored = getStoredUser();
    if (!stored) throw new Error('Not authenticated');
    return localBackendEngine.getUser(stored.uid);
  },

  async logout() {
    if (getApiMode() === 'springboot') {
      try {
        await springBootFetch('/auth/logout', { method: 'POST' });
      } catch {
        // Ignore logout errors
      }
    } else {
      const stored = getStoredUser();
      if (stored) {
        try {
          localBackendEngine.updateUser(stored.uid, { status: 'OFFLINE' });
        } catch {
          // ignore
        }
      }
    }
    setStoredAuth(null, null);
  },

  async forgotPassword(email) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch('/auth/forgot-password', {
          method: 'POST',
          body: JSON.stringify({ email }),
        });
      } catch (err) {
        console.warn('Spring Boot connection failed', err);
      }
    }
    return 'If the email exists, instructions have been dispatched.';
  },
};

export const usersApi = {
  async search(query = '') {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch(`/users/search?q=${encodeURIComponent(query)}`);
      } catch {
        // Fallback
      }
    }
    return localBackendEngine.searchUsers(query);
  },

  async getById(userId) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch(`/users/${userId}`);
      } catch {
        // Fallback
      }
    }
    return localBackendEngine.getUser(userId);
  },

  async updateProfile(updates) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch('/users/me', {
          method: 'PUT',
          body: JSON.stringify(updates),
        });
      } catch {
        // Fallback
      }
    }
    const current = getStoredUser();
    return localBackendEngine.updateUser(current.uid, updates);
  },
};

export const workspacesApi = {
  async list() {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch('/workspaces');
      } catch {
        // Fallback
      }
    }
    const user = getStoredUser();
    return user ? localBackendEngine.getUserWorkspaces(user.uid) : [];
  },

  async create(payload) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch('/workspaces', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch {
        // Fallback
      }
    }
    const user = getStoredUser();
    return localBackendEngine.createWorkspace(user.uid, payload);
  },

  async getMembers(workspaceId) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch(`/workspaces/${workspaceId}/members`);
      } catch {
        // Fallback
      }
    }
    return localBackendEngine.getWorkspaceMembers(workspaceId);
  },

  async addMember(workspaceId, payload) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch(`/workspaces/${workspaceId}/members`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch {
        // Fallback
      }
    }
    const current = getStoredUser();
    return localBackendEngine.addWorkspaceMember(workspaceId, current.uid, payload.userId, payload.role);
  },
};

export const conversationsApi = {
  async list(workspaceId) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch(`/conversations?workspaceId=${workspaceId}`);
      } catch {
        // Fallback
      }
    }
    const user = getStoredUser();
    return user ? localBackendEngine.getWorkspaceConversations(workspaceId, user.uid) : [];
  },

  async create(payload) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch('/conversations', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch {
        // Fallback
      }
    }
    const user = getStoredUser();
    return localBackendEngine.createConversation(user.uid, payload);
  },

  async get(convId) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch(`/conversations/${convId}`);
      } catch {
        // Fallback
      }
    }
    return localBackendEngine.getConversation(convId);
  },

  async update(convId, payload) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch(`/conversations/${convId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } catch {
        // Fallback
      }
    }
    const user = getStoredUser();
    return localBackendEngine.updateConversation(convId, user.uid, payload);
  },

  async addMember(convId, userId) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch(`/conversations/${convId}/members`, {
          method: 'POST',
          body: JSON.stringify({ userId }),
        });
      } catch {
        // Fallback
      }
    }
    const user = getStoredUser();
    return localBackendEngine.addConversationMember(convId, user.uid, userId);
  },

  async removeMember(convId, targetUserId) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch(`/conversations/${convId}/members/${targetUserId}`, {
          method: 'DELETE',
        });
      } catch {
        // Fallback
      }
    }
    const user = getStoredUser();
    return localBackendEngine.removeConversationMember(convId, user.uid, targetUserId);
  },
};

export const messagesApi = {
  async list(convId) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch(`/conversations/${convId}/messages`);
      } catch {
        // Fallback
      }
    }
    return localBackendEngine.getMessages(convId);
  },

  async send(convId, payload) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch(`/conversations/${convId}/messages`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      } catch {
        // Fallback
      }
    }
    const user = getStoredUser();
    return localBackendEngine.sendMessage(convId, user.uid, payload);
  },

  async update(convId, messageId, payload) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch(`/conversations/${convId}/messages/${messageId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } catch {
        // Fallback
      }
    }
    const user = getStoredUser();
    return localBackendEngine.updateMessage(convId, messageId, user.uid, payload.text);
  },

  async delete(convId, messageId) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch(`/conversations/${convId}/messages/${messageId}`, {
          method: 'DELETE',
        });
      } catch {
        // Fallback
      }
    }
    const user = getStoredUser();
    return localBackendEngine.deleteMessage(convId, messageId, user.uid);
  },

  async toggleReaction(convId, messageId, emoji) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch(`/conversations/${convId}/messages/${messageId}/reactions`, {
          method: 'POST',
          body: JSON.stringify({ emoji }),
        });
      } catch {
        // Fallback
      }
    }
    const user = getStoredUser();
    return localBackendEngine.toggleReaction(convId, messageId, user.uid, emoji);
  },

  async togglePin(convId, messageId) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch(`/conversations/${convId}/messages/${messageId}/pin`, {
          method: 'POST',
        });
      } catch {
        // Fallback
      }
    }
    return localBackendEngine.togglePin(convId, messageId);
  },
};

export const notificationsApi = {
  async list() {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch('/notifications');
      } catch {
        // Fallback
      }
    }
    const user = getStoredUser();
    return user ? localBackendEngine.getUserNotifications(user.uid) : [];
  },

  async markRead(notificationId) {
    if (getApiMode() === 'springboot') {
      try {
        return await springBootFetch(`/notifications/${notificationId}/read`, {
          method: 'PATCH',
        });
      } catch {
        // Fallback
      }
    }
    return localBackendEngine.markNotificationRead(notificationId);
  },

  async markAllRead() {
    const user = getStoredUser();
    if (user) {
      localBackendEngine.markAllNotificationsRead(user.uid);
    }
  },
};
