import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import ThemeRegistry from './ThemeRegistry';
import { AuthProvider } from './contexts/AuthContext';
import './globals.css';
import logo from './logo.png';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'POHINC: ClinicaGen — Crie o sistema da sua clínica',
  description:
    'Um jeito fácil e simples de gerar um sistema de gestão personalizado para sua clínica médica.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <head>
        <link rel="icon" href={logo.src} />
      </head>
      <body>
        <ThemeRegistry>
          <AuthProvider>{children}</AuthProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
