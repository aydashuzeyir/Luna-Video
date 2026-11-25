import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Image, StyleSheet, PanResponder, Modal, Dimensions, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { VideoView, useVideoPlayer } from 'expo-video';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium } from '@expo-google-fonts/inter';
import { Poppins_500Medium, Poppins_600SemiBold } from '@expo-google-fonts/poppins';
import { Ionicons } from '@expo/vector-icons';
import { useShareIntent } from 'expo-share-intent';

const W = Dimensions.get('window').width;
type V = { id: string; name: string; uri: string; thumb?: string; dur: number; cat: number; pos?: number };
type D = { vids: V[]; fl: string[]; lang: 'az' | 'en'; th: number; sort: 'new' | 'name' };
const TH = [
  { n: 'Luna Night', bg: '#0B1033', card: '#1A1F55', tx: '#E8E9F7', mu: '#A9ADD0', ac: '#8B7CF6', on: '#0B1033' },
  { n: 'AMOLED Neon', bg: '#000000', card: '#0A1A24', tx: '#E6FFFF', mu: '#9ED0D6', ac: '#00E5FF', on: '#001014' },
  { n: 'Cyberpunk', bg: '#12072B', card: '#24104A', tx: '#F3E8FF', mu: '#C4A8E8', ac: '#C03CFF', on: '#FFFFFF' },
  { n: 'Rose Pearl', bg: '#1F0F16', card: '#3A1624', tx: '#FFE9F0', mu: '#E0A8BC', ac: '#FF4D8D', on: '#1F0F16' },
  { n: 'Ocean Glass', bg: '#07192B', card: '#0E2E4A', tx: '#E3F4FF', mu: '#9CC4E0', ac: '#38B6FF', on: '#07192B' },
];
const C: any = { az: ['Filmlər', 'Ailə', 'Səyahət', 'Musiqi'], en: ['Movies', 'Family', 'Travel', 'Music'] };
const L: any = {
  az: { home: 'Ana səhifə', gal: 'Qalereya', set: 'Parametrlər', vids: 'Videolar', fld: 'Qovluqlar', srch: 'Axtar', empty: 'Hələ video yoxdur. Qalereyadan video seç.', pick: 'Video seç', gi: 'Yalnız seçdiyin videolar açılır.', gs: 'Hər dəfə sistemin seçim pəncərəsi açılır, bütün qalereya açılmır. Qalereyadan silsən də videolar tətbiqdə qalır.', den: 'Giriş məhduddur', dens: 'Video seçilmədi, icazə verilmədi. İcazəni parametrlərdən dəyişə bilərsən.', toset: 'Parametrlərə keç', back: 'Geri', lang: 'Dil', theme: 'Tema', perm: 'İcazələr', pt: 'Yalnız seçilmiş videolar. PIN və ya şifrə yoxdur.', clr: 'Bütün videoları sil', newf: 'Qovluq adı', mk: 'Yarat', ren: 'Ad', save: 'Yadda saxla', mv: 'Qovluğa əlavə et', del: 'Tətbiqdən sil', del2: 'Əminsən? Bir də bas', cls: 'Bağla', hint: 'Aşağı sürüşdür: çıx. Yuxarı: tam ekran. Sağa-sola: irəli-geri. İki dəfə toxun: 10 san.', busy: 'Videolar əlavə olunur...', cont: 'Davam et', tag: 'Sakit. Təhlükəsiz. Sənin.' },
  en: { home: 'Home', gal: 'Gallery', set: 'Settings', vids: 'Videos', fld: 'Folders', srch: 'Search', empty: 'No videos yet. Pick some from the gallery.', pick: 'Pick videos', gi: 'Only the videos you pick are opened.', gs: 'The system picker opens each time, the full gallery is never opened. Videos stay in the app even if deleted from the gallery.', den: 'Access is limited', dens: 'No video was picked, so permission was not given. You can change it in settings.', toset: 'Go to settings', back: 'Back', lang: 'Language', theme: 'Theme', perm: 'Permissions', pt: 'Only picked videos. No PIN or password.', clr: 'Remove all videos', newf: 'Folder name', mk: 'Create', ren: 'Name', save: 'Save', mv: 'Add to folder', del: 'Remove from app', del2: 'Sure? Tap again', cls: 'Close', hint: 'Swipe down: exit. Up: fullscreen. Left/right: seek. Double tap: 10 s.', busy: 'Adding videos...', cont: 'Continue', tag: 'Calm. Safe. Yours.' },
};
const fmt = (s: number) => { s = Math.floor(s || 0); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(x).padStart(2, '0'); };
const mk = (T: any) => StyleSheet.create({
  root: { flex: 1, backgroundColor: T.bg }, w: { padding: 20, paddingBottom: 110 },
  h2: { color: T.tx, fontFamily: 'Poppins_600SemiBold', fontSize: 20 }, tx: { color: T.tx, fontFamily: 'Inter_400Regular', fontSize: 15 }, m: { color: T.mu, fontFamily: 'Inter_400Regular', fontSize: 13 },
  card: { backgroundColor: T.card, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: T.mu + '33' },
  btn: { backgroundColor: T.ac, borderRadius: 12, minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  btnT: { color: T.on, fontFamily: 'Inter_500Medium', fontSize: 15 }, out: { backgroundColor: 'transparent', borderWidth: 1, borderColor: T.mu + '66' },
  chip: { borderWidth: 1, borderColor: T.mu + '66', borderRadius: 99, paddingHorizontal: 14, minHeight: 38, justifyContent: 'center', marginRight: 8, marginBottom: 8 },
  th: { width: W, height: W * 9 / 16, backgroundColor: T.card, marginHorizontal: -20 }, img: { width: '100%', height: '100%' },
  dur: { position: 'absolute', right: 10, bottom: 12, backgroundColor: '#000000B3', color: '#fff', borderRadius: 8, paddingHorizontal: 7, paddingVertical: 2, fontSize: 12, overflow: 'hidden' },
  pb: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 4, backgroundColor: '#ffffff4D' }, pf: { height: 4, backgroundColor: T.ac },
  ym: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 10 }, av: { width: 40, height: 40, borderRadius: 20, backgroundColor: T.ac, alignItems: 'center', justifyContent: 'center' },
  yn: { color: T.tx, fontFamily: 'Inter_500Medium', fontSize: 16 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nav: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 10, backgroundColor: T.bg, borderTopWidth: 1, borderTopColor: T.mu + '33' },
  inp: { backgroundColor: T.card, color: T.tx, borderRadius: 12, minHeight: 44, paddingHorizontal: 12, borderWidth: 1, borderColor: T.mu + '44', fontFamily: 'Inter_400Regular' },
});

