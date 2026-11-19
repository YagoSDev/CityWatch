import assert from 'node:assert/strict';
import test from 'node:test';
import { createActivitySession } from '../src/features/activity-session.ts';
import { activityCounters, activityFeedback, countsForDay, emptyCounts, formatClock, localDay, restoreDailyCounters, sessionTiming, updateDailyCounter } from '../src/features/activity-engagement.ts';
import { authorizeSteps, validStepCount } from '../src/features/pedometer-access.ts';

const morning = new Date(2026, 10, 19, 9, 0, 0).getTime();

test('cronômetro mantém precisão por timestamps mesmo após segundo plano e limita sessão encerrada', () => {
  const session = createActivitySession('correr', 30, morning);
  assert.deepEqual(sessionTiming(session, morning + 9500), { remaining: 1791, elapsed: 9, progress: 9500 / 1800000 });
  assert.deepEqual(sessionTiming(session, morning + 86400000), { remaining: 0, elapsed: 1800, progress: 1 });
  assert.equal(sessionTiming(session, morning - 1000).elapsed, 0);
  assert.equal(formatClock(1791), '29:51');
  assert.equal(formatClock(3661), '01:01:01');
  assert.equal(formatClock(-1), '00:00');
});

test('cafés são contados por dia e preservados ao trocar ou reiniciar sessão', () => {
  const first = updateDailyCounter(null, 'coffee', 1, morning);
  const second = updateDailyCounter(first, 'coffee', 1, morning + 60000);
  const restored = restoreDailyCounters(JSON.stringify(second));
  assert.equal(countsForDay(restored, morning + 3600000).coffee, 2);
  assert.equal(restored?.day, localDay(morning));
  assert.equal(first.counts.coffee, 1, 'não deve modificar a cópia anterior');
});

test('virada do dia local zera a exibição e a próxima gravação sem misturar contadores', () => {
  const yesterday = new Date(2026, 10, 19, 23, 59).getTime();
  const today = new Date(2026, 10, 20, 0, 1).getTime();
  const saved = updateDailyCounter(null, 'coffee', 1, yesterday);
  assert.deepEqual(countsForDay(saved, today), emptyCounts());
  const next = updateDailyCounter(saved, 'focus', 1, today);
  assert.equal(next.counts.coffee, 0);
  assert.equal(next.counts.focus, 1);
});

test('desfazer registro não deixa valores negativos e entradas inválidas são rejeitadas', () => {
  assert.equal(updateDailyCounter(null, 'coffee', -1, morning).counts.coffee, 0);
  const counts = { ...emptyCounts(), coffee: 10000 };
  assert.equal(updateDailyCounter({ day: localDay(morning), counts }, 'coffee', 1, morning).counts.coffee, 10000);
  assert.throws(() => updateDailyCounter(null, 'coffee', 2, morning));
  assert.throws(() => updateDailyCounter(null, 'fake' as 'coffee', 1, morning));
});

test('dados salvos inconsistentes não são aceitos como conquistas válidas', () => {
  assert.equal(restoreDailyCounters(null), null);
  for (const text of ['{', '{}', 'null', JSON.stringify({ day: '2026-11-19', counts: { ...emptyCounts(), coffee: -1 } }),
    JSON.stringify({ day: '2026-11-19', counts: { ...emptyCounts(), focus: 0.5 } })]) {
    assert.throws(() => restoreDailyCounters(text));
  }
});

test('cada atividade tem mensagem própria; direção não oferece contador interativo', () => {
  const messages = ['trabalhar', 'correr', 'passear', 'estudar', 'dirigir', 'outro'].map(id => activityFeedback(id as 'outro', emptyCounts()).title);
  assert.equal(new Set(messages).size, 6);
  assert.equal(activityCounters.dirigir, undefined);
  assert.match(activityFeedback('dirigir', emptyCounts()).message, /estacionado/);
  assert.notEqual(activityFeedback('trabalhar', emptyCounts()).message, activityFeedback('trabalhar', { ...emptyCounts(), coffee: 1 }).message);
  assert.match(activityFeedback('estudar', { ...emptyCounts(), focus: 2 }).message, /2 blocos/);
});

test('sensor indisponível não solicita permissão nem inventa passos', async () => {
  let asked = false;
  const result = await authorizeSteps({ isAvailableAsync: async () => false, requestPermissionsAsync: async () => { asked = true; return { granted: true }; } });
  assert.equal(result, 'unavailable'); assert.equal(asked, false);
});

test('permissão negada é distinguida de sensor autorizado; erros continuam tratáveis', async () => {
  for (const granted of [true, false]) assert.equal(await authorizeSteps({ isAvailableAsync: async () => true, requestPermissionsAsync: async () => ({ granted }) }), granted ? 'ready' : 'denied');
  await assert.rejects(authorizeSteps({ isAvailableAsync: async () => { throw Error('sensor'); }, requestPermissionsAsync: async () => ({ granted: true }) }));
  for (const steps of [-1, NaN, Infinity, 0.5]) assert.throws(() => validStepCount(steps));
  assert.equal(validStepCount(42), 42);
});
