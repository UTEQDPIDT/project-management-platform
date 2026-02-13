import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Providers from './providers';

import './global.css';
import { Toaster } from '@/components/ui/sonner';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
});

export const metadata: Metadata = {
  title: 'PREP | Plataforma de Registro de Eventos y Proyectos',
  description:
    'PREP es una plataforma diseñada para facilitar la gestión de eventos y proyectos dentro de la Universidad Tecnológica de Querétaro (UTEQ). Nuestra misión es proporcionar a estudiantes, profesores y personal administrativo una herramienta eficiente para organizar, registrar y dar seguimiento a sus actividades académicas y extracurriculares.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
