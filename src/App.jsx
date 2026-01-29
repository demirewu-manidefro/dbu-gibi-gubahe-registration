import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegistrationForm from './components/RegistrationForm';
import StudentList from './pages/StudentList';
import AttendanceSheet from './pages/AttendanceSheet';
import AdminManagement from './pages/AdminManagement';
import LandingPage from './pages/LandingPage';

import PendingApprovals from './pages/PendingApprovals';
import NotFound from './pages/NotFound';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

import Register from './pages/Register';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginWrapper />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/add-student" element={<PrivateRoute><RegistrationForm /></PrivateRoute>} />
          <Route path="/attendance" element={<PrivateRoute><AttendanceSheet /></PrivateRoute>} />
          <Route path="/students" element={<PrivateRoute><StudentList /></PrivateRoute>} />
          <Route path="/admins" element={<PrivateRoute><AdminManagement /></PrivateRoute>} />
          <Route path="/approvals" element={<PrivateRoute><PendingApprovals /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><div className="p-20 text-center text-gray-400">Reports Generation module coming soon...</div></PrivateRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

const LoginWrapper = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" /> : <Login />;
};

export default App;
