import type { CommunityEvent } from './events-model';
import type { OcorrenciaAcademica } from './academic-api';
export type Coordinate = { latitude: number; longitude: number };
export const contentTypes = [
  { id: 'ocorrencias', label: 'Ocorrências', icon: 'exclamationmark.triangle.fill', color: '#B43D29' },
  { id: 'alertas', label: 'Alertas', icon: 'bell.badge.fill', color: '#B46100' },
  { id: 'eventos', label: 'Eventos', icon: 'calendar', color: '#7752B8' },
  { id: 'promocoes', label: 'Promoções', icon: 'tag.fill', color: '#A32876' },
  { id: 'noticias', label: 'Notícias', icon: 'newspaper.fill', color: '#397668' },
  { id: 'parceiros', label: 'Parceiros', icon: 'storefront.fill', color: '#34766F' },
  { id: 'servicos', label: 'Serviços públicos', icon: 'building.columns.fill', color: '#2467A3' },
  { id: 'recompensas', label: 'Recompensas', icon: 'gift.fill', color: '#8B4D24' },
] as const;
export const discoveryCategories = ['Trânsito', 'Segurança', 'Clima', 'Iluminação', 'Acessibilidade', 'Limpeza', 'Conservação', 'Cultura', 'Esportes', 'Solidariedade', 'Animais', 'Educação', 'Saúde', 'Comércio'] as const;
export type ContentType = typeof contentTypes[number]['id'];
export type DiscoveryItem = {
  id: string; title: string; description: string; type: ContentType; category: string; local: string;
  dateOnly?: boolean; coordinate?: Coordinate; start?: string; end?: string; status: 'aberto' | 'andamento' | 'encerrado' | 'cancelado'; verified: boolean;
  source?: string; verification?: 'oficial' | 'confirmado' | 'nao-verificado' | 'simulado';
  simulated: boolean; fictionalPosition: boolean; advertising: boolean;
  image: CommunityEvent['imagem']; eventId?: string; occurrenceId?: string;
};
export type MapFilters = { types: ContentType[]; categories: string[]; distance: number | null; time: 'todos' | 'agora' | 'hoje' | 'semana' | 'mes' | 'proximos'; verification?: string[]; status: 'todos' | 'recentes' | 'confirmados' | 'andamento' | 'encerrados' };
export const defaultMapFilters: MapFilters = { types: ['ocorrencias', 'alertas', 'eventos'], categories: [], distance: null, time: 'todos', status: 'todos' };
export function normalizedDiscovery(value: string) { return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim(); }
export function fictionalCoordinate(id: string, center: Coordinate) {
  const hash = Array.from(id).reduce((sum, letter) => (sum * 31 + letter.charCodeAt(0)) >>> 0, 17);
  const angle = (hash % 360) * Math.PI / 180;
  const radius = 0.006 + ((hash >>> 8) % 15) / 1000;
  return { latitude: center.latitude + Math.sin(angle) * radius, longitude: center.longitude + Math.cos(angle) * radius };
}
export function distanceKm(a: Coordinate, b: Coordinate) {
  const rad = (v: number) => v * Math.PI / 180;
  const h = Math.sin(rad(b.latitude - a.latitude) / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(rad(b.longitude - a.longitude) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}
export function timeBounds(period: MapFilters['time'], now: number): [number, number] {
  const day = new Date(now); day.setHours(0, 0, 0, 0);
  if (period === 'agora') return [now, now];
  if (period === 'proximos') return [now, Infinity];
  const end = new Date(day);
  if (period === 'hoje') end.setDate(end.getDate() + 1);
  else if (period === 'semana') { day.setDate(day.getDate() - (day.getDay() + 6) % 7); end.setTime(day.getTime()); end.setDate(end.getDate() + 7); }
  else if (period === 'mes') { day.setDate(1); end.setTime(day.getTime()); end.setMonth(end.getMonth() + 1); }
  else return [-Infinity, Infinity];
  return [day.getTime(), end.getTime() - 1];
}
export function inPeriod(start: string | undefined, end: string | undefined, period: MapFilters['time'], now: number) {
  if (period === 'todos') return true;
  if (!start || !Number.isFinite(Date.parse(start))) return false;
  const a = Date.parse(start); const b = end ? Date.parse(end) : a;
  const [from, to] = timeBounds(period, now);
  return a <= to && b >= from;
}
export function filterDiscovery(items: DiscoveryItem[], filters: MapFilters, origin: Coordinate, query = '', now = Date.now()) {
  const term = normalizedDiscovery(query);
  return items.filter(item => filters.types.includes(item.type) &&
    (!filters.categories.length || filters.categories.includes(item.category)) &&
    (filters.distance === null || (!!item.coordinate && distanceKm(origin, item.coordinate) <= filters.distance)) &&
    (filters.time !== 'proximos' || (item.type === 'eventos' && item.status !== 'encerrado' && item.status !== 'cancelado')) &&
    (!filters.verification?.length || filters.verification.includes(mapVerification(item))) &&
    inPeriod(item.start, item.end, filters.time, now) &&
    (filters.status === 'todos' || (filters.status === 'confirmados' ? item.verified :
      filters.status === 'recentes' ? !!item.start && Date.parse(item.start) <= now && Date.parse(item.start) >= now - 86400000 :
      filters.status === 'andamento' ? item.status === 'andamento' : item.status === 'encerrado')) &&
    (!term || normalizedDiscovery([item.title, item.description, item.local, item.category].join(' ')).includes(term)));
}
export function withinRegion(item: DiscoveryItem, region: Coordinate & { latitudeDelta: number; longitudeDelta: number }) {
  if (!item.coordinate) return false;
  const lon = ((item.coordinate.longitude - region.longitude + 540) % 360) - 180;
  return Math.abs(item.coordinate.latitude - region.latitude) <= region.latitudeDelta / 2 && Math.abs(lon) <= region.longitudeDelta / 2;
}
const eventCategory: Record<CommunityEvent['categoria'], string> = { cultura: 'Cultura', esportes: 'Esportes', solidariedade: 'Solidariedade', animais: 'Animais', meio_ambiente: 'Clima', educacao: 'Educação', saude: 'Saúde', promocoes: 'Comércio' };
export function mapEvents(events: CommunityEvent[], city: string, state: string, center?: Coordinate, now = Date.now()): DiscoveryItem[] {
  return events.filter(e => normalizedDiscovery(e.cidade) === normalizedDiscovery(city) && e.estado === state).map(e => ({
    id: `event:${e.id}`, eventId: e.id, title: e.titulo, description: e.descricao,
    type: e.publicidade ? 'promocoes' : 'eventos', category: eventCategory[e.categoria], local: `${e.local} · ${e.bairro || e.cidade}`,
    coordinate: e.localVerificado && e.latitude !== undefined && e.longitude !== undefined ? { latitude: e.latitude, longitude: e.longitude } : e.simulado && center ? fictionalCoordinate(e.id, center) : undefined,
    start: e.dataInicio, end: e.dataFim, status: e.status === 'cancelado' ? 'cancelado' : e.status !== 'programado' || (!!e.dataFim && Date.parse(e.dataFim) < now) ? 'encerrado' : 'aberto',
    source: e.simulado ? 'Catálogo demonstrativo CityWatch' : 'Catálogo comunitário', verification: e.simulado ? 'simulado' : 'nao-verificado', verified: false, simulated: e.simulado, fictionalPosition: !(e.localVerificado && e.latitude !== undefined && e.longitude !== undefined), advertising: !!e.publicidade, image: e.imagem,
  }));
}
export function mapOccurrences(items: OcorrenciaAcademica[], center: Coordinate): DiscoveryItem[] {
  // A API pública omite GPS cidadão de propósito. Não derivamos coordenadas de endereços privados.
  return items.filter(i => i.origem !== 'cidadao').map(i => ({
    id: `occurrence:${i.id}`, occurrenceId: i.id, title: i.descricao, description: `Registro ${i.id} · ${i.categoria}. Posição acadêmica fictícia.`,
    type: 'ocorrencias', dateOnly: true, category: i.categoria.charAt(0).toUpperCase() + i.categoria.slice(1), source: 'Backend Python · base acadêmica', verification: 'simulado',
    local: i.localidade || i.bairro, coordinate: fictionalCoordinate(i.id, center), start: `${i.data}T00:00:00-03:00`,
    status: i.status === 'concluída' ? 'encerrado' : i.status === 'em análise' ? 'andamento' : 'aberto',
    verified: false, simulated: true, fictionalPosition: true, advertising: false, image: i.categoria === 'limpeza' ? 'cleanup' : i.categoria === 'conservação' ? 'maintenance' : i.categoria === 'acessibilidade' ? 'accessibility' : 'lighting',
  }));
}
export function discoveryStatus(item: DiscoveryItem) { return item.status === 'cancelado' ? 'Cancelado' : item.status === 'andamento' ? 'Em andamento' : item.status === 'encerrado' ? 'Encerrado' : 'Aberto / programado'; }

export function mapVerification(item: DiscoveryItem) {
  return item.simulated ? 'simulado' : item.verification || (item.verified ? 'confirmado' : 'nao-verificado');
}
export function verificationLabel(item: DiscoveryItem) {
  return { oficial: 'Oficial', confirmado: 'Confirmado', 'nao-verificado': 'Relato não verificado', simulado: 'Simulado' }[mapVerification(item)];
}
export type MapGroup = { id: string; coordinate: Coordinate; items: DiscoveryItem[] };
/** Agrupamento por células da câmera, sem dependência nativa adicional. */
export function groupMapItems(items: DiscoveryItem[], region: Coordinate & { latitudeDelta: number; longitudeDelta: number }): MapGroup[] {
  const latSize = Math.max(region.latitudeDelta / 7, 0.00003);
  const lonSize = Math.max(region.longitudeDelta / 5, 0.00003);
  const groups = new Map<string, DiscoveryItem[]>();
  for (const item of items) {
    const p = item.coordinate;
    if (!p || !Number.isFinite(p.latitude) || !Number.isFinite(p.longitude) || Math.abs(p.latitude) > 90 || Math.abs(p.longitude) > 180) continue;
    // A publicidade nunca entra no mesmo grupo de riscos e alertas.
    const key = `${item.advertising ? 'ad' : 'info'}:${Math.floor(p.latitude / latSize)}:${Math.floor(p.longitude / lonSize)}`;
    groups.set(key, [...(groups.get(key) || []), item]);
  }
  return [...groups].map(([id, members]) => ({ id, items: members, coordinate: {
    latitude: members.reduce((v, i) => v + i.coordinate!.latitude, 0) / members.length,
    longitude: members.reduce((v, i) => v + i.coordinate!.longitude, 0) / members.length,
  } }));
}
