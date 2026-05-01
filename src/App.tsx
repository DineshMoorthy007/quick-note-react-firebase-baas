import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NoteProvider } from './context/NoteContext';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import './App.css';

/**
 * PrivateRoute Component
 * Protects the Dashboard route by:
 * - Redirecting authenticated users away from /auth
 * - Redirecting unauthenticated users away from /
 * - Waiting for auth loading state to resolve before making decisions
 */
interface PrivateRouteProps {
  isPublic?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ isPublic = false }) => {
  const { currentUser, loading } = useAuth();

  // Wait for auth state to be determined
  if (loading) {
    return (
      <div style={loadingStyles}>
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // For public routes (auth pages): redirect authenticated users to dashboard
  if (isPublic) {
    return currentUser ? <Navigate to="/" replace /> : <AuthPage />;
  }

  // For private routes (dashboard): redirect unauthenticated users to auth
  return currentUser ? <Dashboard /> : <Navigate to="/auth" replace />;
};

const loadingStyles: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#f8f9fa',
  fontSize: '16px',
  color: '#7b8b9a',
  gap: '16px',
};

/**
 * AppRouter Component
 * Sets up all routes for the application
 */
const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public route: Authentication page */}
      <Route path="/auth" element={<PrivateRoute isPublic={true} />} />

      {/* Private route: Dashboard (default) */}
      <Route path="/" element={<PrivateRoute />} />

      {/* Catch-all redirect to dashboard */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

/**
 * App Component
 * Main application component that wraps everything with providers and routing
 */
function App() {
  return (
    <Router>
      <AuthProvider>
        <NoteProvider>
          <AppRouter />
        </NoteProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
