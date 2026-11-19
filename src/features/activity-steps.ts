import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import type { ActivitySession } from './activity-session';
import { authorizeSteps, validStepCount } from './pedometer-access';

type StepScope = { id: number; since: number; count: number | null; status: 'loading' | 'active' | 'unavailable' | 'denied' | 'error'; message: string };
export function useActivitySteps(session: ActivitySession | null, expired: boolean) {
  const [scope, setScope] = useState<StepScope | null>(null);
  const [foreground, setForeground] = useState(AppState.currentState === 'active');
  const enabling = useRef(false);
  const count = useRef(0);
  const eligible = session?.activity === 'correr' || session?.activity === 'passear';
  const current = eligible && scope?.id === session?.startedAt ? scope : null;

  useEffect(() => {
    const listener = AppState.addEventListener('change', state => setForeground(state === 'active'));
    return () => listener.remove();
  }, []);

  async function enable() {
    if (!session || !eligible || expired || enabling.current) return;
    enabling.current = true;
    const id = session.startedAt;
    const since = Date.now();
    setScope({ id, since, count: null, status: 'loading', message: 'Verificando sensor de passos…' });
    try {
      const { Pedometer } = await import('expo-sensors');
      const status = await authorizeSteps(Pedometer);
      count.current = 0;
      setScope({ id, since, count: status === 'ready' ? 0 : null, status: status === 'ready' ? 'active' : status,
        message: status === 'unavailable' ? 'Este aparelho não oferece contagem de passos. O cronômetro continua funcionando.' :
          status === 'denied' ? 'Acesso aos passos não autorizado. Você pode continuar sem essa função.' : 'Passos desde a ativação nesta sessão.' });
    } catch {
      setScope({ id, since, count: null, status: 'error', message: 'Passos indisponíveis nesta instalação. Use uma versão atualizada do CityWatch em um aparelho com sensor.' });
    } finally { enabling.current = false; }
  }

  const id = current?.id;
  const since = current?.since;
  const active = current?.status === 'active';
  const endsAt = session?.endsAt;
  useEffect(() => {
    if (!active || id === undefined || since === undefined || endsAt === undefined || !foreground || expired) return;
    let cancelled = false;
    let subscription: { remove: () => void } | undefined;
    void (async () => {
      try {
        const { Pedometer } = await import('expo-sensors');
        let base = count.current;
        if (Platform.OS === 'ios') {
          const end = Math.min(Date.now(), endsAt);
          if (end > since) base = validStepCount((await Pedometer.getStepCountAsync(new Date(since), new Date(end))).steps);
        }
        if (cancelled) return;
        count.current = base;
        setScope(previous => previous?.id === id ? { ...previous, count: base } : previous);
        subscription = Pedometer.watchStepCount(result => {
          if (cancelled) return;
          try {
            const next = validStepCount(base + validStepCount(result.steps));
            count.current = next;
            setScope(previous => previous?.id === id ? { ...previous, count: next } : previous);
          } catch { /* A malformed reading never becomes an invented step total. */ }
        });
      } catch {
        if (!cancelled) setScope(previous => previous?.id === id ? { ...previous, status: 'error', message: 'Não foi possível ler os passos. O cronômetro continua disponível.' } : previous);
      }
    })();
    return () => { cancelled = true; subscription?.remove(); };
  }, [active, endsAt, expired, foreground, id, since]);

  return { count: current?.count ?? null, status: current?.status ?? 'idle',
    message: current?.message ?? 'Ative se quiser contar passos. A permissão só será solicitada ao tocar.',
    enable, disable: () => setScope(null) };
}
