'use client';
import { FormEvent, useEffect, useState } from 'react';
import { ProtectedRoute } from '../../components/protected-route';
import { apiFetch } from '../../lib/api';

type PanelSettings = { panelName: string; logoUrl?: string | null; primaryColor?: string | null; maintenance: boolean };
export default function SettingsPage() {
  const [form, setForm] = useState<PanelSettings>({ panelName: '', logoUrl: '', primaryColor: '#06b6d4', maintenance: false });
  useEffect(() => { apiFetch('/api/settings/panel').then((r) => r.json()).then(setForm).catch(() => undefined); }, []);
  async function uploadLogo(file: File) {
    const token = localStorage.getItem('nexastream_token');
    const formData = new FormData(); formData.append('file', file);
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/uploads/panel-logo`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData });
    return r.json();
  }
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await apiFetch('/api/settings/panel', { method: 'PATCH', body: JSON.stringify(form) });
  }
  return <ProtectedRoute><main style={{ minHeight: '100vh', background: '#020617', color: '#fff', padding: 32 }}><h1>Configurações</h1><form onSubmit={handleSubmit} style={{ display: 'grid', gap: 14, maxWidth: 540, marginTop: 24 }}><input value={form.panelName} onChange={(e) => setForm({ ...form, panelName: e.target.value })} placeholder="Nome do painel" style={inputStyle} /><input value={form.logoUrl || ''} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="URL do logo" style={inputStyle} /><input value={form.primaryColor || '#06b6d4'} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} placeholder="#06b6d4" style={inputStyle} /><input type="file" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const uploaded = await uploadLogo(file); setForm((prev) => ({ ...prev, logoUrl: uploaded.url })); }} /><label style={{ display: 'flex', gap: 10, alignItems: 'center' }}><input type="checkbox" checked={form.maintenance} onChange={(e) => setForm({ ...form, maintenance: e.target.checked })} />Modo manutenção</label><button style={buttonStyle}>Salvar alterações</button></form></main></ProtectedRoute>;
}
const inputStyle: React.CSSProperties = { padding: '12px 14px', borderRadius: 12, border: '1px solid #334155', background: '#020617', color: '#fff' };
const buttonStyle: React.CSSProperties = { padding: '12px 14px', borderRadius: 12, border: 'none', background: '#06b6d4', color: '#020617', fontWeight: 700, cursor: 'pointer', width: 'fit-content' };
