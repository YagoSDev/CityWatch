import { useVideoPlayer, VideoView } from 'expo-video';
import { StyleSheet } from 'react-native';

export function EvidenceVideo({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, instance => { instance.loop = false; });
  return <VideoView player={player} style={styles.video} nativeControls contentFit="contain" accessibilityLabel="Prévia do vídeo selecionado" />;
}
const styles = StyleSheet.create({ video: { width: '100%', height: 220, borderRadius: 12 } });
