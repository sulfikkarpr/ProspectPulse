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
  const pending = searchParams.get('pending') === 'true';

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          setLoading(true);
          setToken(token);
          
          // Fetch user data
          const response = await api.get('/auth/me');
          const userData = response.data;
          setUser(userData);
          setLoading(false);
          
          // Check if user is pending approval
          if (pending || !userData.is_approved) {
            navigate('/pending-approval', { replace: true });
          } else {
            // Navigate to dashboard
            navigate('/dashboard', { replace: true });
          }
        } catch (error: any) {
          console.error('Failed to fetch user:', error);
          console.error('Error details:', error.response?.data || error.message);
          setLoading(false);
          // Redirect to login if auth fails
          navigate('/login', { replace: true });
        }
      } else {
        setLoading(false);
        navigate('/login', { replace: true });
      }
    };

    fetchUser();
  }, [token, pending, navigate, setToken, setUser, setLoading]);

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

      // If we have cached user, use it temporarily while fetching fresh data
      if (user) {
        setInitialized(true);
        setLoading(false);
        // Fetch fresh user data in background
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error: any) {
          console.error('Failed to refresh user data:', error);
          // If token is invalid, logout
          if (error.response?.status === 401) {
            useAuthStore.getState().logout();
          }
        }
        return;
      }

      // No cached user, fetch from API
      try {
        setLoading(true);
        const response = await api.get('/auth/me');
        setUser(response.data);
        setInitialized(true);
        setLoading(false);
      } catch (error: any) {
        console.error('Failed to fetch user in ProtectedRoute:', error);
        useAuthStore.getState().logout();
        setInitialized(true);
        setLoading(false);
      }
    };

    initializeAuth();
  }, [token, user, isLoading, isInitialized, setUser, setLoading, setInitialized]);

  // Show loading only if not initialized
  if (!isInitialized || isLoading) {
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

  // Check if user is approved (except for pending-approval page)
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

