import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '../features/profile';
import { useColors } from '../features/theme';
import { CityWatchMascot } from './city-watch-mascot';

/** Native launch screen hands off to this white → CityWatch pink introduction. */
export function Welcome({ onDismiss }: { onDismiss: () => void }) {
  const { ready } = useProfile();
  const colors = useColors();
  const { height, width } = useWindowDimensions();
  const [reduced, setReduced] = useState<boolean | null>(null);
  const [alive, setAlive] = useState(false);
  const [color] = useState(() => new Animated.Value(0));
  const [mascot] = useState(() => new Animated.Value(0));
  const [opacity] = useState(() => new Animated.Value(1));
  const closing = useRef(false);

  useEffect(() => {
    let active = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (active) setReduced(value); })
      .catch(() => { if (active) setReduced(true); });
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduced);
    return () => { active = false; subscription.remove(); };
  }, []);

  useEffect(() => {
    if (!ready || reduced === null) return;
    const sequence = Animated.sequence([
      Animated.delay(reduced ? 200 : 550),
      Animated.parallel([
        Animated.timing(color, { toValue: 1, duration: reduced ? 0 : 800, useNativeDriver: false }),
        Animated.sequence([Animated.delay(reduced ? 0 : 250),
          Animated.timing(mascot, { toValue: 1, duration: reduced ? 0 : 650, useNativeDriver: true })]),
      ]),
      Animated.delay(reduced ? 1000 : 1050),
      Animated.timing(opacity, { toValue: 0, duration: reduced ? 0 : 220, useNativeDriver: true }),
    ]);
    const timer = setTimeout(() => setAlive(true), reduced ? 200 : 950);
    sequence.start(({ finished }) => { if (finished && !closing.current) { closing.current = true; onDismiss(); } });
    return () => { clearTimeout(timer); sequence.stop(); };
  }, [color, mascot, onDismiss, opacity, ready, reduced]);

  return <Animated.View testID="pit-welcome" accessibilityViewIsModal style={[styles.overlay, { opacity,
    backgroundColor: color.interpolate({ inputRange: [0, 1], outputRange: ['#FFFFFF', colors.brand] }) }]}>
    <StatusBar style={alive ? 'light' : 'dark'} />
    <SafeAreaView style={styles.safe}>
      <View style={styles.center}>
        <View style={styles.wordmark}>
          <Animated.Text accessibilityRole="header" maxFontSizeMultiplier={1.4} style={[styles.title,
            { fontSize: Math.min(48, width * 0.12), color: color.interpolate({ inputRange: [0, 1], outputRange: ['#111218', '#FFFFFF'] }) }]}>CityWatch</Animated.Text>
          <Animated.Text style={[styles.tagline, { color: color.interpolate({ inputRange: [0, 1], outputRange: ['#414452', '#FFFFFF'] }) }]}>Sua cidade, nossa comunidade</Animated.Text>
        </View>
        <Animated.View style={{ opacity: mascot, transform: [{ translateY: mascot.interpolate({ inputRange: [0, 1], outputRange: [reduced ? 0 : 36, 0] }) },
          { scale: mascot.interpolate({ inputRange: [0, 1], outputRange: [reduced ? 1 : 0.86, 1] }) }] }}>
          <CityWatchMascot size={Math.min(290, height * 0.32, width * 0.72)} />
          <Text style={styles.hello}>Oi! Eu sou o P.I.T.</Text>
          <Text style={styles.message}>Vamos descobrir a cidade juntos?</Text>
        </Animated.View>
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel="Pular apresentação" testID="skip-pit-welcome"
        onPress={() => { if (!closing.current) { closing.current = true; onDismiss(); } }} style={styles.skip}>
        <Animated.Text style={[styles.skipText, { color: color.interpolate({ inputRange: [0, 1], outputRange: ['#172238', '#FFFFFF'] }) }]}>Pular apresentação</Animated.Text>
      </Pressable>
    </SafeAreaView>
  </Animated.View>;
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, zIndex: 100, backgroundColor: '#FFFFFF' },
  safe: { flex: 1, paddingHorizontal: 24 }, center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 28 },
  wordmark: { alignItems: 'center', gap: 7 }, title: { fontWeight: '900', letterSpacing: -1.8 },
  tagline: { fontSize: 15, textAlign: 'center' }, hello: { color: '#FFFFFF', fontSize: 22, fontWeight: '800', textAlign: 'center', marginTop: 10 },
  message: { color: '#FFFFFF', fontSize: 15, textAlign: 'center', marginTop: 7 },
  skip: { minHeight: 48, alignSelf: 'center', justifyContent: 'center', paddingHorizontal: 18, marginBottom: 12 },
  skipText: { fontSize: 14, fontWeight: '700' },
});
