import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthSession } from '../features/auth-session';
import { findCity } from '../features/city';
import { useProfile } from '../features/profile';
import { CityBackdrop } from './city-backdrop';
import { CityBrand } from './city-brand';

const readyDisplayMs = 1450;

export function Welcome({ onDismiss }: { onDismiss: () => void }) {
  const { session } = useAuthSession();
  const { profile, ready } = useProfile();
  const city = findCity(profile.city, profile.state);
  const firstName = session && (profile.name.trim() ||
    (typeof session.user.user_metadata?.full_name === 'string' ? session.user.user_metadata.full_name.trim() : ''))
    .split(/\s+/)[0];
  const [reduceMotion, setReduceMotion] = useState(true);
  const [opacity] = useState(() => new Animated.Value(1));
  const [entrance] = useState(() => new Animated.Value(0));
  const closing = useRef(false);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!active) return;
      setReduceMotion(enabled);
      if (enabled) entrance.setValue(1);
      else Animated.timing(entrance, { toValue: 1, duration: 240, useNativeDriver: true }).start();
    }).catch(() => { if (active) entrance.setValue(1); });
    const listener = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => { active = false; listener.remove(); };
  }, [entrance]);

  const dismiss = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    if (reduceMotion) {
      onDismiss();
      return;
    }
    Animated.timing(opacity, { toValue: 0, duration: 220, useNativeDriver: true }).start(({ finished }) => {
      if (finished) onDismiss();
    });
  }, [onDismiss, opacity, reduceMotion]);

  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(dismiss, readyDisplayMs);
    return () => clearTimeout(timer);
  }, [dismiss, ready]);

  return (
    <Animated.View style={[styles.overlay, { opacity }]} accessibilityViewIsModal>
      <CityBackdrop photo={city?.photo} />
      <LinearGradient colors={['#111218AD', '#1112184D', '#111218']} locations={[0, 0.35, 0.92]} style={StyleSheet.absoluteFill} />
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}><CityBrand /></View>
        <ScrollView contentContainerStyle={styles.welcomeScroll} showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.content, { opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }] }]}>
            {city && <Text style={styles.location}>{city.landmark} · {city.name}</Text>}
            <Text accessibilityRole="header" style={styles.title}>{firstName ? `Olá, ${firstName}! 👋` : 'Olá! 👋'}</Text>
            <Text style={styles.message}>Vamos descobrir o que acontece na sua cidade?</Text>
            {reduceMotion ? <Text accessibilityLabel="Preparando o CityWatch" style={styles.progress}>•••</Text> : (
              <ActivityIndicator color="#FFFFFF" style={styles.indicator} accessibilityLabel="Preparando o CityWatch" />
            )}
          </Animated.View>
        </ScrollView>
        <Pressable accessibilityRole="button" onPress={() => {
          opacity.stopAnimation();
          onDismiss();
        }} style={styles.skip}>
          <Text style={styles.skipText}>Pular apresentação</Text>
        </Pressable>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 10, backgroundColor: '#111218' },
  safe: { flex: 1, width: '100%', maxWidth: 650, alignSelf: 'center', paddingHorizontal: 25, gap: 20 },
  header: { paddingTop: 14 },
  welcomeScroll: { flexGrow: 1 },
  content: { flexGrow: 1, justifyContent: 'flex-end', gap: 10, paddingBottom: 14 },
  location: { color: '#FBBBD2', fontSize: 14, fontWeight: '700' },
  title: { color: '#FFFFFF', fontSize: 44, fontWeight: '900', letterSpacing: -1.6 },
  message: { color: '#F0ECF2', fontSize: 19, lineHeight: 26, maxWidth: 350 },
  progress: { color: '#FFFFFF', fontSize: 17, letterSpacing: 3 },
  indicator: { alignSelf: 'flex-start', minHeight: 24 },
  skip: { minHeight: 48, alignSelf: 'flex-start', paddingHorizontal: 15, justifyContent: 'center', borderRadius: 24, borderWidth: 1, borderColor: '#FFFFFF6E', marginBottom: 14 },
  skipText: { color: '#FFFFFF', fontWeight: '700' },
});
