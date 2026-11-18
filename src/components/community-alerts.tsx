import { type Colors, useThemedStyles, useColors } from '../features/theme';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CityWatchMascot } from './city-watch-mascot';
import { Action } from './form';
import { useScreenText } from './screen';

const scenarios = [
  {
    id: 'chuva',
    title: 'Chuva intensa',
    area: 'Setor fictício Norte',
    message: 'O cenário representa chuva intensa durante um exercício de comunicação com moradores.',
  },
  {
    id: 'alagamento',
    title: 'Alagamento',
    area: 'Setor fictício Ribeira',
    message: 'O cenário representa acúmulo de água em vias públicas durante um exercício de comunicação com moradores.',
  },
] as const;

type Scenario = (typeof scenarios)[number];

export function CommunityAlerts() {
  const styles = useThemedStyles(createStyles);
  const colors = useColors();
  const screenText = useScreenText();
  const [active, setActive] = useState<Scenario | null>(null);

  return (
    <>
      <View style={styles.intro}>
        <SymbolView name={{ ios: 'bell.badge', android: 'notifications' }} tintColor={colors.link}
          size={22} accessible={false} accessibilityElementsHidden />
        <View style={styles.copy}>
          <Text accessibilityRole="header" style={styles.heading}>Simulação de alerta da Defesa Civil</Text>
          <Text style={screenText}>Exercício com dados fictícios, exibido apenas neste aparelho.</Text>
        </View>
      </View>
      {active ? (
        <>
          <View style={styles.active}>
            <CityWatchMascot state="alert" size={95} />
            <Text accessibilityRole="alert" style={styles.status}>Simulação em andamento</Text>
            <Text accessibilityRole="header" style={styles.heading}>{active.title}</Text>
            <Text style={styles.area}>{active.area}</Text>
            <Text style={screenText}>{active.message}</Text>
          </View>
          <Action title="Encerrar simulação" onPress={() => setActive(null)} secondary />
        </>
      ) : (
        <>
          <Text style={screenText}>Escolha um cenário para iniciar o exercício.</Text>
          {scenarios.map((scenario) => (
            <View key={scenario.id} style={styles.scenario}>
              <Text accessibilityRole="header" style={styles.heading}>{scenario.title}</Text>
              <Text style={styles.area}>{scenario.area}</Text>
              <Action title={`Simular ${scenario.title.toLowerCase()}`} onPress={() => setActive(scenario)} />
            </View>
          ))}
        </>
      )}
    </>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  intro: { backgroundColor: colors.soft, borderRadius: 16, padding: 16, flexDirection: 'row', gap: 10 },
  copy: { flex: 1, gap: 6 },
  heading: { color: colors.text, fontSize: 18, fontWeight: '800' },
  scenario: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 10 },
  active: {
    backgroundColor: colors.alertBg, borderRadius: 16, borderWidth: 1, borderColor: colors.alertBorder, padding: 16, gap: 10,
  },
  status: { color: colors.alert, fontWeight: '700', fontSize: 14 },
  area: { color: colors.link, fontWeight: '700', fontSize: 14 },
});
