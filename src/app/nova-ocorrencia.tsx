import { randomUUID } from 'expo-crypto';
import { File } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { type ComponentRef, useRef, useState } from 'react';
import { ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, ScrollView, type ScrollViewInstance, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PitCard } from '../components/pit-card';
import { Action, Field, Notice } from '../components/form';
import { EvidenceVideo } from '../components/evidence-video';
import { academicRequest, type OcorrenciaAcademica } from '../features/academic-api';
import { captureLocation, insertTranscript, occurrenceTypes, pickEvidence, resolveOccurrenceAddress, tagGroups, tagLabels, toggleTag, validateCitizenDraft, validateEvidence } from '../features/occurrence-draft';
import { useOccurrenceVoice } from '../features/occurrence-voice';
import { type Colors, useColors, useThemedStyles } from '../features/theme';

type Reading = { latitude: number; longitude: number; precisao: number | null; capturada_em: string };
type Evidence = { uri: string; mime: string; size: number };

export default function NewOccurrence() {
  const styles = useThemedStyles(createStyles);
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [local, setLocal] = useState('');
  const [automaticBairro, setAutomaticBairro] = useState('');
  const [reference, setReference] = useState('');
  const [voiceMessage, setVoiceMessage] = useState('');
  const descriptionInput = useRef<ComponentRef<typeof TextInput>>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const [evidence, setEvidence] = useState<Evidence | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState<'publish' | 'media' | 'location' | null>(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [success, setSuccess] = useState<OcorrenciaAcademica>();
  const lock = useRef(false);
  const pending = useRef<{ fingerprint: string; key: string } | null>(null);
  const voice = useOccurrenceVoice(text => { setDescription(previous => insertTranscript(previous, text)); setVoiceMessage('Texto transcrito. Revise antes de publicar.'); }, message => { setVoiceMessage(message); descriptionInput.current?.focus(); });
  const disabled = busy !== null;
  const scroll = useRef<ScrollViewInstance>(null);

  async function chooseEvidence(camera: boolean) {
    if (lock.current) return;
    lock.current = true; setBusy('media'); setError('');
    try {
      const result = await pickEvidence<ImagePicker.ImagePickerResult>(ImagePicker, camera);
      if (result.canceled) return;
      const asset = result.assets[0];
      const file = new File(asset.uri);
      const mime = asset.mimeType || file.type;
      const size = file.size;
      validateEvidence(mime, size);
      setEvidence({ uri: asset.uri, mime, size });
    } catch (caught) { setError((caught as Error).message || 'Não foi possível abrir a câmera ou galeria. Continue sem evidência.'); }
    finally { lock.current = false; setBusy(null); }
  }

  async function locate() {
    if (lock.current) return;
    lock.current = true; setBusy('location'); setError(''); setInfo('');
    try {
      const captured = await captureLocation({
        requestForegroundPermissionsAsync: Location.requestForegroundPermissionsAsync,
        hasServicesEnabledAsync: Location.hasServicesEnabledAsync,
        read: () => Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      });
      setReading(captured);
      const address = await resolveOccurrenceAddress(captured, Location.reverseGeocodeAsync);
      setLocal(address.localidade); setAutomaticBairro(address.bairro);
      setInfo(address.localidade === 'Localização por GPS' ? 'Coordenadas capturadas. O endereço não pôde ser identificado, mas você já pode publicar com o GPS.' : 'Local preenchido automaticamente. Confira se o problema está neste local.');
    } catch (caught) { setError((caught as Error).message); }
    finally { lock.current = false; setBusy(null); }
  }

  async function publish() {
    if (lock.current || success) return;
    setError(''); setInfo('');
    try { validateCitizenDraft(type, description, local, reading); }
    catch (caught) { setError((caught as Error).message); scroll.current?.scrollToEnd({ animated: true }); return; }
    lock.current = true; setBusy('publish'); voice.stop(); Keyboard.dismiss();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 45000);
    try {
      const attachment = evidence ? { mime: evidence.mime, base64: await new File(evidence.uri).base64() } : null;
      if (evidence) validateEvidence(evidence.mime, new File(evidence.uri).size);
      const draft = { tipo: type, descricao: description.trim(), localidade: local.trim(), bairro: automaticBairro, referencia: reference.trim(),
        etiquetas: tags, localizacao: reading, anexo: attachment };
      // Retry idêntico reutiliza a chave; uma edição cria uma nova intenção de publicação.
      const fingerprint = JSON.stringify(draft);
      if (pending.current?.fingerprint !== fingerprint) pending.current = { fingerprint, key: randomUUID() };
      const confirmed = await academicRequest<OcorrenciaAcademica>('/relatos', {
        method: 'POST', signal: controller.signal, body: JSON.stringify({ ...draft, chave: pending.current.key }),
      });
      pending.current = null;
      setSuccess(confirmed); setEvidence(null); setReading(null);
      scroll.current?.scrollTo({ y: 0, animated: true });
    } catch (caught) { setError((caught as Error).message); scroll.current?.scrollToEnd({ animated: true }); }
    finally { clearTimeout(timer); lock.current = false; setBusy(null); }
  }


  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={insets.top + 55} style={styles.fill}>
      <ScrollView ref={scroll} keyboardShouldPersistTaps="handled" contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}>
        {success ? <>
          <View style={styles.successIcon}><SymbolView name="checkmark.seal.fill" size={44} tintColor={colors.security} /></View>
          <Text accessibilityRole="header" style={styles.title}>Ocorrência registrada</Text>
          <Notice message={`Confirmado pelo backend Python.\n${success.id} · ${success.status}`} />
          <Text style={styles.body}>{success.publicado_em ? new Date(success.publicado_em).toLocaleString('pt-BR') : ''}</Text>
          <Text style={styles.body}>Seu relato está salvo neste servidor CityWatch. Ainda não há confirmação de encaminhamento à prefeitura.</Text>
          <Action title="Acompanhar ocorrência" onPress={() => router.replace({ pathname: '/detalhe-ocorrencia', params: { id: success.id } })} />
          <Action title="Voltar ao início" secondary onPress={() => router.navigate('/')} />
        </> : <>
          <View style={styles.intro}>
            <Text accessibilityRole="header" style={styles.title}>Relatar ocorrência</Text>
            <Text style={styles.subtitle}>Ajude a cuidar da sua cidade. Conte o que você encontrou.</Text>
          </View>
          <PitCard title="Estou com você neste relato" message="Conte o que aconteceu e confira o local. Uma foto é opcional: sua segurança vem primeiro." state="alert" />
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.heading}>1. Tipo de ocorrência <Text style={styles.required}>*</Text></Text>
            <View style={styles.types}>
              {occurrenceTypes.map(item => <Pressable key={item.id} accessibilityRole="button"
                accessibilityLabel={item.label} accessibilityState={{ selected: type === item.id, disabled }} disabled={disabled}
                onPress={() => setType(item.id)} style={[styles.type, type === item.id && styles.typeSelected]}>
                <View style={[styles.typeIcon, type === item.id && styles.typeIconSelected]}>
                  <SymbolView name={item.icon} size={23} tintColor={type === item.id ? '#FFFFFF' : colors.link} />
                </View>
                <Text style={styles.typeLabel}>{item.label}</Text>
              </Pressable>)}
            </View>
          </View>
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.heading}>2. O que aconteceu? <Text style={styles.required}>*</Text></Text>
            <Field inputRef={descriptionInput} label="Descrição" placeholder="Descreva o problema e como ele afeta o local…" value={description}
              onChangeText={value => setDescription(Array.from(value).slice(0, 300).join(''))} multiline editable={!disabled && !voice.listening} />
            <View style={styles.between}>
              <Pressable accessibilityRole="button" accessibilityLabel={voice.listening ? 'Parar transcrição' : voice.supported ? 'Ditar descrição' : 'Usar ditado do teclado'}
                disabled={disabled} onPress={() => {
                  setVoiceMessage('');
                  if (voice.supported) void voice.toggle();
                  else { setVoiceMessage('Toque no microfone do teclado do iPhone e fale em português. O texto aparecerá na descrição para você revisar. Se o microfone não aparecer, ative o Ditado em Ajustes → Geral → Teclado.'); descriptionInput.current?.focus(); }
                }} style={styles.mic}>
                <SymbolView name={voice.listening ? 'stop.circle.fill' : 'mic.fill'} size={19} tintColor={colors.link} />
                <Text style={styles.toolLabel}>{voice.listening ? 'Parar ditado' : voice.supported ? 'Ditar em português' : 'Usar ditado do teclado'}</Text>
              </Pressable>
              <Text style={styles.caption}>{Array.from(description).length}/300</Text>
            </View>
            {!!voiceMessage && <Notice message={voiceMessage} />}
            <Text style={styles.caption}>Revise o texto antes de publicar. Áudio não é enviado ao CityWatch.</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.between}><Text accessibilityRole="header" style={styles.heading}>3. Evidências</Text><Text style={styles.caption}>Opcional</Text></View>
            <Text style={styles.body}>Anexe apenas se for seguro. Evite rostos, dados pessoais e imagens fortes.</Text>
            <View style={styles.tools}>
              <ToolButton label="Tirar foto" icon="camera" disabled={disabled} onPress={() => void chooseEvidence(true)} />
              <ToolButton label="Foto ou vídeo" icon="photo.on.rectangle" disabled={disabled} onPress={() => void chooseEvidence(false)} />
            </View>
            <Text style={styles.caption}>1 arquivo • JPEG, PNG, HEIC, MP4 ou MOV • até 8 MB</Text>
            {evidence && <View style={styles.preview}>
              {evidence.mime.startsWith('video/') ? <EvidenceVideo uri={evidence.uri} /> :
                <Image accessible accessibilityLabel="Prévia da evidência selecionada" source={{ uri: evidence.uri }} style={styles.image} resizeMode="contain" />}
              <Text style={styles.caption}>{evidence.mime} · {(evidence.size / 1024 / 1024).toFixed(1)} MB</Text>
              <Text style={styles.caption}>Para substituir, selecione outro arquivo.</Text>
              <Action title="Remover evidência" secondary disabled={disabled} onPress={() => setEvidence(null)} />
            </View>}
          </View>
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.heading}>4. Onde aconteceu? <Text style={styles.required}>*</Text></Text>
            <ToolButton label={busy === 'location' ? 'Obtendo localização…' : 'Usar localização atual'} icon="location.fill" disabled={disabled} onPress={() => void locate()} />
            {reading && <>
              <Text style={styles.caption}>Leitura privada: {reading.latitude.toFixed(5)}, {reading.longitude.toFixed(5)}{reading.precisao !== null ? ` · precisão ±${Math.round(reading.precisao)} m` : ' · precisão não informada'}{ '\n'}{new Date(reading.capturada_em).toLocaleString('pt-BR')}</Text>
              <Action title="Informar outro local manualmente" secondary disabled={disabled} onPress={() => { setReading(null); setLocal(''); setAutomaticBairro(''); }} />
            </>}
            {!!reading && <View style={styles.locationSummary}>
              <Text style={styles.label}>Local identificado automaticamente</Text>
              <Text style={styles.body}>{local || 'Localização por GPS'}</Text>
              <Text style={styles.caption}>Usamos a precisão permitida por você no iPhone. O complemento abaixo não altera suas coordenadas.</Text>
            </View>}
            {!reading && <Field label="Local da ocorrência" placeholder="Endereço ou nome de um local público"
              value={local === 'Localização por GPS' ? '' : local} onChangeText={value => { setLocal(value); setReading(null); setAutomaticBairro(''); }} maxLength={200} editable={!disabled} />}
            <Field label="Como encontrar o problema? (opcional)" placeholder="Ex.: junto ao portão azul, ao lado da faixa de pedestres"
              value={reference} onChangeText={setReference} maxLength={200} multiline editable={!disabled} />
              {info ? <Notice message={info} /> : null}
            <Text style={styles.caption}>Com o GPS, você pode publicar sem digitar um endereço. Sem GPS, informe o local manualmente. Não inclua endereço residencial. Coordenadas precisas ficam privadas.</Text>
          </View>
          <View style={styles.card}>
            <Pressable accessibilityRole="button" accessibilityState={{ expanded }} disabled={disabled} onPress={() => setExpanded(value => !value)} style={styles.between}>
              <Text accessibilityRole="header" style={styles.heading}>5. Etiquetas</Text><Text style={styles.toolLabel}>{tags.length}/5 {expanded ? '−' : '+'}</Text>
            </Pressable>
            <Text style={styles.caption}>Ajude a organizar seu relato. Selecione até cinco.</Text>
            <View style={styles.chips}>{tags.map(id => <Pressable key={id} accessibilityRole="button" accessibilityLabel={`Remover etiqueta ${tagLabels[id]}`} disabled={disabled}
              onPress={() => setTags(previous => previous.filter(tag => tag !== id))} style={styles.chipSelected}><Text style={styles.chipText}>{tagLabels[id]} ×</Text></Pressable>)}</View>
            {expanded && tagGroups.map(group => <View key={group.label} style={styles.tagGroup}>
              <Text style={styles.label}>{group.label}</Text>
              <View style={styles.chips}>{group.tags.map(([id, label]) => <Pressable key={id} accessibilityRole="checkbox"
                accessibilityState={{ checked: tags.includes(id), disabled }} accessibilityLabel={label} disabled={disabled}
                onPress={() => { try { setTags(toggleTag(tags, id)); } catch (caught) { setError((caught as Error).message); } }}
                style={[styles.chip, tags.includes(id) && styles.chipSelected]}><Text style={styles.chipText}>{label}</Text></Pressable>)}</View>
            </View>)}
          </View>
          <Text style={styles.caption}>Data e hora são registradas automaticamente ao publicar. * Campos obrigatórios.</Text>
          {error ? <Notice error message={error} /> : null}
          {busy && <ActivityIndicator accessibilityLabel="Processando" color={colors.link} />}
          <Pressable accessibilityRole="button" accessibilityLabel="Publicar ocorrência" accessibilityState={{ disabled: disabled || voice.listening }}
            disabled={disabled || voice.listening} onPress={() => void publish()} style={({ pressed }) => [styles.publish, (disabled || voice.listening || pressed) && styles.dim]}>
            <SymbolView name="paperplane.fill" size={20} tintColor="#FFFFFF" />
            <Text style={styles.publishLabel}>{busy === 'publish' ? 'Publicando…' : 'Publicar ocorrência'}</Text>
          </Pressable>
          <Text style={styles.caption}>Registro no servidor Python do projeto. Não há encaminhamento automático à prefeitura.</Text>
        </>}
        <View style={styles.footer}>
          <Action title="Demonstração acadêmica e administrativa" secondary onPress={() => router.push('/ocorrencias')} disabled={disabled} />
          <Text style={styles.caption}>Consulta, fila FIFO, histórico LIFO e indicadores.</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function ToolButton({ label, icon, onPress, disabled }: { label: string; icon: SymbolViewProps['name']; onPress: () => void; disabled: boolean }) {
  const styles = useThemedStyles(createStyles);
  const colors = useColors();
  return <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{ disabled }}
    disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.tool, (disabled || pressed) && styles.dim]}>
    <SymbolView name={icon} tintColor={colors.link} size={21} />
    <Text style={styles.toolLabel}>{label}</Text>
  </Pressable>;
}

