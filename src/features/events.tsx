import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type PropsWithChildren } from 'react';
import { loadCommunityEvents } from './events-data';
import { parseFavorites, type CommunityEvent } from './events-model';

type EventsState = { events: CommunityEvent[]; favorites: string[]; agendaIds: string[]; toggleAgenda: (id: string) => Promise<void>; loading: boolean; writing: boolean; error: string; storageError: string; reload: () => void; toggleFavorite: (id: string) => Promise<void> };
const EventsContext = createContext<EventsState | null>(null);
const agendaStorageKey = 'citywatch:agenda:event-ids';
const storageKey = 'citywatch:community:saved-events'; // Compatível com os favoritos existentes.
export function EventsProvider({ children }: PropsWithChildren) {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [agendaIds, setAgendaIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [writing, setWriting] = useState(false);
  const [error, setError] = useState('');
  const [storageError, setStorageError] = useState('');
  const [revision, setRevision] = useState(0);
  const loaded = useRef(false);
  const lock = useRef(false);
  useEffect(() => {
    let active = true;
    loaded.current = false;
    void loadCommunityEvents().then(async items => {
      if (!active) return;
      setEvents(items);
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        const saved = parseFavorites(stored, items.map(item => item.id));
        const storedAgenda = await AsyncStorage.getItem(agendaStorageKey);
        const agenda = parseFavorites(storedAgenda, items.map(item => item.id));
        if (active) { setFavorites(saved); setAgendaIds(agenda); loaded.current = true; }
      } catch { if (active) setStorageError('Não foi possível ler seus favoritos e sua agenda. Tente novamente antes de alterá-los.'); }
    }).catch(() => { if (active) setError('Não foi possível carregar os eventos. Tente novamente.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]);
  const reload = useCallback(() => { setLoading(true); setError(''); setStorageError(''); loaded.current = false; setRevision(value => value + 1); }, []);
  async function toggleFavorite(id: string) {
    if (lock.current || !loaded.current || !events.some(event => event.id === id)) return;
    lock.current = true; setWriting(true); setStorageError('');
    const next = favorites.includes(id) ? favorites.filter(item => item !== id) : [...favorites, id];
    try { await AsyncStorage.setItem(storageKey, JSON.stringify(next)); setFavorites(next); }
    catch { setStorageError('Não foi possível salvar o favorito. Seu estado anterior foi mantido.'); }
    finally { lock.current = false; setWriting(false); }
  }
  async function toggleAgenda(id: string) {
    if (lock.current || !loaded.current || !events.some(event => event.id === id)) return;
    lock.current = true; setWriting(true); setStorageError('');
    const next = agendaIds.includes(id) ? agendaIds.filter(item => item !== id) : [...agendaIds, id];
    try { await AsyncStorage.setItem(agendaStorageKey, JSON.stringify(next)); setAgendaIds(next); }
    catch { setStorageError('Não foi possível salvar sua agenda. O estado anterior foi mantido.'); }
    finally { lock.current = false; setWriting(false); }
  }
  return <EventsContext.Provider value={{ events, favorites, agendaIds, toggleAgenda, loading, writing, error, storageError, reload, toggleFavorite }}>{children}</EventsContext.Provider>;
}
export function useEvents() {
  const context = useContext(EventsContext);
  if (!context) throw new Error('EventsProvider não encontrado.');
  return context;
}
