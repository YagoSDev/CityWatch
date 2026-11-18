import test from 'node:test';
import assert from 'node:assert/strict';
import { contentTypes, defaultMapFilters, filterDiscovery, distanceKm, mapEvents, mapOccurrences, timeBounds, withinRegion, type DiscoveryItem } from '../src/features/discovery-model.ts';
import { buildAgenda, filterAgenda } from '../src/features/agenda-model.ts';
import type { CommunityEvent } from '../src/features/events-model.ts';
const now = new Date(2026, 10, 18, 12).getTime();
const origin = { latitude: -23.55, longitude: -46.63 };
const item: DiscoveryItem = { id: 'a', title: 'Feira de adoção', description: 'Animais', type: 'eventos', category: 'Pets', local: 'Centro', coordinate: origin, start: new Date(2026, 10, 18, 10).toISOString(), end: new Date(2026, 10, 18, 18).toISOString(), status: 'andamento', verified: false, simulated: true, fictionalPosition: true, advertising: false, image: 'adoption' };
const event: CommunityEvent = { id: 'a', titulo: 'Feira', resumo: 'Animais', descricao: 'Simulado', categoria: 'animais', imagem: 'adoption', dataInicio: item.start, dataFim: item.end, fuso: 'America/Sao_Paulo', cidade: 'São Paulo', estado: 'SP', local: 'Centro', destaque: false, simulado: true, status: 'programado', criadoEm: item.start! };
test('tipos, categorias e busca compõem filtros; publicidade não está habilitada por padrão', () => {
  const ad = { ...item, id: 'ad', type: 'promocoes' as const, advertising: true };
  assert.equal(filterDiscovery([item, ad], defaultMapFilters, origin, '', now).length, 1);
  assert.equal(filterDiscovery([item], { ...defaultMapFilters, categories: ['Pets'] }, origin, 'ADOCAO', now).length, 1);
  assert.equal(filterDiscovery([item], { ...defaultMapFilters, categories: ['Clima'] }, origin, '', now).length, 0);
  assert.equal(filterDiscovery([item], { ...defaultMapFilters, types: [] }, origin, '', now).length, 0);
  assert.equal(new Set(contentTypes.map(i => i.color)).size, 8);
});
test('distância em km funciona a partir da origem e exclui itens sem coordenadas', () => {
  assert.equal(distanceKm(origin, origin), 0);
  assert.ok(distanceKm(origin, { ...origin, latitude: origin.latitude + 0.02 }) > 2);
  const items = [item, { ...item, id: 'longe', coordinate: { ...origin, latitude: origin.latitude + 0.02 } }, { ...item, id: 'privado', coordinate: undefined }];
  assert.deepEqual(filterDiscovery(items, { ...defaultMapFilters, distance: 1 }, origin, '', now).map(i => i.id), ['a']);
  assert.equal(filterDiscovery(items, { ...defaultMapFilters, distance: 3 }, origin, '', now).length, 2);
});
test('Agora, Hoje, Semana e Mês usam datas reais do registro sem incluir data desconhecida', () => {
  for (const time of ['agora', 'hoje', 'semana', 'mes'] as const) assert.equal(filterDiscovery([item], { ...defaultMapFilters, time }, origin, '', now).length, 1);
  assert.equal(filterDiscovery([{ ...item, start: undefined }], { ...defaultMapFilters, time: 'hoje' }, origin, '', now).length, 0);
  const [start, end] = timeBounds('semana', now);
  assert.equal(new Date(start).getDay(), 1); assert.equal(new Date(end).getDay(), 0);
});
test('status confirmado não inclui simulações não verificadas, recentes usa 24h', () => {
  assert.equal(filterDiscovery([item], { ...defaultMapFilters, status: 'confirmados' }, origin, '', now).length, 0);
  assert.equal(filterDiscovery([{ ...item, verified: true }], { ...defaultMapFilters, status: 'confirmados' }, origin, '', now).length, 1);
  assert.equal(filterDiscovery([item], { ...defaultMapFilters, status: 'andamento' }, origin, '', now).length, 1);
  assert.equal(filterDiscovery([item], { ...defaultMapFilters, status: 'recentes' }, origin, '', now).length, 1);
  assert.equal(filterDiscovery([item], { ...defaultMapFilters, status: 'encerrados' }, origin, '', now).length, 0);
});
test('lista visível respeita os limites da câmera', () => {
  const region = { ...origin, latitudeDelta: 0.01, longitudeDelta: 0.01 };
  assert.equal(withinRegion(item, region), true);
  assert.equal(withinRegion({ ...item, coordinate: { latitude: 0, longitude: 0 } }, region), false);
  assert.equal(withinRegion({ ...item, coordinate: undefined }, region), false);
});
test('adaptação de eventos respeita cidade, identifica posição fictícia e mantém coordenada verificada', () => {
  assert.equal(mapEvents([event], 'Rio de Janeiro', 'RJ', origin).length, 0);
  const mapped = mapEvents([event], 'São Paulo', 'SP', origin)[0]; assert.equal(mapped.fictionalPosition, true); assert.ok(mapped.coordinate);
  const located = mapEvents([{ ...event, localVerificado: true, latitude: 1, longitude: 2 }], 'São Paulo', 'SP', origin)[0];
  assert.equal(located.fictionalPosition, false); assert.deepEqual(located.coordinate, { latitude: 1, longitude: 2 });
});
test('GPS de relatos cidadãos não é inventado ou exposto no mapa', () => {
  const report = { id: 'OC1', categoria: 'limpeza' as const, descricao: 'Teste', bairro: 'Centro', data: '2026-11-18', status: 'em análise' as const };
  assert.equal(mapOccurrences([{ ...report, origem: 'cidadao' }], origin).length, 0);
  assert.equal(mapOccurrences([report], origin)[0].status, 'andamento');
  assert.equal(mapOccurrences([report], origin)[0].fictionalPosition, true);
});
test('Agenda integra favoritos sem duplicar, respeita cidade e exclui cancelados/publicidade', () => {
  const entries = buildAgenda([event, event, { ...event, id: 'ad', publicidade: true }, { ...event, id: 'cancelado', status: 'cancelado' }], ['a'], [], 'São Paulo', 'SP', now);
  assert.equal(entries.length, 1); assert.equal(entries[0].saved, true);
  assert.equal(buildAgenda([event], ['a'], [], 'Rio de Janeiro', 'RJ', now).length, 0);
  assert.equal(filterAgenda(entries, timeBounds('hoje', now), true).length, 1);
  assert.equal(buildAgenda([event], [], [], 'São Paulo', 'SP', now)[0].saved, false);
});
test('Agenda mantém sem data como desconhecido e não inventa horários', () => {
  const entries = buildAgenda([{ ...event, dataInicio: undefined, dataFim: undefined }], ['a'], [], 'São Paulo', 'SP', now);
  assert.equal(entries[0].date, undefined);
  assert.equal(filterAgenda(entries, timeBounds('mes', now), true).length, 0);
  assert.equal(filterAgenda(entries, [now, Infinity], true, true).length, 1);
});
