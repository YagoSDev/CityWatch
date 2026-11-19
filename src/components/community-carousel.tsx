import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useEvents } from '../features/events';
import { filterEvents, eventStatus } from '../features/events-model';
import { useNow } from '../features/use-now';
import { useCurrentCity } from '../features/current-city';
import { useReducedMotion } from '../features/reduced-motion';
import { useColors } from '../features/theme';
import { EventCard } from './event-card';
export function CommunityCarousel({ width }: { width: number }) {
  const c = useColors(); const reduced = useReducedMotion(); const now = useNow(); const currentCity = useCurrentCity();
  const { events, loading, error, reload } = useEvents();
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null); const [page, setPage] = useState(0);
  const items = filterEvents(events, { city: currentCity.name, state: currentCity.state }, now)
    .filter(event => !event.publicidade && eventStatus(event, now) === 'programado')
    .sort((a, b) => Number(b.destaque) - Number(a.destaque)).slice(0, 6);
  if (loading && !items.length) return <Text style={{ color: c.muted, fontSize: 12 }}>Carregando eventos…</Text>;
  if (error) return <Pressable accessibilityRole="button" onPress={reload} style={{ minHeight: 36, justifyContent: 'center' }}><Text style={{ color: c.link, fontSize: 12 }}>Eventos indisponíveis · tentar novamente</Text></Pressable>;
  if (!items.length) return <Text style={{ color: c.muted, fontSize: 13 }}>Ainda não há eventos para esta cidade.</Text>;
  return <View>
    <ScrollView ref={scroll} horizontal pagingEnabled directionalLockEnabled bounces={false} showsHorizontalScrollIndicator={false}
      accessibilityLabel="Eventos da cidade" onMomentumScrollEnd={({ nativeEvent }) => setPage(Math.min(items.length - 1, Math.max(0, Math.round(nativeEvent.contentOffset.x / width))))}>
      {items.map(event => <EventCard key={event.id} event={event} featured compact width={width} />)}
    </ScrollView>
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>{items.map((event, index) => <Pressable key={event.id} accessibilityRole="button" accessibilityLabel={`Evento ${index + 1} de ${items.length}`} accessibilityState={{ selected: page === index }} onPress={() => { setPage(index); scroll.current?.scrollTo({ x: index * width, animated: !reduced }); }} style={{ width: 29, minHeight: 32, alignItems: 'center', justifyContent: 'center' }}><View style={{ height: 6, width: page === index ? 18 : 6, borderRadius: 4, backgroundColor: page === index ? c.brand : c.border }} /></Pressable>)}</View>
  </View>;
}
