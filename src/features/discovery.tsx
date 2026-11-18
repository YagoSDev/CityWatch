import { createContext, useCallback, useContext, useState, type PropsWithChildren } from 'react';
import { useNow } from './use-now';
import { useEvents } from './events';
import { useNearbyOccurrences } from './nearby-occurrences';
import { findCity } from './city';
import { useProfile } from './profile';
import { defaultMapFilters, mapEvents, mapOccurrences, type MapFilters, type Coordinate } from './discovery-model';
import { discoveryDemos } from './discovery-data';
type Camera = Coordinate & { latitudeDelta: number; longitudeDelta: number };
const Context = createContext<{ filters: MapFilters; setFilters: (value: MapFilters) => void; cameras: Record<string, Camera>; saveCamera: (city: string, region: Camera) => void } | null>(null);
export function DiscoveryProvider({ children }: PropsWithChildren) {
  const [filters, setFilters] = useState<MapFilters>(defaultMapFilters);
  const [cameras, setCameras] = useState<Record<string, Camera>>({});
  const saveCamera = useCallback((city: string, region: Camera) => setCameras(old => ({ ...old, [city]: region })), []);
  return <Context.Provider value={{ filters, setFilters, cameras, saveCamera }}>{children}</Context.Provider>;
}
export function useDiscovery() {
  const context = useContext(Context);
  if (!context) throw new Error('DiscoveryProvider não encontrado');
  const { profile } = useProfile();
  const city = findCity(profile.city, profile.state);
  const occurrences = useNearbyOccurrences();
  const events = useEvents();
  const now = useNow();
  const items = [...mapEvents(events.events, profile.city, profile.state, city?.center, now),
    ...(city ? [...mapOccurrences(occurrences.data, city.center), ...discoveryDemos(city.name, city.center)] : [])];
  return { ...context, items, now, city, cityName: profile.city, loading: events.loading || occurrences.loading,
    error: [events.error, occurrences.error].filter(Boolean).join('\n'),
    privateCount: occurrences.data.filter(i => i.origem === 'cidadao').length,
    retry: () => { occurrences.retry(); events.reload(); } };
}
