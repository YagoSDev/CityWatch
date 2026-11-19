import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SymbolViewProps } from 'expo-symbols';
import { createContext, type PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import {
  createActivitySession, extendActivitySession, isSessionExpired, restoreActivitySession,
  type ActivityId, type ActivitySession,
} from './activity-session';
import type { PitState } from './pit-assets';
import { countsForDay, restoreDailyCounters, updateDailyCounter, type CounterKey, type Counts, type DailyCounters } from './activity-engagement';
import { useActivitySteps } from './activity-steps';

export const activities: { id: ActivityId; label: string; message: string; icon: SymbolViewProps['name']; pit: PitState }[] = [
  { id: 'trabalhar', label: 'Trabalhar', message: 'Boa jornada! Vamos acompanhar o que acontece pelo caminho?',
    icon: { ios: 'briefcase', android: 'work' }, pit: 'working' },
  { id: 'correr', label: 'Correr', message: 'Bora correr! Vou te mostrar o que acontece por perto.',
    icon: { ios: 'figure.run', android: 'directions_run' }, pit: 'running' },
  { id: 'passear', label: 'Passear', message: 'Hoje é dia de explorar! Vamos descobrir a cidade?',
    icon: { ios: 'figure.walk', android: 'directions_walk' }, pit: 'walking' },
  { id: 'estudar', label: 'Estudar', message: 'Partiu estudar! Quer conferir as novidades da região?',
    icon: { ios: 'book', android: 'school' }, pit: 'working' },
  { id: 'dirigir', label: 'Dirigir', message: 'Prepare tudo antes de sair. Durante a direção, mantenha a atenção no trânsito.',
    icon: { ios: 'car', android: 'directions_car' }, pit: 'hello' },
  { id: 'outro', label: 'Outro', message: 'Fechado! Me conta para onde vamos.',
    icon: { ios: 'ellipsis', android: 'more_horiz' }, pit: 'hello' },
];

type Dialog = 'activity' | 'duration' | 'manage' | 'celebration' | null;
type ActivityContextValue = {
  ready: boolean; session: ActivitySession | null; expired: boolean; now: number; dialog: Dialog;
  draft?: ActivityId; error: string; busy: boolean; noticeDismissed: boolean;
  counters: Counts; countersReady: boolean; countersBusy: boolean; countersError: string;
  count: (key: CounterKey, delta: number) => Promise<void>;
  steps: ReturnType<typeof useActivitySteps>;
  choose: (activity: ActivityId) => void; open: () => void; close: () => void; change: () => void;
  start: (minutes: number) => Promise<void>; extend: (minutes: number) => Promise<void>;
  finish: () => Promise<void>; dismissNotice: () => void; retry: () => void;
};
const ActivityContext = createContext<ActivityContextValue | null>(null);
const storageKey = 'citywatch:activity-session:v1';
const countersKey = 'citywatch:activity-counters:v1';

export function ActivityProvider({ children }: PropsWithChildren) {
  const [snapshot, setSnapshot] = useState<{ session: ActivitySession | null }>();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [draft, setDraft] = useState<ActivityId>();
  const [now, setNow] = useState(Date.now);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [noticeDismissed, setNoticeDismissed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const writing = useRef(false);
  const [daily, setDaily] = useState<DailyCounters | null>();
  const [countersBusy, setCountersBusy] = useState(false);
  const [countersError, setCountersError] = useState('');
  const counting = useRef(false);
  const session = snapshot?.session ?? null;
  const expired = session !== null && isSessionExpired(session, now);
  const steps = useActivitySteps(session, expired);

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(countersKey).then(stored => {
      const restored = restoreDailyCounters(stored);
      if (active) { setDaily(restored); setCountersError(''); }
    }).catch(() => { if (active) setCountersError('Não foi possível carregar os contadores. Tente novamente antes de registrar.'); });
    return () => { active = false; };
  }, [attempt]);

  async function countCounter(key: CounterKey, delta: number) {
    if (counting.current || daily === undefined) return;
    counting.current = true; setCountersBusy(true); setCountersError('');
    try {
      const next = updateDailyCounter(daily, key, delta, Date.now());
      await AsyncStorage.setItem(countersKey, JSON.stringify(next));
      setDaily(next); setNow(Date.now());
    } catch { setCountersError('Não foi possível salvar o contador. Tente novamente.'); }
    finally { counting.current = false; setCountersBusy(false); }
  }

  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(storageKey).then((stored) => {
      const restored = restoreActivitySession(stored);
      if (!active) return;
      setSnapshot({ session: restored });
      setNow(Date.now());
      setError('');
      // The opening introduction greets the user. Session choices open on demand from P.I.T.
    }).catch(() => {
      if (active) {
        setError('Não foi possível carregar sua sessão. Tente novamente.');
        setDialog('manage');
      }
    });
    return () => { active = false; };
  }, [attempt]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(Date.now());
    });
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!session || expired) return;
    const timer = setTimeout(() => setNow(Date.now()), Math.min(60000, Math.max(1, session.endsAt - Date.now())));
    return () => clearTimeout(timer);
  }, [expired, now, session]);

  async function persist(next: ActivitySession | null) {
    if (writing.current) return false;
    writing.current = true;
    setBusy(true);
    setError('');
    try {
      await AsyncStorage.setItem(storageKey, JSON.stringify(next));
      setSnapshot({ session: next });
      setNow(Date.now());
      setNoticeDismissed(false);
      return true;
    } catch {
      setError('Não foi possível salvar a sessão neste dispositivo. Tente novamente.');
      return false;
    } finally {
      writing.current = false;
      setBusy(false);
    }
  }

  async function start(minutes: number) {
    if (!draft) { setError('Escolha uma atividade.'); return; }
    try {
      const next = createActivitySession(draft, minutes, Date.now());
      if (await persist(next)) setDialog(null);
    } catch (error) { setError((error as Error).message); }
  }

  async function extend(minutes: number) {
    if (!session) return;
    try {
      const next = extendActivitySession(session, minutes, Date.now());
      if (await persist(next)) setDialog(null);
    } catch (error) { setError((error as Error).message); }
  }

  async function finish() {
    if (await persist(null)) setDialog('celebration');
  }

  function close() {
    if (writing.current) return;
    setDialog(null);
    if (snapshot) setError('');
  }

  return (
    <ActivityContext.Provider value={{
      ready: snapshot !== undefined, session, expired, now, dialog, draft, error, busy, noticeDismissed,
      counters: countsForDay(daily ?? null, now), countersReady: daily !== undefined, countersBusy, countersError,
      count: countCounter, steps,
      choose: (activity) => { setDraft(activity); setError(''); setDialog('duration'); },
      open: () => { setNow(Date.now()); setDialog(!snapshot || session ? 'manage' : 'activity'); },
      close, change: () => setDialog('activity'), start, extend, finish,
      dismissNotice: () => setNoticeDismissed(true),
      retry: () => setAttempt((value) => value + 1),
    }}>
      {children}
    </ActivityContext.Provider>
  );
}

export function useActivity() {
  const context = useContext(ActivityContext);
  if (!context) throw new Error('ActivityProvider ausente.');
  return context;
}
