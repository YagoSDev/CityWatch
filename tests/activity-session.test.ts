import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createActivitySession, extendActivitySession, isSessionExpired, restoreActivitySession,
} from '../src/features/activity-session.ts';

const now = Date.UTC(2026, 10, 18, 12);

test('inicia sessão com atividade e duração escolhidas', () => {
  assert.deepEqual(createActivitySession('dirigir', 30, now), {
    activity: 'dirigir', startedAt: now, endsAt: now + 30 * 60000,
  });
});

test('rejeita atividades desconhecidas e durações inválidas', () => {
  assert.throws(() => createActivitySession('voar' as 'outro', 30, now), /atividade válida/);
  for (const duration of [0, -1, 0.5, 481, Infinity, NaN]) {
    assert.throws(() => createActivitySession('correr', duration, now), /1 e 480/);
  }
});

test('reconhece o término exatamente no prazo e após retorno do segundo plano', () => {
  const session = createActivitySession('passear', 15, now);
  assert.equal(isSessionExpired(session, session.endsAt - 1), false);
  assert.equal(isSessionExpired(session, session.endsAt), true);
  assert.equal(isSessionExpired(session, now + 24 * 3600000), true);
});

test('prolonga sessão ativa preservando início e atividade', () => {
  const session = createActivitySession('estudar', 30, now);
  const extended = extendActivitySession(session, 15, now + 5 * 60000);
  assert.equal(extended.endsAt, now + 45 * 60000);
  assert.equal(extended.startedAt, now);
  assert.equal(extended.activity, 'estudar');
});

test('prolonga sessão vencida a partir do horário atual', () => {
  const session = createActivitySession('trabalhar', 15, now);
  const extended = extendActivitySession(session, 15, now + 60 * 60000);
  assert.equal(extended.endsAt, now + 75 * 60000);
});

test('impede prolongamento além do limite de duração restante', () => {
  const session = createActivitySession('outro', 480, now);
  assert.throws(() => extendActivitySession(session, 15, now), /até 480/);
});

test('restaura sessões inclusive vencidas e reconhece sessão finalizada', () => {
  const session = createActivitySession('correr', 30, now);
  assert.deepEqual(restoreActivitySession(JSON.stringify(session)), session);
  assert.equal(restoreActivitySession(null), null);
  assert.equal(restoreActivitySession('null'), null);
});

test('rejeita dados salvos corrompidos ou inconsistentes', () => {
  for (const stored of ['{', '[]', '{}', '"sessão"', '{"activity":"voar","startedAt":1,"endsAt":2}',
    '{"activity":"correr","startedAt":2,"endsAt":1}', '{"activity":"correr","startedAt":1,"endsAt":1}',
    '{"activity":"correr","startedAt":-1,"endsAt":3}']) {
    assert.throws(() => restoreActivitySession(stored));
  }
});
