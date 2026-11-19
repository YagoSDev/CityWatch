import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useRef, useState, type ComponentRef } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCurrentCity } from '../features/current-city';
import { avatarUri, useProfile } from '../features/profile';
import { useEvents } from '../features/events';
import { eventCategories, filterEvents } from '../features/events-model';
import { useReducedMotion } from '../features/reduced-motion';
import { type Colors, useColors, useThemedStyles } from '../features/theme';
import { CityLogo } from './city-logo';
import { PitCard } from './pit-card';
import { Avatar } from './avatar';
import { EventCard } from './event-card';
import { Action, Notice } from './form';

export default function CommunityScreen() {
  const styles = useThemedStyles(createStyles);
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const currentCity = useCurrentCity();
  const router = useRouter();
  const params = useLocalSearchParams<{ salvos?: string; consulta?: string }>();
  const { events, favorites, loading, error, storageError, reload } = useEvents();
  const [category, setCategory] = useState('todos');
  const [query, setQuery] = useState('');
  const [futureOnly, setFutureOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const sourceKey = `${params.salvos || ''}:${params.consulta || ''}`;
  const [favoriteFilter, setFavoriteFilter] = useState({ source: sourceKey, value: params.salvos === '1' });
  const favoritesOnly = favoriteFilter.source === sourceKey ? favoriteFilter.value : params.salvos === '1';
  const setFavoritesOnly = (value: boolean) => setFavoriteFilter({ source: sourceKey, value });
  const [page, setPage] = useState({ key: '', index: 0 });
  const reduced = useReducedMotion();
  const width = Math.min(useWindowDimensions().width - 32, 648);
  const carousel = useRef<ComponentRef<typeof ScrollView>>(null);
  const list = useRef<ComponentRef<typeof ScrollView>>(null);
  const listY = useRef(0);
  const filtered = filterEvents(events, { category, query, futureOnly, favoritesOnly, favorites, city: currentCity.name, state: currentCity.state });
  const featured = filtered.filter(event => event.destaque);
  const rows = filtered.filter(event => !featured.some(highlight => highlight.id === event.id));
  const filterKey = `${category}:${query}:${futureOnly}:${favoritesOnly}:${currentCity.name}:${currentCity.state}`;
  const carouselKey = `${filterKey}:${featured.map(event => event.id).join(',')}:${width}`;
  const currentPage = page.key === carouselKey ? page.index : 0;
  function resetPage() { setPage({ key: '', index: 0 }); carousel.current?.scrollTo({ x: 0, animated: false }); }
  return <View style={styles.fill}>
    <LinearGradient colors={colors.dark ? ['#ED0050', '#A4003B', '#39172E'] : ['#ED0050', '#C40045', '#A9003E']}
      style={[styles.header, { paddingTop: insets.top + 3 }]}>
      <View style={styles.brand}>
        <CityLogo size={40} />
        <View style={{ flexShrink: 1 }}><Text maxFontSizeMultiplier={1.3} style={styles.brandTitle}>CityWatch</Text><Text numberOfLines={1} maxFontSizeMultiplier={1.3} style={styles.brandSubtitle}>Comunidade · {currentCity.name}</Text></View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" onPress={() => router.push('/perfil')} style={styles.avatar}>
        <Avatar name={profile.name} uri={avatarUri(profile.avatar)} size={45} />
      </Pressable>
    </LinearGradient>
    <ScrollView ref={list} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
      <View style={styles.intro}><Text accessibilityRole="header" style={styles.title}>Comunidade</Text>
        <Text style={styles.subtitle}>Eventos, ações, campanhas e novidades da sua cidade.</Text>
</View>
      <View style={styles.search}>
        <SymbolView name="magnifyingglass" size={18} tintColor={colors.muted} />
        <TextInput accessibilityLabel="Pesquisar eventos" placeholder="Buscar por evento, categoria ou bairro" placeholderTextColor={colors.muted}
          value={query} onChangeText={value => { setQuery(value); resetPage(); }} style={styles.searchInput} clearButtonMode="while-editing" />
        <Pressable accessibilityRole="button" accessibilityLabel="Filtrar eventos" accessibilityState={{ expanded: filtersOpen }} onPress={() => setFiltersOpen(value => !value)} style={styles.filterToggle}>
          <SymbolView name="slider.horizontal.3" size={22} tintColor={futureOnly || favoritesOnly ? colors.brand : colors.link} />
        </Pressable>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categories} accessibilityLabel="Categorias de eventos">
        {eventCategories.map(item => <Pressable key={item.id} accessibilityRole="button" accessibilityLabel={`Categoria ${item.label}`}
          accessibilityState={{ selected: category === item.id }} onPress={() => { setCategory(item.id); resetPage(); }}
          style={[styles.category, item.id === 'solidariedade' && { width: 104 }, category === item.id && styles.categorySelected]}>
          <SymbolView name={item.icon} size={25} tintColor={category === item.id ? '#FFFFFF' : colors.text} />
          <Text style={[styles.categoryLabel, category === item.id && styles.onBrand]}>{item.label}</Text>
        </Pressable>)}
      </ScrollView>
      {filtersOpen && <View style={styles.filterRow}>
        <View style={styles.future}><Switch accessibilityLabel="Somente eventos futuros" value={futureOnly} trackColor={{ true: colors.brand }} onValueChange={value => { setFutureOnly(value); resetPage(); }} /><Text style={styles.filterLabel}>Futuros</Text></View>
        <Pressable accessibilityRole="button" accessibilityState={{ selected: favoritesOnly }} accessibilityLabel="Mostrar favoritos"
          onPress={() => { setFavoritesOnly(!favoritesOnly); resetPage(); }} style={styles.savedButton}>
          <SymbolView name={favoritesOnly ? 'heart.fill' : 'heart'} size={18} tintColor={colors.link} /><Text style={styles.link}>Favoritos</Text>
        </Pressable>
      </View>}
      {storageError ? <><Notice error message={storageError} /><Action title="Tentar carregar favoritos novamente" secondary onPress={reload} /></> : null}
      {loading ? <View style={styles.empty}><ActivityIndicator color={colors.link} /><Text style={styles.subtitle}>Carregando eventos…</Text></View> : error ? <>
        <Notice error message={error} /><Action title="Tentar novamente" onPress={reload} />
      </> : filtered.length === 0 ? <View style={styles.empty}>
        <SymbolView name="calendar.badge.exclamationmark" size={38} tintColor={colors.link} />
        <Text style={styles.sectionTitle}>Nenhum evento encontrado</Text><Text style={styles.subtitle}>Tente outra categoria ou pesquisa. Ainda não há programação para todas as cidades.</Text>
        <Action title="Limpar filtros" secondary onPress={() => { setQuery(''); setCategory('todos'); setFutureOnly(false); setFavoritesOnly(false); resetPage(); }} />
      </View> : <>
        {featured.length > 0 && <View style={styles.section}>
          <View style={styles.sectionHeader}><View style={styles.headingRow}><SymbolView name="flame.fill" size={23} tintColor={colors.brand} /><Text accessibilityRole="header" style={styles.sectionTitle}>Eventos em destaque</Text></View>
            <Pressable accessibilityRole="button" accessibilityLabel="Ver todos os eventos" onPress={() => list.current?.scrollTo({ y: listY.current, animated: !reduced })} style={styles.all}><Text style={styles.link}>Ver todos →</Text></Pressable></View>
          <ScrollView key={carouselKey} ref={carousel} horizontal pagingEnabled bounces={false} showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={({ nativeEvent }) => setPage({ key: carouselKey, index: Math.round(nativeEvent.contentOffset.x / width) })}>
            {featured.map(event => <EventCard key={event.id} event={event} featured width={width} />)}
          </ScrollView>
          <View style={styles.dots}>{featured.map((event, index) => <Pressable key={event.id} accessibilityRole="button" accessibilityLabel={`Destaque ${index + 1} de ${featured.length}`}
            accessibilityState={{ selected: index === currentPage }} style={styles.dotTarget} onPress={() => { setPage({ key: carouselKey, index }); carousel.current?.scrollTo({ x: index * width, animated: !reduced }); }}><View style={[styles.dot, index === currentPage && styles.dotSelected]} /></Pressable>)}</View>
        </View>}
        <View style={styles.section} onLayout={({ nativeEvent }) => { listY.current = nativeEvent.layout.y; }}>
          <View style={styles.headingRow}><SymbolView name="megaphone.fill" size={23} tintColor={colors.brand} /><Text accessibilityRole="header" style={styles.sectionTitle}>Mais eventos para você</Text></View>
          {rows.map(event => <EventCard key={event.id} event={event} />)}
          {rows.length === 0 && <Text style={styles.subtitle}>Os eventos desta seleção estão nos destaques acima.</Text>}
        </View>
      </>}
      <PitCard title="Vamos participar?" message="Salve os eventos que combinam com você. Seus favoritos também entram na Agenda." state="celebration" />
      <View style={styles.footer}><Text style={styles.caption}>Eventos fictícios para demonstração. Fotos ilustrativas; nenhuma programação oficial ou inscrição é confirmada.</Text>
        <Action title="Outros recursos da comunidade" secondary onPress={() => router.push('/recursos-comunidade')} />
      </View>
    </ScrollView>
  </View>;
}
const createStyles = (colors: Colors) => StyleSheet.create({
  filterToggle: { width: 38, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  fill: { flex: 1, backgroundColor: colors.background }, header: { paddingHorizontal: 19, paddingBottom: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderColor: '#FF4B8C77' }, brand: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }, brandTitle: { color: '#FFFFFF', fontSize: 26, fontWeight: '900', letterSpacing: -0.8 }, brandSubtitle: { color: '#FFFFFF', fontSize: 14 }, avatar: { borderRadius: 30, borderWidth: 2, borderColor: '#FFFFFF', padding: 2 }, content: { padding: 16, gap: 15, maxWidth: 680, width: '100%', alignSelf: 'center', paddingBottom: 30 }, intro: { gap: 6 }, title: { color: colors.text, fontSize: 29, fontWeight: '900', letterSpacing: -0.8 }, subtitle: { color: colors.muted, fontSize: 14, lineHeight: 20 }, city: { color: colors.link, fontSize: 11, fontWeight: '600' }, search: { backgroundColor: colors.surface, borderRadius: 14, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12 }, searchInput: { flex: 1, color: colors.text, minHeight: 44, fontSize: 12 }, categories: { gap: 9 }, category: { width: 66, minHeight: 74, borderRadius: 19, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: 8, justifyContent: 'center', alignItems: 'center', gap: 7 }, categorySelected: { backgroundColor: colors.brand, borderColor: '#FF91B7' }, categoryLabel: { color: colors.text, fontSize: 10.5, fontWeight: '600', textAlign: 'center' }, onBrand: { color: '#FFFFFF' }, filterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, future: { flexDirection: 'row', gap: 8, alignItems: 'center' }, filterLabel: { color: colors.text, fontSize: 13 }, savedButton: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44 }, link: { color: colors.link, fontSize: 12, fontWeight: '700' }, section: { gap: 10 }, sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6, flexWrap: 'wrap' }, headingRow: { flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1 }, sectionTitle: { color: colors.text, fontSize: 20, fontWeight: '800', letterSpacing: -0.5, flexShrink: 1 }, all: { minHeight: 44, justifyContent: 'center' }, dots: { flexDirection: 'row', alignSelf: 'center' }, dotTarget: { width: 27, minHeight: 28, justifyContent: 'center', alignItems: 'center' }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border }, dotSelected: { width: 19, backgroundColor: colors.brand }, empty: { gap: 14, paddingVertical: 30, alignItems: 'stretch' }, footer: { gap: 12, paddingTop: 14 }, caption: { color: colors.muted, fontSize: 11, lineHeight: 17 },
});
