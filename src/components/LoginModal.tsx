'use client';

import React, { useState } from 'react';
import { Home, Heart, Lock, User, KeyRound, Sparkles, LogIn } from 'lucide-react';
import { useAuth, UserRole } from '@/context/AuthContext';
import { Dialog, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Button } from './ui/button';

export function LoginModal() {
  const { user, login, isLoginModalOpen, setIsLoginModalOpen } = useAuth();
  const [selectedUser, setSelectedUser] = useState<UserRole>('Saymon');
  const [usernameInput, setUsernameInput] = useState('masterdev');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick switch profile pre-fill
  const handleSelectProfile = (role: UserRole) => {
    setSelectedUser(role);
    setErrorMsg(null);
    if (role === 'Saymon') {
      setUsernameInput('masterdev');
      setPasswordInput('');
    } else {
      setUsernameInput('kelly');
      setPasswordInput('');
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const result = login(usernameInput, passwordInput);
    if (!result.success) {
      setErrorMsg(result.error || 'Erro ao efetuar login.');
    }
  };

  const open = !user || isLoginModalOpen;

  return (
    <Dialog open={open} onOpenChange={(v) => user && setIsLoginModalOpen(v)} maxWidth="md">
      <DialogHeader>
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 text-white shadow-lg shadow-rose-500/20">
          <Home className="h-6 w-6" />
        </div>
        <DialogTitle className="text-center text-xl font-black">
          Nosso <span className="text-rose-600 dark:text-rose-400">Lar</span>
        </DialogTitle>
        <DialogDescription className="text-center text-xs">
          Acesso exclusivo para o casal <strong className="text-slate-800 dark:text-slate-200 font-semibold">Saymon & Kelly</strong>
        </DialogDescription>
      </DialogHeader>

      {/* User Profile Selector Buttons */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSelectProfile('Saymon')}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
            selectedUser === 'Saymon'
              ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/60 dark:border-blue-500 shadow-sm ring-2 ring-blue-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 text-lg font-bold">
            🧔
          </div>
          <div className="text-left">
            <span className="font-bold text-xs text-slate-900 dark:text-white block">Saymon</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Login: masterdev</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => handleSelectProfile('Kelly')}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
            selectedUser === 'Kelly'
              ? 'border-rose-600 bg-rose-50/70 dark:bg-rose-950/60 dark:border-rose-500 shadow-sm ring-2 ring-rose-500/20'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200 text-lg font-bold">
            👩
          </div>
          <div className="text-left">
            <span className="font-bold text-xs text-slate-900 dark:text-white block">Kelly</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Login: kelly</span>
          </div>
        </button>
      </div>

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        {/* Username */}
        <div className="space-y-1.5">
          <Label htmlFor="usernameInput" className="text-xs">Usuário de Acesso</Label>
          <div className="relative">
            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="usernameInput"
              type="text"
              value={usernameInput}
              onChange={(e) => setUsernameInput(e.target.value)}
              placeholder="Digite o login..."
              className="pl-9 text-xs"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="passwordInput" className="text-xs">Senha</Label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              id="passwordInput"
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Digite a senha..."
              className="pl-9 text-xs"
              required
            />
          </div>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-bold py-2 text-xs shadow-md shadow-rose-500/20"
        >
          <LogIn className="mr-1.5 h-4 w-4" /> Entrar no Nosso Lar
        </Button>
      </form>
    </Dialog>
  );
}
