import { Suspense } from 'react';
import OAuthSuccessClient from './oauth-success-client';

export const dynamic = 'force-dynamic';

export default function OAuthSuccessPage() {
  return (
    <Suspense
      fallback={
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
      }
    >
      <OAuthSuccessClient />
    </Suspense>
  );
}
