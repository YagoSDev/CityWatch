import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { type ComponentRef, useEffect, useRef, useState } from 'react';
import { Keyboard, Linking, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type MapView from 'react-native-maps';
import type { Region } from 'react-native-maps';
import { useDiscovery } from '../features/discovery';
import { contentTypes, defaultMapFilters, distanceKm, filterDiscovery, withinRegion, type DiscoveryItem } from '../features/discovery-model';
import { defaultMapCity, normalize } from '../features/city';
import { useForegroundLocation } from '../features/foreground-location';
import { useReducedMotion } from '../features/reduced-motion';
import { useColors } from '../features/theme';
import { cameraRegion, CityMap } from './city-map';
import { DiscoveryFilters } from './discovery-filters';
import { DiscoveryCard } from './discovery-card';
export function DiscoveryMap({ full = false, focusSearch = false }: { full?: boolean; focusSearch?: boolean }) {
  const router = useRouter(); const c = useColors(); const discovery = useDiscovery();
  const { city, cityName, filters, setFilters, cameras, saveCamera } = discovery;
  const center = city?.center ?? defaultMapCity.center;
  const location = useForegroundLocation(); const reduceMotion = useReducedMotion();
  const map = useRef<MapView>(null); const input = useRef<ComponentRef<typeof TextInput>>(null);
  const [initial] = useState(() => cameras[cityName] ?? cameraRegion(location.coordinate ?? center, 0.07));
  const [region, setRegion] = useState<Region>(initial);
  const [following, setFollowing] = useState(!cameras[cityName]);
  const [query, setQuery] = useState(''); const [showFilters, setShowFilters] = useState(false);
  const [list, setList] = useState(false); const [selectedId, setSelectedId] = useState<string>();
  const [destination, setDestination] = useState<{ name: string; coordinate: { latitude: number; longitude: number } }>();
  const filtered = filterDiscovery(discovery.items, filters, location.coordinate ?? center, query, discovery.now);
  const located = filtered.filter(item => item.coordinate);
  const plotted = full ? located : [...located].sort((a, b) => distanceKm(location.coordinate ?? center, a.coordinate!) - distanceKm(location.coordinate ?? center, b.coordinate!)).slice(0, 8);
  const visible = plotted.filter(item => withinRegion(item, region));
  const selected = filtered.find(item => item.id === selectedId);
  const places = query.trim() ? city?.destinations.filter(place => normalize(place.name).includes(normalize(query))) ?? [] : [];
  useEffect(() => { if (full && focusSearch) input.current?.focus(); }, [full, focusSearch]);
  useEffect(() => {
    if (following && location.coordinate) map.current?.animateToRegion(cameraRegion(location.coordinate), reduceMotion ? 0 : 350);
  }, [following, location.coordinate, reduceMotion]);
  async function locate() {
    Keyboard.dismiss(); const coordinate = await location.locate();
    if (coordinate) { setFollowing(true); setDestination(undefined); map.current?.animateToRegion(cameraRegion(coordinate), reduceMotion ? 0 : 350); }
  }
  function select(item: DiscoveryItem) {
    setSelectedId(item.id); setList(false); setFollowing(false); Keyboard.dismiss();
  }
  function selectPlace(p: { name: string; coordinate: { latitude: number; longitude: number } }) {
    setDestination(p); setQuery(''); setFollowing(false); Keyboard.dismiss(); map.current?.animateToRegion(cameraRegion(p.coordinate, 0.02), reduceMotion ? 0 : 350);
  }
  function showCity() { setFollowing(false); map.current?.animateToRegion(cameraRegion(center, 0.07), reduceMotion ? 0 : 300); }
  function group(items: DiscoveryItem[]) {
    setFollowing(false); setList(true); setSelectedId(undefined);
    const points = items.map(i => i.coordinate!);
    map.current?.fitToCoordinates(points, { edgePadding: { top: 150, right: 65, bottom: 230, left: 65 }, animated: !reduceMotion });
  }
  const legend = <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingVertical: 4 }} accessibilityLabel="Legenda do mapa">{contentTypes.filter(t => filters.types.includes(t.id)).map(t => <View key={t.id} style={s.legend}><View style={{ backgroundColor: t.color, padding: 5, borderRadius: ['promocoes', 'parceiros'].includes(t.id) ? 4 : 16 }}><SymbolView name={t.icon} size={13} tintColor="#FFFFFF" /></View><Text style={{ color: c.text, fontSize: 12 }}>{t.label}</Text></View>)}</ScrollView>;
  const summary = <Text accessibilityLiveRegion="polite" style={{ color: c.muted, fontSize: 11 }}>{plotted.length} itens filtrados · {visible.length} nesta área · {location.coordinate ? 'distância pelo GPS autorizado' : 'distância pelo centro da cidade'}</Text>;
  const mapView = <CityMap key={cityName} ref={map} center={center} initialRegion={initial} region={region} items={plotted} destination={destination}
    interactive={full} onPress={full ? undefined : () => router.push('/mapa')} onManualInteraction={() => setFollowing(false)}
    onItemPress={full ? select : () => router.push('/mapa')} onGroupPress={full ? group : () => router.push('/mapa')}
    onRegionChangeComplete={next => { setRegion(next); if (full) saveCamera(cityName, next); }} />;
  const messages = <>
    {!location.coordinate && <Text style={{ color: c.muted, fontSize: 12 }}>{location.message || 'GPS não autorizado ou indisponível. Explore a cidade ou toque em Minha localização.'}</Text>}
    {location.needsSettings && <MapControl label={'Abrir Ajustes'} onPress={() => { void Linking.openSettings().catch(() => {}); }} />}
    {discovery.loading && <Text style={{ color: c.muted }}>Consultando dados…</Text>}
    {!!discovery.error && <>{<MapControl label={'Atualizar dados indisponíveis'} onPress={discovery.retry} />}<Text style={{ color: c.error, fontSize: 11 }}>{discovery.error}</Text></>}
    {!!discovery.privateCount && <Text style={{ color: c.muted, fontSize: 11 }}>{discovery.privateCount} relatos sem coordenadas públicas preservados na consulta.</Text>}
    {!discovery.loading && !plotted.length && <><Text style={{ color: c.text }}>Nenhum item para estes filtros.</Text>{<MapControl label={'Limpar filtros do mapa'} onPress={() => { setFilters(defaultMapFilters); setQuery(''); }} />}</>}
  </>;
  if (!full) return <View style={s.section}>
    <Text accessibilityRole="header" style={[s.heading, { color: c.text }]}>Perto de você</Text>
    <Pressable accessibilityRole="button" accessibilityLabel="Abrir mapa completo" onPress={() => router.push('/mapa')} style={[s.preview, { backgroundColor: c.surface }]}>
      <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={StyleSheet.absoluteFill}>{mapView}</View>
      <View pointerEvents="none" style={[s.badge, { backgroundColor: c.surface }]}><Text style={{ color: c.text, fontSize: 10 }}>{location.coordinate ? 'Sua localização autorizada' : city ? city.name : 'Referência: São Paulo'} · exemplos identificados</Text></View>
      <View pointerEvents="none" style={[s.openBadge, { backgroundColor: c.surface }]}><Text style={{ color: c.link, fontSize: 12, fontWeight: '800' }}>Abrir mapa</Text><SymbolView name="arrow.up.right" size={14} tintColor={c.link} /></View>
    </Pressable>
    {!!discovery.error && <Pressable accessibilityRole="button" accessibilityLabel="Dados do mapa indisponíveis. Tentar novamente" onPress={discovery.retry} style={{ flexDirection: 'row', gap: 6, alignItems: 'center', minHeight: 32 }}><SymbolView name="arrow.clockwise" size={13} tintColor={c.link} /><Text style={{ color: c.muted, fontSize: 11 }}>Dados não atualizados · tentar novamente</Text></Pressable>}
  </View>;
  return <View style={[s.full, { backgroundColor: c.background }]}>
    {mapView}
    <View style={s.top} pointerEvents="box-none">
      <View style={[s.search, { backgroundColor: c.surface, borderColor: c.border }]}><SymbolView name="magnifyingglass" size={18} tintColor={c.link} /><TextInput ref={input} value={query} onChangeText={setQuery} accessibilityLabel="Para onde você quer ir?" placeholder="Para onde você quer ir?" placeholderTextColor={c.muted} style={{ flex: 1, color: c.text, minHeight: 46 }} returnKeyType="search" onSubmitEditing={Keyboard.dismiss} />{!!query && <MapControl label={'Limpar'} onPress={() => setQuery('')} />}</View>
      <View style={s.row}>{<MapControl label={'Filtros'} onPress={() => setShowFilters(true)} icon={'slider.horizontal.3'} />}{<MapControl label={'Ver itens visíveis'} onPress={() => { setList(!list); setSelectedId(undefined); }} icon={'list.bullet'} />}</View>
      {!!query && <View style={[s.results, { backgroundColor: c.surface }]}><Text style={{ color: c.muted, fontSize: 11 }}>Busca local demonstrativa · pontos cadastrados, sem API externa de endereços.</Text>{places.map(p => <MapControl key={p.name} label={`Destino: ${p.name}`} onPress={() => selectPlace(p)} />)}{!places.length && <Text style={{ color: c.muted, fontSize: 12 }}>Nenhum destino cadastrado para esta busca. Os conteúdos do mapa também são filtrados pelo texto.</Text>}</View>}
    </View>
    <View style={[s.bottom, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={s.row}>{<MapControl label={location.locating ? 'Localizando…' : following ? 'Minha localização' : 'Voltar à minha localização'} onPress={() => void locate()} icon={'location.fill'} />}{<MapControl label={'Ver cidade'} onPress={showCity} />}</View>
      {summary}
      {(selected || list) && <ScrollView style={{ maxHeight: 260 }} contentContainerStyle={{ gap: 8 }} keyboardShouldPersistTaps="handled">
        {<MapControl label={'Fechar painel'} onPress={() => { setSelectedId(undefined); setList(false); }} />}
        {selected ? <DiscoveryCard item={selected} summary /> : <><Text style={{ color: c.text, fontWeight: '800' }}>{visible.length} itens visíveis</Text>{visible.map(item => <MapControl key={item.id} label={`${item.title}${item.advertising ? ' · Publicidade' : ''}`} onPress={() => select(item)} />)}{!visible.length && <Text style={{ color: c.muted }}>Mova ou afaste o mapa para encontrar os itens filtrados.</Text>}</>}
      </ScrollView>}
      {legend}
      <ScrollView style={{ maxHeight: 68 }}>{messages}<Text style={{ color: c.muted, fontSize: 10 }}>Simulações identificadas nos cartões. A localização não é publicada. Publicidade usa marcador quadrado.</Text></ScrollView>
    </View>
    {showFilters && <DiscoveryFilters filters={filters} onApply={setFilters} onClose={() => setShowFilters(false)} />}
  </View>;
}
const s = StyleSheet.create({ section: { gap: 10 }, heading: { fontSize: 25, fontWeight: '900', letterSpacing: -0.7 }, preview: { aspectRatio: 16 / 8.5, borderRadius: 22, overflow: 'hidden' }, openBadge: { position: 'absolute', bottom: 10, right: 10, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 5 }, full: { flex: 1 }, top: { position: 'absolute', top: 12, left: 12, right: 12, gap: 8 }, bottom: { position: 'absolute', bottom: 8, left: 10, right: 10, borderRadius: 22, borderWidth: 1, padding: 12, gap: 5, maxHeight: '60%' }, search: { borderWidth: 1, borderRadius: 16, minHeight: 48, paddingHorizontal: 12, flexDirection: 'row', gap: 8, alignItems: 'center' }, row: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 7, justifyContent: 'space-between' }, button: { flexDirection: 'row', alignItems: 'center', gap: 5, minHeight: 44, borderRadius: 12, borderWidth: 1, paddingHorizontal: 10 }, badge: { position: 'absolute', left: 10, top: 10, borderRadius: 10, padding: 7, maxWidth: '92%' }, legend: { flexDirection: 'row', gap: 5, alignItems: 'center' }, results: { padding: 12, borderRadius: 14, gap: 8 } });

function MapControl({ label, onPress, icon }: { label: string; onPress: () => void; icon?: 'slider.horizontal.3' | 'location.fill' | 'list.bullet' }) {
  const c = useColors();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[s.button, { backgroundColor: c.surface, borderColor: c.border }]}>{icon && <SymbolView name={icon} size={17} tintColor={c.link} />}<Text style={{ color: c.link, fontWeight: '700', fontSize: 13 }}>{label}</Text></Pressable>;
}
