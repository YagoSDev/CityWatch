import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';
import { type Colors, useColors, useThemedStyles } from '../features/theme';

export function RewardPreview() {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.card}>
      <SymbolView name={{ ios: 'ticket.fill', android: 'local_activity' }} size={26} tintColor={colors.link} />
      <View style={styles.copy}>
        <Text accessibilityRole="header" style={styles.title}>Cupons e recompensas</Text>
        <Text style={styles.note}>Exemplo fictício · 10% em uma feira de bairro, sem resgate.</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  card: { backgroundColor: colors.soft, padding: 16, borderRadius: 18, flexDirection: 'row', alignItems: 'center', gap: 12 },
  copy: { flex: 1, gap: 4 },
  title: { color: colors.text, fontSize: 17, fontWeight: '800' },
  note: { color: colors.muted, fontSize: 14 },
});
