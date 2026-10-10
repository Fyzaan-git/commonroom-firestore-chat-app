import React, { useState } from 'react';
import { getApiMode, setApiMode, getApiBaseUrl } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import {
  X,
  Server,
  Database,
  ShieldCheck,
  Code2,
  Terminal,
  Layers,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
} from 'lucide-react';

export default function BackendInspectorModal({ isOpen, onClose }) {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('architecture'); // architecture, endpoints, schema, rules
  const [apiMode, setMode] = useState(getApiMode());
  const [serverStatus, setServerStatus] = useState('checking'); // online, offline, checking
  const [testEndpoint, setTestEndpoint] = useState('/api/auth/me');
  const [testResponse, setTestResponse] = useState(null);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setApiMode(newMode);
    addToast(`API mode switched to ${newMode === 'browser' ? 'In-Browser Engine' : 'Spring Boot REST'}`, 'info');
  };

  const runHealthCheck = async () => {
    setServerStatus('checking');
    try {
      const res = await fetch(`${getApiBaseUrl()}/auth/me`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok || res.status === 401 || res.status === 403) {
        setServerStatus('online');
      } else {
        setServerStatus('offline');
      }
    } catch {
      setServerStatus('offline');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="backend-inspector-title"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-600 text-white">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 id="backend-inspector-title" className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>CommonRoom Architecture & Backend Inspector</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Java 17 + Spring Boot 3 + Firestore
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Full-stack system architecture, API contracts, security rules, and connection modes.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'architecture'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-indigo-500" />
            <span>Architecture & Mode</span>
          </button>
          <button
            onClick={() => setActiveTab('endpoints')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'endpoints'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-blue-500" />
            <span>REST API Console</span>
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'schema'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span>Firestore Schema</span>
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
              activeTab === 'rules'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span>Security Rules</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              {/* Connection Mode Card */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Frontend API Target Mode
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Toggle whether the frontend talks to the in-browser Firestore engine or the local Spring Boot service.
                    </p>
                  </div>
                  <div className="flex items-center gap-1 p-1 bg-slate-200 dark:bg-slate-700 rounded-lg">
                    <button
                      onClick={() => handleModeChange('browser')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        apiMode === 'browser'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      In-Browser Engine (Active)
                    </button>
                    <button
                      onClick={() => handleModeChange('springboot')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                        apiMode === 'springboot'
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      Spring Boot (8080)
                    </button>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span>Base URL: {getApiBaseUrl()}</span>
                  <button
                    onClick={runHealthCheck}
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Check Status
                  </button>
                </div>
              </div>

              {/* Architecture Stack Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                    <Server className="w-4 h-4" />
                    <span>Spring Boot 3.2.3 (Java 17)</span>
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                    <li>Stateless JWT Filter (<code className="text-xs font-mono">JwtAuthenticationFilter</code>)</li>
                    <li>BCrypt password hash with salted work factor</li>
                    <li>CORS configuration with strict headers & origins</li>
                    <li>Google Cloud Firestore Java SDK (Async ApiFutures)</li>
                    <li>Full package hierarchy in <code className="text-xs font-mono">/backend/src/main/</code></li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                    <Database className="w-4 h-4" />
                    <span>Firebase Cloud Firestore</span>
                  </div>
                  <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
                    <li>Collections: <code className="text-xs font-mono">users, workspaces, conversations, messages</code></li>
                    <li>Local development via Firestore Emulator (port 8085)</li>
                    <li>Composite indices for timestamps & conversations</li>
                    <li>Strict RBAC rules in <code className="text-xs font-mono">firebase/firestore.rules</code></li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'endpoints' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                Spring Boot REST Endpoints registered in <code className="font-mono">com.commonroom.chat.controller</code>:
              </div>
              <div className="space-y-1.5 font-mono text-xs">
                {[
                  { method: 'POST', path: '/api/auth/register', desc: 'Register user, creates default profile' },
                  { method: 'POST', path: '/api/auth/login', desc: 'Authenticate credentials, generate JWT' },
                  { method: 'GET', path: '/api/auth/me', desc: 'Retrieve current authenticated principal' },
                  { method: 'POST', path: '/api/workspaces', desc: 'Create workspace, assign OWNER' },
                  { method: 'GET', path: '/api/workspaces', desc: 'List workspaces for user' },
                  { method: 'GET', path: '/api/conversations?workspaceId={id}', desc: 'Get channels & DMs' },
                  { method: 'POST', path: '/api/conversations', desc: 'Create group or start 1-on-1 DM' },
                  { method: 'GET', path: '/api/conversations/{id}/messages', desc: 'Fetch chronological messages' },
                  { method: 'POST', path: '/api/conversations/{id}/messages', desc: 'Send new message with replies' },
                  { method: 'PUT', path: '/api/conversations/{id}/messages/{id}', desc: 'Edit existing message (author only)' },
                  { method: 'DELETE', path: '/api/conversations/{id}/messages/{id}', desc: 'Soft-delete message' },
                  { method: 'POST', path: '/api/conversations/{id}/messages/{id}/reactions', desc: 'Toggle emoji reaction' },
                  { method: 'POST', path: '/api/conversations/{id}/messages/{id}/pin', desc: 'Toggle pinned message' },
                  { method: 'GET', path: '/api/notifications', desc: 'Fetch user notification feed' },
                ].map((ep, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          ep.method === 'POST'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                            : ep.method === 'PUT'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : ep.method === 'DELETE'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        }`}
                      >
                        {ep.method}
                      </span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold truncate">
                        {ep.path}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-sans truncate shrink-0">
                      {ep.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'schema' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900 text-slate-200 overflow-x-auto">
                <pre>{`// Firestore Collections Structure:

1. users/{uid}
   - uid: string
   - displayName: string
   - email: string
   - passwordHash: string (BCrypt, server-only)
   - photoURL: string
   - status: "ONLINE" | "AWAY" | "OFFLINE"
   - statusMessage: string
   - createdAt: timestamp
   - lastSeen: timestamp

2. workspaces/{workspaceId}
   - workspaceId: string
   - name: string
   - description: string
   - ownerId: string
   - createdAt: timestamp

3. workspaceMembers/{workspaceId_userId}
   - workspaceId: string
   - userId: string
   - role: "OWNER" | "ADMIN" | "MEMBER"
   - joinedAt: timestamp

4. conversations/{conversationId}
   - conversationId: string
   - workspaceId: string
   - type: "GROUP" | "DIRECT"
   - name: string (or null for direct)
   - description: string
   - createdBy: string
   - participantIds: array<string>
   - lastMessageAt: timestamp
   - lastMessageText: string

5. messages/{messageId}
   - messageId: string
   - conversationId: string
   - workspaceId: string
   - senderId: string
   - text: string
   - replyToMessageId: string | null
   - replyToSenderName: string | null
   - replyToText: string | null
   - edited: boolean
   - deleted: boolean
   - pinned: boolean
   - reactions: array<{ emoji, userId, createdAt }>
   - createdAt: timestamp

6. notifications/{notificationId}
   - notificationId: string
   - recipientId: string
   - senderId: string
   - type: "DIRECT_MESSAGE" | "CHANNEL_MENTION" | "GROUP_INVITE" | "REACTION"
   - conversationId: string
   - content: string
   - isRead: boolean
   - createdAt: timestamp`}</pre>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-lg bg-slate-900 text-slate-200 overflow-x-auto">
                <pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Authenticated user checks
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    match /conversations/{conversationId} {
      allow read, update: if request.auth != null && request.auth.uid in resource.data.participantIds;
      allow create: if request.auth != null && request.auth.uid in request.resource.data.participantIds;
    }

    match /messages/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth.uid == request.resource.data.senderId;
      allow update: if request.auth.uid == resource.data.senderId ||
        request.resource.data.diff(resource.data).affectedKeys().hasOnly(['reactions', 'pinned']);
      allow delete: if request.auth.uid == resource.data.senderId;
    }
  }
}`}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
