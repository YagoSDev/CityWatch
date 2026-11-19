import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useActivity } from '../features/activity';
import { type PitState } from '../features/pit-assets';
import { useThemedStyles, type Colors } from '../features/theme';
import { ActivityDashboard } from './activity-dashboard';
import { CityWatchMascot } from './city-watch-mascot';

/** A contextual invitation, reusing the real session controls rather than a mock chat. */
export function PitCard({ title, message, state = 'hello', live = false }: { title: string; message: string; state?: PitState; live?: boolean }) {
  const activity = useActivity();
  const styles = useThemedStyles(createStyles);
  if (live && activity.session) return <ActivityDashboard />;
  return <Pressable accessibilityRole="button" accessibilityLabel={`${title}. ${message}. Abrir P.I.T.`}
    onPress={activity.open} style={({ pressed }) => [styles.card, pressed && { opacity: 0.8 }]}>
    <CityWatchMascot state={state} size={76} />
    <View style={styles.copy}>
      <Text style={styles.name}>P.I.T. · COM VOCÊ</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.action}>Vamos lá →</Text>
    </View>
  </Pressable>;
}
const createStyles = (c: Colors) => StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 9, padding: 14, borderRadius: 22, backgroundColor: c.soft,
    borderWidth: 1, borderColor: c.border }, copy: { flex: 1, gap: 5 },
  name: { color: c.link, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  title: { color: c.text, fontSize: 17, fontWeight: '800' }, message: { color: c.muted, fontSize: 13, lineHeight: 19 },
  action: { color: c.link, fontSize: 12, fontWeight: '800', marginTop: 2 },
});
