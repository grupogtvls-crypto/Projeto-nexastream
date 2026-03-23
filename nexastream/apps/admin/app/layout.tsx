import './globals.css';
import { ReactNode } from 'react';

export const metadata = { title: 'NexaStream Admin', description: 'Painel administrativo NexaStream' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="pt-BR"><body>{children}</body></html>;
}
