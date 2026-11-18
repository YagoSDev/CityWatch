import { useRouter } from 'expo-router';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { contentTypes, discoveryStatus, verificationLabel, type DiscoveryItem } from '../features/discovery-model';
import { eventImages } from '../features/event-images';
import { useColors } from '../features/theme';
export function DiscoveryCard({ item, summary = false }: { item: DiscoveryItem; summary?: boolean }) {
  const c = useColors(); const router = useRouter();
  const appearance = contentTypes.find(t => t.id === item.type)!;
  const open = () => item.eventId ? router.push({ pathname: '/detalhe-evento', params: { id: item.eventId } }) : item.occurrenceId ? router.push({ pathname: '/detalhe-ocorrencia', params: { id: item.occurrenceId } }) : router.push({ pathname: '/detalhe-mapa', params: { id: item.id } });
  return <View style={[s.card, { backgroundColor: c.surface, borderColor: c.border }]}>
    <View style={s.row}><Image source={eventImages[item.image]} style={s.image} accessibilityLabel="Imagem ilustrativa; não registra o acontecimento" />
      <View style={{ flex: 1, gap: 4 }}><Text style={{ color: c.link, fontSize: 11, fontWeight: '800' }}>{item.advertising ? 'PUBLICIDADE · ' : ''}{appearance.label} · {item.simulated ? 'Simulado' : 'Não verificado'}</Text>
        <Text numberOfLines={summary ? 2 : undefined} style={{ color: c.text, fontSize: 16, fontWeight: '800' }}>{item.title}</Text><Text style={{ color: c.muted, fontSize: 12 }}>{item.category} · {item.local}</Text></View></View>
    <Text numberOfLines={summary ? 2 : undefined} style={{ color: c.text, fontSize: 13 }}>{item.description}</Text>
    <Text style={{ color: c.muted, fontSize: 11 }}>Fonte: {item.source || 'Comunidade CityWatch'} · {verificationLabel(item)}</Text>
    <Text style={{ color: c.muted, fontSize: 12 }}>{item.start ? item.dateOnly ? `${new Date(item.start).toLocaleDateString('pt-BR')} · horário não informado` : new Date(item.start).toLocaleString('pt-BR') : 'Data / horário não informados'} · {discoveryStatus(item)}</Text>
    <Text style={{ color: c.muted, fontSize: 11 }}>{item.fictionalPosition ? 'Posição fictícia para demonstração. ' : ''}Imagem ilustrativa. {item.verified ? 'Verificação disponível.' : 'Sem confirmação oficial.'}</Text>
    <Pressable accessibilityRole="button" accessibilityLabel={`Ver detalhes: ${item.title}`} onPress={open} style={[s.button, { backgroundColor: c.soft }]}><Text style={{ color: c.link, fontWeight: '700' }}>Ver detalhes →</Text></Pressable>
  </View>;
}
const s = StyleSheet.create({ card: { borderRadius: 19, borderWidth: 1, padding: 12, gap: 9 }, row: { flexDirection: 'row', gap: 11 }, image: { width: 66, height: 70, borderRadius: 12 }, button: { minHeight: 44, justifyContent: 'center', alignItems: 'center', borderRadius: 12 } });
