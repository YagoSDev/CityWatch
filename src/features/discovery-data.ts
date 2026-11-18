import type { Coordinate, DiscoveryItem, ContentType } from './discovery-model';
import { fictionalCoordinate } from './discovery-model';
// Exemplos fixos: nunca deslocamos as datas para fazê-los parecer notícias atuais.
export function discoveryDemos(city: string, center: Coordinate): DiscoveryItem[] {
  const definitions: { type: ContentType; title: string; category: string; description: string }[] = [
    { type: 'alertas', title: 'Atenção a uma via em manutenção', category: 'Trânsito', description: 'Exercício de alerta urbano. Não há interdição real confirmada nem orientação de emergência.' },
    { type: 'alertas', title: 'Exercício de aviso de chuva', category: 'Clima', description: 'Aviso meteorológico fictício. Consulte os órgãos oficiais para alertas reais.' },
    { type: 'promocoes', title: 'Oferta da feira demonstrativa', category: 'Comércio', description: 'Publicidade simulada. Nenhum desconto está disponível para compra ou resgate.' },
    { type: 'noticias', title: 'Oficina de cuidado com árvores', category: 'Educação', description: 'Notícia fictícia sobre participação dos moradores. Não representa comunicado oficial.' },
    { type: 'parceiros', title: 'Café da comunidade — exemplo', category: 'Comércio', description: 'Parceiro comercial fictício, sem estabelecimento ou parceria confirmada.' },
    { type: 'servicos', title: 'Atendimento comunitário — exemplo', category: 'Saúde', description: 'Ponto de serviço público fictício para demonstração. Não se dirija ao local para atendimento.' },
    { type: 'recompensas', title: 'Medalha de participação — exemplo', category: 'Solidariedade', description: 'Recompensa demonstrativa sem valor financeiro ou resgate real.' },
  ];
  return definitions.map((d, index) => ({ ...d, id: `demo:${city}:${index}`, local: `Local fictício · ${city}`, coordinate: fictionalCoordinate(`discovery-${index}`, center),
    start: '2026-11-18T00:00:00-03:00', end: '2026-11-30T23:59:59-03:00', status: 'andamento',
    source: 'Demonstração CityWatch', verification: 'simulado', verified: false, simulated: true, fictionalPosition: true, advertising: ['promocoes', 'parceiros'].includes(d.type), image: d.type === 'promocoes' ? 'festival' : 'park' }));
}
