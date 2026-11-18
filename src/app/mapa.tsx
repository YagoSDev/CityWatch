import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DiscoveryMap } from '../components/discovery-map';
import { useColors } from '../features/theme';
export default function MapScreen() {
  const { buscar } = useLocalSearchParams<{ buscar?: string }>(); const c = useColors();
  return <SafeAreaView style={{ flex: 1, backgroundColor: c.background }} edges={['bottom', 'left', 'right']}><DiscoveryMap full focusSearch={!!buscar} /></SafeAreaView>;
}
