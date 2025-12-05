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
  const { user, isLoading, token, setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user && !isLoading) {
        try {
          setLoading(true);
          const response = await api.get('/auth/me');
          setUser(response.data);
          setLoading(false);
        } catch (error: any) {
          console.error('Failed to fetch user in ProtectedRoute:', error);
          console.error('Error details:', error.response?.data || error.message);
          useAuthStore.getState().logout();
          setLoading(false);
        }
      } else if (!token) {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token, user, isLoading, setUser, setLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

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
  const { setLoading } = useAuthStore();

  useEffect(() => {
    // Initialize auth state
    const token = localStorage.getItem('token');
    if (token) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, []);

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

