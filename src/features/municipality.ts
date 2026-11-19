export type CityCoordinate = { latitude: number; longitude: number };
export type Municipality = { name: string; state: string };
type Address = { city?: string | null; subregion?: string | null; region?: string | null; isoCountryCode?: string | null };
const states: Record<string, string> = {
  acre: 'AC', alagoas: 'AL', amapa: 'AP', amazonas: 'AM', bahia: 'BA', ceara: 'CE', 'distrito federal': 'DF',
  'espirito santo': 'ES', goias: 'GO', maranhao: 'MA', 'mato grosso': 'MT', 'mato grosso do sul': 'MS',
  'minas gerais': 'MG', para: 'PA', paraiba: 'PB', parana: 'PR', pernambuco: 'PE', piaui: 'PI',
  'rio de janeiro': 'RJ', 'rio grande do norte': 'RN', 'rio grande do sul': 'RS', rondonia: 'RO', roraima: 'RR',
  'santa catarina': 'SC', 'sao paulo': 'SP', sergipe: 'SE', tocantins: 'TO',
};
export function normalizeCity(value: string) { return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').trim().replace(/\s+/g, ' ').toLowerCase(); }
export function municipalityFromAddress(address: Address | undefined): Municipality | null {
  if (!address || (address.isoCountryCode && address.isoCountryCode.toUpperCase() !== 'BR')) return null;
  const region = address.region?.trim() || '';
  const state = states[normalizeCity(region)] || (Object.values(states).includes(region.toUpperCase()) ? region.toUpperCase() : undefined);
  const name = address.city?.trim() || address.subregion?.trim();
  return name && state ? { name, state } : null;
}
export function validCityCoordinate(point: CityCoordinate) {
  return Number.isFinite(point.latitude) && Number.isFinite(point.longitude) && Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180;
}
/** Memory-only coarse cache; no residential addresses or precise coordinates are persisted. */
export function createMunicipalityResolver(reverse: (point: CityCoordinate) => Promise<Address[]>, now: () => number = Date.now) {
  const cache = new Map<string, { city: Municipality | null; expires: number }>();
  const pending = new Map<string, Promise<Municipality | null>>();
  return async (point: CityCoordinate): Promise<Municipality | null> => {
    if (!validCityCoordinate(point)) return null;
    const key = `${point.latitude.toFixed(2)}:${point.longitude.toFixed(2)}`;
    const hit = cache.get(key);
    if (hit && hit.expires > now()) return hit.city;
    const running = pending.get(key);
    if (running) return running;
    const task = (async () => {
      let city: Municipality | null = null;
      try { city = municipalityFromAddress((await reverse(point))[0]); } catch { /* Keep profile fallback if geocoding is unavailable. */ }
      cache.set(key, { city, expires: now() + (city ? 30 * 60000 : 2 * 60000) });
      if (cache.size > 32) cache.delete(cache.keys().next().value!);
      return city;
    })();
    pending.set(key, task);
    try { return await task; } finally { pending.delete(key); }
  };
}
export function contentMunicipality(profile: { city: string; state: string }, detected: Municipality | null): Municipality & { source: 'gps' | 'profile' } {
  return detected ? { ...detected, source: 'gps' } : { name: profile.city, state: profile.state, source: 'profile' };
}
