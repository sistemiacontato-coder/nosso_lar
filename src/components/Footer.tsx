'use client';

import React from 'react';
import Image from 'next/image';
import { MessageCircle } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappUrl =
    'https://wa.me/5511981394841?text=Ol%C3%A1!%20Vim%20pelo%20Nosso%20Lar%20e%20gostaria%20de%20falar%20com%20a%20Sistemia.';

  return (
    <footer className="border-t border-slate-200/60 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/50 py-5 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: App Branding */}
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Nosso <span className="text-rose-600 dark:text-rose-400 font-bold">Lar</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              Dashboard de Decisão do Casal Saymon & Kelly 💑 © {currentYear}
            </span>
          </div>

          {/* Right: Discreet Sistemia Credit & WhatsApp Icon */}
          <div className="flex items-center gap-3 text-slate-400 text-xs">
            <span className="text-slate-400">Desenvolvido por</span>

            {/* Discreet Logo */}
            <div className="relative h-5 w-16 opacity-85 hover:opacity-100 transition-opacity mix-blend-multiply dark:mix-blend-normal dark:brightness-125">
              <Image
                src="/sistemia_logo.png"
                alt="Sistemia"
                fill
                className="object-contain"
              />
            </div>

            <span className="text-slate-300 dark:text-slate-700">•</span>

            {/* Discrete WhatsApp Link */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              title="Falar com a Sistemia no WhatsApp: (11) 98139-4841"
              className="inline-flex items-center gap-1.5 font-medium text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors group"
            >
              <MessageCircle className="h-4 w-4 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="text-slate-600 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                (11) 98139-4841
              </span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
