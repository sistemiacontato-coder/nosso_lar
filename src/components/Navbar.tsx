'use client';

import React from 'react';
import { Home, Plus, ArrowLeftRight, Heart, LogOut, UserCheck, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './ui/theme-toggle';
import { Badge } from './ui/badge';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onOpenNewProperty: () => void;
  onOpenComparison?: () => void;
  onOpenSettings?: () => void;
  onOpenRealtorModal?: () => void;
  compareCount?: number;
  totalCount?: number;
  sugestoesCount?: number;
}

export function Navbar({
  onOpenNewProperty,
  onOpenComparison,
  onOpenSettings,
  compareCount = 0,
  totalCount = 0,
}: NavbarProps) {
  const { user, logout, setIsLoginModalOpen } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90 transition-colors">
      <div className="max-w-[1600px] w-full mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand: Nosso Lar */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 text-white shadow-md shadow-rose-500/20 shrink-0">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                Nosso <span className="text-rose-600 dark:text-rose-400">Lar</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/60 px-2.5 py-0.5 text-[11px] font-bold text-rose-600 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60">
                <Heart className="h-2.5 w-2.5 fill-rose-500 text-rose-500" /> Saymon & Kelly
              </span>

              {/* Total Count Pill inside Navbar as requested */}
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <Sparkles className="h-3 w-3" />
                {totalCount} {totalCount === 1 ? 'imóvel cotado' : 'imóveis cotados'}
              </span>
            </div>
            <p className="hidden md:block text-xs text-slate-500 dark:text-slate-400">
              O nosso comparador e cotador de apartamentos para alugar
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Comparison CTA Button */}
          {compareCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenComparison}
              className="relative border-rose-300 bg-rose-50/50 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 animate-pulse-subtle"
            >
              <ArrowLeftRight className="mr-1.5 h-4 w-4" />
              <span>Comparar</span>
              <Badge variant="default" className="ml-1.5 h-5 px-1.5 text-[11px] bg-rose-600">
                {compareCount}
              </Badge>
            </Button>
          )}

          {/* Theme Switcher */}
          <ThemeToggle />

          {/* Settings AI Button (Masterdev / Saymon) */}
          {onOpenSettings && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSettings}
              className="h-9 px-2.5 text-xs font-bold border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100"
              title="Configurações da IA Gemini"
            >
              <Sparkles className="h-3.5 w-3.5 mr-1 text-indigo-600" />
              <span className="hidden md:inline">Configurar IA</span>
            </Button>
          )}

          {/* Add Property Button */}
          <Button
            onClick={onOpenNewProperty}
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm hover:shadow-rose-500/20"
          >
            <Plus className="mr-1 h-4 w-4" />
            <span>Cadastrar Imóvel</span>
          </Button>

          {/* Logged in User session badge */}
          {user ? (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setIsLoginModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Trocar usuário"
              >
                <span className="text-sm">{user.avatar}</span>
                <span className="hidden sm:inline">{user.name}</span>
              </button>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Sair da conta"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLoginModalOpen(true)}
              className="text-xs"
            >
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
