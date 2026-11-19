export type StepSensor = {
  isAvailableAsync: () => Promise<boolean>;
  requestPermissionsAsync: () => Promise<{ granted: boolean }>;
};
/** Availability comes before permission: simulators never display a misleading zero count. */
export async function authorizeSteps(sensor: StepSensor): Promise<'ready' | 'unavailable' | 'denied'> {
  if (!await sensor.isAvailableAsync()) return 'unavailable';
  return (await sensor.requestPermissionsAsync()).granted ? 'ready' : 'denied';
}
export function validStepCount(value: number): number {
  if (!Number.isSafeInteger(value) || value < 0) throw new Error('Leitura de passos inválida.');
  return value;
}
