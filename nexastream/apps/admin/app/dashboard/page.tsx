import { ProtectedRoute } from '../../components/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main style={{ minHeight: '100vh', background: '#020617', color: '#fff', padding: 32 }}>
        <h1>Dashboard NexaStream</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 16, marginTop: 24 }}>
          {[['Dispositivos online', '1.248'], ['Bloqueados', '32'], ['Testes ativos', '93'], ['Listas ativas', '18']].map(([title, value]) => (
            <div key={title} style={{ background: '#0f172a', padding: 20, borderRadius: 20, border: '1px solid #1e293b' }}>
              <p style={{ color: '#94a3b8' }}>{title}</p>
              <strong style={{ fontSize: 28 }}>{value}</strong>
            </div>
          ))}
        </div>
      </main>
    </ProtectedRoute>
  );
}
