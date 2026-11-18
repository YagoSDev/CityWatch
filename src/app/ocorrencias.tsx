import { useLocalSearchParams } from 'expo-router';
import { type Colors, useThemedStyles } from '../features/theme';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { Action, Field, Notice } from '../components/form';
import { Screen, useScreenText } from '../components/screen';
import {
  academicQuery, academicRequest, categorias, statuses,
  type AvisoImportacao, type Bairros, type Categoria, type EventoAcademico, type Indicadores,
  type OcorrenciaAcademica, type StatusAcademico,
} from '../features/academic-api';

const sections = ['Consulta', 'Cadastro', 'Fila', 'Histórico', 'Indicadores'] as const;
type Section = typeof sections[number];
type Selected = OcorrenciaAcademica;

function useConsulta<T>(path: string | null, revision: number) {
  const key = `${revision}:${path}`;
  const [state, setState] = useState<{ key: string; data?: T; error?: string }>();
  useEffect(() => {
    if (!path) return;
    const controller = new AbortController();
    void academicRequest<T>(path, { signal: controller.signal }).then(
      (data) => { if (!controller.signal.aborted) setState({ key, data }); },
      (error: Error) => { if (!controller.signal.aborted) setState({ key, error: error.message }); },
    );
    return () => controller.abort();
  }, [key, path]);
  return state?.key === key ? state : undefined;
}

