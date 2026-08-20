'use client';

import React, { useState } from 'react';
import {
  Home,
  LayoutDashboard,
  Building,
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Heart,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface AppSidebarProps {
  activeTab: 'painel' | 'imoveis';
  onTabChange: (tab: 'painel' | 'imoveis') => void;
  onOpenNewProperty: () => void;
  onOpenCommuteAnchorsModal: () => void;
  onOpenSettings: () => void;
  totalCount?: number;
  sugestoesCount?: number;
}

export function AppSidebar({
  activeTab,
  onTabChange,
  onOpenNewProperty,
  onOpenCommuteAnchorsModal,
  onOpenSettings,
  totalCount = 0,
  sugestoesCount = 0,
}: AppSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();

  return (
    <aside
      className={`relative z-50 flex flex-col border-r border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-300 ease-in-out shrink-0 select-none shadow-sm overflow-visible ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Circular Toggle Button (< >) positioned PERFECTLY IN FRONT of all layers */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3.5 top-6 z-[100] flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-lg hover:bg-slate-100 dark:hover:bg-slate-700 hover:scale-110 transition-all cursor-pointer ring-2 ring-indigo-500/20"
        title={isCollapsed ? 'Expandir Menu ( > )' : 'Recolher Menu ( < )'}
      >
        {isCollapsed ? (
          <ChevronRight className="h-4 w-4 stroke-[2.5]" />
        ) : (
          <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
        )}
      </button>

      {/* Brand & Logo Header */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-100 dark:border-slate-800 min-h-[64px]">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-indigo-600 text-white shadow-md shadow-rose-500/20 shrink-0">
          <Home className="h-5 w-5" />
        </div>
        {!isCollapsed && (
          <div className="transition-opacity duration-200 truncate">
            <h1 className="font-black text-base tracking-tight text-slate-900 dark:text-white leading-none">
              Nosso <span className="text-rose-600 dark:text-rose-400">Lar</span>
            </h1>
            <span className="text-[10px] text-slate-400 font-medium truncate block mt-0.5">
              Saymon & Kelly
            </span>
          </div>
        )}
      </div>

      {/* Primary Navigation Links */}
      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        <span className={`text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 block mb-1 ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? '•••' : 'Navegação'}
        </span>

        {/* Tab 1: Painel */}
        <button
          type="button"
          onClick={() => onTabChange('painel')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'painel'
              ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title="Painel — Dashboard & Indicadores Consolidados"
        >
          <LayoutDashboard className="h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
          {!isCollapsed && <span className="truncate">Painel</span>}
        </button>

        {/* Tab 2: Imóveis */}
        <button
          type="button"
          onClick={() => onTabChange('imoveis')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold transition-all ${
            activeTab === 'imoveis'
              ? 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
          } ${isCollapsed ? 'justify-center px-0' : ''}`}
          title="Imóveis — Lista Completa de Apartamentos"
        >
          <Building className="h-4 w-4 shrink-0 text-rose-500" />
          {!isCollapsed && (
            <div className="flex items-center justify-between flex-1 truncate">
              <span>Imóveis</span>
              {totalCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-300">
                  {totalCount}
                </span>
              )}
            </div>
          )}
        </button>

        <div className="pt-3 my-2 border-t border-slate-100 dark:border-slate-800">
          <span className={`text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 block mb-1 ${isCollapsed ? 'text-center' : ''}`}>
            {isCollapsed ? '•••' : 'Perfil & Endereços'}
          </span>

          {/* Endereços Fixos de Interesse (Perfil) */}
          <button
            type="button"
            onClick={onOpenCommuteAnchorsModal}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${
              isCollapsed ? 'justify-center px-0' : ''
            }`}
            title="Endereços Fixos de Interesse (Saymon & Kelly)"
          >
            <MapPin className="h-4 w-4 shrink-0 text-rose-500" />
            {!isCollapsed && <span className="truncate">Endereços de Interesse</span>}
          </button>

          {/* Configurações IA e Modo Corretor - Visíveis EXCLUSIVAMENTE para o Saymon */}
          {(user?.username === 'saymon' ||
            user?.username === 'masterdev' ||
            user?.name?.toLowerCase().includes('saymon')) && (
            <>
              {/* Configurações IA */}
              <button
                type="button"
                onClick={onOpenSettings}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
                title="Configurações da Inteligência Artificial"
              >
                <Sparkles className="h-4 w-4 shrink-0 text-indigo-600" />
                {!isCollapsed && <span className="truncate">Configuração da IA</span>}
              </button>

              {/* Modo Corretor Link */}
              <a
                href="/corretor"
                target="_blank"
                rel="noreferrer"
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-slate-800 hover:text-indigo-600 transition-all ${
                  isCollapsed ? 'justify-center px-0' : ''
                }`}
                title="Portal Público do Corretor"
              >
                <span className="text-base leading-none shrink-0">👔</span>
                {!isCollapsed && (
                  <div className="flex items-center justify-between flex-1 truncate">
                    <span>Modo Corretor</span>
                    <ExternalLink className="h-3 w-3 text-slate-400" />
                  </div>
                )}
              </a>
            </>
          )}
        </div>
      </nav>

      {/* Quick Action: Cadastrar Imóvel */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <button
          type="button"
          onClick={onOpenNewProperty}
          className={`w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-500 to-indigo-600 hover:from-rose-600 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 ${
            isCollapsed ? 'px-0' : ''
          }`}
          title="Cadastrar Novo Imóvel"
        >
          <Plus className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="truncate">Cadastrar Imóvel</span>}
        </button>

        {/* User Session Info & Logout */}
        {user && (
          <div className={`pt-2 flex items-center justify-between ${isCollapsed ? 'justify-center' : ''}`}>
            <div className="flex items-center gap-2 truncate">
              <span className="text-base shrink-0">{user.avatar}</span>
              {!isCollapsed && (
                <div className="truncate">
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-emerald-500 font-bold block">Online</span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <button
                type="button"
                onClick={logout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Sair da Conta"
              >
                <LogOut className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
