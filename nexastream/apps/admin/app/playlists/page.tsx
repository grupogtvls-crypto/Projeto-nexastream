'use client';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from '../../components/protected-route';
import { apiFetch } from '../../lib/api';

type Playlist = { id: string; name: string; sourceType: string; active: boolean };
export default function PlaylistsPage() {
  const [items, setItems] = useState<Playlist[]>([]);
  useEffect(() => { apiFetch('/api/playlists').then((r) => r.json()).then(setItems).catch(() => undefined); }, []);
  return <ProtectedRoute><main style={{ minHeight: '100vh', background: '#020617', color: '#fff', padding: 32 }}><h1>Listas IPTV</h1><div style={{ display: 'grid', gap: 16, marginTop: 24 }}>{items.map((i) => <div key={i.id} style={{ background: '#0f172a', padding: 20, borderRadius: 20, border: '1px solid #1e293b' }}><p><strong>Nome:</strong> {i.name}</p><p><strong>Origem:</strong> {i.sourceType}</p><p><strong>Status:</strong> {i.active ? 'Ativa' : 'Inativa'}</p></div>)}</div></main></ProtectedRoute>;
}
