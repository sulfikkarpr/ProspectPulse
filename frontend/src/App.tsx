import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Prospects from './pages/Prospects';
import ProspectDetail from './pages/ProspectDetail';
import SchedulePreTalk from './pages/SchedulePreTalk';
import api from './services/api';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setToken, setUser, setLoading } = useAuthStore();
  const token = searchParams.get('token');

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          setLoading(true);
          setToken(token);
          
          // Fetch user data
          const response = await api.get('/auth/me');
          setUser(response.data);
          setLoading(false);
          
          // Navigate to dashboard
          navigate('/dashboard', { replace: true });
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
  }, [token, navigate, setToken, setUser, setLoading]);

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
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

