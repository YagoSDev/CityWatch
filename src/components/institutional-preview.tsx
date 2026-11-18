import { type Colors, useThemedStyles } from '../features/theme';
import { StyleSheet, Text, View } from 'react-native';
import { reportCategories } from '../features/reports';
import { useScreenText } from './screen';

const sample = [
  { category: 'iluminacao', open: 6, inReview: 3, resolved: 2 },
  { category: 'vias', open: 4, inReview: 2, resolved: 6 },
  { category: 'limpeza', open: 2, inReview: 1, resolved: 4 },
] as const;

export function InstitutionalPreview() {
  const styles = useThemedStyles(createStyles);
  const screenText = useScreenText();
  const total = sample.reduce((sum, { open, inReview, resolved }) => sum + open + inReview + resolved, 0);

  return (
    <>
      <View style={styles.summary}>
        <Text accessibilityRole="header" style={styles.heading}>Painel institucional</Text>
        <Text style={screenText}>Demonstração com dados fictícios</Text>
        <Text style={styles.total}>{total} ocorrências</Text>
      </View>
      {sample.map(({ category, open, inReview, resolved }) => (
        <View key={category} style={styles.card}>
          <Text accessibilityRole="header" style={styles.heading}>{reportCategories[category]}</Text>
          <Text style={screenText}>{open} abertas · {inReview} em análise · {resolved} resolvidas</Text>
        </View>
      ))}
    </>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  summary: { backgroundColor: colors.soft, borderRadius: 18, padding: 18, gap: 6 },
  card: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 8 },
  heading: { color: colors.text, fontSize: 18, fontWeight: '800' },
  total: { color: colors.link, fontSize: 28, fontWeight: '800' },
});
