export const activityIds = ['trabalhar', 'correr', 'passear', 'estudar', 'dirigir', 'outro'] as const;
export type ActivityId = typeof activityIds[number];
export type ActivitySession = { activity: ActivityId; startedAt: number; endsAt: number };
export const maxDurationMinutes = 480;

export function isActivityId(value: unknown): value is ActivityId {
  return activityIds.some((id) => id === value);
}

export function createActivitySession(activity: ActivityId, minutes: number, now: number): ActivitySession {
  if (!isActivityId(activity)) throw new Error('Escolha uma atividade válida.');
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > maxDurationMinutes) {
    throw new Error('Informe uma duração entre 1 e 480 minutos.');
  }
  return { activity, startedAt: now, endsAt: now + minutes * 60000 };
}

export function isSessionExpired(session: ActivitySession, now: number) {
  return session.endsAt <= now;
}

export function extendActivitySession(session: ActivitySession, minutes: number, now: number): ActivitySession {
  const extension = createActivitySession(session.activity, minutes, Math.max(now, session.endsAt));
  if (extension.endsAt - now > maxDurationMinutes * 60000) throw new Error('A duração restante deve ser de até 480 minutos.');
  return { ...session, endsAt: extension.endsAt };
}

export function restoreActivitySession(stored: string | null): ActivitySession | null {
  if (stored === null) return null;
  const parsed: unknown = JSON.parse(stored);
  if (parsed === null) return null;
  if (typeof parsed !== 'object' || !('activity' in parsed) || !('startedAt' in parsed) || !('endsAt' in parsed) ||
    !isActivityId(parsed.activity) || typeof parsed.startedAt !== 'number' || typeof parsed.endsAt !== 'number' ||
    !Number.isSafeInteger(parsed.startedAt) || !Number.isSafeInteger(parsed.endsAt) ||
    parsed.startedAt < 0 || parsed.endsAt <= parsed.startedAt) {
    throw new Error('Não foi possível ler a sessão salva.');
  }
  return { activity: parsed.activity, startedAt: parsed.startedAt, endsAt: parsed.endsAt };
}
