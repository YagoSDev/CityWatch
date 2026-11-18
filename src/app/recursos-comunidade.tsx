import { type Colors, useThemedStyles } from '../features/theme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CommunityAgenda } from '../components/community-agenda';
import { CommunityAlerts } from '../components/community-alerts';
import { CommunityRewards } from '../components/community-rewards';
import { Action } from '../components/form';
import { RewardPreview } from '../components/reward-preview';
import { InstitutionalPreview } from '../components/institutional-preview';
import { Screen, useScreenText } from '../components/screen';
import { communitySections } from '../features/demo';

export default function CommunityScreen() {
  const styles = useThemedStyles(createStyles);
  const screenText = useScreenText();
  const { secao, evento } = useLocalSearchParams<{ secao?: string; evento?: string }>();
  const router = useRouter();
  const section = communitySections.find(({ id }) => id === secao) ?? communitySections[0];

  return (
    <Screen title="Recursos da comunidade" nativeHeader>
      <View style={styles.filters}>
        {communitySections.map(({ id, title }) => (
          <Pressable key={id} accessibilityRole="button" accessibilityState={{ selected: id === section.id }}
            onPress={() => router.setParams({ secao: id, evento: '' })} style={[styles.filter, id === section.id && styles.selected]}>
            <Text style={[styles.filterText, id === section.id && styles.selectedText]}>{title}</Text>
          </Pressable>
        ))}
      </View>
      {section.id === 'eventos' ? (
        <CommunityAgenda eventId={evento} onSelect={(id) => id ? router.push({ pathname: '/detalhe-evento', params: { id } }) : router.push('/comunidade')} />
      ) : section.id === 'alertas' ? (
        <CommunityAlerts />
      ) : section.id === 'recompensas' ? (
        <>
          <CommunityRewards />
          <RewardPreview />
        </>
      ) : section.id === 'painel' ? (
        <InstitutionalPreview />
      ) : (
        <>
          <Text accessibilityRole="header" style={styles.heading}>Demonstração de segurança</Text>
          <Text style={screenText}>Explore avisos comunitários fictícios de áreas próximas a escolas e hospitais.</Text>
          <Action title="Abrir simulação de alertas" secondary onPress={() => router.setParams({ secao: 'alertas' })} />
        </>
      )}
    </Screen>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  heading: { color: colors.text, fontSize: 20, fontWeight: '800' },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filter: { backgroundColor: colors.soft, borderRadius: 12, minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' },
  selected: { backgroundColor: colors.action },
  filterText: { color: colors.link, fontWeight: '700' },
  selectedText: { color: colors.onAction },
});
