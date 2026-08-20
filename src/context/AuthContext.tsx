'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserSession {
  username: string;
  name: string;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Restore session from localStorage
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem(AUTH_STORAGE_KEY);
      if (savedSession) {
        setUser(JSON.parse(savedSession));
      }
    } catch (e) {
      console.error('Failed to restore user session', e);
    }
  }, []);

  const login = (username: string, password: string) => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Check Kelly: login kelly | password 123456
    if (cleanUsername === 'kelly' || cleanUsername.includes('kelly')) {
      if (cleanPassword === '123456') {
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
      return {
        success: false,
        error: 'Senha incorreta para o usuário Kelly. (Dica: 123456)',
      };
    }

    // Check Saymon: login masterdev ou saymon | password 123123@! ou 123456
    if (
      cleanUsername === 'saymon' ||
      cleanUsername === 'masterdev' ||
      cleanUsername === 'simon' ||
      cleanUsername.includes('saymon')
    ) {
      if (cleanPassword === '123123@!' || cleanPassword === '123456') {
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
      return {
        success: false,
        error: 'Senha incorreta para o usuário Saymon. (Dica: 123123@!)',
      };
    }

    return {
      success: false,
      error: 'Usuário não encontrado. Digite saymon ou kelly.',
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
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
