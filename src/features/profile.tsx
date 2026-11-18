import AsyncStorage from '@react-native-async-storage/async-storage';
import { randomUUID } from 'expo-crypto';
import { File, Paths } from 'expo-file-system';
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from 'react';
import { useAuthSession } from './auth-session';

export type Profile = { name: string; city: string; state: string; bio: string; avatar?: string };
export const states = 'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ');

const defaultProfile: Profile = { name: '', city: 'São Paulo', state: 'SP', bio: '' };

type ProfileContextValue = {
  profile: Profile;
  ready: boolean;
  editable: boolean;
  save: (profile: Profile, photoUri?: string) => Promise<void>;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function avatarUri(avatar?: string) {
  return avatar ? new File(Paths.document, avatar).uri : undefined;
}

function deleteAvatar(filename?: string) {
  if (!filename) return;
  try {
    const file = new File(Paths.document, filename);
    if (file.exists) file.delete();
  } catch {
    // An obsolete image must not interrupt saving the profile.
  }
}

export function ProfileProvider({ children }: PropsWithChildren) {
  const { session, loading } = useAuthSession();
  const key = `citywatch:profile:v1:${session?.user.id ?? 'demo'}`;
  const [snapshot, setSnapshot] = useState<{ key: string; profile: Profile; readFailed?: boolean }>();
  const current = snapshot?.key === key ? snapshot : undefined;

  useEffect(() => {
    if (loading) return;
    let active = true;

    void AsyncStorage.getItem(key).then((stored) => {
      if (!active) return;
      const profile = stored ? { ...defaultProfile, ...JSON.parse(stored) } as Profile : defaultProfile;
      setSnapshot({ key, profile });
    }).catch(() => {
      if (active) setSnapshot({ key, profile: defaultProfile, readFailed: true });
    });

    return () => { active = false; };
  }, [key, loading]);

  async function save(profile: Profile, photoUri?: string) {
    if (!current || current.readFailed || loading) throw new Error('Perfil ainda indisponível.');
    const updated = { ...profile };
    let created: string | undefined;

    try {
      if (photoUri) {
        const source = new File(photoUri);
        created = `avatar-${randomUUID()}${source.extension || '.jpg'}`;
        source.copy(new File(Paths.document, created));
        updated.avatar = created;
      }
      await AsyncStorage.setItem(key, JSON.stringify(updated));
    } catch (error) {
      deleteAvatar(created);
      throw error;
    }

    if (current.profile.avatar !== updated.avatar) deleteAvatar(current.profile.avatar);
    setSnapshot((previous) => previous?.key === key ? { key, profile: updated } : previous);
  }

  return (
    <ProfileContext.Provider value={{
      profile: current?.profile ?? defaultProfile,
      ready: !loading && current !== undefined,
      editable: current !== undefined && !current.readFailed,
      save,
    }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const value = useContext(ProfileContext);
  if (!value) throw new Error('ProfileProvider ausente.');
  return value;
}
