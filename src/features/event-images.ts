import type { ImageSourcePropType } from 'react-native';
import type { CommunityEvent } from './events-model';
export const eventImages: Record<CommunityEvent['imagem'], ImageSourcePropType> = {
  festival: require('../../assets/events/festival.jpg'), running: require('../../assets/events/running.jpg'),
  adoption: require('../../assets/events/adoption.jpg'), park: require('../../assets/ibirapuera.jpg'), rio: require('../../assets/pao-de-acucar.jpg'),
};
