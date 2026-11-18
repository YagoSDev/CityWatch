import { type Colors, useThemedStyles } from '../../features/theme';
import { randomUUID } from 'expo-crypto';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { Action, Field, Notice } from '../../components/form';
import { Screen, useScreenText } from '../../components/screen';
import { useAuthSession } from '../../features/auth-session';
import { type Report, type ReportCategory, type ReportDraft, reportCategories, reportLimits } from '../../features/reports';
import { supabase } from '../../features/supabase';

const formFields = [
  { name: 'title', label: 'Título', placeholder: 'Ex.: Poste apagado na praça' },
  { name: 'public_place', label: 'Local público', placeholder: 'Ex.: Praça da Sé, entrada principal' },
  { name: 'description', label: 'Descrição', placeholder: 'Descreva o que aconteceu' },
] as const;

const blankReport: ReportDraft = { title: '', public_place: '', description: '', category: 'iluminacao' };
const categories = Object.keys(reportCategories) as ReportCategory[];
const reportColumns = 'id,category,title,public_place,description,created_at';

export default function ReportScreen() {
  const styles = useThemedStyles(createStyles);
  const screenText = useScreenText();
  const router = useRouter();
  const { session, loading } = useAuthSession();

  return (
    <Screen title="Relatar">
      <Action title="Relatar ocorrência" onPress={() => router.push('/nova-ocorrencia')} />
      <Text accessibilityRole="header" style={styles.heading}>Relatos da sua conta</Text>
      {!supabase ? (
        <Notice message="O registro de ocorrências ainda está indisponível." />
      ) : loading ? (
        <Text style={screenText}>Carregando sua conta…</Text>
      ) : session ? (
        <ReportForm key={session.user.id} userId={session.user.id} />
      ) : (
        <>
          <Text style={screenText}>Entre na sua conta para registrar e acompanhar ocorrências.</Text>
          <Action title="Entrar na conta" onPress={() => router.navigate('/conta')} />
        </>
      )}
      <Text accessibilityRole="header" style={styles.heading}>Base acadêmica</Text>
      <Action title="Cadastrar ocorrência acadêmica" onPress={() =>
        router.push({ pathname: '/ocorrencias', params: { secao: 'cadastro' } })} />
      <Action title="Abrir ocorrências acadêmicas" secondary onPress={() => router.push('/ocorrencias')} />
    </Screen>
  );
}

