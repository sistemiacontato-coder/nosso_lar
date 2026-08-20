'use client';

import React from 'react';
import Image from 'next/image';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const whatsappUrl =
    'https://wa.me/5511981394841?text=Ol%C3%A1!%20Vim%20pelo%20Nosso%20Lar%20e%20gostaria%20de%20falar%20com%20a%20Sistemia.';

  return (
    <footer className="border-t border-slate-200/60 dark:border-slate-800/60 bg-white/70 dark:bg-slate-950/70 backdrop-blur-md py-3 text-[11px] text-slate-500 dark:text-slate-400">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left Side: Context & Branding */}
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              Nosso <span className="text-rose-600 dark:text-rose-400">Lar</span> © {currentYear}
            </span>
            <span className="text-slate-300 dark:text-slate-700">—</span>
            <span className="text-slate-500 dark:text-slate-400 font-medium">
              Dashboard de Decisão do Casal Saymon & Kelly 💑
            </span>
          </div>

          {/* Right Side: Typography Logo & Official WhatsApp Image */}
          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-400 font-normal">Desenvolvido por</span>

            {/* Typography Logo: Perfeitamente Harmonizada em Altura e Cores */}
            <span className="font-extrabold text-[12px] tracking-tight text-slate-900 dark:text-white flex items-center">
              Sistem<span className="text-[#009ee3] dark:text-[#38bdf8] font-black">IA</span>
            </span>

            {/* Logo Oficial do WhatsApp da pasta do projeto */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              title="Falar com a Sistemia no WhatsApp"
              className="relative h-4.5 w-4.5 hover:scale-110 transition-transform ml-0.5 shrink-0"
            >
              <Image
                src="/whatsapp_logo_clean.png"
                alt="WhatsApp"
                width={18}
                height={18}
                className="object-contain"
              />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
