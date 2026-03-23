'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) throw new Error('Falha no login');
      const data = await response.json();
      localStorage.setItem('nexastream_token', data.accessToken);
      router.push('/dashboard');
    } catch {
      setError('E-mail ou senha inválidos');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#020617', color: '#fff' }}>
      <form onSubmit={handleSubmit} style={{ width: 360, background: '#0f172a', padding: 24, borderRadius: 20 }}>
        <h1>Entrar</h1>
        <div style={{ display: 'grid', gap: 12, marginTop: 20 }}>
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" style={inputStyle} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Senha" style={inputStyle} />
          {error ? <p style={{ color: '#f87171' }}>{error}</p> : null}
          <button disabled={loading} style={buttonStyle}>{loading ? 'Entrando...' : 'Entrar'}</button>
        </div>
      </form>
    </main>
  );
}

const inputStyle: React.CSSProperties = { padding: '12px 14px', borderRadius: 12, border: '1px solid #334155', background: '#020617', color: '#fff' };
const buttonStyle: React.CSSProperties = { padding: '12px 14px', borderRadius: 12, border: 'none', background: '#06b6d4', color: '#020617', fontWeight: 700, cursor: 'pointer' };
