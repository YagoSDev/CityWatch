import type { CommunityEvent, EventCategory } from './events-model';
const base = { simulado: true, destaque: false, status: 'programado', criadoEm: '2026-11-18T12:00:00Z', fuso: 'America/Sao_Paulo', cidade: 'São Paulo', estado: 'SP' } as const;
const demo = (id: string, titulo: string, categoria: EventCategory, details: Partial<CommunityEvent>): CommunityEvent => ({
  ...base, id, titulo, categoria, resumo: 'Encontro demonstrativo para aproximar pessoas da comunidade.',
  descricao: 'Atividade fictícia do CityWatch para demonstrar a descoberta de eventos e a participação comunitária. A programação não corresponde a um anúncio oficial e não confirma a realização de uma atividade no local indicado.',
  imagem: 'park', local: 'Espaço comunitário fictício', ...details,
});
const seedEvents: CommunityEvent[] = [
  demo('festival-cultural-sp', 'Festival Cultural SP', 'cultura', {
    resumo: 'Arte, música e encontros para celebrar a cidade.', imagem: 'festival', destaque: true,
    dataInicio: '2026-11-28T10:00:00-03:00', dataFim: '2026-11-28T22:00:00-03:00', bairro: 'Centro', local: 'Praça comunitária fictícia', preco: 0, links: [{ titulo: 'Espaços culturais da cidade (Prefeitura)', tipo: 'informacoes', url: 'https://prefeitura.sp.gov.br/web/cultura/w/centros-culturais' }],
    descricao: 'Um exemplo de festival que reúne música, oficinas criativas e expressões artísticas em uma praça comunitária fictícia. A proposta demonstra um encontro acolhedor para pessoas de todas as idades, com atividades culturais e espaços de convivência.\n\nEste evento e seus horários são simulados para testes do CityWatch. Não há inscrição ou organizador oficial confirmado.',
    programacao: [{ horario: '10:00', atividade: 'Abertura e encontro da comunidade (simulado)' }, { horario: '14:00', atividade: 'Oficina criativa (simulada)' }, { horario: '18:00', atividade: 'Apresentação musical (simulada)' }, { horario: '22:00', atividade: 'Encerramento simulado' }],
  }),
  demo('corrida-solidaria-sp', 'Corrida Solidária SP', 'esportes', { resumo: 'Movimento e solidariedade em apoio à comunidade.', imagem: 'running', destaque: true,
    dataInicio: '2026-11-29T08:00:00-03:00', dataFim: '2026-11-29T10:00:00-03:00', bairro: 'Vila Mariana', local: 'Parque Ibirapuera', localVerificado: true,
    latitude: -23.5874, longitude: -46.6576, links: [{ titulo: 'Informações oficiais sobre o parque', tipo: 'informacoes', url: 'https://prefeitura.sp.gov.br/web/meio_ambiente/w/parques/regiao_sul/14062' }], descricao: 'Corrida beneficente fictícia, destinada a demonstrar atividades de esporte e convivência no aplicativo. O parque é um local real; a realização de uma corrida nesta data não está confirmada. Não há inscrição, percurso ou organizador verificado.' }),
  demo('encontro-adocao', 'Feira de Adoção', 'animais', { resumo: 'Conheça a importância da adoção responsável.', imagem: 'adoption', destaque: true, bairro: 'Bela Vista',
    dataInicio: '2026-12-05T10:00:00-03:00', dataFim: '2026-12-05T16:00:00-03:00', local: 'Centro comunitário fictício', preco: 0 }),
  demo('feira-livros', 'Feira de troca de livros', 'educacao', { resumo: 'Histórias que circulam, laços que ficam.', dataInicio: '2026-12-06T10:00:00-03:00', dataFim: '2026-12-06T13:00:00-03:00', bairro: 'Vila Mariana', local: 'Parque Ibirapuera', localVerificado: true, latitude: -23.5874, longitude: -46.6576, preco: 0 }),
  demo('mutirao-plantio', 'Mutirão de plantio', 'meio_ambiente', { resumo: 'Um encontro para aprender a cuidar do verde.', dataInicio: '2026-12-12T09:00:00-03:00', dataFim: '2026-12-12T12:00:00-03:00', bairro: 'Alto de Pinheiros' }),
  demo('oficina-desenho', 'Oficina de desenho urbano', 'cultura', { resumo: 'Um novo olhar para os espaços da cidade.', periodo: 'Data e horário a confirmar', bairro: 'Liberdade', local: 'Centro Cultural São Paulo', localVerificado: true, endereco: 'Rua Vergueiro, 1000, São Paulo – SP', links: [{ titulo: 'Visite o Centro Cultural São Paulo', tipo: 'informacoes', url: 'https://centrocultural.sp.gov.br/visite/' }] }),
  demo('campanha-alimentos', 'Campanha de alimentos', 'solidariedade', { resumo: 'Demonstração de uma rede de cuidado e apoio.', dataInicio: '2026-12-13T09:00:00-03:00', dataFim: '2026-12-13T17:00:00-03:00', bairro: 'Santana' }),
  demo('saude-praca', 'Bem-estar na praça', 'saude', { resumo: 'Uma manhã para cuidar de você e conviver.', imagem: 'running', dataInicio: '2026-12-19T08:30:00-03:00', dataFim: '2026-12-19T11:00:00-03:00', bairro: 'Mooca', preco: 0 }),
  demo('feira-parceiros', 'Feira de parceiros', 'promocoes', { resumo: 'Publicidade demonstrativa, sem oferta ou resgate real.', imagem: 'festival', publicidade: true, bairro: 'Pinheiros', periodo: 'Data a confirmar' }),
  demo('encontro-encerrado', 'Encontro de vizinhos', 'solidariedade', { resumo: 'Exemplo de evento já encerrado.', status: 'encerrado', dataInicio: '2026-10-10T10:00:00-03:00', dataFim: '2026-10-10T12:00:00-03:00', bairro: 'Centro' }),
  demo('oficina-cancelada', 'Oficina de fotografia', 'educacao', { resumo: 'Exemplo de evento cancelado, sem inscrições.', status: 'cancelado', dataInicio: '2026-12-20T14:00:00-03:00', dataFim: '2026-12-20T16:00:00-03:00', bairro: 'Centro' }),
  demo('corrida-solidaria-rio', 'Corrida solidária', 'esportes', { cidade: 'Rio de Janeiro', estado: 'RJ', imagem: 'running', destaque: true, bairro: 'Flamengo', local: 'Aterro do Flamengo', dataInicio: '2026-11-29T08:00:00-03:00', dataFim: '2026-11-29T10:00:00-03:00' }),
  demo('campanha-limpeza-rio', 'Mutirão pela orla', 'meio_ambiente', { cidade: 'Rio de Janeiro', estado: 'RJ', imagem: 'rio', bairro: 'Flamengo', local: 'Praia do Flamengo', periodo: 'Data e horário a confirmar' }),
];
export async function loadCommunityEvents() { return demoEvents; }

const eventPhotos: Record<string, CommunityEvent['imagem']> = {
  'festival-cultural-sp': 'festival', 'corrida-solidaria-sp': 'running', 'encontro-adocao': 'adoption',
  'feira-livros': 'books', 'mutirao-plantio': 'planting', 'oficina-desenho': 'art',
  'campanha-alimentos': 'donations', 'saude-praca': 'wellness', 'feira-parceiros': 'market',
  'encontro-encerrado': 'neighbors', 'oficina-cancelada': 'photography',
  'corrida-solidaria-rio': 'running', 'campanha-limpeza-rio': 'cleanup',
};
export const demoEvents = seedEvents.map(event => ({ ...event, imagem: eventPhotos[event.id] ?? event.imagem }));
