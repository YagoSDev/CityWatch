import { DarkTheme, DefaultTheme, Stack, ThemeProvider, usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useCallback, useState } from 'react';
import { CityLogo } from '../components/city-logo';
import { Welcome } from '../components/welcome';
import { PitCompanion } from '../components/pit-companion';
import { PitExperience } from '../components/pit-experience';
import { EventsProvider } from '../features/events';
import { DiscoveryProvider } from '../features/discovery';
import { ActivityProvider } from '../features/activity';
import { AuthSessionProvider } from '../features/auth-session';
import { ForegroundLocationProvider } from '../features/foreground-location';
import { ProfileProvider } from '../features/profile';
import { useColors } from '../features/theme';

export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  const colors = useColors();
  const base = colors.dark ? DarkTheme : DefaultTheme;
  const theme = {
    ...base,
    colors: { ...base.colors, primary: colors.link, background: colors.background, card: colors.surface,
      text: colors.text, border: colors.border, notification: colors.brand },
  };

  return (
    <AuthSessionProvider>
      <ProfileProvider>
        <ForegroundLocationProvider>
          <ThemeProvider value={theme}>
            <EventsProvider>
            <DiscoveryProvider>
            <ActivityProvider>
              <AppExperience />
            </ActivityProvider>
            </DiscoveryProvider>
            </EventsProvider>
          </ThemeProvider>
        </ForegroundLocationProvider>
      </ProfileProvider>
    </AuthSessionProvider>
  );
}

function AppExperience() {
  const [welcoming, setWelcoming] = useState(true);
  const dismiss = useCallback(() => setWelcoming(false), []);
  const replay = useCallback(() => setWelcoming(true), []);
  return <View style={styles.fill}>
    <RootNavigation />
    {welcoming ? <Welcome onDismiss={dismiss} /> : <><PitCompanion onReplay={replay} /><PitExperience /></>}
  </View>;
}

function RootNavigation() {
  const path = usePathname();
  const router = useRouter();
  const colors = useColors();

  return (
    <View style={styles.fill}>
      {path !== '/' && <StatusBar style={['/nova-ocorrencia', '/comunidade', '/detalhe-evento'].includes(path) || colors.dark ? 'light' : 'dark'} />}
      <View style={styles.fill}>
        <Stack screenOptions={{ headerTintColor: colors.link, headerTitleStyle: { color: colors.text },
          headerStyle: { backgroundColor: colors.background }, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="perfil" options={{ title: '', headerBackTitle: 'Voltar' }} />
          <Stack.Screen name="editar-perfil" options={{ title: 'Editar perfil', headerBackTitle: 'Perfil' }} />
          <Stack.Screen name="conta" options={{ title: 'Conta', headerBackTitle: 'Voltar' }} />
          <Stack.Screen name="nova-ocorrencia" options={{ title: 'CityWatch', headerTitleAlign: 'center',
            headerTitle: () => <View style={styles.reportBrand}><CityLogo size={26} /><Text accessibilityRole="header" style={styles.reportTitle}>CityWatch</Text></View>,
            headerTintColor: '#FFFFFF', headerTitleStyle: { color: '#FFFFFF', fontWeight: '800' },
            headerStyle: { backgroundColor: '#E9004B' }, headerBackVisible: false,
            headerLeft: () => <Pressable accessibilityRole="button" accessibilityLabel="Voltar"
              onPress={() => router.canGoBack() ? router.back() : router.navigate('/')} style={styles.reportBack}>
              <SymbolView name="chevron.left" size={21} tintColor="#FFFFFF" />
              <Text style={styles.reportBackText}>Voltar</Text>
            </Pressable>,
          }} />
          <Stack.Screen name="ocorrencias" options={{ title: 'Demonstração acadêmica', headerBackTitle: 'Voltar' }} />
          <Stack.Screen name="detalhe-ocorrencia" options={{ title: 'Ocorrência', headerBackTitle: 'Voltar' }} />
          <Stack.Screen name="recursos-comunidade" options={{ title: 'Recursos da comunidade', headerBackTitle: 'Voltar' }} />
          <Stack.Screen name="detalhe-evento" options={{ headerShown: false }} />
          <Stack.Screen name="agenda" options={{ title: 'Agenda', headerBackTitle: 'Início' }} />
          <Stack.Screen name="detalhe-agenda" options={{ title: 'Data da Agenda', headerBackTitle: 'Agenda' }} />
          <Stack.Screen name="mapa" options={{ title: 'Mapa', headerBackTitle: 'Início' }} />
          <Stack.Screen name="detalhe-mapa" options={{ title: 'Detalhes', headerBackTitle: 'Mapa' }} />
        </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 }, reportBrand: { flexDirection: 'row', alignItems: 'center', gap: 7 }, reportBack: { flexDirection: 'row', alignItems: 'center', gap: 3, minHeight: 44 }, reportTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' }, reportBackText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' } });
