import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useEvents } from '../features/events';
import { categoryLabel, eventDate, eventStatus, type CommunityEvent } from '../features/events-model';
import { eventImages, isGeneratedEventImage } from '../features/event-images';
import { type Colors, useColors, useThemedStyles } from '../features/theme';
export function EventFavorite({ event, photo = false }: { event: CommunityEvent; photo?: boolean }) {
  const { favorites, loading, writing, storageError, toggleFavorite } = useEvents();
  const colors = useColors();
  const selected = favorites.includes(event.id);
  return <Pressable testID={`favorite-${event.id}-${photo ? 'photo' : 'list'}`} accessibilityRole="button" accessibilityLabel={`${selected ? 'Desfavoritar' : 'Favoritar'} ${event.titulo}`}
    accessibilityState={{ selected, disabled: loading || writing || !!storageError }} disabled={loading || writing || !!storageError}
    onPress={press => { press.stopPropagation(); void toggleFavorite(event.id); }} style={[styles.favorite, photo && styles.photoFavorite]}>
    <SymbolView name={selected ? 'heart.fill' : 'heart'} size={25} tintColor={selected ? colors.brand : photo ? '#FFFFFF' : colors.link} />
  </Pressable>;
}
export function EventCard({ event, featured, width, compact = false }: { event: CommunityEvent; featured?: boolean; width?: number; compact?: boolean }) {
  const themed = useThemedStyles(createStyles);
  const router = useRouter();
  const state = eventStatus(event);
  const open = () => router.push({ pathname: '/detalhe-evento', params: { id: event.id } });
  if (featured) return <View style={[themed.hero, { width }]}><Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${event.titulo}. ${event.simulado ? 'Evento simulado.' : ''} ${state}.`}
    onPress={open} style={{ minHeight: compact ? (width || 360) * 9 / 16 : Math.max(240, (width || 360) * 0.65), justifyContent: 'flex-end' }}>
    <Image source={eventImages[event.imagem]} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" />
    <LinearGradient pointerEvents="none" colors={['#11121800', '#11121849', '#111218F5']} locations={[0, 0.3, 1]} style={StyleSheet.absoluteFill} />
    <Text style={styles.imageNote}>Imagem ilustrativa{isGeneratedEventImage(event.imagem) ? ' • IA' : ''}</Text>
    {event.simulado && <Text style={styles.demo}>Simulado</Text>}
    <View style={[styles.heroCopy, compact && { padding: 12, paddingTop: 36, gap: 4 }]}>
      <Text style={styles.badge}>{categoryLabel(event.categoria)}</Text>
      <Text numberOfLines={compact ? 2 : undefined} style={[styles.heroTitle, compact && { fontSize: 20, lineHeight: 23 }]}>{event.titulo}</Text>
      <Text style={[styles.heroDescription, compact && { fontSize: 12, lineHeight: 16 }]} numberOfLines={compact ? 1 : 2}>{event.resumo}</Text>
      <View style={styles.metaRow}>
        <SymbolView name="calendar" size={14} tintColor="#FFFFFF" />
        <Text style={styles.heroMeta}>{eventDate(event)}</Text>
        <SymbolView name="mappin.and.ellipse" size={14} tintColor="#FF3F83" />
        <Text style={styles.heroMeta} numberOfLines={1}>{event.bairro || event.local}</Text>
      </View>
    </View>
  </Pressable>
    <View style={styles.favoritePosition}><EventFavorite event={event} photo /></View>
  </View>;
  return <View style={themed.row}><Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${event.titulo}. ${event.simulado ? 'Evento simulado.' : ''} ${state}.`}
    onPress={open} style={{ flexDirection: 'row', gap: 10, flex: 1 }}>
    <Image source={eventImages[event.imagem]} style={styles.thumbnail} resizeMode="cover" />
    <View style={styles.rowCopy}>
      <Text style={[themed.category, event.publicidade && themed.advert]}>{categoryLabel(event.categoria)}{event.publicidade ? ' • Publicidade' : ''}</Text>
      <Text style={themed.rowTitle} numberOfLines={2}>{event.titulo}</Text>
      <Text style={themed.summary} numberOfLines={2}>{event.resumo}</Text>
      <Text style={themed.meta}>{eventDate(event)} · {event.bairro || event.local}</Text>
      <Text style={themed.simulated}>{event.simulado ? 'Simulado' : 'Evento cadastrado'}{isGeneratedEventImage(event.imagem) ? ' · Imagem IA' : ''}{state !== 'programado' ? ` · ${state}` : ''}</Text>
    </View>
  </Pressable>
    <EventFavorite event={event} />
  </View>;
}
const styles = StyleSheet.create({
  favorite: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', flexShrink: 0 }, photoFavorite: { borderRadius: 22, backgroundColor: '#17151B99' },
  heroCopy: { padding: 16, paddingTop: 70, gap: 6 }, badge: { alignSelf: 'flex-start', color: '#FFFFFF', backgroundColor: '#CA0047', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4, fontSize: 11, fontWeight: '800', overflow: 'hidden' },
  heroTitle: { color: '#FFFFFF', fontSize: 25, fontWeight: '900', letterSpacing: -0.6 }, heroDescription: { color: '#FFFFFF', fontSize: 14, lineHeight: 19 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingRight: 40, marginTop: 5 }, heroMeta: { color: '#FFFFFF', fontSize: 10, flexShrink: 1 },
  imageNote: { position: 'absolute', top: 12, left: 12, color: '#FFFFFF', backgroundColor: '#111218AC', padding: 4, fontSize: 9, borderRadius: 5, overflow: 'hidden' },
  demo: { position: 'absolute', top: 12, right: 12, color: '#FFFFFF', backgroundColor: '#111218BB', padding: 5, fontSize: 10, borderRadius: 7, overflow: 'hidden' },
  favoritePosition: { position: 'absolute', bottom: 8, right: 6 }, thumbnail: { width: 84, height: 104, borderRadius: 12, alignSelf: 'center' }, rowCopy: { flex: 1, gap: 4, paddingVertical: 5 },
});
const createStyles = (colors: Colors) => StyleSheet.create({
  hero: { borderRadius: 22, borderWidth: 1, borderColor: colors.dark ? '#FF76A7' : '#DC8EAA', overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: colors.surface },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: colors.surface, borderRadius: 17, padding: 7, borderWidth: 1, borderColor: colors.dark ? '#4C414E' : colors.border },
  rowTitle: { color: colors.text, fontWeight: '800', fontSize: 16, letterSpacing: -0.3 }, summary: { color: colors.muted, fontSize: 12, lineHeight: 16 },
  category: { color: colors.link, fontWeight: '800', fontSize: 10 }, advert: { color: colors.alert }, meta: { color: colors.muted, fontSize: 10 }, simulated: { color: colors.link, fontSize: 9, fontWeight: '600' },
});
