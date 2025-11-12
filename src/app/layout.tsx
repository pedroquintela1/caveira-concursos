import type { Metadata } from 'next';
import { Inter, Saira } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const saira = Saira({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-saira',
});

export const metadata: Metadata = {
  title: 'KAV Concursos - Lei Seca Descomplicada',
  description:
    'Estude, Memorize, Aprove. A Lei Seca descomplicada para concursos públicos.',
  keywords: [
    'concursos públicos',
    'lei seca',
    'questões',
    'mnemônicos',
    'flashcards',
    'estudo',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${saira.variable} font-saira antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
