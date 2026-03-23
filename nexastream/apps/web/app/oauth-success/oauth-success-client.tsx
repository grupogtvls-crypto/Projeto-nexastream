'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function OAuthSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      localStorage.setItem('nexastream_token', token);
      router.replace('/cliente');
      return;
    }

    router.replace('/login');
  }, [router, searchParams]);

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: '#020617',
        color: '#fff',
      }}
    >
      Finalizando login...
    </main>
  );
}
