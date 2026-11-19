import { usePathname } from 'expo-router';
import { AppState } from 'react-native';
import { startForegroundWatch } from './foreground-watch';
import * as Location from 'expo-location';
import { createMunicipalityResolver, type Municipality } from './municipality';
import { createContext, useCallback, type PropsWithChildren, useContext, useEffect, useRef, useState } from 'react';
import type { LatLng } from 'react-native-maps';

type LocationState = {
  coordinate: LatLng | null;
  municipality: Municipality | null;
  locating: boolean;
  message: string | null;
  needsSettings: boolean;
  locate: () => Promise<LatLng | null>;
};

const ForegroundLocationContext = createContext<LocationState | null>(null);

async function readPosition(): Promise<Location.LocationObject> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Localização indisponível')), 12000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export function ForegroundLocationProvider({ children }: PropsWithChildren) {
  const [coordinate, setCoordinate] = useState<LatLng | null>(null);
  const [municipality, setMunicipality] = useState<Municipality | null>(null);
  const [resolveMunicipality] = useState(() => createMunicipalityResolver(Location.reverseGeocodeAsync));
  const cityRevision = useRef(0);
  const resolveCity = useCallback((position: LatLng) => {
    const revision = ++cityRevision.current;
    void resolveMunicipality(position).then(city => { if (cityRevision.current === revision) setMunicipality(city); });
  }, [resolveMunicipality]);
  const clearPosition = useCallback(() => {
    cityRevision.current++; setCoordinate(null); setMunicipality(null);
  }, []);
  useEffect(() => () => { cityRevision.current++; }, []);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [needsSettings, setNeedsSettings] = useState(false);
  const requestInProgress = useRef(false);
  const path = usePathname();
  const [appState, setAppState] = useState(AppState.currentState);
  const [permissionRevision, setPermissionRevision] = useState(0);
  useEffect(() => { const listener = AppState.addEventListener('change', setAppState); return () => listener.remove(); }, []);
  useEffect(() => {
    if (!['/', '/mapa'].includes(path) || appState !== 'active') return;
    return startForegroundWatch({
      permitted: async () => (await Location.getForegroundPermissionsAsync()).granted,
      enabled: Location.hasServicesEnabledAsync,
      watch: (receive, failure) => Location.watchPositionAsync({ accuracy: Location.Accuracy.Balanced, distanceInterval: 20, timeInterval: 10000 }, receive, failure),
    }, ({ coords }) => {
      if (Number.isFinite(coords.latitude) && Number.isFinite(coords.longitude)) {
        const point = { latitude: coords.latitude, longitude: coords.longitude };
        setCoordinate(point); resolveCity(point); setMessage(null);
      }
    }, reason => { clearPosition(); setMessage(reason); });
  }, [path, appState, permissionRevision, resolveCity, clearPosition]);

  async function locate() {
    if (requestInProgress.current) return null;
    requestInProgress.current = true;
    setLocating(true);
    setMessage(null);
    setNeedsSettings(false);

    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        clearPosition();
        setNeedsSettings(!permission.canAskAgain);
        setMessage('Permita o acesso à localização para centralizar o mapa.');
        return null;
      }
      if (!(await Location.hasServicesEnabledAsync())) {
        clearPosition();
        setMessage('Ative os Serviços de Localização do dispositivo e tente novamente.');
        return null;
      }

      const { coords } = await readPosition();
      const position = { latitude: coords.latitude, longitude: coords.longitude };
      setCoordinate(position); resolveCity(position);
      setPermissionRevision(v => v + 1);
      setMessage('Mapa centralizado na sua localização.');
      return position;
    } catch {
      clearPosition();
      setMessage('Localização indisponível. Tente novamente.');
      return null;
    } finally {
      requestInProgress.current = false;
      setLocating(false);
    }
  }

  return (
    <ForegroundLocationContext.Provider value={{ coordinate, municipality, locating, message, needsSettings, locate }}>
      {children}
    </ForegroundLocationContext.Provider>
  );
}

export function useForegroundLocation() {
  const context = useContext(ForegroundLocationContext);
  if (!context) throw new Error('A tela precisa do ForegroundLocationProvider.');
  return context;
}
