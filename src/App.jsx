import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RegistrationForm from './components/RegistrationForm';
import StudentList from './pages/StudentList';
import AdminManagement from './pages/AdminManagement';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? <Layout>{children}</Layout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginWrapper />} />
          <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/register" element={<PrivateRoute><RegistrationForm /></PrivateRoute>} />
          <Route path="/students" element={<PrivateRoute><StudentList /></PrivateRoute>} />
          <Route path="/admins" element={<PrivateRoute><AdminManagement /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><div className="p-20 text-center text-gray-400">Reports Generation module coming soon...</div></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

const LoginWrapper = () => {
  const { user } = useAuth();
  return user ? <Navigate to="/" /> : <Login />;
};

export default App;
