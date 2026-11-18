import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AgendaEntry } from '../features/agenda-model';
import { useColors } from '../features/theme';
const categories: Record<string, string> = { cultura: 'Cultura', esportes: 'Esportes', animais: 'Animais', educacao: 'Educação', solidariedade: 'Solidariedade', saude: 'Saúde', meio_ambiente: 'Meio ambiente' };
export function AgendaCard({ entry }: { entry: AgendaEntry }) {
  const c = useColors(); const router = useRouter();
  const date = entry.date && !entry.invalidDate ? entry.allDay ? new Date(`${entry.date.slice(0, 10)}T12:00:00`) : new Date(entry.date) : undefined;
  const validDate = date && Number.isFinite(date.getTime()) ? date : undefined;
  return <Pressable accessibilityRole="button" accessibilityLabel={`Agenda: ${entry.title}${entry.saved ? ', favorito' : ''}${entry.added ? ', na minha agenda' : ''}${entry.status === 'cancelado' ? ', cancelado' : ''}`} onPress={() => entry.eventId ? router.push({ pathname: '/detalhe-evento', params: { id: entry.eventId } }) : router.push({ pathname: '/detalhe-agenda', params: { id: entry.id, ano: String(entry.validYear || date?.getFullYear()) } })} style={[s.card, { backgroundColor: c.surface, borderColor: c.border }]}>
    <View style={[s.date, { backgroundColor: c.soft }]}><Text style={{ color: c.link, fontSize: 24, fontWeight: '900' }}>{validDate?.getDate() || '—'}</Text><Text style={{ color: c.link, fontSize: 10, fontWeight: '700' }}>{validDate ? validDate.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase() : 'SEM DATA'}</Text></View>
    <View style={{ flex: 1, gap: 4 }}><Text style={{ color: c.link, fontSize: 10, fontWeight: '800' }}>{entry.kind === 'feriado' ? `FERIADO ${entry.scope?.toUpperCase() || ''}` : categories[entry.category || ''] || 'Evento'}{entry.simulated ? ' · SIMULADO' : ''}</Text><Text style={{ color: c.text, fontWeight: '800', fontSize: 15 }}>{entry.title}</Text><Text style={{ color: c.muted, fontSize: 12 }}>{entry.invalidDate ? 'Data inválida' : entry.allDay ? 'Dia inteiro' : validDate ? validDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : 'Horário a confirmar'} · {entry.local}</Text>{entry.status !== 'programado' && entry.status && <Text style={{ color: c.error, fontSize: 12 }}>{entry.status === 'cancelado' ? 'Cancelado' : 'Encerrado'}</Text>}{(entry.saved || entry.added) && <Text style={{ color: c.link, fontSize: 11 }}>{[entry.saved && 'Favorito', entry.added && 'Na minha agenda'].filter(Boolean).join(' · ')}</Text>}</View>
    <SymbolView name={entry.saved ? 'heart.fill' : entry.added ? 'calendar.badge.checkmark' : 'chevron.right'} size={16} tintColor={c.link} />
  </Pressable>;
}
const s = StyleSheet.create({ card: { padding: 13, borderRadius: 18, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 11 }, date: { width: 48, minHeight: 57, justifyContent: 'center', alignItems: 'center', borderRadius: 12 } });
