import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { contentTypes, defaultMapFilters, discoveryCategories, type MapFilters } from '../features/discovery-model';
import { useColors } from '../features/theme';
import { Action } from './form';
export function DiscoveryFilters({ filters, onApply, onClose }: { filters: MapFilters; onApply: (filters: MapFilters) => void; onClose: () => void }) {
  const [draft, setDraft] = useState(filters);
  const [expanded, setExpanded] = useState(false);
  const c = useColors();
  function choices<T extends string | number | null>(label: string, values: readonly { id: T; label: string }[], selected: readonly T[], choose: (value: T) => void) {
    return <View style={{ gap: 9 }}><Text accessibilityRole="header" style={{ color: c.text, fontSize: 18, fontWeight: '800' }}>{label}</Text><View style={s.wrap}>{values.map(item => <Pressable
      key={String(item.id)} accessibilityRole="button" accessibilityState={{ selected: selected.includes(item.id) }} accessibilityLabel={`${label}: ${item.label}`}
      onPress={() => choose(item.id)} style={[s.chip, { backgroundColor: selected.includes(item.id) ? c.action : c.surface, borderColor: c.border }]}>
      <Text style={{ color: selected.includes(item.id) ? '#FFFFFF' : c.text, fontSize: 14 }}>{item.label}</Text></Pressable>)}</View></View>;
  }
  return <Modal animationType="slide" transparent onRequestClose={onClose}><View style={{ flex: 1, backgroundColor: '#00000066', justifyContent: 'flex-end' }}>
    <SafeAreaView style={{ height: expanded ? '95%' : '82%', backgroundColor: c.background, borderTopLeftRadius: 26, borderTopRightRadius: 26 }} edges={['bottom', 'left', 'right']}><Pressable accessibilityRole="button" onPress={() => setExpanded(!expanded)} style={{ minHeight: 36, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: c.link }}>{expanded ? 'Recolher filtros' : 'Expandir filtros'}</Text></Pressable>
      <View style={s.header}><Text accessibilityRole="header" style={{ color: c.text, fontSize: 24, fontWeight: '800' }}>Filtros do mapa</Text><Pressable accessibilityRole="button" onPress={onClose} style={s.close}><Text style={{ color: c.link }}>Cancelar</Text></Pressable></View>
      <ScrollView contentContainerStyle={s.content}>
        {choices('Tipos de conteúdo', contentTypes.map(i => ({ id: i.id, label: i.label })), draft.types, id => setDraft({ ...draft, types: draft.types.includes(id) ? draft.types.filter(i => i !== id) : [...draft.types, id] }))}
        <Text style={{ color: c.muted }}>Selecione pelo menos um tipo. Publicidade tem identificação e marcador quadrado.</Text>
        {choices('Categorias', discoveryCategories.map(id => ({ id, label: id })), draft.categories, id => setDraft({ ...draft, categories: draft.categories.includes(id) ? draft.categories.filter(i => i !== id) : [...draft.categories, id] }))}
        <Text style={{ color: c.muted }}>Sem categorias selecionadas: todas as categorias.</Text>
        {choices('Distância', [1, 3, 5, 10, null].map(id => ({ id, label: id === null ? 'Cidade toda' : `${id} km` })), [draft.distance], distance => setDraft({ ...draft, distance }))}
        {choices('Tempo', [{ id: 'todos', label: 'Qualquer período' }, { id: 'agora', label: 'Agora' }, { id: 'hoje', label: 'Hoje' }, { id: 'semana', label: 'Esta semana' }, { id: 'mes', label: 'Este mês' }, { id: 'proximos', label: 'Próximos eventos' }] as const, [draft.time], time => setDraft({ ...draft, time }))}
        {choices('Verificação', [{ id: 'oficial', label: 'Oficial' }, { id: 'confirmado', label: 'Confirmado' }, { id: 'nao-verificado', label: 'Relato não verificado' }, { id: 'simulado', label: 'Simulado' }], draft.verification || [], id => setDraft({ ...draft, verification: draft.verification?.includes(id) ? draft.verification.filter(i => i !== id) : [...(draft.verification || []), id] }))}
        {choices('Status', [{ id: 'todos', label: 'Todos' }, { id: 'recentes', label: 'Recentes' }, { id: 'confirmados', label: 'Confirmados' }, { id: 'andamento', label: 'Em andamento' }, { id: 'encerrados', label: 'Encerrados' }] as const, [draft.status], status => setDraft({ ...draft, status }))}
        <Text style={{ color: c.muted }}>Recentes: publicados/iniciados nas últimas 24 horas. Confirmados exige verificação; nenhum exemplo fictício é tratado como confirmado. Períodos usam o fuso do dispositivo.</Text>
        <Action title="Limpar filtros" secondary onPress={() => setDraft({ ...defaultMapFilters, types: contentTypes.map(i => i.id) })} />
        <Action title="Restaurar filtros padrão" secondary onPress={() => setDraft(defaultMapFilters)} />
      </ScrollView>
      <View style={{ padding: 16 }}><Action title="Aplicar filtros" disabled={!draft.types.length} onPress={() => { onApply(draft); onClose(); }} /></View>
    </SafeAreaView></View>
  </Modal>;
}
const s = StyleSheet.create({ content: { padding: 20, gap: 22 }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20 }, close: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 8 }, wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { minHeight: 44, borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, justifyContent: 'center' } });
