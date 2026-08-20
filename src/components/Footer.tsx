'use client';

import React from 'react';
import Image from 'next/image';
import { MessageSquare, Sparkles } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappUrl =
    'https://wa.me/5511985778167?text=Ol%C3%A1!%20Vim%20pelo%20Nosso%20Lar%20e%20gostaria%20de%20falar%20com%20a%20Sistemia%20sobre%20sistemas%20e%20IA.';

  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md py-8 text-xs text-slate-600 dark:text-slate-400">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left Column: Nosso Lar */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-1">
            <span className="font-bold text-slate-900 dark:text-white text-sm">
              Nosso <span className="text-rose-600 dark:text-rose-400">Lar</span> © {currentYear}
            </span>
            <span className="text-slate-500 dark:text-slate-400">
              Dashboard de Decisão do Casal Saymon & Kelly 💑
            </span>
          </div>

          {/* Center Column: Sistemia Branding, Logo & WhatsApp Button */}
          <div className="flex flex-col items-center text-center space-y-2 py-2 px-6 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800/60 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="relative h-7 w-24">
                <Image
                  src="/sistemia_logo.png"
                  alt="Sistemia Logo"
                  fill
                  className="object-contain dark:brightness-110"
                />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> IA & Sistemas
              </span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-sm">
              Construção de Atendimentos com Inteligência Artificial e Sistemas sob Medida.
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:shadow-emerald-500/20 transition-all"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>Falar com a Sistemia no WhatsApp</span>
              <span className="text-[10px] font-normal opacity-90">(11 98577-8167)</span>
            </a>
          </div>

          {/* Right Column: Tailored Disclaimer */}
          <div className="flex flex-col items-center md:items-end text-center md:text-right space-y-1">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Desenvolvido sob medida
            </span>
            <span className="text-slate-400">
              Para a melhor escolha de aluguel em Osasco & SP.
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
