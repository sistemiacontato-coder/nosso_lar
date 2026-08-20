'use client';

import React, { useState } from 'react';
import { Home, User, KeyRound, LogIn } from 'lucide-react';
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

  const open = !user || isLoginModalOpen;

  return (
    <Dialog open={open} onOpenChange={(v) => user && setIsLoginModalOpen(v)} maxWidth="md">
      <div className="p-2 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl">
        <DialogHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 text-white shadow-md shadow-rose-500/20">
            <Home className="h-6 w-6" />
          </div>
          <DialogTitle className="text-center text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Nosso <span className="text-rose-600 dark:text-rose-400">Lar</span>
          </DialogTitle>
          <DialogDescription className="text-center text-xs text-slate-500 dark:text-slate-400">
            Acesso exclusivo para o casal <strong className="text-slate-800 dark:text-slate-200 font-semibold">Saymon & Kelly</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleLoginSubmit} className="space-y-4 pt-2">
          {/* Username Input */}
          <div className="space-y-1.5">
            <Label htmlFor="usernameInput" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Usuário de Acesso
            </Label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="usernameInput"
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                placeholder="Digite o seu usuário de acesso..."
                className="pl-10 h-10 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Password Input */}
          <div className="space-y-1.5">
            <Label htmlFor="passwordInput" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Senha
            </Label>
            <div className="relative">
              <KeyRound className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                id="passwordInput"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Digite a sua senha..."
                className="pl-10 h-10 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl"
                required
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs text-center font-medium">
              {errorMsg}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/20 transition-all mt-2"
          >
            <LogIn className="mr-2 h-4 w-4" /> Entrar no Nosso Lar
          </Button>
        </form>
      </div>
    </Dialog>
  );
}
