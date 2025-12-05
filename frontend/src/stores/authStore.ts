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
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setAdminKeyVerified: (verified: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: true,
  adminKeyVerified: false,
  setUser: (user) => set({ user }),
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
  setLoading: (isLoading) => set({ isLoading }),
  setAdminKeyVerified: (verified) => set({ adminKeyVerified: verified }),
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, isLoading: false, adminKeyVerified: false });
  },
}));

