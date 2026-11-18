export type CalendarExportDependencies = { read: (key: string) => Promise<string | null>; write: (key: string, value: string) => Promise<unknown>; open: () => Promise<'saved' | 'canceled' | 'done'> };
const pending = new Set<string>();
/** Não lê compromissos pessoais. Um envio interrompido exige revisão, sem repetição automática. */
export async function exportCalendarOnce(key: string, deps: CalendarExportDependencies) {
  if (pending.has(key)) return 'A inclusão deste evento já está em andamento.';
  pending.add(key);
  try {
    const previous = await deps.read(key);
    if (previous === 'saved') return 'Este evento já foi adicionado por este dispositivo. Confira no seu calendário.';
    if (previous) return 'Existe uma inclusão anterior sem confirmação. Revise o calendário do dispositivo antes de tentar novamente.';
    await deps.write(key, 'pending');
    let result: 'saved' | 'canceled' | 'done';
    try { result = await deps.open(); } catch (error) { await deps.write(key, ''); throw error; }
    try { await deps.write(key, result === 'saved' ? 'saved' : result === 'canceled' ? '' : 'review'); }
    catch { throw new Error('O calendário foi aberto, mas não conseguimos registrar o resultado. Confira seus compromissos antes de repetir.'); }
    return result === 'saved' ? 'Evento adicionado ao calendário do dispositivo.' : result === 'canceled' ? 'Inclusão cancelada. Nada foi confirmado na agenda.' : 'Confira no aplicativo de calendário se o evento foi incluído.';
  } finally { pending.delete(key); }
}
export function calendarExportKey(id: string, start: string, end: string) { return `citywatch:calendar-export:${encodeURIComponent(id)}:${Date.parse(start)}:${Date.parse(end)}`; }
