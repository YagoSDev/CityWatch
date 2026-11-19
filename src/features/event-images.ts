import type { ImageSourcePropType } from 'react-native';
import type { CommunityEvent } from './events-model';
export const eventImages: Record<CommunityEvent['imagem'], ImageSourcePropType> = {
  festival: require('../../assets/events/festival.jpg'), running: require('../../assets/events/running.jpg'),
  adoption: require('../../assets/events/adoption.jpg'), park: require('../../assets/ibirapuera.jpg'), rio: require('../../assets/pao-de-acucar.jpg'),

  books: require('../../assets/events/books.jpg'),
  planting: require('../../assets/events/planting.jpg'),
  art: require('../../assets/events/art.jpg'),
  donations: require('../../assets/events/donations.jpg'),
  wellness: require('../../assets/events/wellness.jpg'),
  market: require('../../assets/events/market.jpg'),
  neighbors: require('../../assets/events/neighbors.jpg'),
  photography: require('../../assets/events/photography.jpg'),
  cleanup: require('../../assets/events/cleanup.jpg'),
  coffee: require('../../assets/events/coffee.jpg'),
  rain: require('../../assets/events/rain.jpg'),
  maintenance: require('../../assets/events/maintenance.jpg'),
  lighting: require('../../assets/events/lighting.jpg'),
  accessibility: require('../../assets/events/accessibility.jpg'),
};

export function isGeneratedEventImage(key: string) { return !['park', 'rio'].includes(key); }
