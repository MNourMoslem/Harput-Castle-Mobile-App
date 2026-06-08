import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'expo-router';

import {
  type AuthUser,
  clearTokens,
  fetchMe,
  loadStoredTokens,
  login as loginApi,
  logoutApi,
  register as registerApi,
} from '@/services/auth';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  requireAuth: (message?: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        await loadStoredTokens();
        const me = await fetchMe();
        setUser(me);
      } catch {
        await clearTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const me = await loginApi(username, password);
    setUser(me);
  }, []);

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      await registerApi(username, email, password);
      await login(username, password);
    },
    [login],
  );

  const logout = useCallback(async () => {
    await logoutApi();
    setUser(null);
  }, []);

  const requireAuth = useCallback(
    (message?: string) => {
      if (user) return true;
      router.push({
        pathname: '/auth/login',
        params: message ? { message } : undefined,
      });
      return false;
    },
    [router, user],
  );

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      requireAuth,
    }),
    [user, isLoading, login, register, logout, requireAuth],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
