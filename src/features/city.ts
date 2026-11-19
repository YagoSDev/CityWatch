import type { ImageSourcePropType } from 'react-native';
import type { LatLng } from 'react-native-maps';
import { destinations, saoPaulo } from './demo';

export type City = {
  id: string;
  name: string;
  landmark: string;
  description: string;
  photo?: ImageSourcePropType;
  center: LatLng;
  destinations: { name: string; coordinate: LatLng }[];
};

const cities: Record<string, City> = {
  'cosmopolis:SP': {
    id: 'cosmopolis', name: 'Cosmópolis', landmark: 'Centro de Cosmópolis',
    description: 'Foto de arquivo de 2007 · Carlosar / Wikimedia Commons.',
    photo: require('../../assets/cities/cosmopolis-centro.jpg'),
    // Approximate municipal reference from IBGE map 3512803; never a user address.
    center: { latitude: -22.64, longitude: -47.2 }, destinations: [],
  },
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

export const countryReferenceCenter = { latitude: -14.2, longitude: -51.9 }; // Broad map reference, never a city location.
