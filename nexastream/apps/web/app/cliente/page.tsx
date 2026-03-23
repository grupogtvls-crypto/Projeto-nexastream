import Link from 'next/link';
import { CustomerProtected } from '../../components/customer-protected';
import { SiteHeader } from '../../components/site-header';
export default function CustomerAreaPage() { return <CustomerProtected><main className="page-bg"><SiteHeader /><section className="container" style={{ paddingTop: 50, paddingBottom: 50 }}><h1>Área do cliente</h1><div className="grid-3" style={{ marginTop: 24 }}><Link href="/cliente/dispositivos" className="card" style={{ padding: 24 }}><h3>Meus dispositivos</h3></Link><Link href="/cliente/downloads" className="card" style={{ padding: 24 }}><h3>Downloads</h3></Link><Link href="/cliente/perfil" className="card" style={{ padding: 24 }}><h3>Perfil</h3></Link></div></section></main></CustomerProtected>; }
