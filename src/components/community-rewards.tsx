import { type Colors, useThemedStyles } from '../features/theme';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuthSession } from '../features/auth-session';
import { supabase } from '../features/supabase';
import { Action, Notice } from './form';
import { useScreenText } from './screen';

const pointsPerReport = 10;

export function CommunityRewards() {
  const screenText = useScreenText();
  const { session, loading } = useAuthSession();
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);

  return (
    <>
      <Text style={screenText}>Cada ocorrência registrada vale {pointsPerReport} pontos.</Text>
      {!supabase ? (
        <Notice message="A consulta de pontos ainda está indisponível." />
      ) : loading ? (
        <Text style={screenText}>Carregando sua conta…</Text>
      ) : session ? (
        <PointsBalance key={`${session.user.id}:${attempt}`} userId={session.user.id}
          onRetry={() => setAttempt((current) => current + 1)} />
      ) : (
        <Action title="Entrar para ver meus pontos" onPress={() => router.navigate('/conta')} />
      )}
    </>
  );
}

function PointsBalance({ userId, onRetry }: { userId: string; onRetry: () => void }) {
  const styles = useThemedStyles(createStyles);
  const screenText = useScreenText();
  const [count, setCount] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useFocusEffect(useCallback(() => {
    if (!supabase) return;
    const controller = new AbortController();

    void supabase.from('reports').select('id', { count: 'exact', head: true })
      .eq('user_id', userId).abortSignal(controller.signal)
      .then(({ count: total, error }) => {
        if (controller.signal.aborted) return;
        setFailed(Boolean(error) || total === null);
        setCount(error ? null : total);
      });

    return () => controller.abort();
  }, [userId]));

  if (failed) {
    return (
      <>
        <Notice message="Não foi possível consultar seus pontos." error />
        <Action title="Tentar novamente" secondary onPress={onRetry} />
      </>
    );
  }

  if (count === null) return <Text style={screenText}>Consultando seus pontos…</Text>;

  return (
    <View style={styles.card}>
      <Text accessibilityRole="header" style={styles.label}>Meus pontos</Text>
      <Text style={styles.balance}>{(count * pointsPerReport).toLocaleString('pt-BR')} pontos</Text>
      <Text style={screenText}>{count === 1 ? '1 ocorrência registrada' : `${count} ocorrências registradas`}</Text>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  card: { backgroundColor: colors.soft, borderRadius: 18, padding: 18, gap: 6 },
  label: { color: colors.link, fontSize: 15, fontWeight: '700' },
  balance: { color: colors.link, fontSize: 31, fontWeight: '800' },
});
