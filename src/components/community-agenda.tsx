import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { useEvents } from '../features/events';
import { Action, Notice } from './form';
import { EventCard } from './event-card';
import { useScreenText } from './screen';
export function CommunityAgenda({ eventId }: { eventId?: string; onSelect?: (id?: string) => void }) {
  const router = useRouter();
  const body = useScreenText();
  const { events, favorites, agendaIds, loading, error, storageError, reload } = useEvents();
  return <>
    <Text style={body}>Agenda demonstrativa. Os favoritos são compartilhados com a aba Comunidade.</Text>
    <Action title="Abrir calendário da Agenda" onPress={() => router.push('/agenda')} />
    <Action title="Abrir Comunidade" onPress={() => router.navigate('/comunidade')} />
    {eventId && <Action title="Abrir detalhes do evento" secondary onPress={() => router.push({ pathname: '/detalhe-evento', params: { id: eventId } })} />}
    {loading ? <Text style={body}>Carregando eventos salvos…</Text> : <View style={{ gap: 10 }}>
      {events.filter(event => (favorites.includes(event.id) || agendaIds.includes(event.id))).map(event => <EventCard key={event.id} event={event} />)}
      {favorites.length === 0 && agendaIds.length === 0 && <Text style={body}>Você ainda não favoritou eventos.</Text>}
    </View>}
    {!!(error || storageError) && <><Notice error message={error || storageError} /><Action title="Tentar novamente" secondary onPress={reload} /></>}
  </>;
}
