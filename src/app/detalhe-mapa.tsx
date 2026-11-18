import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import { useDiscovery } from '../features/discovery';
import { Screen, useScreenText } from '../components/screen';
import { Notice } from '../components/form';
export default function MapDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { items, loading } = useDiscovery(); const style = useScreenText();
  const item = items.find(i => i.id === id);
  return <Screen title={item?.title || 'Conteúdo do mapa'} nativeHeader>{item ? <><Notice message={item.advertising ? 'Publicidade demonstrativa. Sem oferta, parceiro ou resgate real.' : 'Conteúdo simulado. Não representa alerta, notícia ou atendimento oficial.'} /><Text style={style}>{item.description}</Text><Text style={style}>{item.local} · posição fictícia.</Text><Text style={style}>Este exemplo permite testar a descoberta no mapa. Nenhuma autoridade foi notificada.</Text></> : <Text style={style}>{loading ? 'Carregando…' : 'Conteúdo não encontrado.'}</Text>}</Screen>;
}
