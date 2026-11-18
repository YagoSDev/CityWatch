import { SymbolView } from 'expo-symbols';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '../features/theme';

export function CityBrand() {
  const colors = useColors();

  return (
    <View accessible accessibilityLabel="CityWatch. Sua cidade, nossa comunidade." style={styles.brand}>
      <SymbolView name={{ ios: 'mappin.circle.fill', android: 'location_on' }} size={40} tintColor="#FF3F83" />
      <View style={styles.copy}>
        <Text maxFontSizeMultiplier={1.3} style={styles.title}>City<Text style={styles.accent}>Watch</Text></Text>
        <Text maxFontSizeMultiplier={1.65} style={[styles.subtitle, { color: colors.onAction }]}>Sua cidade, nossa comunidade</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', flexShrink: 1, gap: 7 },
  copy: { flexShrink: 1 },
  title: { color: '#FFFFFF', fontSize: 29, fontWeight: '900', letterSpacing: -1.2 },
  accent: { color: '#FF6699' },
  subtitle: { fontSize: 12, fontWeight: '600' },
});
