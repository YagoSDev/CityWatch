type Position = { coords: { latitude: number; longitude: number } };
type Subscription = { remove: () => void };
export type ForegroundWatchDependencies = {
  permitted: () => Promise<boolean>;
  enabled: () => Promise<boolean>;
  watch: (receive: (position: Position) => void, failure: (reason: string) => void) => Promise<Subscription>;
};
/** Só verifica autorização existente. Nunca solicita permissão ou inicia tarefa de fundo. */
export function startForegroundWatch(deps: ForegroundWatchDependencies, receive: (p: Position) => void, unavailable: (reason: string) => void) {
  let active = true; let subscription: Subscription | undefined;
  void (async () => {
    if (!(await deps.permitted())) { if (active) unavailable('Use Minha localização para autorizar o GPS.'); return; }
    if (!active) return;
    if (!(await deps.enabled())) { if (active) unavailable('GPS desativado. Você pode explorar a cidade pelo mapa.'); return; }
    if (!active) return;
    const next = await deps.watch(p => { if (active) receive(p); }, reason => { if (active) unavailable(reason); });
    if (active) subscription = next; else next.remove();
  })().catch(() => { if (active) unavailable('Atualização de localização indisponível. Tente Minha localização.'); });
  return () => { active = false; subscription?.remove(); subscription = undefined; };
}