const createStyles = (colors: Colors) => StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.background }, content: { padding: 20, gap: 18, maxWidth: 680, width: '100%', alignSelf: 'center' },
  intro: { gap: 9, paddingVertical: 10 }, title: { color: colors.text, fontSize: 29, fontWeight: '800', letterSpacing: -0.8 },
  subtitle: { color: colors.muted, fontSize: 16, lineHeight: 23 }, card: { backgroundColor: colors.surface, padding: 17, borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, borderColor: colors.border, gap: 13 },
  heading: { color: colors.text, fontSize: 18, fontWeight: '800', flexShrink: 1 }, required: { color: colors.link },
  types: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, type: { width: '47%', flexGrow: 1, minHeight: 95, borderWidth: 1, borderColor: colors.border, borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 10, gap: 7 },
  typeSelected: { backgroundColor: colors.soft, borderColor: colors.link }, typeIcon: { width: 40, height: 40, backgroundColor: colors.soft, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }, typeIconSelected: { backgroundColor: '#E9004B' }, typeLabel: { color: colors.text, fontSize: 13, fontWeight: '700', textAlign: 'center' },
  locationSummary: { backgroundColor: colors.soft, borderRadius: 13, padding: 13, gap: 6 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }, body: { color: colors.muted, fontSize: 14, lineHeight: 21 }, caption: { color: colors.muted, fontSize: 12, lineHeight: 18 },
  tools: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 }, tool: { backgroundColor: colors.soft, borderRadius: 13, minHeight: 54, padding: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, flexGrow: 1 }, toolLabel: { color: colors.link, fontSize: 13, fontWeight: '700', flexShrink: 1 },
  mic: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 7 }, preview: { gap: 9 }, image: { width: '100%', height: 200, backgroundColor: colors.background, borderRadius: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { borderWidth: 1, borderColor: colors.border, borderRadius: 20, minHeight: 40, paddingHorizontal: 12, paddingVertical: 10 }, chipSelected: { backgroundColor: colors.soft, borderWidth: 1, borderColor: colors.link, borderRadius: 20, minHeight: 40, paddingHorizontal: 12, paddingVertical: 10 }, chipText: { color: colors.link, fontSize: 12, fontWeight: '600' }, label: { color: colors.text, fontWeight: '700' }, tagGroup: { gap: 9, marginTop: 5 },
  publish: { backgroundColor: '#E9004B', borderRadius: 16, minHeight: 57, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 14 }, publishLabel: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' }, dim: { opacity: 0.55 }, footer: { borderTopWidth: StyleSheet.hairlineWidth, borderColor: colors.border, paddingTop: 20, marginTop: 8, gap: 9 }, successIcon: { alignItems: 'center', paddingTop: 24 },
});
