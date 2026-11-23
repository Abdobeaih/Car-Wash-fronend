'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { ApiError, apiRequest, clearToken, getToken, setToken } from './api';
import type { AuthResponse, MeResponse, User } from './types';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
  country?: string;
  dialCode?: string;
  phone?: string;
  countryCode?: string;
}

export interface RegisterResponse {
  user: User;
  message?: string;
  devOtp?: string;
}

export interface AuthContextValue {
  user: User | null;
  loading: boolean;
  sessionError?: string | null;
  login: (email: string, password: string) => Promise<User>;
  register: (input: RegisterInput) => Promise<{ user: User; message?: string; devOtp?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError,setSessionError] = useState<string|null>(null);

  const refresh = useCallback(async () => {
    const token = getToken();
    setLoading(true);
    setSessionError(null);
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await apiRequest<MeResponse>('/auth/me', { auth: true });
      if(getToken()===token) setUser(res.user);
    } catch (error) {
      // Network failures and server errors are not evidence of session expiry.
      // Also ignore responses for an older login/logout that finished later.
      if(getToken()!==token) return;
      if(error instanceof ApiError && error.status===401) {
        clearToken(); setUser(null);
      } else {
        setSessionError('unavailable');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setSessionError(null);
    setToken(res.token);
    setUser(res.user);
    return res.user;
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const res = await apiRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: input,
    });
    return { user: res.user, message: res.message, devOtp: res.devOtp };
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST', auth: true });
    } catch {
      // ignore — local state is cleared regardless
    }
    clearToken();
    setSessionError(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, sessionError, login, register, logout, refresh }),
    [user, loading, sessionError, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
