export const eventCategories = [
  { id: 'todos', label: 'Todos', icon: 'square.grid.2x2' },
  { id: 'cultura', label: 'Cultura', icon: 'theatermasks' },
  { id: 'esportes', label: 'Esportes', icon: 'figure.run' },
  { id: 'solidariedade', label: 'Solidariedade', icon: 'heart' },
  { id: 'animais', label: 'Animais', icon: 'pawprint' },
  { id: 'meio_ambiente', label: 'Meio ambiente', icon: 'leaf' },
  { id: 'educacao', label: 'Educação', icon: 'book' },
  { id: 'saude', label: 'Saúde', icon: 'cross.case' },
  { id: 'promocoes', label: 'Promoções', icon: 'tag' },
] as const;
export type EventCategory = Exclude<typeof eventCategories[number]['id'], 'todos'>;
export type CommunityEvent = {
  id: string; titulo: string; resumo: string; descricao: string; categoria: EventCategory;
  imagem: 'festival' | 'running' | 'adoption' | 'park' | 'rio' | 'books' | 'planting' | 'art' | 'donations' | 'wellness' | 'market' | 'neighbors' | 'photography' | 'cleanup' | 'coffee' | 'rain' | 'maintenance' | 'lighting' | 'accessibility';
  dataInicio?: string; dataFim?: string; periodo?: string; fuso: string;
  local: string; bairro?: string; cidade: string; estado: string;
  endereco?: string; latitude?: number; longitude?: number; localVerificado?: boolean;
  organizador?: string; preco?: number; destaque: boolean; simulado: boolean; publicidade?: boolean;
  programacao?: { horario: string; atividade: string }[];
  links?: { titulo: string; url: string; tipo: 'site' | 'instagram' | 'inscricao' | 'regulamento' | 'informacoes' }[];
  status: 'programado' | 'cancelado' | 'encerrado'; criadoEm: string;
};
export function normalized(value: string) { return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().toLowerCase(); }
export function categoryLabel(category: string) { return eventCategories.find(item => item.id === category)?.label || category; }
export function eventStatus(event: CommunityEvent, now = Date.now()) {
  if (event.status === 'cancelado') return 'cancelado';
  if (event.status === 'encerrado' || (event.dataFim && Date.parse(event.dataFim) < now)) return 'encerrado';
  return 'programado';
}
export function filterEvents(events: CommunityEvent[], filters: { category?: string; query?: string; futureOnly?: boolean; favoritesOnly?: boolean; favorites?: string[]; city: string; state: string }, now = Date.now()) {
  const query = normalized(filters.query || '');
  return events.filter(event => normalized(event.cidade) === normalized(filters.city) && event.estado === filters.state &&
    (!filters.category || filters.category === 'todos' || event.categoria === filters.category) &&
    (!query || normalized([event.titulo, event.resumo, categoryLabel(event.categoria), event.bairro, event.local].join(' ')).includes(query)) &&
    (!filters.favoritesOnly || filters.favorites?.includes(event.id)) &&
    (!filters.futureOnly || (eventStatus(event, now) === 'programado' && !!event.dataInicio && Date.parse(event.dataInicio) > now)));
}
export function safeEventUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || !url.hostname || url.username || url.password) return null;
    if (/^(localhost|127\.|10\.|192\.168\.|\[::1\])/.test(url.hostname)) return null;
    return url.href;
  } catch { return null; }
}
export function calendarPayload(event: CommunityEvent, now = Date.now()) {
  if (eventStatus(event, now) !== 'programado') throw new Error('Este evento foi cancelado ou já encerrou.');
  if (!event.dataInicio || !event.dataFim || !Number.isFinite(Date.parse(event.dataInicio)) || !Number.isFinite(Date.parse(event.dataFim)) || Date.parse(event.dataFim) <= Date.parse(event.dataInicio)) {
    throw new Error('A data e os horários completos ainda não foram informados.');
  }
  return { title: `${event.simulado ? '[DEMONSTRAÇÃO] ' : ''}${event.titulo}`, startDate: new Date(event.dataInicio),
    endDate: new Date(event.dataFim), timeZone: event.fuso, location: event.endereco || `${event.local}, ${event.cidade} – ${event.estado}`,
    notes: `${event.simulado ? 'Evento fictício do CityWatch, criado para demonstração. Não é uma programação oficial.\n' : ''}${event.descricao}` };
}
export function eventMapUrl(event: CommunityEvent) {
  if (!event.localVerificado) return null;
  if (event.latitude !== undefined && event.longitude !== undefined && Number.isFinite(event.latitude) && Number.isFinite(event.longitude) && Math.abs(event.latitude) <= 90 && Math.abs(event.longitude) <= 180) {
    return `https://maps.apple.com/?ll=${event.latitude},${event.longitude}&q=${encodeURIComponent(event.local)}`;
  }
  return event.endereco?.trim() ? `https://maps.apple.com/?q=${encodeURIComponent(event.endereco)}` : null;
}
export function shareEventText(event: CommunityEvent) {
  return `${event.simulado ? 'DEMONSTRAÇÃO · Evento fictício\n' : ''}${event.titulo}\n${eventDate(event)} · ${event.local}, ${event.cidade} – ${event.estado}\n${event.resumo}`;
}
export function eventDate(event: CommunityEvent) {
  return event.dataInicio ? new Date(event.dataInicio).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', timeZone: event.fuso }) : event.periodo || 'Data a confirmar';
}
export function eventHours(event: CommunityEvent) {
  const format = (date: string) => new Date(date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: event.fuso });
  return event.dataInicio ? `${format(event.dataInicio)}${event.dataFim ? ` às ${format(event.dataFim)}` : ' · término não informado'}` : 'Horário a confirmar';
}
export function parseFavorites(value: string | null, validIds?: string[]) {
  if (!value) return [];
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.some(id => typeof id !== 'string')) throw new Error('Lista de favoritos inválida.');
  return [...new Set(parsed.filter(id => !validIds || validIds.includes(id)))];
}

/** Local examples are NEW simulations; real or verified event places are never relabelled. */
export function eventsForMunicipality(items: CommunityEvent[], city: string, state: string): CommunityEvent[] {
  if (items.some(item => normalized(item.cidade) === normalized(city) && item.estado === state)) return items;
  const templates = items.filter(item => item.simulado && normalized(item.cidade) === 'sao paulo' && item.estado === 'SP');
  const slug = `${normalized(city).replace(/[^a-z0-9]+/g, '-')}:${state}`;
  const local = templates.map(item => ({ ...item, id: `city-demo:${slug}:${item.id}`,
    titulo: item.titulo.replace(/\s+SP$/, ''), cidade: city, estado: state,
    local: `Espaço comunitário fictício · ${city}`, bairro: undefined, endereco: undefined,
    latitude: undefined, longitude: undefined, localVerificado: false, links: undefined, organizador: undefined,
    descricao: `Exemplo simulado de ${item.titulo.replace(/\s+SP$/, '')} para explorar a comunidade de ${city} – ${state}. Não existe programação, endereço ou organizador local confirmado. A imagem é ilustrativa e não documenta um evento nesta cidade.`,
  }));
  return [...items, ...local];
}
