import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: 'admin' | 'mentor' | 'member';
  is_approved?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  adminKeyVerified: boolean;
  isInitialized: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setAdminKeyVerified: (verified: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  logout: () => void;
}

// Helper to get cached user
const getCachedUser = (): User | null => {
  try {
    const cached = localStorage.getItem('user');
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.error('Failed to parse cached user:', e);
  }
  return null;
};

// Helper to cache user
const cacheUser = (user: User | null) => {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getCachedUser(),
  token: localStorage.getItem('token'),
  isLoading: true,
  adminKeyVerified: false,
  isInitialized: false,
  setUser: (user) => {
    cacheUser(user);
    set({ user });
  },
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    set({ token });
  },
  setLoading: (isLoading) => set({ isLoading }),
  setAdminKeyVerified: (verified) => {
    set({ adminKeyVerified: verified });
    // Also cache admin key verification status
    if (verified) {
      localStorage.setItem('adminKeyVerified', 'true');
    } else {
      localStorage.removeItem('adminKeyVerified');
    }
  },
  setInitialized: (initialized) => set({ isInitialized: initialized }),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('adminKeyVerified');
    set({ user: null, token: null, isLoading: false, adminKeyVerified: false, isInitialized: true });
  },
}));

// Initialize admin key verification from cache
const cachedAdminKeyVerified = localStorage.getItem('adminKeyVerified') === 'true';
if (cachedAdminKeyVerified) {
  useAuthStore.getState().setAdminKeyVerified(true);
}

