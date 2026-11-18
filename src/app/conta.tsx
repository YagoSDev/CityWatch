import { useState } from 'react';
import { Keyboard, Text } from 'react-native';
import { Action, Field, Notice } from '../components/form';
import { Screen, useScreenText } from '../components/screen';
import { useAuthSession } from '../features/auth-session';
import { supabase } from '../features/supabase';

const authMessages: Record<string, string> = {
  invalid_credentials: 'E-mail ou senha incorretos.',
  email_not_confirmed: 'Confirme seu e-mail antes de entrar.',
  email_address_invalid: 'Informe um endereço de e-mail válido.',
  email_address_not_authorized: 'O envio de confirmação está restrito a e-mails da equipe do projeto.',
  weak_password: 'Escolha uma senha mais forte.',
  over_email_send_rate_limit: 'Aguarde antes de solicitar outro e-mail.',
  over_request_rate_limit: 'Muitas tentativas. Aguarde e tente novamente.',
  signup_disabled: 'O cadastro de novas contas está indisponível.',
};

export default function AccountScreen() {
  const screenText = useScreenText();
  const { session, loading } = useAuthSession();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<{ message: string; error?: boolean } | null>(null);
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const signingUp = mode === 'signup';

  async function authenticate() {
    if (!supabase || busy) return;
    const address = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(address) || !password || (signingUp && password.length < 8)) {
      setStatus({
        message: signingUp ? 'Informe um e-mail válido e uma senha de pelo menos 8 caracteres.' : 'Informe seu e-mail e sua senha.',
        error: true,
      });
      return;
    }

    Keyboard.dismiss();
    setBusy(true);
    setStatus(null);
    try {
      const credentials = { email: address, password };
      const { data, error } = signingUp
        ? await supabase.auth.signUp(credentials)
        : await supabase.auth.signInWithPassword(credentials);

      if (error) {
        if (error.code === 'email_not_confirmed') setConfirmationEmail(address);
        setStatus({ message: authMessages[error.code ?? ''] ?? 'Não foi possível continuar. Tente novamente.', error: true });
        return;
      }

      setPassword('');
      if (signingUp && !data.session) {
        setMode('login');
        setConfirmationEmail(address);
        setStatus({ message: 'Confira sua caixa de entrada para confirmar o e-mail. Depois, volte para entrar.' });
      } else {
        setConfirmationEmail(null);
      }
    } catch {
      setStatus({ message: 'Não foi possível conectar. Verifique sua conexão e tente novamente.', error: true });
    } finally {
      setBusy(false);
    }
  }

  async function resendConfirmation() {
    if (!supabase || !confirmationEmail || busy) return;
    Keyboard.dismiss();
    setBusy(true);
    setStatus(null);
    try {
      const { error } = await supabase.auth.resend({ type: 'signup', email: confirmationEmail });
      setStatus(error ? {
        message: authMessages[error.code ?? ''] ?? 'Não foi possível reenviar a confirmação. Tente novamente.',
        error: true,
      } : {
        message: 'Confira sua caixa de entrada e a pasta de spam para encontrar o e-mail de confirmação.',
      });
    } catch {
      setStatus({ message: 'Não foi possível conectar. Verifique sua conexão e tente novamente.', error: true });
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!supabase || busy) return;
    setBusy(true);
    setStatus(null);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      setMode('login');
      setEmail('');
      setPassword('');
      setConfirmationEmail(null);
    } catch {
      setStatus({ message: 'Não foi possível sair da conta. Tente novamente.', error: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen nativeHeader>
      {!supabase ? (
        <Notice message="A conexão para entrar ou criar uma conta ainda está indisponível." />
      ) : loading ? (
        <Text style={screenText}>Carregando sua conta…</Text>
      ) : session ? (
        <>
          <Text style={screenText}>{session.user.email}</Text>
          <Action title={busy ? 'Saindo…' : 'Sair da conta'} onPress={signOut} disabled={busy} secondary />
        </>
      ) : (
        <>
          <Text style={screenText}>{signingUp ? 'Crie uma conta para registrar ocorrências.' : 'Entre para registrar e acompanhar suas ocorrências.'}</Text>
          <Field label="E-mail" value={email} onChangeText={(value) => {
            setEmail(value);
            if (confirmationEmail) {
              setConfirmationEmail(null);
              setStatus(null);
            }
          }} editable={!busy}
            inputMode="email" autoCapitalize="none" autoCorrect={false} autoComplete="email" />
          <Field label="Senha" value={password} onChangeText={setPassword} editable={!busy}
            secureTextEntry autoCapitalize="none" autoComplete={signingUp ? 'new-password' : 'current-password'}
            onSubmitEditing={authenticate} />
          <Action title={busy ? 'Aguarde…' : signingUp ? 'Criar conta' : 'Entrar'} onPress={authenticate} disabled={busy} />
          {confirmationEmail && (
            <Action title="Reenviar confirmação" onPress={resendConfirmation} disabled={busy} secondary />
          )}
          <Action title={signingUp ? 'Já tenho conta' : 'Criar uma conta'} secondary disabled={busy} onPress={() => {
            setMode(signingUp ? 'login' : 'signup');
            setPassword('');
            setConfirmationEmail(null);
            setStatus(null);
          }} />
        </>
      )}
      {status && <Notice {...status} />}
    </Screen>
  );
}