function Player({ v, T, S, t, onBack, onPos }: any) {
  const ref = useRef<any>(null); const player = useVideoPlayer({ uri: v.uri }, (p: any) => { p.staysActiveInBackground = true; if (v.pos && v.pos > 3 && (!v.dur || v.pos < v.dur - 5)) p.currentTime = v.pos; p.play(); });
  const [s, setS] = useState({ c: 0, d: v.dur || 0, pl: true, r: 1 }); const [bw, setBw] = useState(1);
  const cb = useRef(onBack); cb.current = onBack; const st = useRef<any>({}); const last = useRef(0);
  useEffect(() => { const i = setInterval(() => { try { setS({ c: player.currentTime, d: player.duration || v.dur, pl: player.playing, r: player.playbackRate }); onPos(v.id, player.currentTime, player.duration); } catch (e) {} }, 700); return () => clearInterval(i); }, []);
  const pr = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => { st.current = { x: e.nativeEvent.pageX, t: player.currentTime, md: '' }; },
    onPanResponderMove: (e, g) => { const q = st.current; if (!q.md && (Math.abs(g.dx) > 12 || Math.abs(g.dy) > 12)) q.md = Math.abs(g.dx) > Math.abs(g.dy) ? 'h' : 'v'; if (q.md === 'h') player.currentTime = Math.max(0, Math.min(player.duration || 0, q.t + g.dx / W * 90)); },
    onPanResponderRelease: (e, g) => { const q = st.current;
      if (q.md === 'v' && g.dy > 80) cb.current(); else if (q.md === 'v' && g.dy < -80) ref.current?.enterFullscreen();
      else if (!q.md) { const n = Date.now(); if (n - last.current < 300) { player.currentTime = Math.max(0, player.currentTime + (q.x > W / 2 ? 10 : -10)); last.current = 0; } else { last.current = n; setTimeout(() => { if (last.current === n) { player.playing ? player.pause() : player.play(); } }, 260); } } },
  })).current;
  const R = [0.5, 0.75, 1, 1.5, 2];
  return (<View style={{ flex: 1, backgroundColor: '#000' }}>
    <View style={[S.row, { padding: 12, paddingTop: 40 }]}><Pressable onPress={onBack} hitSlop={12}><Ionicons name="arrow-back" size={26} color="#fff" /></Pressable><Text numberOfLines={1} style={[S.tx, { flex: 1, marginLeft: 12, color: '#fff' }]}>{v.name}</Text></View>
    <View style={{ width: W, height: W * 9 / 16 }} {...pr.panHandlers}><VideoView ref={ref} player={player} style={{ width: '100%', height: '100%' }} nativeControls={false} contentFit="contain" allowsFullscreen /></View>
    <Pressable onLayout={(e) => setBw(e.nativeEvent.layout.width)} onPress={(e) => { player.currentTime = e.nativeEvent.locationX / bw * (s.d || 0); }} style={{ height: 28, justifyContent: 'center', marginHorizontal: 12 }}><View style={{ height: 4, backgroundColor: '#ffffff40', borderRadius: 2 }}><View style={{ height: 4, borderRadius: 2, backgroundColor: T.ac, width: (s.d ? Math.min(100, s.c / s.d * 100) : 0) + '%' }} /></View></Pressable>
    <View style={[S.row, { paddingHorizontal: 16 }]}><Text style={S.m}>{fmt(s.c)} / {fmt(s.d)}</Text>
      <Pressable hitSlop={10} onPress={() => (s.pl ? player.pause() : player.play())}><Ionicons name={s.pl ? 'pause' : 'play'} size={34} color="#fff" /></Pressable>
      <Pressable hitSlop={10} onPress={() => { const n = R[(R.indexOf(s.r) + 1) % R.length]; player.playbackRate = n; }}><Text style={[S.tx, { color: '#fff' }]}>{s.r}×</Text></Pressable>
      <Pressable hitSlop={10} onPress={() => ref.current?.enterFullscreen()}><Ionicons name="expand" size={24} color="#fff" /></Pressable></View>
    <Text style={[S.m, { padding: 16 }]}>{t('hint')}</Text></View>);
}

