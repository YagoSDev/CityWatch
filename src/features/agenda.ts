import { useEvents } from './events';
import { useProfile } from './profile';
import { useCurrentCity } from './current-city';
import { buildAgenda } from './agenda-model';
import { cityAgendaDates } from './agenda-dates';
import { useNow } from './use-now';
export function useAgenda(year?: number) {
  const events = useEvents(); const { profile } = useProfile(); const now = useNow();
  const selectedCity = useCurrentCity(); const city = selectedCity.city; const validYear = year ?? new Date(now).getFullYear();
  const dates = cityAgendaDates(city?.id, validYear, selectedCity.state, selectedCity.name);
  const entries = buildAgenda(events.events, events.favorites, dates, selectedCity.name, selectedCity.state, now, { includeInactive: true, agendaIds: events.agendaIds });
  return { ...events, entries, now, city, profile, selectedCity, validYear };
}
