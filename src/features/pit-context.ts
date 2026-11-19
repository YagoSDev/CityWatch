export type PitContext = { title: string; message: string };

export function pitContext(path: string): PitContext {
  if (path === '/nova-ocorrencia' || path === '/relatar') return {
    title: 'Vamos cuidar da cidade?', message: 'Conte o que aconteceu. Se for seguro, adicione uma foto e confira o local antes de publicar.',
  };
  if (path.includes('ocorrencia')) return {
    title: 'Cada relato tem uma história', message: 'Acompanhe o status e as atualizações. Um relato não significa encaminhamento confirmado à prefeitura.',
  };
  if (path.includes('mapa')) return {
    title: 'Vamos explorar por perto?', message: 'Use os filtros para escolher o que aparece no mapa. Confira a origem e a data de cada informação.',
  };
  if (path.includes('agenda') || path.includes('evento')) return {
    title: 'Um encontro com a cidade', message: 'Consulte as datas e salve o que interessa. Eventos demonstrativos continuam identificados.',
  };
  if (path === '/comunidade' || path === '/recursos-comunidade') return {
    title: 'A cidade acontece com você', message: 'Descubra eventos e ações da comunidade. Seus favoritos também aparecem na Agenda.',
  };
  if (path.includes('perfil')) return {
    title: 'Seu jeito de participar', message: 'Personalize seu perfil e confira suas contribuições. Vamos planejar sua próxima atividade?',
  };
  return { title: 'Oi! Eu sou o P.I.T.', message: 'Seu companheiro no CityWatch. Vamos explorar o mapa, encontrar um evento ou planejar uma atividade?' };
}

export function pitDockBounds(width: number, height: number, top: number, bottom: number) {
  const minY = top + 12;
  return { left: 4, right: Math.max(4, width - 60), top: minY, bottom: Math.max(minY, height - bottom - 172) };
}

export function clampDockY(y: number, bounds: ReturnType<typeof pitDockBounds>) {
  return Math.min(bounds.bottom, Math.max(bounds.top, y));
}
