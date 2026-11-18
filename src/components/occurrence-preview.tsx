import { SymbolView } from 'expo-symbols';
import { Image, type ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native';
import type { OcorrenciaAcademica } from '../features/academic-api';
import { occurrenceAppearance } from '../features/nearby-occurrences';
import { type Colors, useColors, useThemedStyles } from '../features/theme';

const titles = {
  iluminação: 'Iluminação pública',
  acessibilidade: 'Acessibilidade',
  limpeza: 'Limpeza urbana',
  conservação: 'Conservação dos espaços',
};

export function OccurrencePreview({ item, width, image, onPress }: {
  item: OcorrenciaAcademica; width: number; image: ImageSourcePropType; onPress: () => void;
}) {
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const simulated = item.origem !== 'cidadao';
  const appearance = occurrenceAppearance(item.categoria, colors);

  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Abrir ${item.id}. ${item.descricao}. ${simulated ? 'Simulado' : 'Relato cidadão'}, não verificado.`}
      onPress={onPress} style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}>
      <View style={styles.photoFrame}>
        <Image source={image} style={styles.photo} resizeMode="cover" />
        <Text style={styles.imageNote}>Imagem ilustrativa</Text>
      </View>
      <View style={styles.copy}>
        <View style={styles.categoryRow}>
          <SymbolView name={appearance.icon} size={16} tintColor={appearance.tint} />
          <Text style={[styles.category, { color: appearance.tint }]}>{item.categoria}</Text>
          <Text style={styles.simulated}>{simulated ? 'Simulado' : 'Relato cidadão'}</Text>
        </View>
        <Text style={styles.title}>{titles[item.categoria]}</Text>
        <Text style={styles.description}>{item.descricao}</Text>
        <View style={styles.metaRow}>
          <SymbolView name={{ ios: 'mappin', android: 'location_on' }} size={13} tintColor={colors.muted} />
          <Text style={styles.meta}>{item.bairro}</Text>
        </View>
        <Text style={styles.meta}>{item.publicado_em ? new Date(item.publicado_em).toLocaleString('pt-BR') : `${item.data} · horário não informado`}</Text>
        <View style={styles.footer}>
          <Text style={styles.status}>{item.status}</Text>
          <Text style={styles.verification}>Não verificado</Text>
        </View>
      </View>
    </Pressable>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  card: { borderRadius: 22, backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border, overflow: 'hidden', boxShadow: '0 3px 10px #0000000B' },
  pressed: { opacity: 0.8 },
  photoFrame: { height: 130, backgroundColor: colors.soft },
  photo: { width: '100%', height: '100%' },
  imageNote: { position: 'absolute', bottom: 8, left: 10, color: '#FFFFFF', backgroundColor: '#111218C9',
    fontSize: 10, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 7, overflow: 'hidden' },
  copy: { gap: 8, padding: 14 },
  categoryRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 5 },
  category: { fontWeight: '800', fontSize: 12, flexGrow: 1 },
  simulated: { color: colors.link, backgroundColor: colors.soft, fontSize: 10, fontWeight: '700',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8, overflow: 'hidden' },
  title: { color: colors.text, fontWeight: '800', fontSize: 19, letterSpacing: -0.4 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  meta: { color: colors.muted, fontSize: 11, flexShrink: 1 },
  footer: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginTop: 2 },
  status: { color: colors.text, fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  verification: { color: colors.muted, fontSize: 11 },
});
