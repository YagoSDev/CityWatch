import { useEvents } from './events';
import { useProfile } from './profile';
import { findCity } from './city';
import { buildAgenda } from './agenda-model';
import { cityAgendaDates } from './agenda-dates';
import { useNow } from './use-now';
export function useAgenda(year?: number) {
  const events = useEvents(); const { profile } = useProfile(); const now = useNow();
  const city = findCity(profile.city, profile.state); const validYear = year ?? new Date(now).getFullYear();
  const dates = cityAgendaDates(city?.id, validYear, profile.state, profile.city);
  const entries = buildAgenda(events.events, events.favorites, dates, profile.city, profile.state, now, { includeInactive: true, agendaIds: events.agendaIds });
  return { ...events, entries, now, city, profile, validYear };
}
