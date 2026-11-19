import { useEffect, useState } from 'react';
import { AppState, StyleSheet, Text, View } from 'react-native';
import type { ActivitySession } from '../features/activity-session';
import { formatClock, sessionTiming } from '../features/activity-engagement';
import { useThemedStyles, type Colors } from '../features/theme';

/** Only this small subtree ticks every second; timestamps recover after backgrounding. */
export function ActivityTimer({ session }: { session: ActivitySession }) {
  const [now, setNow] = useState(Date.now);
  const styles = useThemedStyles(createStyles);
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined;
    function resume(state: string | null | undefined) {
      if (timer) clearInterval(timer);
      if (state === 'active') {
        setNow(Date.now());
        timer = setInterval(() => {
          const time = Date.now(); setNow(time);
          if (time >= session.endsAt && timer) clearInterval(timer);
        }, 1000);
      }
    }
    const initial = setTimeout(() => resume(AppState.currentState), 0);
    const listener = AppState.addEventListener('change', resume);
    return () => { clearTimeout(initial); if (timer) clearInterval(timer); listener.remove(); };
  }, [session.endsAt]);
  const time = sessionTiming(session, now);
  return <View style={styles.container}>
    <View style={styles.row}>
      <View><Text style={styles.label}>TEMPO RESTANTE</Text><Text style={styles.clock}>{formatClock(time.remaining)}</Text></View>
      <View><Text style={styles.label}>EM ATIVIDADE</Text><Text style={styles.elapsed}>{formatClock(time.elapsed)}</Text></View>
    </View>
    <View style={styles.track}><View style={[styles.progress, { width: `${time.progress * 100}%` }]} /></View>
    {time.remaining === 0 && <Text accessibilityRole="text" style={styles.ended}>Tempo planejado encerrado. Você pode prolongar ou finalizar.</Text>}
  </View>;
}
const createStyles = (c: Colors) => StyleSheet.create({
  container: { gap: 8 }, row: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' },
  label: { color: c.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1 }, clock: { color: c.text, fontSize: 30, fontWeight: '900', fontVariant: ['tabular-nums'], letterSpacing: -1 },
  elapsed: { color: c.link, fontSize: 21, fontWeight: '800', fontVariant: ['tabular-nums'] }, track: { height: 5, borderRadius: 3, backgroundColor: c.border, overflow: 'hidden' },
  progress: { height: '100%', backgroundColor: c.link, borderRadius: 3 }, ended: { color: c.muted, fontSize: 12 },
});
