import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Prospects from './pages/Prospects';
import ProspectDetail from './pages/ProspectDetail';
import SchedulePreTalk from './pages/SchedulePreTalk';
import PendingApproval from './pages/PendingApproval';
import UserApproval from './pages/UserApproval';
import api from './services/api';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser, setLoading } = useAuthStore();
  const token = searchParams.get('token');

  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        setLoading(false);
        navigate('/login', { replace: true });
        return;
      }

      try {
        setLoading(true);
        setToken(token);
        
        // Fetch user data
        const response = await api.get('/auth/me');
        const userData = response.data;
        setUser(userData);
        setLoading(false);
        
        // Always redirect to dashboard - ProtectedRoute will handle pending check
        navigate('/dashboard', { replace: true });
      } catch (error: any) {
        console.error('Failed to fetch user:', error);
        setLoading(false);
        navigate('/login', { replace: true });
      }
    };

    initializeAuth();
  }, [token, navigate, setToken, setUser, setLoading]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Completing login...</div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading, token, setUser, setLoading, isInitialized, setInitialized } = useAuthStore();

  useEffect(() => {
    const initializeAuth = async () => {
      // Skip if already initialized
      if (isInitialized) return;

      // If no token, mark as initialized and done
      if (!token) {
        setInitialized(true);
        setLoading(false);
        return;
      }

      // If we have cached user, use it immediately (fast path)
      if (user) {
        setInitialized(true);
        setLoading(false);
        // Refresh user data in background (non-blocking)
        api.get('/auth/me')
          .then(response => setUser(response.data))
          .catch(error => {
            if (error.response?.status === 401) {
              useAuthStore.getState().logout();
            }
          });
        return;
      }

      // No cached user, fetch from API (only once)
      try {
        setLoading(true);
        const response = await api.get('/auth/me');
        setUser(response.data);
        setInitialized(true);
        setLoading(false);
      } catch (error: any) {
        console.error('Failed to fetch user:', error);
        useAuthStore.getState().logout();
        setInitialized(true);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token, user, isLoading, isInitialized, setUser, setLoading, setInitialized]);

  // Show loading only during initial fetch
  if (!isInitialized && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // If no user after initialization, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Single check: if not approved, redirect to pending (except on pending page itself)
  if (!user.is_approved && !window.location.pathname.includes('/pending-approval')) {
    return <Navigate to="/pending-approval" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prospects"
          element={
            <ProtectedRoute>
              <Prospects />
            </ProtectedRoute>
          }
        />
        <Route
          path="/prospects/:id"
          element={
            <ProtectedRoute>
              <ProspectDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/schedule"
          element={
            <ProtectedRoute>
              <SchedulePreTalk />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <UserApproval />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

