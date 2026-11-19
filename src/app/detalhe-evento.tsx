import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useRef, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { EventFavorite } from '../components/event-card';
import { Action, Notice } from '../components/form';
import { useEvents } from '../features/events';
import { addEventToCalendar, openEventLink, openEventMap, shareEvent } from '../features/event-actions';
import { eventImages, isGeneratedEventImage } from '../features/event-images';
import { calendarPayload, categoryLabel, eventDate, eventHours, eventMapUrl, eventStatus, safeEventUrl } from '../features/events-model';
import { type Colors, useColors, useThemedStyles } from '../features/theme';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { events, agendaIds, toggleAgenda, writing, loading, error, storageError, reload } = useEvents();
  const event = events.find(item => item.id === id);
  const router = useRouter();
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState('');
  const [actionError, setActionError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const lock = useRef(false);
  const back = () => router.canGoBack() ? router.back() : router.replace('/comunidade');
  async function act(work: () => Promise<unknown>) {
    if (lock.current) return;
    lock.current = true; setBusy(true); setMessage(''); setActionError(false);
    try { const result = await work(); if (typeof result === 'string') setMessage(result); }
    catch (caught) { setActionError(true); setMessage((caught as Error).message || 'Não foi possível abrir este recurso. Tente novamente.'); }
    finally { lock.current = false; setBusy(false); }
  }
  if (loading || !event) return <View style={[styles.fill, styles.fallback, { paddingTop: insets.top + 20 }]}>
    <Action title="Voltar à Comunidade" onPress={back} secondary />
    {loading ? <ActivityIndicator color={colors.link} /> : <Notice error message={error || 'Evento não encontrado. Ele pode ter sido removido da programação.'} />}
    {!!error && <Action title="Tentar novamente" onPress={reload} />}
  </View>;
  const status = eventStatus(event);
  let calendarReason = '';
  try { calendarPayload(event); } catch (caught) { calendarReason = (caught as Error).message; }
  const links = (event.links || []).filter(link => safeEventUrl(link.url));
  const registration = links.find(link => link.tipo === 'inscricao');
  const mapAvailable = !!eventMapUrl(event);
  return <View style={styles.fill}>
    <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 25 }}>
      <View style={[styles.hero, { minHeight: Math.max(340, insets.top + 290) }]}>
        <Image source={eventImages[event.imagem]} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" />
        <LinearGradient colors={['#11121833', '#11121800', colors.background]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
        <View style={[styles.tools, { top: insets.top + 8 }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Voltar" onPress={back} style={styles.photoButton}><SymbolView name="arrow.left" size={24} tintColor="#FFFFFF" /></Pressable>
          <View style={styles.toolsRight}><EventFavorite event={event} photo />
            <Pressable accessibilityRole="button" accessibilityLabel="Compartilhar evento" disabled={busy} onPress={() => void act(() => shareEvent(event))} style={styles.photoButton}><SymbolView name="square.and.arrow.up" size={23} tintColor="#FFFFFF" /></Pressable>
          </View>
        </View>
        <View style={styles.heroCopy}>
          <View style={styles.badges}><Text style={styles.badge}>{categoryLabel(event.categoria)}</Text>{event.simulado && <Text style={styles.demo}>Evento simulado</Text>}</View>
          <Text accessibilityRole="header" style={styles.title}>{event.titulo}</Text>
          <Text style={styles.subtitle}>{event.resumo}</Text>
          <Text style={styles.photoNote}>Imagem ilustrativa{isGeneratedEventImage(event.imagem) ? ' gerada por IA' : ''}</Text>
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.infoPart}><SymbolView name="calendar" size={26} tintColor={colors.brand} /><View style={styles.infoCopy}><Text style={styles.strong}>{eventDate(event)}</Text><Text style={styles.body}>{eventHours(event)}</Text></View></View>
          <View style={styles.infoPart}><SymbolView name="mappin.circle.fill" size={27} tintColor={colors.brand} /><View style={styles.infoCopy}><Text style={styles.strong}>{event.local}</Text><Text style={styles.body}>{event.cidade} – {event.estado}</Text></View></View>
        </View>
        {event.simulado && <Text style={styles.meta}>Evento fictício. Datas e atividades simuladas; não é um anúncio oficial.</Text>}
        {status !== 'programado' && <Notice error={status === 'cancelado'} message={status === 'cancelado' ? 'Este evento foi cancelado. A inclusão na agenda e a inscrição estão desativadas.' : 'Este evento já encerrou.'} />}
        {!!storageError && <><Notice error message={storageError} /><Action title="Tentar carregar favoritos" secondary onPress={reload} /></>}
        <View style={styles.section}><View style={styles.heading}><SymbolView name="doc.text.fill" size={23} tintColor={colors.brand} /><Text accessibilityRole="header" style={styles.sectionTitle}>Sobre o evento</Text></View>
          <Text style={styles.body}>{event.descricao}</Text>
          <Text style={styles.meta}>Organização · {event.organizador || 'Não informada'}</Text>
          {event.preco !== undefined && <Text style={styles.meta}>{event.simulado ? 'Preço simulado · ' : ''}{event.preco === 0 ? 'Gratuito' : event.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>}
          {event.publicidade && <Notice message="Publicidade demonstrativa. Não há oferta, cupom ou benefício válido para resgate." />}
        </View>
        {!!event.programacao?.length && <View style={styles.section}>
          <Pressable accessibilityRole="button" accessibilityLabel="Programação do evento" accessibilityState={{ expanded: scheduleOpen }} onPress={() => setScheduleOpen(value => !value)} style={styles.scheduleButton}>
            <SymbolView name="calendar.badge.clock" size={23} tintColor={colors.brand} /><Text style={styles.strong}>Programação</Text><SymbolView name={scheduleOpen ? 'chevron.down' : 'chevron.right'} size={17} tintColor={colors.link} />
          </Pressable>
          {scheduleOpen && event.programacao?.map((item, index) => <View key={index} style={styles.scheduleRow}><Text style={styles.hour}>{item.horario}</Text><Text style={[styles.body, styles.infoCopy]}>{item.atividade}</Text></View>)}
        </View>}
        <View style={styles.section}><View style={styles.heading}><SymbolView name="mappin.and.ellipse" size={23} tintColor={colors.brand} /><Text accessibilityRole="header" style={styles.sectionTitle}>Localização</Text></View>
          <Text style={styles.body}>{event.endereco || [event.local, event.bairro, event.cidade, event.estado].filter(Boolean).join(' · ')}</Text>
          {mapAvailable ? <Action title="Ver localização" secondary disabled={busy} onPress={() => void act(() => openEventMap(event))} /> : <Text style={styles.meta}>Endereço ou coordenadas ainda não confirmados. Mapa indisponível para este registro.</Text>}
          {mapAvailable && event.simulado && <Text style={styles.meta}>O local é real; a realização deste evento nele é fictícia.</Text>}
        </View>
        {!!links.length && <View style={styles.section}>
          <View style={styles.heading}><SymbolView name="link" size={23} tintColor={colors.brand} /><Text accessibilityRole="header" style={styles.sectionTitle}>Links úteis</Text></View>
          <View style={styles.linksCard}>{links.map(link => <Pressable key={link.url} accessibilityRole="link" disabled={busy} onPress={() => void act(() => openEventLink(link.url))} style={styles.linkRow}>
            <SymbolView name={link.tipo === 'instagram' ? 'camera' : 'globe'} size={22} tintColor={colors.brand} /><Text style={[styles.strong, styles.infoCopy]}>{link.titulo}</Text><SymbolView name="arrow.up.right.square" size={19} tintColor={colors.brand} />
          </Pressable>)}</View>
        </View>}
        {!!message && <Notice message={message} error={actionError} />}
        {busy && <ActivityIndicator accessibilityLabel="Abrindo recurso" color={colors.link} />}
        {!!registration && status === 'programado' && <Action title="Quero participar" disabled={busy} onPress={() => void act(() => openEventLink(registration.url))} />}
        <Action title={agendaIds.includes(event.id) ? 'Remover da Agenda CityWatch' : 'Salvar na Agenda CityWatch'} secondary disabled={writing || busy || (!agendaIds.includes(event.id) && status !== 'programado')} onPress={() => void toggleAgenda(event.id)} />
        <Text style={styles.meta}>Favoritar é marcar interesse. Salvar na Agenda mantém o evento mesmo se você retirar o favorito. O calendário do dispositivo é uma ação separada.</Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Adicionar ao calendário do dispositivo" accessibilityState={{ disabled: busy || !!calendarReason }} disabled={busy || !!calendarReason}
          onPress={() => void act(() => addEventToCalendar(event))} style={[styles.calendar, (busy || !!calendarReason) && styles.disabled]}>
          <SymbolView name="calendar.badge.plus" size={24} tintColor="#FFFFFF" /><Text style={styles.calendarText}>Adicionar ao calendário do dispositivo</Text>
        </Pressable>
        {!!calendarReason && <Text style={styles.meta}>{calendarReason}</Text>}
        {event.simulado && !calendarReason && <Text style={styles.meta}>Se adicionar, a agenda identificará o compromisso como DEMONSTRAÇÃO. Você poderá revisar ou cancelar antes de salvar.</Text>}
      </View>
    </ScrollView>
  </View>;
}
const createStyles = (colors: Colors) => StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background }, fallback: { padding: 20, gap: 20 }, hero: { justifyContent: 'flex-end', backgroundColor: colors.surface }, tools: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 1 }, toolsRight: { flexDirection: 'row', gap: 9 }, photoButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#111218A3', alignItems: 'center', justifyContent: 'center' }, heroCopy: { padding: 20, paddingTop: 150, gap: 8 }, badges: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' }, badge: { color: '#FFFFFF', backgroundColor: '#C80047', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 13, fontSize: 12, fontWeight: '700', overflow: 'hidden' }, demo: { color: '#FFFFFF', backgroundColor: '#18151DC9', padding: 5, borderRadius: 7, fontSize: 11, overflow: 'hidden' }, title: { color: colors.text, fontSize: 32, fontWeight: '900', letterSpacing: -1 }, subtitle: { color: colors.text, fontSize: 17, lineHeight: 23 }, photoNote: { color: colors.muted, fontSize: 10 }, content: { paddingHorizontal: 18, paddingTop: 5, gap: 22, maxWidth: 680, width: '100%', alignSelf: 'center' }, infoCard: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, padding: 15, borderRadius: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 16 }, infoPart: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 140, gap: 10 }, infoCopy: { flex: 1 }, strong: { color: colors.text, fontSize: 14, fontWeight: '700' }, body: { color: colors.text, fontSize: 15, lineHeight: 22 }, meta: { color: colors.muted, fontSize: 12, lineHeight: 18 }, section: { gap: 12 }, heading: { flexDirection: 'row', alignItems: 'center', gap: 8 }, sectionTitle: { color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 }, scheduleButton: { backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, minHeight: 54, flexDirection: 'row', alignItems: 'center', padding: 15, gap: 13 }, scheduleRow: { flexDirection: 'row', gap: 15 }, hour: { color: colors.link, fontWeight: '700', fontSize: 14 }, linksCard: { backgroundColor: colors.surface, borderRadius: 19, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 15 }, linkRow: { flexDirection: 'row', alignItems: 'center', minHeight: 56, gap: 14, paddingVertical: 12 }, calendar: { backgroundColor: colors.brand, minHeight: 57, borderRadius: 24, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, padding: 14, marginTop: 8 }, calendarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' }, disabled: { opacity: 0.45 },
});
