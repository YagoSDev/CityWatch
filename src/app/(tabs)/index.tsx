import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useIsFocused, useLocalSearchParams, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { StatusBar } from 'expo-status-bar';
import { type ComponentRef, useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '../../components/avatar';
import { CityBackdrop } from '../../components/city-backdrop';
import { CityBrand } from '../../components/city-brand';
import { DiscoveryMap } from '../../components/discovery-map';
import { CommunityCarousel } from '../../components/community-carousel';
import { HomeAgenda } from '../../components/home-agenda';
import { activities, useActivity } from '../../features/activity';
import { useReducedMotion } from '../../features/reduced-motion';
import { findCity } from '../../features/city';
import { avatarUri, useProfile } from '../../features/profile';
import { type Colors, useColors, useThemedStyles } from '../../features/theme';
export default function HomeScreen() {
  const router = useRouter(); const colors = useColors(); const styles = useThemedStyles(createStyles);
  const insets = useSafeAreaInsets(); const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const { salto } = useLocalSearchParams<{ salto?: string }>(); const handledJump = useRef<string>(undefined);
  const activitySession = useActivity(); const currentActivity = activities.find(item => item.id === activitySession.session?.activity);
  const reduceMotion = useReducedMotion(); const { profile } = useProfile(); const city = findCity(profile.city, profile.state);
  const { width, height } = useWindowDimensions(); const heroHeight = Math.max(280, Math.min(390, height * 0.35));
  const isFocused = useIsFocused(); const [photoHeight, setPhotoHeight] = useState(heroHeight); const [photoUnderStatusBar, setPhotoUnderStatusBar] = useState(true);
  const pagePadding = width < 375 ? 14 : 18;
  useFocusEffect(useCallback(() => {
    if (!salto || handledJump.current === salto) return;
    const frame = requestAnimationFrame(() => { handledJump.current = salto; scroll.current?.scrollTo({ y: 0, animated: !reduceMotion }); });
    return () => cancelAnimationFrame(frame);
  }, [salto, reduceMotion]));
  return <View style={styles.screen}>
    {isFocused && <StatusBar style={photoUnderStatusBar || colors.dark ? 'light' : 'dark'} />}
    <ScrollView ref={scroll} contentInsetAdjustmentBehavior="never" showsVerticalScrollIndicator={false}
      scrollEventThrottle={32} onScroll={({ nativeEvent }) => setPhotoUnderStatusBar(nativeEvent.contentOffset.y < photoHeight - insets.top - 21)}>
        <View style={[styles.hero, { minHeight: heroHeight }]} onLayout={({ nativeEvent }) => setPhotoHeight(nativeEvent.layout.height)}>
          <CityBackdrop photo={city?.photo} />
          <LinearGradient pointerEvents="none" colors={['#080C18B3', '#080C1800', '#080C18BA', '#080C18F0']}
            locations={[0, 0.39, 0.72, 1]} style={StyleSheet.absoluteFill} />
          <LinearGradient pointerEvents="none" colors={[colors.photoFade, colors.background]} style={styles.fade} />

          <View style={[styles.heroContent, {
            paddingTop: insets.top + 6, paddingLeft: Math.max(19, insets.left), paddingRight: Math.max(19, insets.right),
          }]}>
            <View style={styles.heroTop}>
              <CityBrand />
              <Pressable accessibilityRole="button" accessibilityLabel="Abrir perfil" testID="home-profile"
                style={styles.avatarButton} onPress={() => router.push('/perfil')}>
                <Avatar name={profile.name} uri={avatarUri(profile.avatar)} size={43} />
              </Pressable>
            </View>
            <View style={styles.cityCopy}>
              <View style={styles.cityLine}>
                <SymbolView name={{ ios: 'mappin', android: 'location_on' }} tintColor={colors.onAction} size={15} />
                <Text accessibilityRole={city ? undefined : 'header'} style={styles.city}>{city?.name ?? profile.city} – {profile.state}</Text>
              </View>
              {city && <>
                <Text accessibilityRole="header" style={styles.landmark}>{city.landmark}</Text>
                <Text style={styles.landmarkDescription}>{city.description}</Text>
              </>}
            </View>
          </View>
        </View>

      <View style={[styles.page, { paddingLeft: Math.max(pagePadding, insets.left), paddingRight: Math.max(pagePadding, insets.right) }]}>
        <DiscoveryMap />
        <View style={{ gap: 10 }}>
          <Text accessibilityRole="header" style={styles.sectionTitle}>Acontece em {profile.city}</Text>
          <CommunityCarousel key={`${profile.city}:${profile.state}:${width}`} width={Math.min(width, 668) - Math.max(pagePadding, insets.left) - Math.max(pagePadding, insets.right)} />
        </View>
        <HomeAgenda />
        {activitySession.session && <Pressable accessibilityRole="button" accessibilityLabel="Gerenciar sessão de atividade" onPress={activitySession.open} style={styles.sessionChip}>
          <SymbolView name={currentActivity?.icon ?? 'clock'} size={17} tintColor={colors.link} /><Text style={styles.secondary}>{currentActivity?.label} · {activitySession.expired ? 'Tempo encerrado' : `${Math.ceil(Math.max(0, activitySession.session.endsAt - activitySession.now) / 60000)} min restantes`}</Text><Text style={styles.link}>Gerenciar</Text>
        </Pressable>}
        <View style={styles.links}>
          <Pressable accessibilityRole="button" onPress={activitySession.open} style={styles.textButton}><SymbolView name="sparkles" size={17} tintColor={colors.link} /><Text style={styles.link}>Planejar com P.I.T.</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/recursos-comunidade')} style={styles.textButton}><Text style={styles.link}>Mais recursos da cidade →</Text></Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push('/ocorrencias')} style={styles.textButton}><Text style={styles.link}>Demonstração acadêmica →</Text></Pressable>
        </View>
      </View>
    </ScrollView>
    {!photoUnderStatusBar && <View pointerEvents="none" style={[styles.statusScrim, { height: insets.top }]} />}
  </View>;
}
const createStyles = (colors: Colors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background }, statusScrim: { position: 'absolute', left: 0, right: 0, top: 0, backgroundColor: colors.background },
  hero: { backgroundColor: colors.fallbackTop, overflow: 'hidden' }, fade: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 40 },
  heroContent: { flexGrow: 1, width: '100%', maxWidth: 668, alignSelf: 'center', justifyContent: 'space-between', gap: 48, paddingBottom: 40 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' }, avatarButton: { padding: 2, backgroundColor: colors.onAction, borderWidth: 2, borderColor: colors.brand, borderRadius: 30 },
  cityCopy: { alignItems: 'flex-start', gap: 3 }, cityLine: { flexDirection: 'row', alignItems: 'center', gap: 6 }, city: { color: colors.onAction, fontSize: 15, fontWeight: '800', flexShrink: 1 },
  landmark: { color: colors.onAction, fontSize: 37, fontWeight: '900', letterSpacing: -1.4 }, landmarkDescription: { color: '#F3F2F5', fontSize: 15 },
  sectionTitle: { color: colors.text, fontSize: 25, fontWeight: '900', letterSpacing: -0.7 },
  page: { width: '100%', maxWidth: 668, alignSelf: 'center', gap: 24, paddingBottom: 30 }, divider: { height: 1, marginVertical: 3 },
  secondary: { color: colors.muted, fontSize: 13 }, link: { color: colors.link, fontSize: 13, fontWeight: '700' }, links: { gap: 2 },
  textButton: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 6 }, sessionChip: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 12, borderRadius: 14, backgroundColor: colors.soft },
});
