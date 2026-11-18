import { useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
/** Atualiza os recortes de tempo sem executar Date.now durante renderização. */
export function useNow() {
  const [now, setNow] = useState(Date.now);
  const focused = useIsFocused();
  useEffect(() => {
    if (!focused) return;
    const refresh = () => setNow(Date.now());
    const initial = setTimeout(refresh, 0);
    const timer = setInterval(refresh, 60000);
    const listener = AppState.addEventListener('change', state => { if (state === 'active') refresh(); });
    return () => { clearTimeout(initial); clearInterval(timer); listener.remove(); };
  }, [focused]);
  return now;
}
