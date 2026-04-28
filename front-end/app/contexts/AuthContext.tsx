'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '@/app/services/api';
import { LoginCredentials } from '@/app/types';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  isVerified: boolean;
  userEmail: string | null;
  setUserEmail: (email: string) => void;
  setIsVerified: (verified: boolean) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'openhealth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load token on mount
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedEmail = localStorage.getItem('openhealth_email');
    const savedVerified = localStorage.getItem('openhealth_verified');
    if (savedToken) {
      setToken(savedToken);
      setUserEmail(savedEmail);
      setIsVerified(savedVerified !== 'false');
    }
    setIsLoading(false);
  }, []);

  // Update storage when verified changes
  useEffect(() => {
    if (isVerified) {
      localStorage.removeItem('openhealth_verified');
    } else {
      localStorage.setItem('openhealth_verified', 'false');
    }
  }, [isVerified]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await api.login(credentials);
      const jwt = response.token;
      setToken(jwt);
      setUserEmail(credentials.email);
      setIsVerified(true);
      localStorage.setItem(TOKEN_KEY, jwt);
      localStorage.setItem('openhealth_email', credentials.email);
    } catch (err: any) {
      if (err.message === 'unverified_account') {
        setToken(err.token || null);
        setUserEmail(credentials.email);
        setIsVerified(false);
        throw err; // Re-throw to be handled by the page
      }
      throw err;
    }
  };

  const register = async (data: any) => {
    await api.register(data);
    setUserEmail(data.email);
    setIsVerified(false);
  };

  const logout = () => {
    setToken(null);
    setUserEmail(null);
    setIsVerified(true);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('openhealth_email');
    localStorage.removeItem('openhealth_verified');
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated: !!token,
        isVerified,
        userEmail,
        setUserEmail,
        setIsVerified,
        login,
        register,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
