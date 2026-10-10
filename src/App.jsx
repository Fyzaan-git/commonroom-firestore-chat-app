import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { WorkspaceProvider } from './context/WorkspaceContext.jsx';
import { ChatProvider } from './context/ChatContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';
import AppRoutes from './routes/AppRoutes.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <WorkspaceProvider>
              <ChatProvider>
                <NotificationProvider>
                  <AppRoutes />
                </NotificationProvider>
              </ChatProvider>
            </WorkspaceProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
