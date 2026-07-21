import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';

const plusJakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans', weight: ['400', '500', '600', '700', '800'] });
const plusJakartaDisplay = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-display', weight: ['600', '700', '800'] });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '500', '600'] });

export const metadata: Metadata = {
  title: 'CONECTA URP · Analítica de Egresados',
  description: 'Plataforma de analítica de la Encuesta de Egresados CONECTA URP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${plusJakarta.variable} ${plusJakartaDisplay.variable} ${jetbrainsMono.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
