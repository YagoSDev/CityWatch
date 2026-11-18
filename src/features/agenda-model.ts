import type { CommunityEvent } from './events-model';
export type AgendaEntry = {
  id: string; title: string; description?: string; category?: string; date?: string; end?: string; allDay?: boolean; local: string;
  city?: string; state?: string; origin?: string; scope?: 'Nacional' | 'Estadual' | 'Municipal'; validYear?: number;
  simulated: boolean; saved: boolean; added?: boolean; status?: 'programado' | 'cancelado' | 'encerrado'; invalidDate?: boolean;
  kind: 'evento' | 'feriado' | 'especial' | 'pessoal'; eventId?: string; source?: string;
};
export function buildAgenda(events: CommunityEvent[], favorites: string[], dates: AgendaEntry[], city: string, state: string, now = Date.now(), options: { includeInactive?: boolean; agendaIds?: string[] } = {}): AgendaEntry[] {
  const normalize = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  const byId = new Map<string, AgendaEntry>(); dates.forEach(item => byId.set(item.id, item));
  events.filter(e => normalize(e.cidade) === normalize(city) && e.estado === state && !e.publicidade && (options.includeInactive || (e.status !== 'cancelado' && e.status !== 'encerrado' && (!e.dataFim || Date.parse(e.dataFim) >= now)))).forEach(e => {
    const invalidDate = !!(e.dataInicio && !Number.isFinite(Date.parse(e.dataInicio))) || !!(e.dataFim && (!Number.isFinite(Date.parse(e.dataFim)) || (!!e.dataInicio && Date.parse(e.dataFim) <= Date.parse(e.dataInicio))));
    byId.set(`event:${e.id}`, { id: `event:${e.id}`, eventId: e.id, title: e.titulo, description: e.descricao, category: e.categoria, date: e.dataInicio, end: e.dataFim, local: e.local, city: e.cidade, state: e.estado,
      origin: e.simulado ? 'Catálogo demonstrativo CityWatch' : 'Comunidade', simulated: e.simulado, saved: favorites.includes(e.id), added: options.agendaIds?.includes(e.id) || false,
      status: e.status === 'cancelado' ? 'cancelado' : e.status === 'encerrado' || (!!e.dataFim && Date.parse(e.dataFim) < now) ? 'encerrado' : 'programado', invalidDate, kind: 'evento' });
  });
  return [...byId.values()].sort((a, b) => dateRank(a) - dateRank(b) || a.id.localeCompare(b.id));
}
function dateRank(item: AgendaEntry) { return item.date && !item.invalidDate && Number.isFinite(Date.parse(item.date)) ? Date.parse(item.date) : Infinity; }
export function filterAgenda(items: AgendaEntry[], range: [number, number], savedOnly = false, includeUndated = false) {
  return items.filter(item => (!savedOnly || item.saved || item.added) &&
    (Number.isFinite(dateRank(item)) ? Date.parse(item.date!) <= range[1] && Date.parse(item.end || item.date!) >= range[0] : includeUndated && (item.saved || item.added)));
}
export function localDayKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; }
export function monthKey(now: number) { return localDayKey(new Date(now)).slice(0, 7); }
export function shiftMonth(month: string, delta: number) { const [year, m] = month.split('-').map(Number); return localDayKey(new Date(year, m - 1 + delta, 1)).slice(0, 7); }
export function monthCells(month: string): (string | null)[] {
  const [year, m] = month.split('-').map(Number); const count = new Date(year, m, 0).getDate(); const offset = new Date(year, m - 1, 1).getDay();
  const cells: (string | null)[] = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= count; day++) cells.push(`${month}-${String(day).padStart(2, '0')}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}
export function dayRange(key: string): [number, number] { const [y, m, d] = key.split('-').map(Number); return [new Date(y, m - 1, d).getTime(), new Date(y, m - 1, d + 1).getTime() - 1]; }
export function entriesOnDay(items: AgendaEntry[], key: string) {
  const range = dayRange(key);
  return items.filter(item => !item.invalidDate && item.date && (item.allDay ? key >= item.date.slice(0, 10) && key <= (item.end || item.date).slice(0, 10) : Number.isFinite(dateRank(item)) && Date.parse(item.date) <= range[1] && Date.parse(item.end || item.date) >= range[0]));
}
export function monthRange(key: string): [number, number] { return [dayRange(`${key}-01`)[0], dayRange(`${shiftMonth(key, 1)}-01`)[0] - 1]; }
export function entryDateLabel(entry: AgendaEntry) {
  if (entry.invalidDate) return 'Data inválida';
  if (!entry.date) return 'Data a confirmar';
  return entry.allDay ? entry.date.slice(0, 10).split('-').reverse().join('/') : new Date(entry.date).toLocaleDateString('pt-BR');
}
