import './globals.css';
import { ReactNode } from 'react';
export const metadata = { title: 'NexaStream', description: 'Plataforma oficial NexaStream' };
export default function RootLayout({ children }: { children: ReactNode }) { return <html lang="pt-BR"><body>{children}</body></html>; }
