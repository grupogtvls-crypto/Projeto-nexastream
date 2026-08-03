'use client';

import Hls from 'hls.js';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import styles from './player.module.css';

type Credentials = { server: string; username: string; password: string };
type Kind = 'live' | 'movie' | 'series';
type Category = { category_id: string; category_name: string };
type Media = {
  stream_id?: number; series_id?: number; name: string; stream_icon?: string; cover?: string;
  category_id?: string; container_extension?: string; rating?: string | number; releaseDate?: string;
};
type Episode = { id: string | number; title?: string; episode_num?: number; container_extension?: string; info?: { movie_image?: string; plot?: string } };

const STORAGE = { credentials: 'nexa_web_credentials', favorites: 'nexa_web_favorites', progress: 'nexa_web_progress' };
const section: Record<Kind, { title: string; categories: string; items: string }> = {
  live: { title: 'TV ao vivo', categories: 'get_live_categories', items: 'get_live_streams' },
  movie: { title: 'Filmes', categories: 'get_vod_categories', items: 'get_vod_streams' },
  series: { title: 'Séries', categories: 'get_series_categories', items: 'get_series' },
};

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try { return JSON.parse(localStorage.getItem(key) || '') as T; } catch { return fallback; }
}

export default function PlayerPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [credentials, setCredentials] = useState<Credentials>({ server: '', username: '', password: '' });
  const [connected, setConnected] = useState(false);
  const [profile, setProfile] = useState<{ username?: string; exp_date?: string; status?: string }>({});
  const [kind, setKind] = useState<Kind>('live');
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [items, setItems] = useState<Media[]>([]);
  const [selected, setSelected] = useState<Media | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [search, setSearch] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const saved = readJson<Credentials | null>(STORAGE.credentials, null);
    setFavorites(readJson<string[]>(STORAGE.favorites, []));
    if (saved) { setCredentials(saved); void connect(undefined, saved); }
    return () => hlsRef.current?.destroy();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function api(action = '', extra: Record<string, string | number> = {}, auth = credentials) {
    const response = await fetch('/api/xtream', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ ...auth, action, ...extra }) });
    const data = await response.json();
    if (!response.ok || data?.error) throw new Error(data?.error || 'Não foi possível carregar a lista');
    return data;
  }

  async function connect(event?: FormEvent, auth = credentials) {
    event?.preventDefault(); setLoading(true); setError('');
    try {
      const data = await api('', {}, auth);
      if (Number(data?.user_info?.auth) !== 1) throw new Error('Servidor, usuário ou senha inválidos');
      localStorage.setItem(STORAGE.credentials, JSON.stringify(auth));
      setCredentials(auth); setProfile(data.user_info || {}); setConnected(true);
      await loadSection('live', auth);
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha no login'); setConnected(false); }
    finally { setLoading(false); }
  }

  async function loadSection(next: Kind, auth = credentials) {
    setKind(next); setSelected(null); setEpisodes([]); setActiveCategory('all'); setSearch(''); setLoading(true); setError('');
    try {
      const [categoryData, itemData] = await Promise.all([api(section[next].categories, {}, auth), api(section[next].items, {}, auth)]);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
      setItems(Array.isArray(itemData) ? itemData : []);
    } catch (e) { setError(e instanceof Error ? e.message : 'Falha ao carregar o conteúdo'); }
    finally { setLoading(false); }
  }

  function mediaKey(item: Media, type = kind) { return `${type}:${item.stream_id ?? item.series_id}`; }
  function toggleFavorite(item: Media) {
    const key = mediaKey(item); const next = favorites.includes(key) ? favorites.filter((x) => x !== key) : [...favorites, key];
    setFavorites(next); localStorage.setItem(STORAGE.favorites, JSON.stringify(next));
  }

  function streamUrl(id: string | number, extension: string, type: 'live' | 'movie' | 'series') {
    const base = credentials.server.replace(/\/$/, '');
    const path = type === 'live' ? 'live' : type === 'movie' ? 'movie' : 'series';
    return `${base}/${path}/${encodeURIComponent(credentials.username)}/${encodeURIComponent(credentials.password)}/${id}.${extension}`;
  }

  function playUrl(rawUrl: string, resumeKey?: string) {
    const video = videoRef.current; if (!video) return;
    hlsRef.current?.destroy(); hlsRef.current = null;
    const url = `/api/stream?url=${encodeURIComponent(rawUrl)}`;
    const resume = resumeKey ? readJson<Record<string, number>>(STORAGE.progress, {})[resumeKey] || 0 : 0;
    const restore = () => { if (resume > 10 && Number.isFinite(video.duration) && resume < video.duration - 20) video.currentTime = resume; void video.play(); };
    if (rawUrl.toLowerCase().includes('.m3u8') && Hls.isSupported()) {
      const hls = new Hls({ enableWorker: true, lowLatencyMode: true }); hlsRef.current = hls; hls.loadSource(url); hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, restore);
    } else { video.src = url; video.onloadedmetadata = restore; }
    video.ontimeupdate = () => {
      if (!resumeKey || !Number.isFinite(video.currentTime)) return;
      const saved = readJson<Record<string, number>>(STORAGE.progress, {}); saved[resumeKey] = Math.floor(video.currentTime); localStorage.setItem(STORAGE.progress, JSON.stringify(saved));
    };
  }

  async function openMedia(item: Media) {
    setSelected(item); setEpisodes([]); setError('');
    if (kind === 'series') {
      setLoading(true);
      try {
        const data = await api('get_series_info', { series_id: item.series_id! });
        const seasons = data?.episodes && typeof data.episodes === 'object' ? Object.values(data.episodes).flat() as Episode[] : [];
        setEpisodes(seasons);
      } catch (e) { setError(e instanceof Error ? e.message : 'Não foi possível carregar os episódios'); }
      finally { setLoading(false); }
      return;
    }
    const extension = kind === 'live' ? 'm3u8' : (item.container_extension || 'mp4');
    playUrl(streamUrl(item.stream_id!, extension, kind), mediaKey(item));
  }

  function playEpisode(episode: Episode) {
    playUrl(streamUrl(episode.id, episode.container_extension || 'mp4', 'series'), `series:${selected?.series_id}:episode:${episode.id}`);
  }

  const visible = useMemo(() => items.filter((item) => {
    const categoryOk = activeCategory === 'all' || String(item.category_id) === activeCategory;
    const searchOk = item.name.toLowerCase().includes(search.toLowerCase());
    const favoriteOk = !onlyFavorites || favorites.includes(mediaKey(item));
    return categoryOk && searchOk && favoriteOk;
  }), [items, activeCategory, search, onlyFavorites, favorites, kind]);

  if (!connected) return <main className={styles.loginPage}><section className={styles.loginCard}>
    <div className={styles.logo}>N</div><p className={styles.eyebrow}>NEXASTREAM WEB</p><h1>Seu entretenimento,<br/><span>em qualquer tela.</span></h1>
    <p className={styles.muted}>Entre com os dados Xtream Codes da sua lista.</p>
    <form onSubmit={connect} className={styles.loginForm}>
      <label>Endereço do servidor<input value={credentials.server} onChange={(e) => setCredentials({ ...credentials, server: e.target.value })} placeholder="http://servidor.com:porta" required /></label>
      <div className={styles.formRow}><label>Usuário<input value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} required /></label><label>Senha<input type="password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} required /></label></div>
      {error && <div className={styles.error}>{error}</div>}<button disabled={loading}>{loading ? 'Conectando…' : 'Entrar no player'}</button>
    </form><small>Use apenas listas e conteúdos para os quais você possui autorização.</small>
  </section></main>;

  return <main className={styles.app}>
    <aside className={styles.sidebar}><a className={styles.brand} href="/"><span>N</span><b>NexaStream</b></a>
      <nav><button className={kind === 'live' ? styles.active : ''} onClick={() => loadSection('live')}>◉ <span>TV ao vivo</span></button><button className={kind === 'movie' ? styles.active : ''} onClick={() => loadSection('movie')}>▶ <span>Filmes</span></button><button className={kind === 'series' ? styles.active : ''} onClick={() => loadSection('series')}>▣ <span>Séries</span></button><button className={onlyFavorites ? styles.active : ''} onClick={() => setOnlyFavorites(!onlyFavorites)}>♥ <span>Favoritos</span></button></nav>
      <button className={styles.logout} onClick={() => { localStorage.removeItem(STORAGE.credentials); location.reload(); }}>↪ <span>Trocar lista</span></button>
    </aside>
    <section className={styles.content}>
      <header className={styles.topbar}><div><p>Bem-vindo de volta</p><h2>{profile.username || 'NexaStream'}</h2></div><label className={styles.search}>⌕<input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar canais, filmes e séries" /></label><div className={styles.status}><i />{profile.status || 'Ativo'}</div></header>
      {selected && <section className={styles.playerArea}><div className={styles.videoWrap}><video ref={videoRef} controls autoPlay playsInline /></div><div className={styles.nowPlaying}><img src={selected.stream_icon || selected.cover || ''} alt="" /><div><small>REPRODUZINDO AGORA</small><h3>{selected.name}</h3><p>{kind === 'series' ? `${episodes.length} episódios disponíveis` : section[kind].title}</p></div><button onClick={() => toggleFavorite(selected)}>{favorites.includes(mediaKey(selected)) ? '♥' : '♡'}</button></div>
        {kind === 'series' && <div className={styles.episodes}>{episodes.map((episode) => <button key={episode.id} onClick={() => playEpisode(episode)}><span>{episode.episode_num || '▶'}</span><div><b>{episode.title || `Episódio ${episode.episode_num || ''}`}</b><small>Assistir episódio</small></div></button>)}</div>}
      </section>}
      <section className={styles.library}><div className={styles.libraryTitle}><div><p>EXPLORAR</p><h1>{onlyFavorites ? 'Meus favoritos' : section[kind].title}</h1></div><span>{visible.length} itens</span></div>
        <div className={styles.categories}><button className={activeCategory === 'all' ? styles.selectedCategory : ''} onClick={() => setActiveCategory('all')}>Todos</button>{categories.map((category) => <button key={category.category_id} className={activeCategory === String(category.category_id) ? styles.selectedCategory : ''} onClick={() => setActiveCategory(String(category.category_id))}>{category.category_name}</button>)}</div>
        {error && <div className={styles.error}>{error}</div>}{loading ? <div className={styles.loading}>Carregando conteúdo…</div> : visible.length ? <div className={styles.mediaGrid}>{visible.map((item) => <article key={mediaKey(item)} onClick={() => openMedia(item)}><div className={styles.poster}>{(item.stream_icon || item.cover) ? <img src={item.stream_icon || item.cover} alt="" loading="lazy" /> : <span>N</span>}<div className={styles.play}>▶</div><button onClick={(e) => { e.stopPropagation(); toggleFavorite(item); }}>{favorites.includes(mediaKey(item)) ? '♥' : '♡'}</button></div><h3>{item.name}</h3><p>{item.releaseDate || (item.rating ? `★ ${item.rating}` : section[kind].title)}</p></article>)}</div> : <div className={styles.empty}>Nenhum conteúdo encontrado.</div>}
      </section>
    </section>
  </main>;
}
