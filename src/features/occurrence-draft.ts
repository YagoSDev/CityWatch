// Identificadores estáveis. O tipo cidadão complementa a classificação acadêmica.
export const occurrenceTypes = [
  { id: 'acidente', label: 'Acidente', icon: 'car.side.hill.up.fill', category: 'acessibilidade' },
  { id: 'perigo', label: 'Perigo', icon: 'exclamationmark.triangle.fill', category: 'conservação' },
  { id: 'danos_urbanos', label: 'Danos urbanos', icon: 'wrench.and.screwdriver.fill', category: 'conservação' },
  { id: 'limpeza', label: 'Limpeza', icon: 'leaf.fill', category: 'limpeza' },
  { id: 'alagamento', label: 'Alagamento', icon: 'drop.fill', category: 'conservação' },
  { id: 'outros', label: 'Outros', icon: 'ellipsis.circle.fill', category: 'conservação' },
  { id: 'iluminacao', label: 'Iluminação', icon: 'lightbulb.fill', category: 'iluminação' },
  { id: 'acessibilidade', label: 'Acessibilidade', icon: 'figure.roll', category: 'acessibilidade' },
] as const;
export const tagGroups = [
  { label: 'Trânsito', tags: [['transito_acidente', 'Acidente'], ['transito_obstrucao', 'Via obstruída'], ['transito_sinalizacao', 'Sinalização']] },
  { label: 'Segurança', tags: [['seguranca_risco', 'Risco à segurança'], ['seguranca_area_atencao', 'Área de atenção']] },
  { label: 'Clima', tags: [['clima_alagamento', 'Alagamento'], ['clima_chuva', 'Chuva intensa']] },
  { label: 'Serviços urbanos', tags: [['urbano_iluminacao', 'Iluminação'], ['urbano_lixo', 'Lixo'], ['urbano_calcada', 'Calçada'], ['urbano_buraco', 'Buraco']] },
  { label: 'Acessibilidade', tags: [['acesso_rampa', 'Rampa'], ['acesso_piso_tatil', 'Piso tátil'], ['acesso_passagem', 'Passagem acessível']] },
] as const;
export const tagLabels: Record<string, string> = Object.fromEntries(tagGroups.flatMap<readonly [string, string]>(group => group.tags));
export const maxEvidenceBytes = 8 * 1024 * 1024;
export const evidenceMimes = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'video/mp4', 'video/quicktime'];
export function validateEvidence(mime: string, size: number) {
  if (!evidenceMimes.includes(mime)) throw new Error('Use imagem JPEG, PNG, HEIC ou vídeo MP4/MOV.');
  if (!Number.isFinite(size) || size <= 0 || size > maxEvidenceBytes) throw new Error('O arquivo deve ter no máximo 8 MB e não pode estar vazio.');
}
export function toggleTag(current: string[], id: string) {
  if (!tagLabels[id]) throw new Error('Etiqueta desconhecida.');
  if (current.includes(id)) return current.filter(value => value !== id);
  if (current.length >= 5) throw new Error('Você pode selecionar até cinco etiquetas.');
  return [...current, id];
}
export function validateCitizenDraft(type: string, description: string, location: string, coordinate?: { latitude: number; longitude: number } | null) {
  if (!occurrenceTypes.some(item => item.id === type)) throw new Error('Selecione o tipo de ocorrência.');
  if (!description.trim() || Array.from(description.trim()).length > 300) throw new Error('Descreva a ocorrência em até 300 caracteres.');
  if (!location.trim() && !validCoordinate(coordinate)) throw new Error('Use sua localização atual ou informe o local manualmente.');
}
export function insertTranscript(original: string, transcript: string) {
  return Array.from([original.trim(), transcript.trim()].filter(Boolean).join(' ')).slice(0, 300).join('');
}
export interface SpeechPort {
  isRecognitionAvailable(): boolean;
  supportsOnDeviceRecognition(): boolean;
  requestPermissionsAsync(): Promise<{ granted: boolean }>;
  start(options: { lang: string; interimResults: boolean; continuous: boolean; requiresOnDeviceRecognition: boolean; recordingOptions: { persist: boolean } }): void;
}
export async function startDictation(speech: SpeechPort | null, isCurrent: () => boolean = () => true) {
  if (!speech || !speech.isRecognitionAvailable() || !speech.supportsOnDeviceRecognition()) {
    throw new Error('Transcrição indisponível nesta versão ou dispositivo. Digite normalmente ou use o ditado do teclado do iPhone.');
  }
  if (!(await speech.requestPermissionsAsync()).granted) throw new Error('Microfone ou reconhecimento de fala não autorizado. Você pode digitar normalmente.');
  if (!isCurrent()) throw new Error('Ditado cancelado.');
  speech.start({ lang: 'pt-BR', interimResults: false, continuous: false, requiresOnDeviceRecognition: true, recordingOptions: { persist: false } });
}
export interface EvidencePort<T> {
  requestCameraPermissionsAsync(): Promise<{ granted: boolean }>;
  requestMediaLibraryPermissionsAsync(): Promise<{ granted: boolean }>;
  launchCameraAsync(options: object): Promise<T>;
  launchImageLibraryAsync(options: object): Promise<T>;
}
export async function pickEvidence<T>(port: EvidencePort<T>, camera: boolean) {
  const permission = camera ? await port.requestCameraPermissionsAsync() : await port.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) throw new Error('Acesso não autorizado. A evidência é opcional; você pode continuar sem ela.');
  return camera ? port.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8, exif: false }) :
    port.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.8, videoMaxDuration: 30, exif: false });
}
export interface LocationPort {
  requestForegroundPermissionsAsync(): Promise<{ granted: boolean }>;
  hasServicesEnabledAsync(): Promise<boolean>;
  read(): Promise<{ coords: { latitude: number; longitude: number; accuracy: number | null }; timestamp: number }>;
}
export async function captureLocation(port: LocationPort) {
  if (!(await port.requestForegroundPermissionsAsync()).granted) throw new Error('Localização não autorizada. Informe o local manualmente.');
  if (!(await port.hasServicesEnabledAsync())) throw new Error('Serviços de localização desativados. Informe o local manualmente.');
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const position = await Promise.race([port.read(), new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Não foi possível obter a localização. Informe o local manualmente.')), 12000);
    })]);
    if (!validCoordinate(position.coords)) throw new Error('O dispositivo retornou uma localização inválida. Tente novamente ou informe o local manualmente.');
    return { latitude: position.coords.latitude, longitude: position.coords.longitude,
      precisao: position.coords.accuracy !== null && Number.isFinite(position.coords.accuracy) && position.coords.accuracy >= 0 ? position.coords.accuracy : null, capturada_em: new Date(position.timestamp).toISOString() };
  } finally { clearTimeout(timer); }
}

export function validCoordinate(coordinate?: { latitude: number; longitude: number } | null) {
  return !!coordinate && Number.isFinite(coordinate.latitude) && Number.isFinite(coordinate.longitude) &&
    Math.abs(coordinate.latitude) <= 90 && Math.abs(coordinate.longitude) <= 180;
}
export type ResolvedAddress = { street?: string | null; district?: string | null; city?: string | null; subregion?: string | null; region?: string | null };
export async function resolveOccurrenceAddress(coordinate: { latitude: number; longitude: number }, reverse: (coordinate: { latitude: number; longitude: number }) => Promise<ResolvedAddress[]>) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const addresses = await Promise.race([reverse(coordinate), new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error('Endereço indisponível')), 6000);
    })]);
    const address = addresses[0];
    const parts = address ? [address.street, address.district, address.city || address.subregion, address.region].filter((part): part is string => !!part?.trim()) : [];
    return { localidade: [...new Set(parts)].join(', ').slice(0, 200) || 'Localização por GPS', bairro: address?.district?.slice(0, 120) || 'Localização por GPS' };
  } catch { return { localidade: 'Localização por GPS', bairro: 'Localização por GPS' }; }
  finally { clearTimeout(timer); }
}
