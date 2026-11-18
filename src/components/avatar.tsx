import { Image, StyleSheet, Text, View } from 'react-native';
import { type Colors, useThemedStyles } from '../features/theme';

export function Avatar({ name, uri, size }: { name: string; uri?: string; size: number }) {
  const styles = useThemedStyles(createStyles);
  const initials = name.trim().split(/\s+/).slice(0, 2).map((word) => Array.from(word)[0]).join('').toUpperCase();

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={uri ? "Foto do perfil" : `Iniciais ${initials || 'CW'}`}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initials, { fontSize: size * 0.32 }]}>{initials || 'CW'}</Text>
      {uri && <Image source={{ uri }} style={StyleSheet.absoluteFill} />}
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  avatar: { backgroundColor: colors.soft, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.link, fontWeight: '800' },
});
