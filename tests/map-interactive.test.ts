import test from 'node:test';
import assert from 'node:assert/strict';
import { groupMapItems, filterDiscovery, defaultMapFilters, mapOccurrences, type DiscoveryItem } from '../src/features/discovery-model.ts';
import { startForegroundWatch } from '../src/features/foreground-watch.ts';
const center = { latitude: -23.55, longitude: -46.63 };
const region = { ...center, latitudeDelta: 0.07, longitudeDelta: 0.07 };
const item: DiscoveryItem = { id: '1', title: 'Teste', description: 'Simulado', type: 'eventos', category: 'Cultura', local: 'Fictício', coordinate: center, status: 'aberto', verified: false, simulated: true, fictionalPosition: true, advertising: false, image: 'park', start: '2026-12-01T12:00:00Z', end: '2026-12-01T14:00:00Z' };
const flush = () => new Promise<void>(resolve => setImmediate(resolve));
test('agrupamento reduz sobreposição, mantém todos os itens e separa publicidade', () => {
  const groups = groupMapItems([item, { ...item, id: '2' }, { ...item, id: 'ad', advertising: true }], region);
  assert.equal(groups.length, 2); assert.equal(groups.reduce((sum, g) => sum + g.items.length, 0), 3);
  assert.equal(groups.some(g => g.items.length > 1 && g.items.some(i => i.advertising)), false);
  assert.equal(groupMapItems([{ ...item, coordinate: { latitude: 999, longitude: 0 } }], region).length, 0);
});
test('verificação respeita origem simulada mesmo quando flag verified estiver incorreta', () => {
  const now = Date.parse('2026-11-18T12:00:00Z');
  assert.equal(filterDiscovery([{ ...item, verified: true }], { ...defaultMapFilters, verification: ['oficial'] }, center, '', now).length, 0);
  assert.equal(filterDiscovery([item], { ...defaultMapFilters, verification: ['simulado'], time: 'proximos' }, center, '', now).length, 1);
  assert.equal(filterDiscovery([{ ...item, status: 'cancelado' }], { ...defaultMapFilters, time: 'proximos' }, center, '', now).length, 0);
});
test('categorias acadêmicas específicas são preservadas para os filtros', () => {
  const mapped = mapOccurrences([{ id: '1', categoria: 'acessibilidade', descricao: 'Rampa', bairro: 'Bairro', data: '2026-10-01', status: 'aberta' }], center);
  assert.equal(mapped[0].category, 'Acessibilidade'); assert.equal(mapped[0].source, 'Backend Python · base acadêmica');
});
test('permissão negada não inicia observação nem pede nova autorização', async () => {
  let watched = false; let message = '';
  const stop = startForegroundWatch({ permitted: async () => false, enabled: async () => true, watch: async () => { watched = true; return { remove() {} }; } }, () => assert.fail(), reason => { message = reason; });
  await flush(); stop(); assert.equal(watched, false); assert.match(message, /autorizar/);
});
test('GPS desativado mantém fluxo alternativo sem observação', async () => {
  let message = '';
  const stop = startForegroundWatch({ permitted: async () => true, enabled: async () => false, watch: async () => { assert.fail(); return { remove() {} }; } }, () => assert.fail(), reason => { message = reason; });
  await flush(); stop(); assert.match(message, /GPS desativado/);
});
test('sair da tela ou do primeiro plano remove observador e ignora posições tardias', async () => {
  let removed = 0; let reads = 0; let send: (p: { coords: typeof center }) => void = () => {};
  const stop = startForegroundWatch({ permitted: async () => true, enabled: async () => true, watch: async receive => { send = receive; return { remove: () => { removed++; } }; } }, () => { reads++; }, () => {});
  await flush(); send({ coords: center }); stop(); send({ coords: center }); assert.equal(reads, 1); assert.equal(removed, 1);
});
test('cancelamento durante início assíncrono também remove inscrição', async () => {
  let resolveWatch: (value: { remove: () => void }) => void = () => {}; let removed = 0;
  const stop = startForegroundWatch({ permitted: async () => true, enabled: async () => true, watch: () => new Promise(resolve => { resolveWatch = resolve; }) }, () => assert.fail(), () => {});
  await flush(); stop(); resolveWatch({ remove: () => { removed++; } }); await flush(); assert.equal(removed, 1);
});
