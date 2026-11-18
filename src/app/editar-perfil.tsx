import { launchImageLibraryAsync } from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Keyboard, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../components/avatar';
import { Action, Field, Notice } from '../components/form';
import { Screen, useScreenText } from '../components/screen';
import { useAuthSession } from '../features/auth-session';
import { findCity } from '../features/city';
import { avatarUri, states, useProfile, type Profile } from '../features/profile';

export default function EditProfileScreen() {
  const { session } = useAuthSession();
  const { profile, editable, ready } = useProfile();

  if (!editable) {
    return <Screen nativeHeader>
      <Notice error={ready} message={ready ? 'O perfil está indisponível.' : 'Carregando o perfil…'} />
    </Screen>;
  }

  return <EditProfileForm key={session?.user.id ?? 'demo'} profile={profile} />;
}

function EditProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const { save } = useProfile();
  const body = useScreenText();
  const [draft, setDraft] = useState(profile);
  const [photo, setPhoto] = useState<string>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);

  function change(field: keyof Profile, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function choosePhoto() {
    if (busyRef.current) return;
    Keyboard.dismiss();
    setError('');
    busyRef.current = true;
    setBusy(true);

    try {
      const result = await launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.65,
        exif: false,
      });
      if (!result.canceled) setPhoto(result.assets[0].uri);
    } catch {
      setError('Não foi possível abrir a fototeca.');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function submit() {
    if (busyRef.current) return;
    const updated = { ...draft, name: draft.name.trim(), city: draft.city.trim(), state: draft.state.trim().toUpperCase(), bio: draft.bio.trim() };

    if (!updated.name || !updated.city || !states.includes(updated.state)) {
      setError('Informe seu nome, a cidade e uma sigla de estado válida, como SP ou RJ.');
      return;
    }

    setError('');
    busyRef.current = true;
    setBusy(true);
    Keyboard.dismiss();
    try {
      const knownCity = findCity(updated.city, updated.state);
      await save({ ...updated, city: knownCity?.name ?? updated.city }, photo);
      if (router.canGoBack()) router.back();
      else router.replace('/perfil');
    } catch {
      setError('Não foi possível salvar as alterações no dispositivo. Tente de novo.');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  return (
    <Screen nativeHeader>
      <View style={styles.preview}><Avatar name={draft.name} uri={photo ?? avatarUri(draft.avatar)} size={84} /></View>
      <Action title="Escolher foto" onPress={() => void choosePhoto()} secondary disabled={busy} />
      {(photo || draft.avatar) && <Action title="Remover foto" secondary disabled={busy} onPress={() => {
        setPhoto(undefined);
        setDraft((current) => ({ ...current, avatar: undefined }));
      }} />}
      <Field label="Nome" value={draft.name} onChangeText={(value) => change('name', value)} maxLength={60} autoCapitalize="words" editable={!busy} />
      <Field label="Cidade" value={draft.city} onChangeText={(value) => change('city', value)} maxLength={65} autoCapitalize="words" editable={!busy} />
      <Field label="Estado (UF)" value={draft.state} onChangeText={(value) => change('state', value.toUpperCase())}
        maxLength={2} autoCapitalize="characters" autoCorrect={false} editable={!busy} />
      <Field label="Biografia (opcional)" value={draft.bio} onChangeText={(value) => change('bio', value)} multiline maxLength={240} editable={!busy} />
      <Text style={body}>Os dados do perfil ficam neste dispositivo. A cidade e o estado definem a imagem do cabeçalho.</Text>
      {error ? <Notice message={error} error /> : null}
      <Action title="Salvar alterações" onPress={() => void submit()} disabled={busy} />
    </Screen>
  );
}

const styles = StyleSheet.create({ preview: { alignSelf: 'center' } });
