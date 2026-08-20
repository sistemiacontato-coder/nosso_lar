'use client';

import React from 'react';
import { Home, Plus, ArrowLeftRight, Heart, LogOut, Sparkles, LayoutDashboard, Building } from 'lucide-react';
import { Button } from './ui/button';
import { ThemeToggle } from './ui/theme-toggle';
import { Badge } from './ui/badge';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  activeTab: 'painel' | 'imoveis';
  onTabChange: (tab: 'painel' | 'imoveis') => void;
  onOpenNewProperty: () => void;
  onOpenComparison?: () => void;
  onOpenSettings?: () => void;
  onOpenCommuteAnchorsModal?: () => void;
  compareCount?: number;
  totalCount?: number;
  sugestoesCount?: number;
}

export function Navbar({
  activeTab,
  onTabChange,
  onOpenNewProperty,
  onOpenComparison,
  onOpenSettings,
  onOpenCommuteAnchorsModal,
  compareCount = 0,
  totalCount = 0,
}: NavbarProps) {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90 transition-colors">
      <div className="max-w-[1600px] w-full mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Main Tabs */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 text-white shadow-md shadow-rose-500/20 shrink-0">
              <Home className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  Nosso <span className="text-rose-600 dark:text-rose-400">Lar</span>
                </span>
                <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Saymon & Kelly
                </span>
              </div>
            </div>
          </div>

          {/* Main Navigation Tabs: Painel vs Imóveis */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 ml-2">
            <button
              type="button"
              onClick={() => onTabChange('painel')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'painel'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Painel</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('imoveis')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'imoveis'
                  ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building className="h-3.5 w-3.5 text-rose-500" />
              <span>Imóveis</span>
              {totalCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300">
                  {totalCount}
                </span>
              )}
            </button>
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



          {/* Add Property Button */}
          <Button
            onClick={onOpenNewProperty}
            size="sm"
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-sm hover:shadow-rose-500/20"
          >
            <Plus className="mr-1 h-4 w-4" />
            <span>Cadastrar Imóvel</span>
          </Button>

          {/* Logged in User session badge -> Click opens Endereços de Interesse (Perfil) */}
          {user && (
            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={onOpenCommuteAnchorsModal}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Clique para editar o Perfil do Casal e Endereços de Interesse Fixos"
              >
                <span className="text-sm">{user.avatar}</span>
                <span className="hidden sm:inline">{user.name}</span>
                <Heart className="h-3 w-3 fill-rose-500 text-rose-500 ml-0.5" />
              </button>
              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Sair da conta"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
