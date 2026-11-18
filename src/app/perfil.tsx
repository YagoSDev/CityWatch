import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '../components/avatar';
import { CommunityRewards } from '../components/community-rewards';
import { Action, Notice } from '../components/form';
import { RewardPreview } from '../components/reward-preview';
import { Screen, useScreenText } from '../components/screen';
import { useAuthSession } from '../features/auth-session';
import { avatarUri, useProfile } from '../features/profile';
import { type Colors, useColors, useThemedStyles } from '../features/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { session, loading } = useAuthSession();
  const { profile, ready, editable } = useProfile();
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const body = useScreenText();
  const [settingsError, setSettingsError] = useState(false);

  return (
    <Screen title="Meu perfil" nativeHeader>
      <View style={styles.identity}>
        <View style={styles.avatarFrame}>
          <Avatar name={profile.name} uri={avatarUri(profile.avatar)} size={73} />
        </View>
        <View style={styles.identityCopy}>
          <Text style={styles.name}>{profile.name || (loading ? 'Carregando…' : 'Morador CityWatch')}</Text>
          <View style={styles.location}>
            <SymbolView name={{ ios: 'mappin', android: 'location_on' }} size={15} tintColor={colors.link} />
            <Text style={[body, styles.locationText]}>{profile.city} · {profile.state}</Text>
          </View>
          {profile.bio ? <Text style={body}>{profile.bio}</Text> : null}
          {!loading && !session && <Text style={styles.tag}>Perfil demonstrativo</Text>}
        </View>
      </View>
      {ready && !editable && <Notice error message="Não foi possível carregar o perfil salvo neste dispositivo." />}
      <Action title="Editar perfil" onPress={() => router.push('/editar-perfil')} disabled={!editable} />
      <Action title={session ? 'Gerenciar conta' : 'Entrar ou criar conta'} secondary
        disabled={loading} onPress={() => router.push('/conta')} />

      {session ? <CommunityRewards /> : !loading && (
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.heading}>Pontuação acumulada</Text>
          <Text style={styles.points}>120 pontos</Text>
          <Text style={body}>Saldo demonstrativo.</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>Nível e ranking local</Text>
        <Text style={styles.tag}>Demonstração</Text>
        <View style={styles.metrics}>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Nível comunitário</Text>
            <Text style={styles.metricValue}>Participante ativo</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricLabel}>Ranking local</Text>
            <Text style={styles.metricValue}>8ª posição</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>Conquistas e medalhas</Text>
        <Text style={styles.tag}>Demonstração</Text>
        <View style={styles.medal}>
          <SymbolView name={{ ios: 'medal.fill', android: 'military_tech' }} size={23} tintColor={colors.alert} />
          <Text style={body}>Primeira contribuição</Text>
        </View>
        <View style={styles.medal}>
          <SymbolView name={{ ios: 'star.circle.fill', android: 'stars' }} size={23} tintColor={colors.event} />
          <Text style={body}>Cuidado com o bairro</Text>
        </View>
      </View>

      {!loading && (
        <View style={styles.card}>
          <Text accessibilityRole="header" style={styles.heading}>Histórico de contribuições</Text>
          {session ? (
            <Action title="Ver meus relatos" secondary onPress={() => router.navigate('/relatar')} />
          ) : (
            <>
              <Text style={styles.tag}>Demonstração</Text>
              <Text style={body}>Relato de iluminação pública · 8 de novembro</Text>
              <Text style={body}>Relato de conservação de praça · 3 de novembro</Text>
            </>
          )}
        </View>
      )}

      <RewardPreview />

      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.heading}>Privacidade</Text>
        <Text style={body}>Nome, foto, cidade, estado e biografia deste perfil ficam neste dispositivo.</Text>
        <Text style={body}>Controle a permissão de localização nas configurações do sistema.</Text>
        <Action title="Abrir ajustes do aplicativo" secondary onPress={() => {
          setSettingsError(false);
          void Linking.openSettings().catch(() => setSettingsError(true));
        }} />
        {settingsError && <Notice error message="Não foi possível abrir os ajustes do aplicativo." />}
      </View>
    </Screen>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  identity: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14, backgroundColor: colors.soft, borderRadius: 22, padding: 16 },
  avatarFrame: { borderColor: colors.brand, borderRadius: 44, borderWidth: 2, padding: 3, backgroundColor: colors.surface },
  location: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationText: { flexShrink: 1 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  metric: { flexGrow: 1, flexBasis: 129, padding: 10, gap: 5, borderRadius: 12, backgroundColor: colors.background },
  metricLabel: { color: colors.muted, fontSize: 13, fontWeight: '600' },
  metricValue: { color: colors.text, fontSize: 16, fontWeight: '800' },
  identityCopy: { flexGrow: 1, flexShrink: 1, flexBasis: 160, gap: 4 },
  name: { color: colors.text, fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  tag: { color: colors.link, fontSize: 13, fontWeight: '700' },
  card: { gap: 8, borderRadius: 18, padding: 16, backgroundColor: colors.surface },
  heading: { color: colors.text, fontSize: 18, fontWeight: '800' },
  points: { color: colors.link, fontSize: 28, fontWeight: '900' },
  medal: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
