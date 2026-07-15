import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'CONECTA URP · Analítica de Egresados',
  description: 'Plataforma de analítica de la Encuesta de Egresados CONECTA URP',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
