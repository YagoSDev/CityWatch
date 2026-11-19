import { Image, StyleSheet, Text, View } from 'react-native';
import { useAuthSession } from '../features/auth-session';
import { type Colors, useThemedStyles } from '../features/theme';

export function Avatar({ name, uri, size }: { name: string; uri?: string; size: number }) {
  const { loading } = useAuthSession();
  const demonstration = !uri && !loading;
  const styles = useThemedStyles(createStyles);
  const initials = name.trim().split(/\s+/).slice(0, 2).map((word) => Array.from(word)[0]).join('').toUpperCase();

  return (
    <View accessible accessibilityRole="image" accessibilityLabel={uri ? "Foto do perfil" : demonstration ? "Foto demonstrativa de perfil" : `Iniciais ${initials || 'CW'}`}
      style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initials, { fontSize: size * 0.32 }]}>{initials || 'CW'}</Text>
      {(uri || demonstration) && <Image source={uri ? { uri } : require('../../assets/profile/demo-avatar.png')} style={[StyleSheet.absoluteFill, { width: '100%', height: '100%' }]} resizeMode="cover" />}
    </View>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  avatar: { backgroundColor: colors.soft, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  initials: { color: colors.link, fontWeight: '800' },
});
