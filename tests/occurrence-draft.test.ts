import test from 'node:test';
import assert from 'node:assert/strict';
import { captureLocation, insertTranscript, maxEvidenceBytes, occurrenceTypes, pickEvidence, startDictation, tagLabels, toggleTag, validateCitizenDraft, validateEvidence } from '../src/features/occurrence-draft.ts';

test('tipos preservam todas as quatro categorias acadêmicas', () => {
  assert.deepEqual(new Set(occurrenceTypes.map(type => type.category)), new Set(['iluminação', 'acessibilidade', 'limpeza', 'conservação']));
});
test('validação de cadastro obrigatório e limite Unicode de descrição', () => {
  assert.doesNotThrow(() => validateCitizenDraft('acidente', 'Texto revisado', 'Praça fictícia'));
  assert.doesNotThrow(() => validateCitizenDraft('limpeza', '😀'.repeat(300), 'Praça fictícia'));
  for (const fields of [['', 'Texto', 'Praça'], ['limpeza', ' ', 'Praça'], ['limpeza', 'Texto', ' '], ['limpeza', 'x'.repeat(301), 'Praça']]) {
    assert.throws(() => validateCitizenDraft(...fields as [string, string, string]));
  }
});
test('etiquetas permitem cinco, removem chips e não duplicam IDs', () => {
  let tags: string[] = [];
  const ids = Object.keys(tagLabels);
  for (const id of ids.slice(0, 5)) tags = toggleTag(tags, id);
  assert.equal(tags.length, 5);
  assert.throws(() => toggleTag(tags, ids[5]), /cinco/);
  assert.throws(() => toggleTag(tags, 'Lixo'), /desconhecida/);
  assert.deepEqual(toggleTag(tags, ids[0]), ids.slice(1, 5));
});
test('anexos limitam tamanho e formato, não aceitam áudio', () => {
  validateEvidence('image/jpeg', 100);
  validateEvidence('video/quicktime', maxEvidenceBytes);
  for (const size of [0, -1, NaN, maxEvidenceBytes + 1]) assert.throws(() => validateEvidence('image/png', size));
  for (const mime of ['audio/mp3', 'application/pdf', '']) assert.throws(() => validateEvidence(mime, 10));
});
test('transcrição é inserida para revisão, respeitando 300 caracteres', () => {
  assert.equal(insertTranscript('Texto existente', '  novo trecho '), 'Texto existente novo trecho');
  assert.equal(Array.from(insertTranscript('😀'.repeat(299), 'novo trecho')).length, 300);
});
test('Expo Go ou reconhecimento local indisponível mantém digitação e não pede microfone', async () => {
  await assert.rejects(startDictation(null), /Digite normalmente/);
  let requested = false;
  const unavailable = { isRecognitionAvailable: () => true, supportsOnDeviceRecognition: () => false,
    requestPermissionsAsync: async () => { requested = true; return { granted: true }; }, start: () => assert.fail('não deveria iniciar') };
  await assert.rejects(startDictation(unavailable), /indisponível/);
  assert.equal(requested, false);
});
test('ditado pede permissão ao iniciar e usa pt-BR sem persistir áudio', async () => {
  let started: unknown;
  const native = { isRecognitionAvailable: () => true, supportsOnDeviceRecognition: () => true,
    requestPermissionsAsync: async () => ({ granted: true }), start: (options: unknown) => { started = options; } };
  await startDictation(native);
  assert.deepEqual(started, { lang: 'pt-BR', interimResults: false, continuous: false, requiresOnDeviceRecognition: true, recordingOptions: { persist: false } });
  started = null;
  await assert.rejects(startDictation({ ...native, requestPermissionsAsync: async () => ({ granted: false }) }), /não autorizado/);
  assert.equal(started, null);
  await assert.rejects(startDictation(native, () => false), /cancelado/);
  assert.equal(started, null);
});
test('câmera e galeria só abrem após permissão, cancelamento preserva o rascunho', async () => {
  const calls: string[] = [];
  const port = {
    requestCameraPermissionsAsync: async () => { calls.push('camera-permission'); return { granted: true }; },
    requestMediaLibraryPermissionsAsync: async () => { calls.push('gallery-permission'); return { granted: true }; },
    launchCameraAsync: async () => { calls.push('camera'); return { canceled: true }; },
    launchImageLibraryAsync: async () => { calls.push('gallery'); return { canceled: true }; },
  };
  assert.deepEqual(await pickEvidence(port, true), { canceled: true });
  assert.deepEqual(calls, ['camera-permission', 'camera']);
  calls.length = 0;
  await pickEvidence(port, false);
  assert.deepEqual(calls, ['gallery-permission', 'gallery']);
  calls.length = 0;
  await assert.rejects(pickEvidence({ ...port, requestCameraPermissionsAsync: async () => ({ granted: false }) }, true), /opcional/);
  assert.equal(calls.length, 0);
});

test('GPS só lê após permissão e serviço disponível, sem monitoramento contínuo', async () => {
  let reads = 0;
  const port = {
    requestForegroundPermissionsAsync: async () => ({ granted: true }),
    hasServicesEnabledAsync: async () => true,
    read: async () => { reads++; return { coords: { latitude: -23.55, longitude: -46.63, accuracy: 20 }, timestamp: Date.UTC(2026, 10, 18, 12) }; },
  };
  assert.deepEqual(await captureLocation(port), { latitude: -23.55, longitude: -46.63, precisao: 20, capturada_em: '2026-11-18T12:00:00.000Z' });
  assert.equal(reads, 1);
  await assert.rejects(captureLocation({ ...port, requestForegroundPermissionsAsync: async () => ({ granted: false }) }), /não autorizada/);
  await assert.rejects(captureLocation({ ...port, hasServicesEnabledAsync: async () => false }), /desativados/);
  assert.equal(reads, 1);
});

test('GPS válido dispensa endereço escrito e complemento; coordenadas inválidas não liberam publicação', () => {
  assert.doesNotThrow(() => validateCitizenDraft('limpeza', 'Resíduos', '', { latitude: -23.55, longitude: -46.63 }));
  for (const latitude of [NaN, Infinity, 91]) assert.throws(() => validateCitizenDraft('limpeza', 'Resíduos', '', { latitude, longitude: 0 }));
});
test('endereço é preenchido sem número residencial e falha de geocodificação mantém GPS válido', async () => {
  const { resolveOccurrenceAddress } = await import('../src/features/occurrence-draft.ts');
  const point = { latitude: -23.55, longitude: -46.63 };
  const address = await resolveOccurrenceAddress(point, async value => {
    assert.deepEqual(value, point);
    return [{ street: 'Rua de teste', district: 'Centro', city: 'Cidade fictícia', region: 'SP' }];
  });
  assert.equal(address.localidade, 'Rua de teste, Centro, Cidade fictícia, SP');
  assert.equal(address.bairro, 'Centro');
  assert.equal((await resolveOccurrenceAddress(point, async () => { throw new Error('offline'); })).localidade, 'Localização por GPS');
});