export default function App() {
  const [fonts] = useFonts({ Inter_400Regular, Inter_500Medium, Poppins_500Medium, Poppins_600SemiBold });
  const [d, setD] = useState<D>({ vids: [], fl: [], lang: 'az', th: 0, sort: 'new' }); const [ready, setReady] = useState(false); const [splash, setSplash] = useState(true);
  const [scr, setScr] = useState('home'); const [tab, setTab] = useState('v'); const [cat, setCat] = useState(-1); const [q, setQ] = useState(''); const [sq, setSq] = useState(false);
  const [cur, setCur] = useState<string | null>(null); const [sh, setSh] = useState<string | null>(null); const [dc, setDc] = useState(false); const [busy, setBusy] = useState(false);
  const [tgt, setTgt] = useState(0); const [nf, setNf] = useState(''); const [rn, setRn] = useState(''); const posR = useRef<any>({});
  const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();
  useEffect(() => { if (hasShareIntent && ready && shareIntent?.files?.length) { addAssets(shareIntent.files.map((f: any) => ({ uri: /^(file|content):/.test(f.path) ? f.path : 'file://' + f.path, fileName: f.fileName, duration: 0 })), 0, 'home'); resetShareIntent(); } }, [hasShareIntent, ready]);
  const T = TH[d.th] || TH[0]; const S = useMemo(() => mk(T), [d.th]); const t = (k: string) => L[d.lang][k]; const FL = [...C[d.lang], ...d.fl];
  useEffect(() => { AsyncStorage.getItem('luna').then((s) => { if (s) setD(JSON.parse(s)); setReady(true); }); setTimeout(() => setSplash(false), 1600); }, []);
  useEffect(() => { if (ready) AsyncStorage.setItem('luna', JSON.stringify(d)); }, [d, ready]);
  const flush = () => setD((p) => { const k = Object.keys(posR.current); if (!k.length) return p; const vids = p.vids.map((v) => (posR.current[v.id] !== undefined ? { ...v, pos: posR.current[v.id] } : v)); posR.current = {}; return { ...p, vids }; });
  useEffect(() => { const i = setInterval(flush, 5000); return () => clearInterval(i); }, []);
  const onPos = (id: string, p: number, dur: number) => { posR.current[id] = dur && p > dur - 5 ? 0 : p; };
  const upd = (id: string, f: Partial<V>) => setD((p) => ({ ...p, vids: p.vids.map((v) => (v.id === id ? { ...v, ...f } : v)) }));
  const pick = async (c: number, back: string) => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, allowsMultipleSelection: true });
    if (r.canceled) { setScr('den'); return; }
    await addAssets(r.assets, c, back);
  };
  const addAssets = async (assets: any[], c: number, back: string) => {
    setBusy(true); const dir = FileSystem.documentDirectory + 'vault/'; await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(() => {}); const add: V[] = [];
    for (const a of assets) { const id = Date.now() + '_' + Math.random().toString(36).slice(2, 7); const ext = (a.uri.split('?')[0].split('.').pop() || 'mp4').slice(0, 4); const to = dir + id + '.' + ext;
      try { await FileSystem.copyAsync({ from: a.uri, to }); } catch (e) { continue; }
      let thumb; try { thumb = (await VideoThumbnails.getThumbnailAsync(to, { time: 1000 })).uri; } catch (e) {}
      add.push({ id, name: (a.fileName || 'Video').replace(/\.[^.]+$/, ''), uri: to, thumb, dur: Math.round((a.duration || 0) / 1000), cat: c }); }
    setD((p) => ({ ...p, vids: [...p.vids, ...add] })); setBusy(false); setScr(back);
  };
  const clearAll = async () => { await FileSystem.deleteAsync(FileSystem.documentDirectory + 'vault/', { idempotent: true }).catch(() => {}); setD((p) => ({ ...p, vids: [] })); };
  const delV = async (v: V) => { await FileSystem.deleteAsync(v.uri, { idempotent: true }).catch(() => {}); setD((p) => ({ ...p, vids: p.vids.filter((x) => x.id !== v.id) })); };
  if (!fonts || !ready || splash) return (<View style={[S.root, { alignItems: 'center', justifyContent: 'center' }]}><StatusBar barStyle="light-content" /><Ionicons name="moon" size={96} color="#C9BFFF" /><Text style={[S.h2, { fontSize: 32, marginTop: 12 }]}>Luna Video</Text><Text style={S.m}>{t('tag')}</Text></View>);
  const curV = d.vids.find((v) => v.id === cur);
  if (scr === 'play' && curV) return <Player key={curV.id} v={curV} T={T} S={S} t={t} onPos={onPos} onBack={() => { flush(); setScr('home'); }} />;
  const q2 = q.toLowerCase(); let vs = d.vids.filter((v) => (cat < 0 || v.cat === cat) && v.name.toLowerCase().includes(q2));
  vs = d.sort === 'name' ? [...vs].sort((a, b) => a.name.localeCompare(b.name)) : [...vs].reverse();
  const Card = (v: V) => { const p = v.pos && v.pos > 3 && v.dur ? Math.min(100, v.pos / v.dur * 100) : 0;
    return (<View key={v.id} style={{ marginBottom: 18 }}><Pressable onPress={() => { setCur(v.id); setScr('play'); }}><View style={S.th}>{v.thumb ? <Image source={{ uri: v.thumb }} style={S.img} /> : null}{v.dur ? <Text style={S.dur}>{fmt(v.dur)}</Text> : null}{p ? <View style={S.pb}><View style={[S.pf, { width: (p + '%') as any }]} /></View> : null}</View></Pressable>
      <View style={S.ym}><View style={S.av}><Text style={{ color: T.on, fontFamily: 'Inter_500Medium' }}>{v.name.charAt(0).toUpperCase()}</Text></View><View style={{ flex: 1 }}><Text numberOfLines={1} style={S.yn}>{v.name}</Text><Text style={S.m}>{FL[v.cat] || ''}</Text></View>
        <Pressable hitSlop={12} onPress={() => { setSh(v.id); setRn(v.name); setDc(false); }}><Ionicons name="ellipsis-vertical" size={22} color={T.tx} /></Pressable></View></View>); };
  const Chip = (label: string, on: boolean, f: () => void, k?: any) => (<Pressable key={k ?? label} onPress={f} style={[S.chip, on && { backgroundColor: T.ac, borderColor: T.ac }]}><Text style={[S.tx, on && { color: T.on }]}>{label}</Text></Pressable>);
  const shV = d.vids.find((v) => v.id === sh);
  let body: any;
  if (scr === 'den') body = (<View style={[S.w, { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 14 }]}><Ionicons name="lock-closed" size={44} color={T.ac} /><Text style={S.h2}>{t('den')}</Text><Text style={[S.m, { textAlign: 'center' }]}>{t('dens')}</Text><Pressable style={[S.btn, { alignSelf: 'stretch' }]} onPress={() => setScr('set')}><Text style={S.btnT}>{t('toset')}</Text></Pressable><Pressable style={[S.btn, S.out, { alignSelf: 'stretch' }]} onPress={() => setScr('home')}><Text style={S.tx}>{t('back')}</Text></Pressable></View>);
  else if (scr === 'gal') body = (<ScrollView contentContainerStyle={S.w}><Text style={S.h2}>{t('gal')}</Text>
    <View style={[S.card, { marginTop: 14, gap: 10 }]}><Ionicons name="lock-closed" size={30} color={T.ac} /><Text style={S.tx}>{t('gi')}</Text><Text style={S.m}>{t('gs')}</Text></View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginVertical: 8 }}>{FL.map((n, i) => Chip(n, tgt === i, () => setTgt(i), i))}</View>
    <Pressable style={S.btn} onPress={() => pick(tgt, 'gal')}><Text style={S.btnT}>{t('pick')} ({FL[tgt]})</Text></Pressable>
    <View style={[S.row, { marginTop: 16 }]}><TextInput style={[S.inp, { flex: 1, marginRight: 8 }]} value={nf} onChangeText={setNf} placeholder={t('newf')} placeholderTextColor={T.mu} maxLength={30} /><Pressable style={S.btn} onPress={() => { const n = nf.trim(); if (n && !FL.includes(n)) { setD((p) => ({ ...p, fl: [...p.fl, n] })); setNf(''); } }}><Text style={S.btnT}>{t('mk')}</Text></Pressable></View>
    {busy ? <Text style={[S.m, { marginTop: 12 }]}>{t('busy')}</Text> : null}</ScrollView>);
  else if (scr === 'set') body = (<ScrollView contentContainerStyle={S.w}><Text style={S.h2}>{t('set')}</Text>
    <View style={[S.card, S.row, { marginTop: 14 }]}><Text style={S.tx}>{t('lang')}</Text><View style={{ flexDirection: 'row' }}>{Chip('AZ', d.lang === 'az', () => setD((p) => ({ ...p, lang: 'az' })))}{Chip('EN', d.lang === 'en', () => setD((p) => ({ ...p, lang: 'en' })))}</View></View>
    <View style={S.card}><Text style={[S.tx, { marginBottom: 8 }]}>{t('theme')}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{TH.map((x, i) => Chip(x.n, d.th === i, () => setD((p) => ({ ...p, th: i })), i))}</View></View>
    <View style={S.card}><Text style={S.tx}>{t('perm')}</Text><Text style={[S.m, { marginVertical: 8 }]}>{t('pt')}</Text><Pressable style={[S.btn, S.out]} onPress={clearAll}><Text style={S.tx}>{t('clr')}</Text></Pressable></View></ScrollView>);
  else body = (<ScrollView contentContainerStyle={S.w}><View style={S.row}><Text style={[S.h2, { textTransform: 'uppercase' }]}>Luna Video</Text><View style={{ flexDirection: 'row', gap: 18 }}><Pressable hitSlop={10} onPress={() => setD((p) => ({ ...p, sort: p.sort === 'new' ? 'name' : 'new' }))}><Ionicons name="swap-vertical" size={24} color={T.tx} /></Pressable><Pressable hitSlop={10} onPress={() => { setSq(!sq); setQ(''); }}><Ionicons name="search" size={24} color={T.tx} /></Pressable></View></View>
    {sq ? <TextInput autoFocus style={[S.inp, { marginTop: 12 }]} value={q} onChangeText={setQ} placeholder={t('srch')} placeholderTextColor={T.mu} /> : null}
    <View style={{ flexDirection: 'row', gap: 22, marginVertical: 14 }}>{['v', 'f'].map((k) => (<Pressable key={k} onPress={() => setTab(k)}><Text style={[S.h2, { fontSize: 17, color: tab === k ? T.tx : T.mu }]}>{t(k === 'v' ? 'vids' : 'fld')}</Text>{tab === k ? <View style={{ height: 4, width: 28, borderRadius: 2, backgroundColor: T.ac, marginTop: 2 }} /> : null}</Pressable>))}</View>
    {tab === 'f' ? FL.map((n, i) => { const fv = d.vids.filter((v) => v.cat === i); return (<Pressable key={i} style={{ marginBottom: 14 }} onPress={() => { setCat(i); setTab('v'); }}><View style={[S.row, { gap: 12 }]}><View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: T.card, alignItems: 'center', justifyContent: 'center' }}><Ionicons name="folder" size={20} color={T.ac} /></View><Text style={[S.tx, { flex: 1, fontSize: 16 }]}>{n}</Text><Text style={S.m}>{fv.length}</Text><Ionicons name="chevron-forward" size={18} color={T.mu} /></View>{fv.length ? <View style={{ flexDirection: 'row', marginTop: 10, marginLeft: 48, borderRadius: 6, overflow: 'hidden' }}>{fv.slice(0, 3).map((v) => (<View key={v.id} style={{ flex: 1, height: 74, backgroundColor: T.card }}>{v.thumb ? <Image source={{ uri: v.thumb }} style={S.img} /> : null}</View>))}</View> : null}</Pressable>); })
      : (<View>{cat >= 0 ? Chip(FL[cat] + ' ✕', true, () => setCat(-1)) : null}{vs.length ? vs.map(Card) : <View style={S.card}><Text style={[S.m, { marginBottom: 12 }]}>{t('empty')}</Text><Pressable style={S.btn} onPress={() => setScr('gal')}><Text style={S.btnT}>{t('pick')}</Text></Pressable></View>}</View>)}</ScrollView>);
  return (<View style={S.root}><StatusBar barStyle="light-content" /><View style={{ flex: 1, paddingTop: 36 }}>{body}</View>
    <View style={S.nav}>{[['home', 'home'], ['gal', 'film'], ['set', 'settings']].map(([k, ic]) => (<Pressable key={k} onPress={() => setScr(k)} style={{ padding: 8, alignItems: 'center', minWidth: 72 }}><Ionicons name={ic as any} size={24} color={scr === k ? T.ac : T.mu} /><Text style={[S.m, { fontSize: 11, color: scr === k ? T.ac : T.mu }]}>{t(k)}</Text></Pressable>))}</View>
    <Modal visible={!!shV} transparent animationType="slide" onRequestClose={() => setSh(null)}><Pressable style={{ flex: 1, backgroundColor: '#0008', justifyContent: 'flex-end' }} onPress={() => setSh(null)}><Pressable style={{ backgroundColor: T.bg, padding: 20, borderTopLeftRadius: 20, borderTopRightRadius: 20, gap: 12 }}>
      <Text style={S.m}>{t('ren')}</Text><TextInput style={S.inp} value={rn} onChangeText={setRn} maxLength={80} />
      <Pressable style={S.btn} onPress={() => { if (shV && rn.trim()) upd(shV.id, { name: rn.trim() }); setSh(null); }}><Text style={S.btnT}>{t('save')}</Text></Pressable>
      <Text style={S.m}>{t('mv')}</Text><View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{FL.map((n, i) => Chip(n, shV?.cat === i, () => shV && upd(shV.id, { cat: i }), i))}</View>
      <Pressable style={[S.btn, S.out]} onPress={() => { if (!dc) setDc(true); else { if (shV) delV(shV); setSh(null); } }}><Text style={[S.tx, { color: '#FF9AA2' }]}>{dc ? t('del2') : t('del')}</Text></Pressable>
      <Pressable style={[S.btn, S.out]} onPress={() => setSh(null)}><Text style={S.tx}>{t('cls')}</Text></Pressable></Pressable></Pressable></Modal></View>);
}
