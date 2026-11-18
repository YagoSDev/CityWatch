import { useLocalSearchParams } from 'expo-router';
import { Alert, Text } from 'react-native';
import { useAgenda } from '../features/agenda';
import { entryDateLabel } from '../features/agenda-model';
import { openEventLink } from '../features/event-actions';
import { Screen, useScreenText } from '../components/screen';
import { Action, Notice } from '../components/form';
export default function AgendaDetail() {
  const { id, ano } = useLocalSearchParams<{ id?: string; ano?: string }>();
  const year = Number(ano); const { entries, loading } = useAgenda(Number.isInteger(year) ? year : undefined); const style = useScreenText();
  const item = entries.find(e => e.id === id);
  return <Screen title={item?.title || 'Data da Agenda'} nativeHeader>{item ? <>
    <Notice message={item.simulated ? 'Data demonstrativa simulada.' : `Feriado ${item.scope?.toLowerCase()} · base verificada para ${item.validYear}.`} />
    <Text style={style}>{entryDateLabel(item)} · {item.allDay ? 'Dia inteiro' : 'Horário não informado'}</Text><Text style={style}>{item.description}</Text><Text style={style}>{item.local}</Text><Text style={style}>Origem: {item.origin}</Text>
    {item.source && <Action title="Consultar fonte oficial" secondary onPress={() => { void openEventLink(item.source!).catch((e: Error) => Alert.alert('Não foi possível abrir', e.message)); }} />}
  </> : <Text style={style}>{loading ? 'Carregando…' : 'Data não encontrada na base deste ano.'}</Text>}</Screen>;
}
