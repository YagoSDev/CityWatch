import { useMemo } from 'react';
import { useColorScheme } from 'react-native';

const brand = '#F50057';
const onAction = '#FFFFFF';

const light = {
  dark: false, brand, onAction,
  background: '#F7F8FC', surface: '#FFFFFF', text: '#172238', muted: '#4D5971',
  border: '#DCDDE6', soft: '#FCE4EC', link: '#AE003E', action: '#C20046',
  security: '#13644E', securityBg: '#DFEEE8', alert: '#8A4C12', alertBg: '#F9EBD9', alertBorder: '#EAD0AD',
  event: '#594899', eventBg: '#ECE7FA', error: '#9E2438', errorBg: '#FBE8EB',
  photoFade: '#F7F8FC00', fallbackTop: '#702044', fallbackBottom: '#E8AFC4',
};

const dark: typeof light = {
  dark: true, brand, onAction,
  background: '#111218', surface: '#1C1E28', text: '#F4F3F9', muted: '#B6BACD',
  border: '#363849', soft: '#401D30', link: '#FF93B6', action: '#C20046',
  security: '#90E0C4', securityBg: '#193B34', alert: '#FFCE98', alertBg: '#3D2B1E', alertBorder: '#684829',
  event: '#D0BEFF', eventBg: '#33284B', error: '#FFADB8', errorBg: '#492431',
  photoFade: '#11121800', fallbackTop: '#4F163C', fallbackBottom: '#371E3E',
};

export type Colors = typeof light;

export function useColors() {
  return useColorScheme() === 'dark' ? dark : light;
}

export function useThemedStyles<T>(create: (colors: Colors) => T) {
  const colors = useColors();
  return useMemo(() => create(colors), [create, colors]);
}
