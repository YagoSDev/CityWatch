import { useState } from 'react';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAgenda } from '../features/agenda';
import { useNow } from '../features/use-now';
import { dayRange, entriesOnDay, filterAgenda, localDayKey, monthCells, monthKey, monthRange, shiftMonth } from '../features/agenda-model';
import { timeBounds } from '../features/discovery-model';
import { useColors } from '../features/theme';
import { AgendaCard } from '../components/agenda-card';
import { Action, Notice } from '../components/form';
export default function AgendaScreen() {
  const c = useColors(); const router = useRouter(); const clock = useNow();
  const [month, setMonth] = useState(() => monthKey(clock)); const [day, setDay] = useState<string>();
  const [period, setPeriod] = useState<'hoje' | 'semana' | 'mes' | 'proximos'>('mes'); const [savedOnly, setSavedOnly] = useState(false);
  const { entries, now, loading, error, storageError, reload, selectedCity } = useAgenda(Number(month.slice(0, 4)));
  const today = localDayKey(new Date(now)); const cells = monthCells(month);
  const base = entries.filter(e => !savedOnly || e.saved || e.added);
  const range: [number, number] = period === 'proximos' ? [dayRange(today)[0], Infinity] : period === 'mes' ? monthRange(month) : timeBounds(period, now);
  const results = day ? entriesOnDay(base, day) : filterAgenda(base, range, false, period === 'proximos');
  const monthDate = new Date(`${month}-01T12:00:00`);
  function move(delta: number) { setMonth(shiftMonth(month, delta)); setDay(undefined); setPeriod('mes'); }
  function choosePeriod(next: typeof period) { setPeriod(next); setDay(undefined); if (next !== 'mes') setMonth(monthKey(now)); }
  return <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['bottom', 'left', 'right']}><ScrollView contentContainerStyle={s.content}>
    <Text accessibilityRole="header" style={{ color: c.text, fontSize: 30, fontWeight: '900' }}>Agenda</Text><Text style={{ color: c.muted }}>Sua cidade, suas próximas datas.</Text>
    <View style={[s.calendar, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={s.row}><Pressable accessibilityRole="button" accessibilityLabel="Mês anterior" onPress={() => move(-1)} style={s.arrow}><SymbolView name="chevron.left" tintColor={c.link} size={19} /></Pressable><Text accessibilityRole="header" accessibilityLiveRegion="polite" style={{ color: c.text, fontSize: 20, fontWeight: '800', flexShrink: 1, textTransform: 'capitalize' }}>{monthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</Text><Pressable accessibilityRole="button" accessibilityLabel="Próximo mês" onPress={() => move(1)} style={s.arrow}><SymbolView name="chevron.right" tintColor={c.link} size={19} /></Pressable></View>
      <View style={s.grid}>{['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(label => <View key={label} style={s.cell}><Text style={{ color: c.muted, fontSize: 10, fontWeight: '700' }}>{label}</Text></View>)}
        {cells.map((key, index) => { const count = key ? entriesOnDay(base, key).length : 0; return key ? <Pressable key={key} accessibilityRole="button" accessibilityLabel={`Dia ${key.split('-').reverse().join('/')}${count ? `, ${count} acontecimentos` : ', sem acontecimentos'}${key === today ? ', hoje' : ''}`} accessibilityState={{ selected: day === key }} onPress={() => setDay(day === key ? undefined : key)} style={s.cell}>
          <View style={[s.day, { backgroundColor: day === key ? c.soft : 'transparent', borderColor: key === today ? c.link : 'transparent' }]}><Text style={{ color: day === key || key === today ? c.link : c.text, fontWeight: key === today || day === key ? '800' : '500' }}>{Number(key.slice(-2))}</Text><View style={{ width: 5, height: 5, borderRadius: 1, marginTop: 3, backgroundColor: count ? c.brand : 'transparent' }} /></View>
        </Pressable> : <View key={`empty-${index}`} style={s.cell} />; })}
      </View>
      <Text style={{ color: c.muted, fontSize: 11 }}>■ Acontecimento · toque em um dia para ver os detalhes.</Text>
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>{([{ id: 'hoje', label: 'Hoje' }, { id: 'semana', label: 'Esta semana' }, { id: 'mes', label: 'Este mês' }, { id: 'proximos', label: 'Próximos' }] as const).map(p => <Pressable key={p.id} accessibilityRole="button" accessibilityLabel={`Agenda: ${p.label}`} accessibilityState={{ selected: period === p.id && !day }} onPress={() => choosePeriod(p.id)} style={[s.chip, { backgroundColor: period === p.id && !day ? c.action : c.surface, borderColor: c.border }]}><Text style={{ color: period === p.id && !day ? '#FFFFFF' : c.text }}>{p.label}</Text></Pressable>)}</ScrollView>
    <Pressable accessibilityRole="button" accessibilityState={{ selected: savedOnly }} onPress={() => setSavedOnly(!savedOnly)} style={s.saved}><SymbolView name={savedOnly ? 'heart.fill' : 'heart'} size={17} tintColor={c.link} /><Text style={{ color: c.link, fontWeight: '700' }}>{savedOnly ? 'Somente salvos: ativado' : 'Somente salvos'}</Text></Pressable>
    <View style={s.row}><Text accessibilityRole="header" style={{ color: c.text, fontSize: 19, fontWeight: '800', flexShrink: 1 }}>{day ? `Em ${day.split('-').reverse().join('/')}` : period === 'mes' ? `Acontecimentos de ${monthDate.toLocaleDateString('pt-BR', { month: 'long' })}` : 'Acontecimentos do período'}</Text>{day && <Pressable accessibilityRole="button" onPress={() => setDay(undefined)} style={s.arrow}><Text style={{ color: c.link }}>Limpar dia</Text></Pressable>}</View>
    {loading && <Text style={{ color: c.muted }}>Carregando agenda…</Text>}
    {!!(error || storageError) && <><Notice error message={error || storageError} /><Action title="Atualizar agenda" secondary onPress={reload} /></>}
    {!loading && !results.length && <Text style={{ color: c.muted }}>Nenhum acontecimento {day ? 'nesta data' : 'neste período'}{savedOnly ? ' entre seus favoritos e eventos adicionados' : ''}. Experimente outra data ou abra a Comunidade.</Text>}
    {results.map(entry => <AgendaCard key={entry.id} entry={entry} />)}
    <Notice message={`Feriados: base verificada de 2026. Nacionais e datas estaduais/municipais disponíveis para a cidade selecionada. ${Number(month.slice(0, 4)) !== 2026 ? 'Este ano ainda não possui base de feriados.' : ''} O calendário de ${selectedCity.name} pode estar incompleto.`} />
    <Text style={{ color: c.muted, fontSize: 12 }}>Favoritos entram automaticamente. Remover o favorito mantém o evento público; ele sai de Somente salvos, exceto se também estiver salvo na Agenda CityWatch. Nenhum compromisso pessoal do aparelho é lido.</Text>
    <Action title="Eventos da Comunidade" secondary onPress={() => router.navigate('/comunidade')} />
  </ScrollView></SafeAreaView>;
}
const s = StyleSheet.create({ content: { padding: 17, gap: 13, maxWidth: 640, width: '100%', alignSelf: 'center' }, calendar: { borderRadius: 24, borderWidth: 1, padding: 12, gap: 8 }, row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }, arrow: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }, grid: { flexDirection: 'row', flexWrap: 'wrap' }, cell: { width: '14.285714%', minHeight: 44, alignItems: 'center', justifyContent: 'center' }, day: { width: 36, height: 38, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, chip: { minHeight: 44, borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, justifyContent: 'center' }, saved: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 7 } });
