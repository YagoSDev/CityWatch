import assert from 'node:assert/strict';
import test from 'node:test';
import { contentMunicipality, createMunicipalityResolver, municipalityFromAddress } from '../src/features/municipality.ts';
import { demoEvents } from '../src/features/events-data.ts';
import { eventsForMunicipality, filterEvents, parseFavorites } from '../src/features/events-model.ts';
import { cityAgendaDates } from '../src/features/agenda-dates.ts';

const point = { latitude: -22.64, longitude: -47.2 };
const address = { city: 'Cosmópolis', region: 'São Paulo', isoCountryCode: 'BR' };

test('município e UF são extraídos sem confundir a cidade com o nome do estado', () => {
  assert.deepEqual(municipalityFromAddress(address), { name: 'Cosmópolis', state: 'SP' });
  assert.deepEqual(municipalityFromAddress({ city: 'Cosmópolis', region: 'sp' }), { name: 'Cosmópolis', state: 'SP' });
  assert.deepEqual(municipalityFromAddress({ subregion: 'Campinas', region: 'São Paulo' }), { name: 'Campinas', state: 'SP' });
  assert.equal(municipalityFromAddress({ city: 'São Paulo', region: 'California', isoCountryCode: 'US' }), null);
  assert.equal(municipalityFromAddress({ region: 'São Paulo' }), null);
  assert.equal(municipalityFromAddress(undefined), null);
});

test('cidade descoberta tem prioridade sem modificar a residência do perfil', () => {
  const profile = { city: 'São Paulo', state: 'SP' };
  const result = contentMunicipality(profile, { name: 'Cosmópolis', state: 'SP' });
  assert.deepEqual(result, { name: 'Cosmópolis', state: 'SP', source: 'gps' });
  assert.equal(profile.city, 'São Paulo');
  assert.deepEqual(contentMunicipality(profile, null), { name: 'São Paulo', state: 'SP', source: 'profile' });
});

test('geocodificação deduplica leituras concorrentes e reutiliza cache da área por 30 minutos', async () => {
  let calls = 0; let now = 1000;
  let finish: (value: typeof address[]) => void = () => {};
  const lookup = createMunicipalityResolver(async () => { calls++; return await new Promise<typeof address[]>(resolve => { finish = resolve; }); }, () => now);
  const first = lookup(point); const second = lookup({ latitude: -22.6401, longitude: -47.2001 });
  assert.equal(calls, 1); finish([address]);
  assert.deepEqual(await first, await second);
  now += 29 * 60000;
  assert.deepEqual(await lookup(point), { name: 'Cosmópolis', state: 'SP' });
  assert.equal(calls, 1);
  now += 2 * 60000;
  const refresh = lookup(point); assert.equal(calls, 2); finish([address]); await refresh;
});

test('falha de geocodificação usa fallback e permite nova tentativa; coordenadas inválidas não consultam serviço', async () => {
  let now = 0; let calls = 0;
  const lookup = createMunicipalityResolver(async () => { calls++; if (calls === 1) throw Error('offline'); return [address]; }, () => now);
  assert.equal(await lookup({ latitude: NaN, longitude: 0 }), null);
  assert.equal(calls, 0);
  assert.equal(await lookup(point), null); assert.equal(await lookup(point), null); assert.equal(calls, 1);
  now = 120001;
  assert.deepEqual(await lookup(point), { name: 'Cosmópolis', state: 'SP' }); assert.equal(calls, 2);
});

test('Cosmópolis recebe novos exemplos simulados sem herdar endereços, coordenadas ou links de São Paulo', () => {
  const catalog = eventsForMunicipality(demoEvents, 'Cosmópolis', 'SP');
  const local = filterEvents(catalog, { city: 'Cosmópolis', state: 'SP' });
  assert.equal(local.length, 11);
  for (const event of local) {
    assert.equal(event.simulado, true); assert.equal(event.localVerificado, false);
    assert.equal(event.endereco, undefined); assert.equal(event.latitude, undefined); assert.equal(event.longitude, undefined);
    assert.equal(event.links, undefined); assert.equal(event.bairro, undefined);
    assert.match(event.local, /fictício.*Cosmópolis/);
    assert.doesNotMatch(event.titulo + event.local + event.descricao, /Ibirapuera|Centro Cultural São Paulo|Festival Cultural SP/);
  }
  assert.equal(demoEvents.find(event => event.id === 'corrida-solidaria-sp')?.local, 'Parque Ibirapuera');
  assert.equal(new Set(local.map(event => event.imagem)).size, local.length, 'cada evento local deve ter imagem própria');
});

test('eventos reais não são deslocados e cidades já cadastradas não ganham cópias artificiais', () => {
  assert.equal(eventsForMunicipality(demoEvents, 'São Paulo', 'SP'), demoEvents);
  const real = { ...demoEvents[0], id: 'evento-real', cidade: 'Campinas', simulado: false };
  const catalog = eventsForMunicipality([real], 'Cosmópolis', 'SP');
  assert.deepEqual(catalog, [real]); assert.equal(real.cidade, 'Campinas');
  const local = eventsForMunicipality(demoEvents, 'Cosmópolis', 'SP');
  assert.equal(eventsForMunicipality(local, 'cosmopolis', 'SP'), local);
});

test('favoritos locais mantêm IDs estáveis entre acentos, recarga e troca de cidade', () => {
  const first = eventsForMunicipality(demoEvents, 'Cosmópolis', 'SP');
  const second = eventsForMunicipality(demoEvents, 'cosmopolis', 'SP');
  const id = filterEvents(first, { city: 'Cosmópolis', state: 'SP' })[0].id;
  assert.ok(second.some(event => event.id === id));
  assert.deepEqual(parseFavorites(JSON.stringify([id, id, 'festival-cultural-sp'])), [id, 'festival-cultural-sp']);
  assert.deepEqual(parseFavorites(JSON.stringify([id, 'festival-cultural-sp']), ['festival-cultural-sp']), ['festival-cultural-sp']);
});

test('agenda de Cosmópolis não inventa feriados municipais de São Paulo', () => {
  const dates = cityAgendaDates('cosmopolis', 2026, 'SP', 'Cosmópolis');
  assert.ok(dates.some(item => item.title.includes('Consciência Negra')));
  assert.ok(dates.some(item => item.title.includes('Data Magna')));
  assert.equal(dates.filter(item => item.scope === 'Municipal').length, 0);
});
