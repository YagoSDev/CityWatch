import { LinearGradient } from 'expo-linear-gradient';
import { Tabs, useRouter } from 'expo-router';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type Colors, useColors, useThemedStyles } from '../../features/theme';

const icons: Record<string, SymbolViewProps['name']> = {
  index: { ios: 'house.fill', android: 'home' },
  relatar: { ios: 'plus', android: 'add' },
  comunidade: { ios: 'person.2.fill', android: 'groups' },
};

export default function TabLayout() {
  const router = useRouter();
  const colors = useColors();
  const styles = useThemedStyles(createStyles);

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true }}
      tabBar={({ state, descriptors, emitter, navigateToTab, insets }) => (
        <View accessibilityRole="tablist" style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 9) }]}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const report = route.name === 'relatar';
            const options = descriptors[route.key]?.options;
            const title = route.name === 'comunidade' ? 'Comunidade' : options?.title ?? route.name;
            const tint = report ? colors.onAction : focused ? colors.link : colors.muted;

            return (
              <Pressable key={route.key} accessibilityRole="tab" accessibilityLabel={title}
                accessibilityState={{ selected: focused }} testID={`tab-${route.name}`}
                onPress={() => {
                  if (route.name === 'relatar') {
                    router.push('/nova-ocorrencia');
                    return;
                  }
                  const event = emitter.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                  if (!focused && !event.defaultPrevented) navigateToTab(route.key);
                }}
                onLongPress={() => emitter.emit({ type: 'tabLongPress', target: route.key })}
                style={({ pressed }) => [styles.button, report && styles.report, pressed && styles.pressed]}>
                {report && <LinearGradient pointerEvents="none" colors={[colors.brand, colors.action]}
                  style={styles.reportFill} />}
                <SymbolView name={icons[route.name]} size={report ? 26 : 23} weight="semibold" tintColor={tint} />
                <Text maxFontSizeMultiplier={1.45} adjustsFontSizeToFit minimumFontScale={0.85} numberOfLines={1} style={[styles.label, { color: tint }]}>{title}</Text>
                {!report && focused && <View style={styles.selected} />}
              </Pressable>
            );
          })}
        </View>
      )}>
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="relatar" options={{ title: 'Relatar' }} />
      <Tabs.Screen name="comunidade" options={{ title: 'Comunidade' }} />
    </Tabs>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 12,
    paddingTop: 5, borderTopLeftRadius: 25, borderTopRightRadius: 25, borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border, boxShadow: '0 -3px 15px #00000012' },
  button: { flex: 1, minHeight: 55, justifyContent: 'center', alignItems: 'center', gap: 4, paddingVertical: 5, paddingHorizontal: 2 },
  report: { flex: 1.08, minHeight: 61, borderRadius: 37, backgroundColor: colors.brand, marginHorizontal: 6,
    boxShadow: '0 4px 13px #A600393B' },
  reportFill: { ...StyleSheet.absoluteFill, borderRadius: 37 },
  label: { textAlign: 'center', fontSize: 12, fontWeight: '800' },
  selected: { position: 'absolute', height: 3, width: 31, borderRadius: 3, backgroundColor: colors.brand, bottom: 0 },
  pressed: { opacity: 0.75 },
});
