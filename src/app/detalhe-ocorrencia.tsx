import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { Action, Notice } from '../components/form';
import { Screen, useScreenText } from '../components/screen';
import { tagLabels, occurrenceTypes } from '../features/occurrence-draft';
import { academicQuery, academicRequest, type EventoAcademico, type OcorrenciaAcademica } from '../features/academic-api';

export default function OccurrenceDetail() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const [data, setData] = useState<{ item: OcorrenciaAcademica; history: EventoAcademico[] }>();
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const body = useScreenText();

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    let active = true;
    const timer = setTimeout(() => controller.abort(), 10000);

    void Promise.all([
      academicRequest<OcorrenciaAcademica>('/ocorrencias/' + encodeURIComponent(id), { signal: controller.signal }),
      academicRequest<EventoAcademico[]>(academicQuery('/historico', { identificador: id }), { signal: controller.signal }),
    ]).then(([item, history]) => {
      if (active) { setData({ item, history }); setError(''); }
    }).catch((error: Error) => { if (active) setError(error.message); })
      .finally(() => clearTimeout(timer));
    return () => { active = false; clearTimeout(timer); controller.abort(); };
  }, [id, revision]);

  return (
    <Screen title="Detalhes da ocorrência" nativeHeader>

      {!id ? <Notice error message="Informe o identificador da ocorrência." /> : error ? <>
        <Notice error message={error} />
        <Action title="Tentar novamente" onPress={() => { setError(''); setRevision((value) => value + 1); }} />
      </> : !data || data.item.id !== id ? <Text style={body}>Carregando ocorrência e histórico…</Text> : <>
        <Notice message={data.item.origem === 'cidadao' ? 'Relato cidadão não verificado. Sem confirmação de encaminhamento à prefeitura.' : 'Registro acadêmico simulado. A posição no mapa é fictícia.'} />
        <Text style={body}>{data.item.id} · {data.item.categoria}</Text>
        <Text accessibilityRole="header" style={[body, { fontSize: 23, fontWeight: '800' }]}>{data.item.descricao}</Text>
        <Text style={body}>{data.item.localidade || data.item.bairro} · {data.item.publicado_em ? new Date(data.item.publicado_em).toLocaleString('pt-BR') : data.item.data}</Text>
        {!!data.item.referencia && <Text style={body}>Como encontrar · {data.item.referencia}</Text>}
        <Text style={body}>Status · {data.item.status}</Text>
        <Text style={body}>Verificação · não verificado{data.item.origem !== 'cidadao' ? ', registro simulado' : ''}</Text>
        {data.item.tipo && <Text style={body}>Tipo · {occurrenceTypes.find(type => type.id === data.item.tipo)?.label || data.item.tipo}</Text>}
        {!!data.item.etiquetas?.length && <Text style={body}>Etiquetas · {data.item.etiquetas.map(tag => tagLabels[tag] || tag).join(', ')}</Text>}
        {data.item.possui_anexo && <Text style={body}>Evidência recebida e armazenada de forma privada no servidor. Não publicada nesta consulta.</Text>}
        {!data.item.publicado_em && <Text style={body}>Horário da ocorrência · não informado na base</Text>}
        <Text accessibilityRole="header" style={[body, { fontSize: 20, fontWeight: '800' }]}>Histórico de atualizações</Text>
        {data.history.length === 0 ? <Text style={body}>Ainda não há atualizações.</Text> : data.history.map((event, index) => (
          <Text key={index} style={body}>{event.data} · {event.status_anterior} → {event.status_novo}{'\n'}{event.observacao}</Text>
        ))}
      </>}
    </Screen>
  );
}
