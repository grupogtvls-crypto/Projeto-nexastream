import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', background: '#020617', color: '#fff', padding: 32 }}>
      <h1>NexaStream Admin</h1>
      <p>Painel administrativo inicial.</p>
      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        <Link href="/login">Login</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/dispositivos">Dispositivos</Link>
      </div>
    </main>
  );
}
