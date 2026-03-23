'use client';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../components/protected-route';
import { apiFetch } from '../../lib/api';

type License = { id: string; key: string; status: string; durationDays: number };
export default function LicensesPage() {
  const [items, setItems] = useState<License[]>([]);
  useEffect(() => { apiFetch('/api/licenses').then((r) => r.json()).then(setItems).catch(() => undefined); }, []);
  return <ProtectedRoute><main style={{ minHeight: '100vh', background: '#020617', color: '#fff', padding: 32 }}><h1>Licenças</h1><div style={{ display: 'grid', gap: 16, marginTop: 24 }}>{items.map((i) => <div key={i.id} style={{ background: '#0f172a', padding: 20, borderRadius: 20, border: '1px solid #1e293b' }}><p><strong>Chave:</strong> {i.key}</p><p><strong>Status:</strong> {i.status}</p><p><strong>Duração:</strong> {i.durationDays} dias</p></div>)}</div></main></ProtectedRoute>;
}