function Choices<T extends string>({ values, value, onSelect }: {
  values: readonly T[]; value: T; onSelect: (value: T) => void;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.choices}>
      {values.map((option) => {
        const selected = option === value;
        return (
          <Pressable key={option} accessibilityRole="button" accessibilityState={{ selected }}
            onPress={() => onSelect(option)} style={[styles.choice, selected && styles.selected]}>
            <Text style={[styles.choiceText, selected && styles.selectedText]}>{option}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function OccurrenceCard({ item, onSelect }: { item: Selected; onSelect: (item: Selected) => void }) {
  const styles = useThemedStyles(createStyles);
  const screenText = useScreenText();
  return (
    <Pressable accessibilityRole="button" onPress={() => onSelect(item)} style={styles.card}>
      <Text style={styles.heading}>{item.id} · {item.descricao}</Text>
      <Text style={screenText}>{item.bairro} · {item.categoria}</Text>
      <Text style={styles.meta}>{item.status} · {item.data}</Text>
    </Pressable>
  );
}

function HistoryList({ history }: { history: EventoAcademico[] }) {
  const styles = useThemedStyles(createStyles);
  const screenText = useScreenText();
  return history.length ? history.map((item, position) => (
    <View key={`${item.ocorrencia_id}-${position}`} style={styles.card}>
      <Text style={styles.heading}>{item.ocorrencia_id} · {item.data}</Text>
      <Text style={screenText}>{item.status_anterior} → {item.status_novo}</Text>
      <Text style={screenText}>{item.observacao}</Text>
    </View>
  )) : <Text style={screenText}>Nenhuma alteração registrada.</Text>;
}

function Report({ data, warnings }: { data: Indicadores; warnings: AvisoImportacao[] }) {
  const styles = useThemedStyles(createStyles);
  const screenText = useScreenText();
  return (
    <>
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>{data.total} ocorrências · {data.pendencias} pendentes</Text>
        <Text style={screenText}>Tempo médio de conclusão: {data.tempo_medio_conclusao_dias === null
          ? 'sem dados' : `${data.tempo_medio_conclusao_dias.toLocaleString('pt-BR')} dias`}</Text>
        <Text style={screenText}>{data.interpretacao}</Text>
      </View>
      <Text accessibilityRole="header" style={styles.heading}>Categorias</Text>
      {Object.entries(data.por_categoria).map(([label, item]) => (
        <Text key={label} style={screenText}>{label} · {item.quantidade} ({item.percentual}%)</Text>
      ))}
      <Text accessibilityRole="header" style={styles.heading}>Status</Text>
      {Object.entries(data.por_status).map(([label, item]) => (
        <Text key={label} style={screenText}>{label} · {item.quantidade} ({item.percentual}%)</Text>
      ))}
      <Text accessibilityRole="header" style={styles.heading}>Matriz de categorias e status</Text>
      <Text style={screenText}>{data.matriz.status.join(' | ')}</Text>
      {data.matriz.categorias.map((label, index) => (
        <Text key={label} style={screenText}>{label} · {data.matriz.valores[index].join(' | ')}</Text>
      ))}
      <Text accessibilityRole="header" style={styles.heading}>Origem e fórmulas</Text>
      <Text style={screenText}>{data.origem.registros_validos} válidas · {data.origem.eventos_historicos} eventos · {data.origem.registros_rejeitados} avisos</Text>
      {data.origem.duracoes_concluidas.map((item) => (
        <Text key={item.id} style={screenText}>{item.id} · {item.abertura} → {item.conclusao} · {item.dias} dias</Text>
      ))}
      {Object.entries(data.formulas).map(([name, formula]) => (
        <Text key={name} style={screenText}>{formula}</Text>
      ))}
      {warnings.map((item) => (
        <Notice key={`${item.arquivo}-${item.linha}-${item.id}`}
          message={`${item.arquivo}${item.linha ? `, linha ${item.linha}` : ''} · ${item.id ?? 'sem ID'} · ${item.erro}`} />
      ))}
    </>
  );
}

const emptyDraft = { id: '', descricao: '', bairro: '', data: '' };
const categoryChoices = ['Todas as categorias', ...categorias] as const;
const statusChoices = ['Todos os status', ...statuses] as const;

export default function AcademicScreen() {
  const styles = useThemedStyles(createStyles);
  const screenText = useScreenText();
  const { secao } = useLocalSearchParams<{ secao?: string }>();
  const [section, setSection] = useState<Section>(() => secao === 'cadastro' ? 'Cadastro' : 'Consulta');
  const [category, setCategory] = useState<typeof categoryChoices[number]>('Todas as categorias');
  const [status, setStatus] = useState<typeof statusChoices[number]>('Todos os status');
  const [grouped, setGrouped] = useState(false);
  const [lookup, setLookup] = useState('');
  const [selected, setSelected] = useState<Selected | null>(null);
  const [nextStatus, setNextStatus] = useState<StatusAcademico>('em análise');
  const [observation, setObservation] = useState('');
  const [draftCategory, setDraftCategory] = useState<Categoria>('iluminação');
  const [draft, setDraft] = useState(emptyDraft);
  const [revision, setRevision] = useState(0);
  const [notice, setNotice] = useState<{ message: string; error?: boolean }>();
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const querying = section === 'Consulta' && !selected;
  const list = useConsulta<Selected[]>(querying && !grouped ? academicQuery('/ocorrencias', {
    categoria: category === 'Todas as categorias' ? '' : category,
    status: status === 'Todos os status' ? '' : status,
  }) : null, revision);
  const neighborhoods = useConsulta<Bairros>(querying && grouped ? '/bairros' : null, revision);
  const queue = useConsulta<Selected[]>(section === 'Fila' ? '/fila' : null, revision);
  const history = useConsulta<EventoAcademico[]>(selected ? academicQuery('/historico', { identificador: selected.id })
    : section === 'Histórico' ? '/historico' : null, revision);
  const indicators = useConsulta<Indicadores>(section === 'Indicadores' ? '/indicadores' : null, revision);
  const warnings = useConsulta<AvisoImportacao[]>(section === 'Indicadores' ? '/validacao' : null, revision);
  const activeQuery = selected || section === 'Histórico' ? history
    : section === 'Fila' ? queue : section === 'Indicadores' ? (indicators?.error ? indicators : warnings?.error ? warnings
      : indicators && warnings ? indicators : undefined)
    : querying ? (grouped ? neighborhoods : list) : null;

  function showOccurrence(item: Selected) {
    setSection('Consulta');
    setSelected(item);
    setNextStatus(item.status === 'aberta' ? 'em análise' : item.status === 'em análise' ? 'concluída' : 'aberta');
    setObservation('');
  }

  function changeSection(value: Section) {
    if (pending.current) return;
    Keyboard.dismiss();
    setSection(value);
    setSelected(null);
    setNotice(undefined);
    setRevision((current) => current + 1);
  }

  async function act<T>(path: string, options: RequestInit | undefined, accept: (data: T) => void, success?: string) {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    setNotice(undefined);
    Keyboard.dismiss();
    try {
      accept(await academicRequest<T>(path, options));
      if (success) setNotice({ message: success });
      setRevision((current) => current + 1);
    } catch (error) {
      setNotice({ message: error instanceof Error ? error.message : 'Não foi possível concluir a operação.', error: true });
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }

  return (
    <Screen title="Ocorrências acadêmicas" nativeHeader>
      <Text style={screenText}>Demonstração acadêmica e administrativa · Global Solution</Text>
      <Choices values={sections} value={section} onSelect={changeSection} />
      {notice && <Notice {...notice} />}

      {querying && (
        <>
          <Field label="Identificador" placeholder="OC-001" value={lookup} onChangeText={setLookup}
            autoCapitalize="characters" autoCorrect={false}
            onSubmitEditing={() => act<Selected>(`/ocorrencias/${encodeURIComponent(lookup.trim())}`, undefined, showOccurrence)} />
          <Action title="Buscar por ID" disabled={busy || !lookup.trim()}
            onPress={() => act<Selected>(`/ocorrencias/${encodeURIComponent(lookup.trim())}`, undefined, showOccurrence)} />
          <Action title={grouped ? 'Voltar aos filtros' : 'Agrupar por bairro'} secondary
            onPress={() => setGrouped((previous) => !previous)} />
          {!grouped && (
            <>
              <Choices values={categoryChoices} value={category} onSelect={setCategory} />
              <Choices values={statusChoices} value={status} onSelect={setStatus} />
              {list?.data?.length === 0 && <Text style={screenText}>Nenhuma ocorrência encontrada.</Text>}
              {list?.data?.map((item) => <OccurrenceCard key={item.id} item={item} onSelect={showOccurrence} />)}
            </>
          )}
          {grouped && Object.entries(neighborhoods?.data ?? {}).map(([bairro, groups]) => (
            <View key={bairro} style={styles.group}>
              <Text accessibilityRole="header" style={styles.heading}>{bairro}</Text>
              {Object.entries(groups).map(([label, items]) => (
                <View key={label} style={styles.group}>
                  <Text style={styles.meta}>{label}</Text>
                  {items.map((item) => <OccurrenceCard key={item.id} item={item} onSelect={showOccurrence} />)}
                </View>
              ))}
            </View>
          ))}
        </>
      )}

      {selected && (
        <>
          <Action title="Voltar à consulta" onPress={() => changeSection('Consulta')} secondary disabled={busy} />
          <View style={styles.card}>
            <Text accessibilityRole="header" style={styles.heading}>{selected.id} · {selected.descricao}</Text>
            <Text style={screenText}>{selected.bairro} · {selected.categoria}</Text>
            <Text style={styles.meta}>{selected.status} · {selected.data}</Text>
          </View>
          <Text accessibilityRole="header" style={styles.heading}>Atualizar status</Text>
          <Choices values={statuses} value={nextStatus} onSelect={setNextStatus} />
          <Field label="Observação (opcional)" value={observation} onChangeText={setObservation} editable={!busy} />
          <Action title="Salvar status" disabled={busy || nextStatus === selected.status}
            onPress={() => act<Selected>(`/ocorrencias/${encodeURIComponent(selected.id)}/status`, {
              method: 'PATCH', body: JSON.stringify({ status: nextStatus, observacao: observation }),
            }, showOccurrence, 'Status atualizado.')} />
          <Text accessibilityRole="header" style={styles.heading}>Histórico desta ocorrência</Text>
          {history?.data && <HistoryList history={history.data} />}
        </>
      )}

      {section === 'Cadastro' && (
        <>
          <Field label="Identificador" placeholder="OC-020" value={draft.id} editable={!busy}
            autoCapitalize="characters" autoCorrect={false} onChangeText={(id) => setDraft({ ...draft, id })} />
          <Text accessibilityRole="header" style={styles.heading}>Categoria</Text>
          <Choices values={categorias} value={draftCategory} onSelect={setDraftCategory} />
          <Field label="Descrição" value={draft.descricao} multiline editable={!busy}
            onChangeText={(descricao) => setDraft({ ...draft, descricao })} />
          <Field label="Bairro" value={draft.bairro} editable={!busy} onChangeText={(bairro) => setDraft({ ...draft, bairro })} />
          <Field label="Data (opcional)" placeholder="AAAA-MM-DD" value={draft.data} editable={!busy}
            onChangeText={(data) => setDraft({ ...draft, data })} />
          <Action title="Cadastrar ocorrência" disabled={busy}
            onPress={() => act<Selected>('/ocorrencias', {
              method: 'POST', body: JSON.stringify({ ...draft, categoria: draftCategory, data: draft.data.trim() || null }),
            }, (item) => { setDraft(emptyDraft); showOccurrence(item); }, 'Ocorrência cadastrada.')} />
        </>
      )}

      {section === 'Fila' && queue?.data && (
        <>
          <Action title="Examinar próxima ocorrência" disabled={busy || queue.data.length === 0}
            onPress={() => act<Selected>('/fila/examinar', { method: 'POST' }, showOccurrence, 'Ocorrência encaminhada para análise.')} />
          {queue.data.length === 0 && <Text style={screenText}>A fila está vazia.</Text>}
          {queue.data.map((item) => <OccurrenceCard key={item.id} item={item} onSelect={showOccurrence} />)}
        </>
      )}

      {section === 'Histórico' && history?.data && <HistoryList history={history.data} />}
      {section === 'Indicadores' && indicators?.data && warnings?.data &&
        <Report data={indicators.data} warnings={warnings.data} />}
      {activeQuery === undefined && <Text style={screenText}>Consultando a API Python…</Text>}
      {activeQuery?.error && (
        <>
          <Notice message={activeQuery.error} error />
          <Action title="Tentar novamente" secondary onPress={() => setRevision((current) => current + 1)} />
        </>
      )}
    </Screen>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  choice: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 12, backgroundColor: colors.soft },
  selected: { backgroundColor: colors.action },
  choiceText: { color: colors.link, fontWeight: '700' },
  selectedText: { color: colors.onAction },
  group: { gap: 10 },
  card: { borderRadius: 16, backgroundColor: colors.surface, padding: 14, gap: 6 },
  heading: { color: colors.text, fontSize: 17, fontWeight: '800' },
  meta: { color: colors.link, fontWeight: '600' },
});
