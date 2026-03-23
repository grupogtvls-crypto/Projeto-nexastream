'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
export function CustomerProtected({ children }: { children: React.ReactNode }) { const router = useRouter(); const [ready, setReady] = useState(false); useEffect(() => { const token = localStorage.getItem('nexastream_token'); if (!token) { router.replace('/login'); return; } setReady(true); }, [router]); if (!ready) return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Carregando...</main>; return <>{children}</>; }
