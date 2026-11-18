import type { AgendaEntry } from './agenda-model';
const spSource = 'https://www2.prefeitura.sp.gov.br/web/gestao/w/calendario_2026';
const nationalSource = 'https://www.gov.br/gestao/pt-br/assuntos/noticias/2025/dezembro/confira-o-calendario-oficial-de-feriados-nacionais-e-pontos-facultativos-em-2026';
const rioSource = 'https://www.trf2.jus.br/jfrj/prazos-suspensos-feriados/2026/dia-de-sao-sebastiao';
export function cityAgendaDates(cityId: string | undefined, year: number, state = cityId === 'sp' ? 'SP' : cityId === 'rj' ? 'RJ' : '', cityName = cityId === 'sp' ? 'São Paulo' : cityId === 'rj' ? 'Rio de Janeiro' : ''): AgendaEntry[] {
  if (year !== 2026) return [];
  const national = [['01-01', 'Confraternização Universal'], ['04-03', 'Paixão de Cristo'], ['04-21', 'Tiradentes'], ['05-01', 'Dia Mundial do Trabalho'], ['09-07', 'Independência do Brasil'], ['10-12', 'Nossa Senhora Aparecida'], ['11-02', 'Finados'], ['11-15', 'Proclamação da República'], ['11-20', 'Dia Nacional de Zumbi e da Consciência Negra'], ['12-25', 'Natal']];
  const make = (date: string, title: string, scope: 'Nacional' | 'Estadual' | 'Municipal', source: string): AgendaEntry => ({
    id: `holiday:${scope}:${scope === 'Nacional' ? 'BR' : scope === 'Estadual' ? state : cityId}:${date}`, title, date: `2026-${date}T00:00:00-03:00`, end: `2026-${date}T23:59:59-03:00`, allDay: true,
    kind: 'feriado', scope, validYear: 2026, source, origin: 'Fonte pública verificada em 18/11/2026', local: scope === 'Nacional' ? 'Brasil' : scope === 'Estadual' ? state : cityName,
    city: cityName, state, simulated: false, saved: false, added: false, status: 'programado', category: `Feriado ${scope.toLowerCase()}`, description: `${title}. Feriado ${scope.toLowerCase()} com validade na base de 2026. Consulte a fonte para informações oficiais.`,
  });
  const items = national.map(([d, t]) => make(d, t, 'Nacional', nationalSource));
  if (state === 'SP') items.push(make('07-09', 'Data Magna do Estado de São Paulo', 'Estadual', spSource));
  if (state === 'RJ') items.push(make('04-23', 'Dia de São Jorge', 'Estadual', 'https://www.trf2.jus.br/jfrj/prazos-suspensos-feriados/2026/dia-de-sao-jorge'));
  if (cityId === 'sp') items.push(make('01-25', 'Aniversário de São Paulo', 'Municipal', spSource), make('06-04', 'Corpus Christi', 'Municipal', spSource));
  if (cityId === 'rj') items.push(make('01-20', 'Dia de São Sebastião', 'Municipal', rioSource));
  return items;
}
