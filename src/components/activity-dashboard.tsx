import { Pressable, StyleSheet, Text, View } from 'react-native';
import { activities, useActivity } from '../features/activity';
import { activityCounters, activityFeedback } from '../features/activity-engagement';
import { useThemedStyles, type Colors } from '../features/theme';
import { ActivityTimer } from './activity-timer';
import { CityWatchMascot } from './city-watch-mascot';

export function ActivityDashboard({ manage = true }: { manage?: boolean }) {
  const activity = useActivity();
  const styles = useThemedStyles(createStyles);
  if (!activity.session) return null;
  const selected = activities.find(item => item.id === activity.session?.activity)!;
  const feedback = activityFeedback(selected.id, activity.counters);
  const counter = activityCounters[selected.id];
  const walking = selected.id === 'correr' || selected.id === 'passear';
  const count = counter ? activity.counters[counter.key] : 0;
  const disabled = activity.countersBusy || !activity.countersReady || activity.expired;
  return <View style={styles.card} testID="pit-live-activity">
    <View style={styles.intro}>
      <CityWatchMascot state={selected.pit} size={78} />
      <View style={styles.copy}>
        <Text style={styles.name}>P.I.T. · {selected.label.toLocaleUpperCase('pt-BR')}</Text>
        <Text accessibilityRole="header" style={styles.title}>{feedback.title}</Text>
        <Text style={styles.message}>{feedback.message}</Text>
      </View>
    </View>
    <ActivityTimer session={activity.session} />
    {walking && <View style={styles.metric}>
      <Text style={styles.counterLabel}>Passos na sessão</Text>
      <Text style={styles.counterValue}>{activity.steps.count === null ? '—' : activity.steps.count.toLocaleString('pt-BR')}</Text>
      <Text style={styles.note}>{activity.steps.message}</Text>
      <Text style={styles.note}>Sensor do aparelho · sem GPS. A leitura depende do suporte e da permissão do dispositivo.</Text>
      {!activity.expired && (activity.steps.status === 'active' ? <Pressable accessibilityRole="button" style={styles.smallButton} onPress={activity.steps.disable}>
        <Text style={styles.link}>Desativar passos</Text>
      </Pressable> : <Pressable accessibilityRole="button" disabled={activity.steps.status === 'loading'} style={styles.smallButton} onPress={() => void activity.steps.enable()}>
        <Text style={styles.link}>{activity.steps.status === 'loading' ? 'Verificando sensor…' : 'Ativar contagem de passos'}</Text>
      </Pressable>)}
    </View>}
    {counter && <View style={styles.metric}>
      <View style={styles.counterRow}>
        <View style={styles.copy}><Text style={styles.counterLabel}>{counter.label}</Text>
          <Text style={styles.counterValue}>{activity.countersReady ? count.toLocaleString('pt-BR') : '—'}</Text></View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Desfazer um registro de ${counter.label.toLowerCase()}`} disabled={disabled || count === 0}
          onPress={() => void activity.count(counter.key, -1)} style={[styles.undo, (disabled || count === 0) && styles.disabled]}>
          <Text style={styles.link}>−</Text>
        </Pressable>
        <Pressable accessibilityRole="button" disabled={disabled} onPress={() => void activity.count(counter.key, 1)}
          style={[styles.add, disabled && styles.disabled]}><Text style={styles.addText}>{counter.add}</Text></Pressable>
      </View>
      <Text style={styles.note}>Registro manual · salvo neste aparelho · reinicia a cada dia local. Não gera pontos ou prêmios.</Text>
    </View>}
    {!!activity.countersError && <View><Text accessibilityRole="alert" style={styles.note}>{activity.countersError}</Text>
      <Pressable accessibilityRole="button" onPress={activity.retry} style={styles.smallButton}><Text style={styles.link}>Tentar carregar contadores</Text></Pressable></View>}
    {manage && <View style={styles.actions}>
      <Pressable accessibilityRole="button" style={styles.smallButton} onPress={activity.open}><Text style={styles.link}>Gerenciar sessão →</Text></Pressable>
      {selected.id !== 'dirigir' && <Pressable accessibilityRole="button" style={styles.smallButton} onPress={activity.change}><Text style={styles.link}>Trocar atividade</Text></Pressable>}
    </View>}
  </View>;
}
const createStyles = (c: Colors) => StyleSheet.create({
  card: { gap: 15, padding: 16, backgroundColor: c.soft, borderRadius: 24, borderWidth: 1, borderColor: c.border },
  intro: { flexDirection: 'row', alignItems: 'center', gap: 9 }, copy: { flex: 1, gap: 5 }, name: { color: c.link, fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  title: { color: c.text, fontSize: 19, fontWeight: '800' }, message: { color: c.muted, fontSize: 13, lineHeight: 19 },
  metric: { padding: 12, gap: 7, backgroundColor: c.surface, borderRadius: 17 }, counterRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  counterLabel: { color: c.muted, fontSize: 12, fontWeight: '700' }, counterValue: { color: c.text, fontSize: 25, fontWeight: '900', fontVariant: ['tabular-nums'] },
  undo: { width: 44, height: 44, borderRadius: 14, backgroundColor: c.soft, alignItems: 'center', justifyContent: 'center' },
  add: { minHeight: 44, paddingHorizontal: 12, paddingVertical: 10, backgroundColor: c.action, borderRadius: 14, justifyContent: 'center', flexShrink: 1 },
  addText: { color: c.onAction, fontSize: 12, fontWeight: '800', textAlign: 'center' }, disabled: { opacity: 0.45 },
  note: { color: c.muted, fontSize: 11, lineHeight: 16 }, smallButton: { minHeight: 44, justifyContent: 'center' },
  link: { color: c.link, fontWeight: '800', fontSize: 12 }, actions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
});
