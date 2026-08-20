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

    // Check Kelly: login: kelly | password: 123456
    if (cleanUsername === 'kelly' && password === '123456') {
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

    // Check Saymon: login: masterdev | password: 123123@!
    if (cleanUsername === 'masterdev' && password === '123123@!') {
      const session: UserSession = {
        username: 'masterdev',
        name: 'Saymon',
        avatar: '🧔',
      };
      setUser(session);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
      setIsLoginModalOpen(false);
      return { success: true };
    }

    return {
      success: false,
      error: 'Credenciais inválidas. Verifique o nome de usuário e a senha.',
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
