'use client';
import { useState } from 'react';
import { CustomerProtected } from '../../../components/customer-protected';
import { SiteHeader } from '../../../components/site-header';
export default function CustomerProfilePage() { const [name, setName] = useState(''); const [phone, setPhone] = useState(''); return <CustomerProtected><main className="page-bg"><SiteHeader /><section className="container" style={{ paddingTop: 50, paddingBottom: 50 }}><h1>Meu perfil</h1><form className="card" style={{ padding: 24, maxWidth: 520, display: 'grid', gap: 14, marginTop: 24 }}><input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome" /><input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Telefone" /><button className="btn-primary">Salvar perfil</button></form></section></main></CustomerProtected>; }
