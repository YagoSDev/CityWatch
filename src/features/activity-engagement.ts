import type { ActivityId, ActivitySession } from './activity-session.ts';

export const counterKeys = ['coffee', 'water', 'focus', 'discoveries', 'wins'] as const;
export type CounterKey = typeof counterKeys[number];
export type Counts = Record<CounterKey, number>;
export type DailyCounters = { day: string; counts: Counts };
export const emptyCounts = (): Counts => ({ coffee: 0, water: 0, focus: 0, discoveries: 0, wins: 0 });

export function localDay(now: number): string {
  const date = new Date(now);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function countsForDay(saved: DailyCounters | null, now: number): Counts {
  return saved?.day === localDay(now) ? saved.counts : emptyCounts();
}
export function updateDailyCounter(saved: DailyCounters | null, key: CounterKey, delta: number, now: number): DailyCounters {
  if (!counterKeys.includes(key) || ![-1, 1].includes(delta)) throw new Error('Contador inválido.');
  const counts = { ...countsForDay(saved, now) };
  counts[key] = Math.max(0, Math.min(10000, counts[key] + delta));
  return { day: localDay(now), counts };
}
export function restoreDailyCounters(stored: string | null): DailyCounters | null {
  if (stored === null) return null;
  const data: unknown = JSON.parse(stored);
  if (!data || typeof data !== 'object' || !('day' in data) || typeof data.day !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/.test(data.day) || !('counts' in data) || !data.counts || typeof data.counts !== 'object') {
    throw new Error('Não foi possível ler os contadores salvos.');
  }
  const values = data.counts as Record<string, unknown>;
  const counts = emptyCounts();
  for (const key of counterKeys) {
    const n = values[key];
    if (typeof n !== 'number' || !Number.isSafeInteger(n) || n < 0 || n > 10000) throw new Error('Contador salvo inválido.');
    counts[key] = n;
  }
  return { day: data.day, counts };
}

export function sessionTiming(session: ActivitySession, now: number) {
  const remaining = Math.max(0, Math.ceil((session.endsAt - now) / 1000));
  const elapsed = Math.max(0, Math.floor((Math.min(now, session.endsAt) - session.startedAt) / 1000));
  return { remaining, elapsed, progress: Math.max(0, Math.min(1, (now - session.startedAt) / (session.endsAt - session.startedAt))) };
}
export function formatClock(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds));
  const parts = [Math.floor(total / 3600), Math.floor(total / 60) % 60, total % 60];
  return (parts[0] ? parts : parts.slice(1)).map(n => String(n).padStart(2, '0')).join(':');
}

export const activityCounters: Partial<Record<ActivityId, { key: CounterKey; label: string; add: string }>> = {
  trabalhar: { key: 'coffee', label: 'Cafés hoje', add: 'Tomei um café ☕' },
  correr: { key: 'water', label: 'Copos de água hoje', add: 'Registrei uma água 💧' },
  passear: { key: 'discoveries', label: 'Descobertas hoje', add: 'Vi algo legal ✨' },
  estudar: { key: 'focus', label: 'Blocos de foco hoje', add: 'Concluí um bloco 📚' },
  outro: { key: 'wins', label: 'Pequenas conquistas hoje', add: 'Uma conquista! 🎉' },
};
export function activityFeedback(id: ActivityId, counts: Counts): { title: string; message: string } {
  switch (id) {
    case 'trabalhar': return { title: 'Modo trabalho: ativado!', message: counts.coffee === 0 ? 'Você cuida do trabalho, eu cuido do cronômetro. Café só se você quiser!' : counts.coffee === 1 ? 'Primeiro café registrado! Eu continuo movido a eletricidade. ☕' : `${counts.coffee} cafés registrados hoje. Já eu sigo na bateria! Que tal uma pausa?` };
    case 'correr': return { title: 'Bora, uma passada de cada vez!', message: counts.water ? 'Água registrada! Seu ritmo, seu caminho. Eu acompanho o tempo.' : 'Ative os passos se quiser e siga no seu ritmo. A água também pode entrar no registro.' };
    case 'passear': return { title: 'Modo explorador: ligado!', message: counts.discoveries ? `${counts.discoveries} descobertas hoje. A cidade guarda pequenas surpresas!` : 'Olhe ao redor: uma praça, uma arte, uma novidade. Encontrou algo legal?' };
    case 'estudar': return { title: 'P.I.T. em modo concentração', message: counts.focus ? `${counts.focus} blocos de foco registrados hoje. Conhecimento carregando! 📚` : 'Uma coisa de cada vez. Quando terminar um bloco, registre sua conquista aqui.' };
    case 'dirigir': return { title: 'Boa viagem. Eu fico quietinho!', message: 'Deixe o celular guardado durante a direção. Gerencie a sessão apenas quando estiver estacionado.' };
    default: return { title: 'Seu plano, nossa companhia', message: counts.wins ? `${counts.wins} pequenas conquistas hoje. Cada uma merece seu momento!` : 'Escolha seu ritmo. Quando realizar algo legal, celebre uma pequena conquista.' };
  }
}
