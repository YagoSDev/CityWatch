import { useForegroundLocation } from './foreground-location';
import { useProfile } from './profile';
import { findCity, type City } from './city';
import { contentMunicipality } from './municipality';

/** Discovery follows the authorized location; the residence stored in the profile remains unchanged. */
export function useCurrentCity() {
  const { profile } = useProfile();
  const location = useForegroundLocation();
  const selected = contentMunicipality(profile, location.municipality);
  const known = findCity(selected.name, selected.state);
  const city: City | undefined = known ?? (selected.source === 'gps' && location.coordinate ? {
    id: `gps:${selected.name}:${selected.state}`, name: selected.name,
    landmark: 'Sua cidade, de perto', description: 'Informação e comunidade para acompanhar a cidade.',
    center: location.coordinate, destinations: [],
  } : undefined);
  return { ...selected, city, key: `${selected.name}:${selected.state}` };
}
