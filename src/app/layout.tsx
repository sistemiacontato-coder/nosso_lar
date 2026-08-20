import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Nosso Lar | Comparador de Imóveis (Saymon & Kelly)',
  description:
    'Compare apartamentos para aluguel lado a lado. Calcule custo total (aluguel + condomínio + IPTU), preço por m², tempo de trajeto e registre os pontos de vista de Saymon & Kelly.',
  keywords: [
    'nosso lar',
    'aluguel de apartamento',
    'comparador de imóveis',
    'cotação de aluguel',
    'osasco',
    'vila yara',
    'vila sao francisco',
  ],
  authors: [{ name: 'Saymon & Kelly' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
