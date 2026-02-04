import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { useAuth } from './context/auth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegistrationForm from './components/RegistrationForm';
import StudentList from './pages/StudentList';
import AttendanceSheet from './pages/AttendanceSheet';
import AdminManagement from './pages/AdminManagement';
import LandingPage from './pages/LandingPage';

import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';
import ChangePassword from './pages/ChangePassword';
import PendingApprovals from './pages/PendingApprovals';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  // Force password change if required
  if (user.mustChangePassword && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" />;
  }

  return <Layout>{children}</Layout>;
};

const ChangePasswordRoute = () => {
  const { user } = useAuth();
  return user ? <ChangePassword /> : <Navigate to="/login" />;
};

import Register from './pages/Register';
import Gallery from './pages/Gallery';

// Wrapper component to access user context for NotificationProvider
const AppContent = () => {
  const { user } = useAuth();

  return (
    <NotificationProvider currentUser={user}>
      <Routes>
        <Route path="/login" element={<LoginWrapper />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/change-password" element={<ChangePasswordRoute />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/add-student" element={<PrivateRoute><RegistrationForm /></PrivateRoute>} />
        <Route path="/attendance" element={<PrivateRoute><AttendanceSheet /></PrivateRoute>} />
        <Route path="/students" element={<PrivateRoute><StudentList /></PrivateRoute>} />
        <Route path="/admins" element={<PrivateRoute><AdminManagement /></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Analytics /></PrivateRoute>} />
        <Route path="/approvals" element={<PrivateRoute><PendingApprovals /></PrivateRoute>} />
        <Route path="/gallery" element={<PrivateRoute><Gallery /></PrivateRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </NotificationProvider>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

const LoginWrapper = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" /> : <Login />;
};

export default App;
