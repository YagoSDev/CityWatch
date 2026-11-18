import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAgenda, dayRange, entriesOnDay, filterAgenda, monthCells, monthRange, shiftMonth, type AgendaEntry } from '../src/features/agenda-model.ts';
import { cityAgendaDates } from '../src/features/agenda-dates.ts';
import { calendarExportKey, exportCalendarOnce } from '../src/features/calendar-export.ts';
import type { CommunityEvent } from '../src/features/events-model.ts';
const event: CommunityEvent = { id: '1', titulo: 'Festival', resumo: 'Simulado', descricao: 'Exemplo', categoria: 'cultura', imagem: 'festival', dataInicio: '2026-11-28T10:00:00-03:00', dataFim: '2026-11-28T22:00:00-03:00', fuso: 'America/Sao_Paulo', cidade: 'São Paulo', estado: 'SP', local: 'Local fictício', destaque: true, simulado: true, status: 'programado', criadoEm: '2026-11-18T12:00:00Z' };
const now = Date.parse('2026-11-18T12:00:00Z');
test('navegação mensal atravessa anos e respeita fevereiro bissexto', () => {
  assert.equal(shiftMonth('2026-12', 1), '2027-01'); assert.equal(shiftMonth('2026-01', -1), '2025-12');
  const cells = monthCells('2028-02'); assert.ok(cells.includes('2028-02-29')); assert.equal(cells.length % 7, 0);
  assert.equal(monthCells('2026-11')[0], '2026-11-01');
});
test('seleção de dia e marcadores usam datas com eventos, sem marcar dias vazios', () => {
  const entries = buildAgenda([event], [], [], 'São Paulo', 'SP', now);
  assert.equal(entriesOnDay(entries, '2026-11-28').length, 1); assert.equal(entriesOnDay(entries, '2026-11-27').length, 0);
  assert.equal(filterAgenda(entries, monthRange('2026-11')).length, 1); assert.equal(filterAgenda(entries, dayRange('2026-11-18')).length, 0);
});
test('favorito e adicionadoAgenda são independentes e não duplicam a lista', () => {
  const entries = buildAgenda([event, event], [], [], 'São Paulo', 'SP', now, { includeInactive: true, agendaIds: ['1'] });
  assert.equal(entries.length, 1); assert.equal(entries[0].saved, false); assert.equal(entries[0].added, true);
  assert.equal(filterAgenda(entries, monthRange('2026-11'), true).length, 1);
  const removed = buildAgenda([event], [], [], 'São Paulo', 'SP', now, { includeInactive: true });
  assert.equal(removed.length, 1); assert.equal(filterAgenda(removed, monthRange('2026-11'), true).length, 0);
});
test('datas inválidas e ausentes não geram marcadores; cancelados mantêm identificação na agenda completa', () => {
  const entries = buildAgenda([{ ...event, dataInicio: 'inválida' }, { ...event, id: '2', dataInicio: undefined, dataFim: undefined }, { ...event, id: '3', status: 'cancelado' }], ['1', '2'], [], 'São Paulo', 'SP', now, { includeInactive: true });
  assert.equal(entries.find(i => i.eventId === '1')!.invalidDate, true);
  assert.equal(entriesOnDay(entries, '2026-11-28').length, 1); assert.equal(entriesOnDay(entries, '2026-11-28')[0].status, 'cancelado');
  assert.equal(filterAgenda(entries, [now, Infinity], true, true).length, 2);
});
test('feriados respeitam ano, abrangência e município, sem inventar datas para outros locais', () => {
  const sp = cityAgendaDates('sp', 2026); assert.equal(sp.length, 13);
  assert.equal(sp.filter(i => i.scope === 'Nacional').length, 10);
  assert.ok(sp.some(i => i.scope === 'Municipal' && i.title.includes('Aniversário')));
  const unknown = cityAgendaDates(undefined, 2026, 'MG', 'Cidade desconhecida'); assert.equal(unknown.length, 10); assert.ok(unknown.every(i => i.scope === 'Nacional'));
  assert.equal(cityAgendaDates('sp', 2027).length, 0);
  assert.ok(cityAgendaDates('rj', 2026).some(i => i.scope === 'Estadual'));
  assert.ok(sp.every(i => i.source?.startsWith('https://') && i.validYear === 2026));
});
test('feriados de dia inteiro preservam a data civil cadastrada', () => {
  const holiday = cityAgendaDates('sp', 2026).find(i => i.title === 'Natal')!;
  assert.equal(entriesOnDay([holiday], '2026-12-25').length, 1); assert.equal(entriesOnDay([holiday], '2026-12-24').length, 0);
});
test('calendário nativo evita duplicar envio confirmado', async () => {
  const storage = new Map<string, string>(); let calls = 0;
  const deps = { read: async (k: string) => storage.get(k) || null, write: async (k: string, v: string) => storage.set(k, v), open: async () => { calls++; return 'saved' as const; } };
  const key = calendarExportKey('event', event.dataInicio!, event.dataFim!);
  assert.match(await exportCalendarOnce(key, deps), /adicionado/); assert.match(await exportCalendarOnce(key, deps), /já foi/); assert.equal(calls, 1);
});
test('cancelamento permite nova tentativa; interrupção sem confirmação pede revisão', async () => {
  const storage = new Map<string, string>(); let calls = 0;
  const deps = { read: async (k: string) => storage.get(k) || null, write: async (k: string, v: string) => storage.set(k, v), open: async () => { calls++; return 'canceled' as const; } };
  await exportCalendarOnce('cancel', deps); await exportCalendarOnce('cancel', deps); assert.equal(calls, 2);
  storage.set('uncertain', 'pending'); assert.match(await exportCalendarOnce('uncertain', deps), /sem confirmação/); assert.equal(calls, 2);
});
test('duplo toque concorrente abre apenas um editor nativo', async () => {
  let finish: (value: 'saved') => void = () => {}; let calls = 0;
  const deps = { read: async () => null, write: async () => {}, open: () => { calls++; return new Promise<'saved'>(resolve => { finish = resolve; }); } };
  const first = exportCalendarOnce('concurrent', deps); await new Promise<void>(resolve => setImmediate(resolve));
  assert.match(await exportCalendarOnce('concurrent', deps), /andamento/); finish('saved'); await first; assert.equal(calls, 1);
});
