import { requireOptionalNativeModule } from 'expo';
import { useIsFocused } from 'expo-router';
import { AppState } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import type { ExpoSpeechRecognitionModuleType } from 'expo-speech-recognition/build/ExpoSpeechRecognitionModule.types';
import { startDictation } from './occurrence-draft';

// Importar o módulo obrigatório da biblioteca derrubaria o Expo Go.
const speech = requireOptionalNativeModule<ExpoSpeechRecognitionModuleType>('ExpoSpeechRecognition');
function nativeVoiceAvailable() {
  try { return !!speech && speech.isRecognitionAvailable() && speech.supportsOnDeviceRecognition(); }
  catch { return false; }
}
export function useOccurrenceVoice(onResult: (text: string) => void, onError: (message: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(nativeVoiceAvailable);
  const active = useRef(false);
  const mounted = useRef(false);
  const focused = useIsFocused();
  const allowed = useRef(false);
  const requesting = useRef(false);
  const callbacks = useRef({ onResult, onError });
  useEffect(() => { callbacks.current = { onResult, onError }; });
  useEffect(() => {
    allowed.current = focused;
    if (!focused && active.current) { speech?.abort(); active.current = false; setListening(false); }
  }, [focused]);
  useEffect(() => {
    mounted.current = true;
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') setSupported(nativeVoiceAvailable());
      if (state !== 'active' && active.current && !requesting.current) { speech?.abort(); active.current = false; setListening(false); }
    });
    return () => { mounted.current = false; subscription.remove(); };
  }, []);
  useEffect(() => {
    if (!speech) return;
    const subscriptions = [
      speech.addListener('result', event => {
        if (active.current && event.isFinal && event.results[0]?.transcript) callbacks.current.onResult(event.results[0].transcript);
      }),
      speech.addListener('error', event => {
        const localUnavailable = ['language-not-supported', 'service-not-allowed'].includes(event.error);
        if (localUnavailable) setSupported(false);
        if (active.current) callbacks.current.onError(localUnavailable ? 'O reconhecimento local em português não está disponível. Use o microfone do teclado do iPhone ou digite normalmente.' : 'Não foi possível transcrever. Revise o texto ou use o microfone do teclado do iPhone.');
        active.current = false; setListening(false);
      }),
      speech.addListener('end', () => { active.current = false; setListening(false); }),
    ];
    return () => { if (active.current) speech.abort(); subscriptions.forEach(subscription => subscription.remove()); };
  }, []);
  async function toggle() {
    if (listening) { speech?.stop(); return; }
    if (requesting.current) return;
    requesting.current = true;
    try { active.current = true; await startDictation(speech, () => mounted.current && allowed.current); if (mounted.current && active.current) setListening(true); }
    catch (error) { active.current = false; if (mounted.current) callbacks.current.onError((error as Error).message); }
    finally { requesting.current = false; }
  }
  function stop() { if (active.current) { speech?.abort(); active.current = false; setListening(false); } }
  return { listening, toggle, stop, supported };
}
