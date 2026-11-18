import type { ImageSourcePropType } from 'react-native';

export type PitState = 'hello' | 'running' | 'working' | 'walking' | 'alert' | 'celebration';
type PitAsset = { animation: ImageSourcePropType | null; requiredFile: string; label: string };

// Register animation files after checking the approved character, motion, and edges.
export const pitAssets: Record<PitState, PitAsset> = {
  hello: { animation: null, requiredFile: 'pit_hello.gif', label: 'P.I.T. cumprimentando' },
  running: { animation: null, requiredFile: 'pit_running.gif', label: 'P.I.T. correndo' },
  working: { animation: null, requiredFile: 'pit_working.gif', label: 'P.I.T. pronto para trabalhar' },
  walking: { animation: null, requiredFile: 'pit_walking.gif', label: 'P.I.T. passeando' },
  alert: { animation: null, requiredFile: 'pit_alert.gif', label: 'P.I.T. em estado de atenção' },
  celebration: { animation: null, requiredFile: 'pit_celebration.gif', label: 'P.I.T. comemorando' },
};

export const pitFallback = require('../../assets/mascot/static/pit.png');
