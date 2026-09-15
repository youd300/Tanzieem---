import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getStoredToken, setStoredToken, removeStoredToken } from './api';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
}

export interface UserProfileData {
  user_id: string;
  name: string;
  username: string;
  bio?: string;
  avatar_url?: string;
  title: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  best_streak: number;
  daily_target_minutes: number;
  preferred_session_minutes: number;
  focus_area: string;
  language: 'en' | 'ar';
  timezone: string;
  notifications_enabled: number;
  updated_at: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  profile: UserProfileData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (name: string, username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfileData>) => Promise<UserProfileData>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load session on startup
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.auth.me();
        setUser(data.user);
        setProfile(data.profile);
      } catch (err) {
        console.warn('Session verification failed, clearing token:', err);
        removeStoredToken();
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (emailOrUsername: string, password: string) => {
    const res = await api.auth.login({ emailOrUsername, password });
    setStoredToken(res.token);
    setUser(res.user);
    setProfile(res.profile);
  };

  const register = async (name: string, username: string, email: string, password: string) => {
    const res = await api.auth.register({ name, username, email, password });
    setStoredToken(res.token);
    setUser(res.user);
    setProfile(res.profile);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch {}
    removeStoredToken();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updates: Partial<UserProfileData>) => {
    const updated = await api.profile.update(updates);
    setProfile(updated);
    return updated;
  };

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const p = await api.profile.get();
      setProfile(p);
    } catch (err) {
      console.warn('Failed to refresh profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user && !!profile,
        login,
        register,
        logout,
        updateProfile,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
