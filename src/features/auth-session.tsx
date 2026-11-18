import type { Session } from '@supabase/supabase-js';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { supabase } from './supabase';

const AuthContext = createContext<{ session: Session | null; loading: boolean }>({
  session: null,
  loading: false,
});

export function AuthSessionProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabase !== null);

  useEffect(() => {
    if (!supabase) return;

    const { auth } = supabase;
    const { data: { subscription } } = auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    if (Platform.OS === 'web') return () => subscription.unsubscribe();

    function refreshWhileActive(state: typeof AppState.currentState) {
      if (state === 'active') void auth.startAutoRefresh();
      else void auth.stopAutoRefresh();
    }

    refreshWhileActive(AppState.currentState);
    const appState = AppState.addEventListener('change', refreshWhileActive);
    return () => {
      subscription.unsubscribe();
      appState.remove();
      void auth.stopAutoRefresh();
    };
  }, []);

  return <AuthContext.Provider value={{ session, loading }}>{children}</AuthContext.Provider>;
}

export function useAuthSession() {
  return useContext(AuthContext);
}
