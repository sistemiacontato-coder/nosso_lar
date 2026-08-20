'use client';

import React, { useState } from 'react';
import { Home, User, KeyRound, LogIn, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

export function LoginModal() {
  const { user, login, isLoginModalOpen, setIsLoginModalOpen } = useAuth();
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const result = login(usernameInput, passwordInput);
    if (!result.success) {
      setErrorMsg(result.error || 'Credenciais inválidas. Verifique o usuário e a senha.');
    }
  };



  const isFullLoginScreen = !user;
  const isModalOpen = isLoginModalOpen && user !== null;

  // Content of the Login Form Card
  const formCard = (
    <div className="w-full max-w-md p-6 sm:p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 text-white shadow-lg shadow-rose-500/30">
          <Home className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">
          Nosso <span className="text-rose-500">Lar</span>
        </h2>
        <p className="text-xs text-slate-400">
          Acesso exclusivo para o casal <strong className="text-slate-200">Saymon & Kelly</strong>
        </p>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
        {/* Username Input */}
        <div className="space-y-1.5">
          <Label htmlFor="usernameInput" className="text-xs font-semibold text-slate-300">
            Usuário
          </Label>
          <div className="relative">
            <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <Input
              id="usernameInput"
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="saymon ou kelly"
              className="pl-10 h-10 text-xs bg-slate-950 border-slate-800 text-white rounded-xl focus:border-rose-500"
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="space-y-1.5">
          <Label htmlFor="passwordInput" className="text-xs font-semibold text-slate-300">
            Senha
          </Label>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <Input
              id="passwordInput"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Digite sua senha..."
              className="pl-10 h-10 text-xs bg-slate-950 border-slate-800 text-white rounded-xl focus:border-rose-500"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-11 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-500/20 transition-all"
        >
          <LogIn className="mr-2 h-4 w-4" /> Entrar no Nosso Lar
        </Button>
      </form>
    </div>
  );

  // If not logged in, display full screen with 100% SOLID FLAT COLOR BACKGROUND (cor chapada, zero blur!)
  if (isFullLoginScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center p-4">
        {formCard}
      </div>
    );
  }

  // If open as modal when logged in
  if (!isModalOpen) return null;

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsLoginModalOpen} maxWidth="md">
      {formCard}
    </Dialog>
  );
}
