import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import api from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const { setUser, setToken, setLoading } = useAuthStore();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
      setToken(token);
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      navigate('/dashboard');
    } catch (error) {
      localStorage.removeItem('token');
      setToken(null);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const response = await api.get('/auth/url');
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Failed to get auth URL:', error);
      alert('Failed to initiate login. Please try again.');
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

