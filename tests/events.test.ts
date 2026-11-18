import test from 'node:test';
import assert from 'node:assert/strict';
import { calendarPayload, eventMapUrl, eventStatus, filterEvents, parseFavorites, safeEventUrl, shareEventText, type CommunityEvent } from '../src/features/events-model.ts';
const now = Date.parse('2026-11-18T12:00:00Z');
const event: CommunityEvent = { id: 'festival', titulo: 'Festival Cultural', resumo: 'Música para todos', descricao: 'Demonstração', categoria: 'cultura', imagem: 'festival',
  dataInicio: '2026-11-28T10:00:00-03:00', dataFim: '2026-11-28T22:00:00-03:00', fuso: 'America/Sao_Paulo', local: 'Praça fictícia', bairro: 'Sé', cidade: 'São Paulo', estado: 'SP', destaque: true, simulado: true, status: 'programado', criadoEm: '2026-11-18T12:00:00Z' };
const run: CommunityEvent = { ...event, id: 'corrida', categoria: 'esportes', titulo: 'Corrida solidária', bairro: 'Vila Mariana' };
const city = { city: 'São Paulo', state: 'SP' };

test('categoria, busca sem acentos e bairro compõem os filtros', () => {
  assert.deepEqual(filterEvents([event, run], { ...city, category: 'cultura' }, now).map(item => item.id), ['festival']);
  assert.equal(filterEvents([event, run], { ...city, query: 'cultural' }, now)[0].id, 'festival');
  assert.equal(filterEvents([event, run], { ...city, query: 'se' }, now)[0].id, 'festival');
  assert.equal(filterEvents([event, run], { ...city, query: 'VILA MARIANA' }, now)[0].id, 'corrida');
  assert.equal(filterEvents([event], { ...city, query: 'inexistente' }, now).length, 0);
});
test('cidade e estado impedem que eventos de outra região apareçam como locais', () => {
  assert.equal(filterEvents([event], { city: 'Rio de Janeiro', state: 'RJ' }, now).length, 0);
  assert.equal(filterEvents([event], { city: 'São Paulo', state: 'RJ' }, now).length, 0);
});
test('futuros exclui eventos cancelados, encerrados e sem data', () => {
  const items = [event, { ...event, id: 'cancelado', status: 'cancelado' as const }, { ...event, id: 'sem-data', dataInicio: undefined }, { ...event, id: 'antigo', dataInicio: '2026-10-01T12:00:00Z', dataFim: '2026-10-01T14:00:00Z' }];
  assert.deepEqual(filterEvents(items, { ...city, futureOnly: true }, now).map(item => item.id), ['festival']);
  assert.equal(eventStatus(items[3], now), 'encerrado');
});
test('favoritos migram IDs legados, removem duplicatas e rejeitam armazenamento corrompido', () => {
  assert.deepEqual(parseFavorites('["feira-livros","feira-livros","removido"]', ['feira-livros']), ['feira-livros']);
  assert.throws(() => parseFavorites('{invalid', []));
  assert.throws(() => parseFavorites('[2]', []));
  assert.deepEqual(filterEvents([event, run], { ...city, favoritesOnly: true, favorites: ['corrida'] }, now), [run]);
});
test('links rejeitam esquemas perigosos, HTTP, credenciais e endereço local', () => {
  for (const url of ['javascript:alert(1)', 'file:///etc/passwd', 'data:text/html,test', 'http://example.com', 'https://user:password@example.com', 'https://localhost/path', 'https://192.168.0.1']) assert.equal(safeEventUrl(url), null);
  assert.equal(safeEventUrl('https://centrocultural.sp.gov.br/visite/'), 'https://centrocultural.sp.gov.br/visite/');
});
test('mapa só abre endereço ou coordenadas cadastrados e verificados', () => {
  assert.equal(eventMapUrl(event), null);
  assert.equal(eventMapUrl({ ...event, localVerificado: true }), null);
  assert.equal(eventMapUrl({ ...event, localVerificado: true, latitude: 999, longitude: 0 }), null);
  assert.match(eventMapUrl({ ...event, localVerificado: true, endereco: 'Rua Vergueiro, 1000, São Paulo' })!, /maps.apple.com/);
});
test('calendário usa exatamente datas registradas e marca demonstração', () => {
  const payload = calendarPayload(event, now);
  assert.equal(payload.startDate.toISOString(), '2026-11-28T13:00:00.000Z');
  assert.equal(payload.endDate.toISOString(), '2026-11-29T01:00:00.000Z');
  assert.match(payload.title, /^\[DEMONSTRAÇÃO\]/);
  assert.match(payload.notes, /fictício/);
  for (const item of [{ ...event, dataInicio: undefined }, { ...event, dataFim: undefined }, { ...event, dataInicio: 'inválida' }, { ...event, dataFim: event.dataInicio }, { ...event, status: 'cancelado' as const }]) assert.throws(() => calendarPayload(item, now));
});
test('compartilhamento mantém identificação fictícia, sem links inventados', () => {
  const text = shareEventText(event);
  assert.match(text, /Evento fictício/);
  assert.match(text, /Festival Cultural/);
  assert.doesNotMatch(text, /https?:/);
});
