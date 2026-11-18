import test from 'node:test';
import assert from 'node:assert/strict';
import { requestApi, resolveApiUrl } from '../src/features/api-connection.ts';

test('IP local acompanha o endereço de abertura do Expo e não o IP antigo do Mac', () => {
  assert.equal(resolveApiUrl('http://192.168.0.102:8000', '192.168.0.103:8081', true), 'http://192.168.0.103:8000');
  assert.equal(resolveApiUrl('http://localhost:8000', 'http://192.168.0.103:8081/bundle', true), 'http://192.168.0.103:8000');
  assert.equal(resolveApiUrl(undefined, '127.0.0.1:8081', true), 'http://127.0.0.1:8000');
});
test('servidor remoto explícito e configuração de produção são preservados', () => {
  assert.equal(resolveApiUrl('https://citywatch.example/api/', '192.168.0.103:8081', true), 'https://citywatch.example/api');
  assert.equal(resolveApiUrl('https://citywatch.example', undefined, false), 'https://citywatch.example');
  assert.throws(() => resolveApiUrl(undefined, undefined, false), /não foi configurado/);
});
test('resposta Python confirmada e cabeçalhos adicionais preservados', async () => {
  const transport: typeof fetch = async (_url, options) => {
    assert.equal(new Headers(options?.headers).get('X-Test'), 'preservado');
    assert.equal(new Headers(options?.headers).get('Content-Type'), 'application/json');
    return new Response(JSON.stringify({ id: 'CW-TESTE', status: 'aberta' }), { status: 201 });
  };
  assert.deepEqual(await requestApi('http://localhost:8000/relatos', { method: 'POST', headers: { 'X-Test': 'preservado' }, body: '{}' }, transport), { id: 'CW-TESTE', status: 'aberta' });
});
test('erros de rede, timeout, validação e backend antigo são diferenciados', async () => {
  await assert.rejects(requestApi('/relatos', undefined, async () => { throw new TypeError('network'); }), /mesma rede Wi-Fi/);
  const abort = new AbortController(); abort.abort();
  await assert.rejects(requestApi('/relatos', { signal: abort.signal }, async () => { throw new Error('abort'); }), /demorou/);
  await assert.rejects(requestApi('/relatos', undefined, async () => new Response(JSON.stringify({ detail: 'Local inválido' }), { status: 422 })), /Local inválido/);
  await assert.rejects(requestApi('/relatos', undefined, async () => new Response('{}', { status: 404 })), /desatualizado/);
  await assert.rejects(requestApi('/relatos', undefined, async () => new Response('{}', { status: 500 })), /servidor não conseguiu/);
});
