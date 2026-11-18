function hostOf(value: string) {
  try { return new URL(value.includes('://') ? value : `http://${value}`).hostname; }
  catch { return ''; }
}
function localHost(host: string) {
  return host === 'localhost' || host === '127.0.0.1' || host === '10.0.2.2' ||
    /^10\./.test(host) || /^192\.168\./.test(host) || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
}
export function resolveApiUrl(configured: string | undefined, metroAddress: string | undefined, development: boolean) {
  const configuredUrl = configured?.trim().replace(/\/+$/, '');
  const metroHost = metroAddress ? hostOf(metroAddress) : '';
  if (development && metroHost && localHost(metroHost) && (!configuredUrl || localHost(hostOf(configuredUrl)))) {
    // O servidor Python local acompanha o host do QR code, mesmo se o DHCP mudar o IP do Mac.
    const port = configuredUrl ? new URL(configuredUrl).port || '8000' : '8000';
    return `http://${metroHost}:${port}`;
  }
  if (configuredUrl) {
    const url = new URL(configuredUrl);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Endereço da API inválido. Use HTTP ou HTTPS.');
    return configuredUrl;
  }
  if (development) return 'http://127.0.0.1:8000';
  throw new Error('O endereço do servidor CityWatch ainda não foi configurado nesta versão.');
}
export async function requestApi<T>(url: string, options?: RequestInit, transport: typeof fetch = fetch): Promise<T> {
  let response: Response;
  const headers = new Headers(options?.headers);
  headers.set('Accept', 'application/json');
  if (options?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  try { response = await transport(url, { ...options, headers }); }
  catch (error) {
    if (options?.signal?.aborted || (error as Error).name === 'AbortError') {
      throw new Error('O servidor demorou a responder. Seu rascunho foi mantido; tente publicar novamente.');
    }
    throw new Error('Não foi possível conectar ao CityWatch. Mantenha o Mac e o iPhone na mesma rede Wi-Fi e o servidor Python ligado. Seu rascunho foi mantido.');
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 404 && url.endsWith('/relatos')) throw new Error('O servidor conectado está desatualizado. Reinicie o backend Python do CityWatch.');
    if (response.status >= 500) throw new Error('O servidor não conseguiu concluir a publicação. Seu rascunho foi mantido; tente novamente.');
    throw new Error(typeof payload?.detail === 'string' ? payload.detail : `O servidor recusou a solicitação (${response.status}). Revise os campos e tente novamente.`);
  }
  if (!payload) throw new Error('O servidor enviou uma resposta inválida. Seu rascunho foi mantido; tente novamente.');
  return payload as T;
}
