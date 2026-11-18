import { useEffect, useState } from 'react';
import { Animated, AppState, Image, type ImageSourcePropType, StyleSheet } from 'react-native';
import { pitAssets, pitFallback, type PitState } from '../features/pit-assets';
import { useReducedMotion } from '../features/reduced-motion';

export function CityWatchMascot({ state = 'hello', size = 160 }: { state?: PitState; size?: number }) {
  const reducedMotion = useReducedMotion();
  const [active, setActive] = useState(AppState.currentState === 'active');
  useEffect(() => {
    const listener = AppState.addEventListener('change', (value) => setActive(value === 'active'));
    return () => listener.remove();
  }, []);
  const [failedImage, setFailedImage] = useState<ImageSourcePropType>();
  const [opacity] = useState(() => new Animated.Value(1));
  const asset = pitAssets[state];
  const source = !reducedMotion && active && asset.animation && failedImage !== asset.animation ? asset.animation : pitFallback;

  useEffect(() => {
    if (reducedMotion) { opacity.setValue(1); return; }
    opacity.setValue(0);
    const animation = Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [opacity, reducedMotion, state]);

  return (
    <Animated.View style={[styles.frame, { width: size, height: size, opacity }]}>
      <Image accessible source={source} style={styles.image} resizeMode="contain"
        accessibilityLabel={asset.animation ? asset.label : 'P.I.T. · imagem estática'}
        onError={() => setFailedImage(source)} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  frame: { alignSelf: 'center' },
  image: { width: '100%', height: '100%' },
});
