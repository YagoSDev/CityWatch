import Constants from 'expo-constants';
import { NativeModules } from 'react-native';
import { requestApi, resolveApiUrl } from './api-connection';

export const categorias = ['iluminação', 'acessibilidade', 'limpeza', 'conservação'] as const;
export const statuses = ['aberta', 'em análise', 'concluída'] as const;

export type Categoria = typeof categorias[number];
export type StatusAcademico = typeof statuses[number];
export type OcorrenciaAcademica = {
  id: string;
  categoria: Categoria;
  descricao: string;
  bairro: string;
  data: string;
  status: StatusAcademico;
  origem?: 'simulado' | 'cidadao';
  tipo?: string;
  etiquetas?: string[];
  publicado_em?: string;
  localidade?: string;
  referencia?: string;
  possui_anexo?: boolean;
};
export type EventoAcademico = {
  ocorrencia_id: string;
  status_anterior: StatusAcademico;
  status_novo: StatusAcademico;
  data: string;
  observacao: string;
};
export type AvisoImportacao = { arquivo: string; linha: number | null; id: string | null; erro: string };
export type Bairros = Record<string, Partial<Record<Categoria, OcorrenciaAcademica[]>>>;
type Medidas = { quantidade: number; percentual: number };
export type Indicadores = {
  total: number;
  pendencias: number;
  por_categoria: Record<Categoria, Medidas>;
  por_status: Record<StatusAcademico, Medidas>;
  tempo_medio_conclusao_dias: number | null;
  matriz: { categorias: Categoria[]; status: StatusAcademico[]; valores: number[][] };
  origem: {
    registros_validos: number;
    eventos_historicos: number;
    registros_rejeitados: number;
    concluidas_sem_historico: number;
    duracoes_concluidas: { id: string; abertura: string; conclusao: string; dias: number }[];
  };
  formulas: Record<string, string>;
  interpretacao: string;
};

export function academicApiUrl() {
  return resolveApiUrl(process.env.EXPO_PUBLIC_CITYWATCH_API_URL,
    Constants.expoConfig?.hostUri || Constants.expoGoConfig?.debuggerHost || NativeModules.SourceCode?.scriptURL,
    __DEV__);
}
export async function academicRequest<T>(path: string, options?: RequestInit): Promise<T> {
  return requestApi<T>(academicApiUrl() + path, options);
}

export function academicQuery(path: string, params: Record<string, string>) {
  const query = Object.entries(params)
    .filter(([, value]) => value)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join('&');
  return query ? `${path}?${query}` : path;
}
