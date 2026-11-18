import { demoEvents } from './events-data';
import { categoryLabel, eventDate, eventHours } from './events-model';

// Adaptador para componentes legados; a programação vem do mesmo catálogo da Comunidade.
export const communityEvents = demoEvents.map(event => ({
  id: event.id, city: event.estado === 'SP' ? 'sp' : 'rj', category: categoryLabel(event.categoria),
  title: event.titulo, place: event.local, time: event.dataInicio ? `${eventDate(event)} · ${eventHours(event)}` : event.periodo || 'Data a confirmar',
  description: event.resumo, imagem: event.imagem,
}));
export type CommunityEventId = string;

export const communitySections = [
  { id: 'eventos', title: 'Eventos' },
  { id: 'seguranca', title: 'Segurança' },
  { id: 'alertas', title: 'Alertas' },
  { id: 'recompensas', title: 'Recompensas' },
  { id: 'painel', title: 'Painel institucional' },
] as const;

export const saoPaulo = { latitude: -23.562, longitude: -46.658 };
export const destinations = [
  { name: 'Parque Ibirapuera', coordinate: { latitude: -23.5874, longitude: -46.6576 } },
  { name: 'MASP', coordinate: { latitude: -23.5614, longitude: -46.6559 } },
  { name: 'Ponte Estaiada', coordinate: { latitude: -23.6133, longitude: -46.6995 } },
];
