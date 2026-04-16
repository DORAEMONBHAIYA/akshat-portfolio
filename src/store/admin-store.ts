import { create } from 'zustand';

interface AdminState {
  isAuth: boolean;
  token: string | null;
  username: string | null;
  activeSection: string;
  setAuth: (auth: boolean, token: string | null, username: string | null) => void;
  setActiveSection: (section: string) => void;
  logout: () => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  isAuth: false,
  token: null,
  username: null,
  activeSection: 'dashboard',
  setAuth: (auth, token, username) => {
    if (typeof window !== 'undefined') {
      if (auth && token) {
        localStorage.setItem('admin_token', token);
        localStorage.setItem('admin_username', username || '');
      } else {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
      }
    }
    set({ isAuth: auth, token, username });
  },
  setActiveSection: (section) => set({ activeSection: section }),
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_username');
    }
    set({ isAuth: false, token: null, username: null, activeSection: 'dashboard' });
  },
}));
