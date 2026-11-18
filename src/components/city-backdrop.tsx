import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { Image, type ImageSourcePropType, StyleSheet, View } from 'react-native';
import { useColors } from '../features/theme';

export function CityBackdrop({ photo }: { photo?: ImageSourcePropType }) {
  const colors = useColors();
  const [failedPhoto, setFailedPhoto] = useState<ImageSourcePropType>();

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <LinearGradient colors={['#192945', '#575467', colors.fallbackBottom]} style={styles.fill}>
        <View style={styles.ring} />
        <View style={[styles.ring, styles.outerRing]} />
      </LinearGradient>
      {photo && photo !== failedPhoto &&
        <Image source={photo} style={styles.fill} onError={() => setFailedPhoto(photo)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill, width: '100%', height: '100%' },
  ring: { position: 'absolute', right: -54, top: -22, width: 271, height: 271, borderRadius: 160, borderColor: '#FFFFFF45', borderWidth: 1 },
  outerRing: { right: -103, top: -70, width: 367, height: 367, borderRadius: 205 },
});
