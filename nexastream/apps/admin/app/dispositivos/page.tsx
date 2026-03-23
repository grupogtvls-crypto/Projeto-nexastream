'use client';

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../components/protected-route';
import { apiFetch } from '../../lib/api';

type Device = { id: string; deviceCode: string; platform: string; blocked: boolean; macActivated: boolean; license?: { key: string } | null; user?: { name: string } | null; };

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  async function loadDevices() { const r = await apiFetch('/api/devices'); if (r.ok) setDevices(await r.json()); }
  useEffect(() => { loadDevices(); }, []);
  return <ProtectedRoute><main style={{ minHeight: '100vh', background: '#020617', color: '#fff', padding: 32 }}><h1>Dispositivos</h1><div style={{ display: 'grid', gap: 16, marginTop: 24 }}>{devices.map((d) => <div key={d.id} style={{ background: '#0f172a', padding: 20, borderRadius: 20, border: '1px solid #1e293b' }}><p><strong>Código:</strong> {d.deviceCode}</p><p><strong>Cliente:</strong> {d.user?.name || '—'}</p><p><strong>Plataforma:</strong> {d.platform}</p><p><strong>Licença:</strong> {d.license?.key || '—'}</p><p><strong>MAC:</strong> {d.macActivated ? 'Ativado' : 'Inativo'}</p></div>)}</div></main></ProtectedRoute>;
}