function ReportForm({ userId }: { userId: string }) {
  const styles = useThemedStyles(createStyles);
  const screenText = useScreenText();
  const [draft, setDraft] = useState(blankReport);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<{ message: string; error?: boolean } | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [listState, setListState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [refresh, setRefresh] = useState(0);
  const pendingId = useRef<string | null>(null);
  const savingRef = useRef(false);

  useEffect(() => {
    if (!supabase) return;
    const controller = new AbortController();

    void supabase.from('reports').select(reportColumns)
      .eq('user_id', userId).order('created_at', { ascending: false }).order('id', { ascending: false }).limit(20)
      .abortSignal(controller.signal)
      .then(({ data, error }) => {
        if (controller.signal.aborted) return;
        if (error) {
          setListState('error');
          return;
        }
        setReports(data);
        setListState('ready');
      });

    return () => controller.abort();
  }, [refresh, userId]);

  function updateDraft<K extends keyof ReportDraft>(field: K, value: ReportDraft[K]) {
    pendingId.current = null;
    setStatus(null);
    setDraft((previous) => ({ ...previous, [field]: value }));
  }

  async function submit() {
    if (!supabase || savingRef.current) return;
    const report = {
      category: draft.category,
      title: draft.title.trim(),
      public_place: draft.public_place.trim(),
      description: draft.description.trim(),
    };

    for (const { name, label } of formFields) {
      const { min, max } = reportLimits[name];
      const length = Array.from(report[name]).length;
      if (length < min || length > max) {
        setStatus({ message: `${label} deve ter de ${min} a ${max} caracteres.`, error: true });
        return;
      }
    }

    Keyboard.dismiss();
    savingRef.current = true;
    setSaving(true);
    setStatus(null);
    try {
      const id = pendingId.current ?? randomUUID();
      pendingId.current = id;

      // Reuse the draft ID if the connection fails before the app receives confirmation.
      const { error: writeError } = await supabase.from('reports')
        .upsert({ id, ...report }, { onConflict: 'id', ignoreDuplicates: true });
      if (writeError) throw writeError;

      const { data, error: readError } = await supabase.from('reports')
        .select('id').eq('id', id).eq('user_id', userId).maybeSingle();
      if (readError || !data) throw readError ?? new Error('Ocorrência indisponível');

      pendingId.current = null;
      setDraft(blankReport);
      setStatus({ message: 'Ocorrência registrada na sua conta.' });
      reloadReports();
    } catch {
      setStatus({ message: 'Não foi possível confirmar o registro. Tente novamente.', error: true });
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  function reloadReports() {
    setListState('loading');
    setRefresh((previous) => previous + 1);
  }

  return (
    <>
      <Text style={screenText}>Informe onde ocorreu o problema. A ocorrência ficará visível na sua conta.</Text>
      <View style={styles.categorySection}>
        <Text style={styles.categoryLabel}>Categoria</Text>
        <View style={styles.categories}>
          {categories.map((category) => {
            const selected = category === draft.category;
            return (
              <Pressable key={category} accessibilityRole="button" accessibilityState={{ selected, disabled: saving }}
                disabled={saving} onPress={() => updateDraft('category', category)}
                style={[styles.category, selected && styles.selectedCategory]}>
                <Text style={[styles.categoryText, selected && styles.selectedText]}>{reportCategories[category]}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      {formFields.map(({ name, label, placeholder }) => (
        <Field key={name} label={label} placeholder={placeholder} value={draft[name]}
          onChangeText={(value) => updateDraft(name, value)} multiline={name === 'description'}
          maxLength={reportLimits[name].max} editable={!saving} />
      ))}
      <Action title={saving ? 'Registrando…' : 'Registrar ocorrência'} onPress={submit} disabled={saving} />
      {status && <Notice {...status} />}
      <Text accessibilityRole="header" style={styles.heading}>Minhas ocorrências</Text>
      {listState === 'loading' && <Text style={screenText}>Carregando ocorrências…</Text>}
      {listState === 'error' && (
        <>
          <Notice message="Não foi possível carregar suas ocorrências." error />
          <Action title="Tentar novamente" onPress={reloadReports} secondary />
        </>
      )}
      {listState === 'ready' && reports.length === 0 && <Text style={screenText}>Você ainda não registrou ocorrências.</Text>}
      {reports.map(({ id, category, title, public_place, description, created_at }) => (
        <View key={id} style={styles.card}>
          <Text style={styles.cardMeta}>{reportCategories[category]} · {new Date(created_at).toLocaleDateString('pt-BR')}</Text>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={screenText}>{public_place}</Text>
          <Text style={screenText}>{description}</Text>
        </View>
      ))}
    </>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  categorySection: { gap: 8 },
  categoryLabel: { color: colors.text, fontSize: 15, fontWeight: '700' },
  categories: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  category: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center', borderRadius: 12, backgroundColor: colors.soft },
  selectedCategory: { backgroundColor: colors.action },
  categoryText: { color: colors.link, fontWeight: '700' },
  selectedText: { color: colors.onAction },
  heading: { color: colors.text, fontSize: 21, fontWeight: '800', marginTop: 8 },
  card: { borderRadius: 16, padding: 14, gap: 5, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  cardTitle: { color: colors.text, fontSize: 17, fontWeight: '700' },
  cardMeta: { color: colors.link, fontSize: 13, fontWeight: '700' },
});
