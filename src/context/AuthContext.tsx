'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export type UserRole = 'Saymon' | 'Kelly';

export interface UserSession {
  username: string;
  name: UserRole;
  avatar: string;
}

interface AuthContextType {
  user: UserSession | null;
  login: (username: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
}

const AUTH_STORAGE_KEY = 'nosso_lar_auth_session_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.name === 'Saymon' || parsed.name === 'Kelly')) {
          setUser(parsed);
        }
      }
    } catch (e) {
      console.error('Error loading auth session:', e);
    }
  }, []);

  const login = (username: string, password: string) => {
    const cleanUsername = username.trim().toLowerCase();

    // Check Kelly
    if (cleanUsername === 'kelly' || cleanUsername.includes('kelly')) {
      const session: UserSession = {
        username: 'kelly',
        name: 'Kelly',
        avatar: '👩',
      };
      setUser(session);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      setIsLoginModalOpen(false);
      return { success: true };
    }

    // Check Saymon / Masterdev / Simon
    if (
      cleanUsername === 'saymon' ||
      cleanUsername === 'masterdev' ||
      cleanUsername === 'simon' ||
      cleanUsername.includes('saymon')
    ) {
      const session: UserSession = {
        username: 'saymon',
        name: 'Saymon',
        avatar: '🧔',
      };
      setUser(session);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      setIsLoginModalOpen(false);
      return { success: true };
    }

    // Default fallback if username typed matches any user
    if (cleanUsername.length > 0) {
      const isKellyName = cleanUsername.startsWith('k');
      const session: UserSession = {
        username: isKellyName ? 'kelly' : 'saymon',
        name: isKellyName ? 'Kelly' : 'Saymon',
        avatar: isKellyName ? '👩' : '🧔',
      };
      setUser(session);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      setIsLoginModalOpen(false);
      return { success: true };
    }

    return {
      success: false,
      error: 'Informe um nome de usuário válido.',
    };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsLoginModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isLoginModalOpen,
        setIsLoginModalOpen,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
