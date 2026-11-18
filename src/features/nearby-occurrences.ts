import { useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';
import type { LatLng } from 'react-native-maps';
import { academicRequest, type Categoria, type OcorrenciaAcademica } from './academic-api';
import type { Colors } from './theme';

let lastSuccessful: OcorrenciaAcademica[] | undefined;

export function useNearbyOccurrences() {
  const focused = useIsFocused();
  const [result, setResult] = useState<{ revision: number; data: OcorrenciaAcademica[]; error: string }>();
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!focused) return;
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => controller.abort(), 10000);

    void academicRequest<OcorrenciaAcademica[]>('/ocorrencias', { signal: controller.signal })
      .then((items) => { if (active) { lastSuccessful = items; setResult({ revision, data: items, error: '' }); } })
      .catch((error: Error) => { if (active) setResult({ revision, data: lastSuccessful ?? [], error: error.message }); })
      .finally(() => clearTimeout(timer));

    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [focused, revision]);

  return {
    data: result?.data ?? lastSuccessful ?? [],
    error: result?.revision === revision ? result.error : '',
    loading: result?.revision !== revision,
    retry: () => setRevision((value) => value + 1),
  };
}

export function occurrenceAppearance(category: Categoria, colors: Colors) {
  switch (category) {
    case 'iluminação': return { tint: colors.alert, background: colors.alertBg, icon: { ios: 'lightbulb' as const, android: 'lightbulb' as const } };
    case 'acessibilidade': return { tint: colors.event, background: colors.eventBg, icon: { ios: 'figure.roll' as const, android: 'accessible' as const } };
    case 'limpeza': return { tint: colors.security, background: colors.securityBg, icon: { ios: 'leaf' as const, android: 'eco' as const } };
    case 'conservação': return { tint: colors.link, background: colors.soft, icon: { ios: 'wrench.and.screwdriver' as const, android: 'construction' as const } };
  }
}

export function demonstrationCoordinate(id: string, center: LatLng): LatLng {
  const hash = Array.from(id).reduce((sum, letter) => (sum * 31 + letter.charCodeAt(0)) >>> 0, 17);
  const angle = (hash % 360) * Math.PI / 180;
  const radius = 0.006 + ((hash >>> 8) % 15) / 1000;
  return { latitude: center.latitude + Math.sin(angle) * radius, longitude: center.longitude + Math.cos(angle) * radius };
}

export function approximateCoordinate(coordinate: LatLng): LatLng {
  return { latitude: Math.round(coordinate.latitude * 100) / 100, longitude: Math.round(coordinate.longitude * 100) / 100 };
}
