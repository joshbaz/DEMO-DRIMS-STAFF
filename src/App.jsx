import React, { useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { toast } from 'sonner';
import { useSocket } from './hooks/useSocket';

// Pages
import Login from './pages/0.auth/Login';
import ForgotPassword from './pages/0.auth/ForgotPassword';
import Dashboard from './pages/1.Dashboard/Dashboard';
import StudentsManagement from './pages/2.StudentsManagement/StudentManagement';
import DirectMessages from './pages/4.DirectMessages/DirectMessages';
import Notifications from './pages/5.Notifications/Notifications';
import Settings from './pages/6.Settings/Settings';
import Documents from './pages/7.Documents/Documents';
import Appointments from './pages/8.Appointments/Appointments';

// Layout
import Layout from './components/Layout/Layout';
import StudentProfile from './pages/2.StudentsManagement/StudentProfile';
import GradeManagement from './pages/3.Grades/GradeManagement';

// PWA Component
import PWAInstaller from './components/PWAInstaller';

import SupportChatWidget from './components/SupportChatWidget';

// Global Document Notification Handler
const DocumentNotificationHandler = () => {
  const handleDocumentNotification = useCallback((data) => {
    console.log('Global document notification received:', data);
    if (data.type === 'new_document_uploaded') {
      const document = data.document;
      toast.success(
        `New document uploaded by ${document.studentName}: ${document.title}`,
        {
          description: `Document type: ${document.type}`,
          action: {
            label: 'View',
            onClick: () => {
              // Navigate to student documents or show document details
              console.log('Navigate to document:', document.id);
            }
          }
        }
      );
    }
  }, []);

  // Initialize socket connection
  useSocket(handleDocumentNotification, null, null);

  return null; // This component doesn't render anything
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // if (loading) {
  //   return <div>Loading...</div>;
  // }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Public Route Component (redirect if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  // if (loading) {
  //   return <div>Loading...</div>;
  // }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="students" element={<StudentsManagement />} />
        <Route path="students/profile/:id" element={<StudentProfile />} />
        <Route path="grades" element={<GradeManagement />} />
        <Route path="documents" element={<Documents />} />
        <Route path="appointments" element={<Appointments />} />
        <Route path="direct-messages" element={<DirectMessages />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
      {/* PWA Installer moved outside AuthProvider so it shows on login page */}
      <PWAInstaller />
      <DocumentNotificationHandler />
      <SupportChatWidget />
    </BrowserRouter>
  );
}

export default App;