import type { ImageSourcePropType } from 'react-native';
import type { LatLng } from 'react-native-maps';
import { destinations, saoPaulo } from './demo';

type City = {
  id: 'sp' | 'rj';
  name: string;
  landmark: string;
  description: string;
  photo: ImageSourcePropType;
  center: LatLng;
  destinations: { name: string; coordinate: LatLng }[];
};

const cities: Record<string, City> = {
  'sao paulo:SP': {
    id: 'sp',
    name: 'São Paulo',
    landmark: 'Ponte Estaiada',
    description: 'Um dos cartões-postais do Rio Pinheiros.',
    photo: require('../../assets/ponte-estaiada.jpg'),
    center: saoPaulo,
    destinations,
  },
  'rio de janeiro:RJ': {
    id: 'rj',
    name: 'Rio de Janeiro',
    landmark: 'Pão de Açúcar',
    description: 'Um cartão-postal da Baía de Guanabara.',
    photo: require('../../assets/pao-de-acucar.jpg'),
    center: { latitude: -22.944, longitude: -43.178 },
    destinations: [
      { name: 'Pão de Açúcar', coordinate: { latitude: -22.9493, longitude: -43.1546 } },
      { name: 'Cristo Redentor', coordinate: { latitude: -22.9519, longitude: -43.2105 } },
      { name: 'Praia de Copacabana', coordinate: { latitude: -22.9739, longitude: -43.1849 } },
    ],
  },
};

export function normalize(value: string) {
  return value.trim().normalize('NFD').replace(/\p{Diacritic}/gu, '').replace(/\s+/g, ' ').toLowerCase();
}

export function findCity(city: string, state: string): City | undefined {
  return cities[`${normalize(city)}:${state.trim().toUpperCase()}`];
}

export const defaultMapCity = cities['sao paulo:SP'];
