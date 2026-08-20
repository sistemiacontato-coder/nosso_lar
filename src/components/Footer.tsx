'use client';

import React from 'react';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappUrl =
    'https://wa.me/5511981394841?text=Ol%C3%A1!%20Vim%20pelo%20Nosso%20Lar%20e%20gostaria%20de%20falar%20com%20a%20Sistemia.';

  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/60 backdrop-blur-md py-4 text-xs text-slate-500 dark:text-slate-400">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left Side: Nosso Lar Branding & Couple Context */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">
              Nosso <span className="text-rose-600 dark:text-rose-400">Lar</span> © {currentYear}
            </span>
            <span className="text-slate-300 dark:text-slate-700">—</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Dashboard de Decisão do Casal Saymon & Kelly 💑
            </span>
          </div>

          {/* Right Side: Desenvolvido por + Cropped Transparent Logo + Discrete WhatsApp Icon */}
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-normal">Desenvolvido por</span>

            {/* Recortada & Transparente Logo */}
            <div className="relative h-6 w-24 hover:opacity-90 transition-opacity">
              <Image
                src="/sistemia_logo_clean.png"
                alt="Sistemia"
                fill
                className="object-contain dark:brightness-110"
              />
            </div>

            {/* Discrete Green WhatsApp Icon Only (Without text number) */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              title="Falar com a Sistemia no WhatsApp"
              className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-white transition-all shadow-sm hover:scale-110 shrink-0"
            >
              <svg
                className="h-4 w-4 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-1.005 3.67 3.748-.983z" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
