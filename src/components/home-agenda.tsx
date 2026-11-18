import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, Text, View } from 'react-native';
import { useAgenda } from '../features/agenda';
import { entriesOnDay, localDayKey, monthCells, monthKey } from '../features/agenda-model';
import { useColors } from '../features/theme';
export function HomeAgenda() {
  const c = useColors(); const router = useRouter(); const { entries, now, loading, error, storageError, reload } = useAgenda();
  const today = localDayKey(new Date(now)); const month = monthKey(now); const cells = monthCells(month);
  return <View style={{ gap: 10 }}>
    <Text accessibilityRole="header" style={{ color: c.text, fontSize: 25, fontWeight: '900', letterSpacing: -0.7 }}>Agenda</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir Agenda completa. ${new Date(now).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`} onPress={() => router.push('/agenda')} style={{ borderRadius: 22, backgroundColor: c.surface, borderColor: c.border, borderWidth: 1, padding: 12 }}>
      <View pointerEvents="none" accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 9 }}><Text style={{ color: c.text, fontSize: 16, fontWeight: '800', textTransform: 'capitalize' }}>{new Date(now).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</Text><SymbolView name="calendar" size={20} tintColor={c.link} /></View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'].map(label => <View key={label} style={{ width: '14.285714%', height: 23, alignItems: 'center' }}><Text style={{ color: c.muted, fontSize: 9, fontWeight: '700' }}>{label}</Text></View>)}
          {cells.map((key, index) => <View key={key || `empty-${index}`} style={{ width: '14.285714%', height: 30, alignItems: 'center', justifyContent: 'center' }}>{key && <View style={{ width: 27, height: 28, borderWidth: 1, borderColor: key === today ? c.link : 'transparent', borderRadius: 9, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: key === today ? c.link : c.text, fontWeight: key === today ? '800' : '500', fontSize: 12 }}>{Number(key.slice(-2))}</Text><View style={{ height: 3, width: 3, marginTop: 2, borderRadius: 1, backgroundColor: entriesOnDay(entries, key).length ? c.brand : 'transparent' }} /></View>}</View>)}
        </View>
      </View>
    </Pressable>
    {!!(error || storageError) && <Pressable accessibilityRole="button" accessibilityLabel="Agenda não atualizada. Tentar novamente" onPress={reload} style={{ minHeight: 32, justifyContent: 'center' }}><Text style={{ color: c.muted, fontSize: 11 }}>Agenda não atualizada · tentar novamente</Text></Pressable>}
    {loading && <Text style={{ color: c.muted, fontSize: 11 }}>Atualizando agenda…</Text>}
  </View>;
}
