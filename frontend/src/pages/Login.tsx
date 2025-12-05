import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { user, token, setUser, setToken, setLoading } = useAuthStore();

  useEffect(() => {
    // Check if user is already logged in
    if (token && user) {
      // User is already logged in, redirect to dashboard
      if (user.is_approved) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/pending-approval', { replace: true });
      }
      return;
    }

    // If we have a token but no user, try to fetch user
    if (token && !user) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token, user, navigate, setToken, setLoading]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/me');
      const userData = response.data;
      setUser(userData);
      setLoading(false);
      
      if (userData.is_approved) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/pending-approval', { replace: true });
      }
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await api.get('/auth/url');
      window.location.href = response.data.url;
    } catch (error: any) {
      console.error('Failed to get auth URL:', error);
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
      const status = error.response?.status;
      
      let alertMessage = 'Failed to initiate login. Please try again.\n\n';
      alertMessage += `API URL: ${apiUrl}\n`;
      if (status) {
        alertMessage += `Status: ${status}\n`;
      }
      alertMessage += `Error: ${errorMessage}\n\n`;
      
      if (apiUrl.includes('localhost')) {
        alertMessage += '⚠️ Backend URL is set to localhost. Please set VITE_API_URL in Vercel environment variables.';
      } else if (status === 0 || error.code === 'ERR_NETWORK') {
        alertMessage += '⚠️ Cannot connect to backend. Please check:\n';
        alertMessage += '1. Backend is deployed and running\n';
        alertMessage += '2. VITE_API_URL is correct in Vercel\n';
        alertMessage += '3. Backend CORS allows your frontend domain';
      }
      
      alert(alertMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ProspectPulse
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Sign in with your Google account
          </p>
        </div>
        <div className="mt-8">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

