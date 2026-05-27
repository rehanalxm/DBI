import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import InactivityTimer from './components/InactivityTimer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          {/* Headless inactivity auto-logout tracker */}
          <InactivityTimer />
          
          <Routes>
            {/* Public Landing Page */}
            <Route path="/" element={<Home />} />
            
            {/* Public Auth Pages */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Banking Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            
            {/* Default Redirection Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        
        {/* Toast Alert Service */}
        <Toaster 
          position="top-right" 
          toastOptions={{ 
            duration: 4000,
            style: {
              background: '#0f172a',
              color: '#fff',
              borderRadius: '16px',
              fontSize: '13px',
              fontWeight: '600',
              padding: '12px 18px',
            }
          }} 
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
