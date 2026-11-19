import { usePathname, useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Keyboard, Modal, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { activities, useActivity } from '../features/activity';
import { clampDockY, pitContext, pitDockBounds } from '../features/pit-context';
import { useReducedMotion } from '../features/reduced-motion';
import { type Colors, useColors, useThemedStyles } from '../features/theme';
import { CityWatchMascot } from './city-watch-mascot';

/** Lives outside the Stack: remains attached to the viewport while pages scroll or change. */
export function PitCompanion({ onReplay }: { onReplay: () => void }) {
  const path = usePathname();
  const router = useRouter();
  const activity = useActivity();
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const bounds = useMemo(() => pitDockBounds(width, height, insets.top, insets.bottom), [width, height, insets.top, insets.bottom]);
  const [dock, setDock] = useState({ side: 'right', y: height * 0.53 });
  const anchor = useMemo(() => ({ x: dock.side === 'right' ? bounds.right : bounds.left, y: clampDockY(dock.y, bounds) }), [bounds, dock]);
  const [position] = useState(() => new Animated.ValueXY({ x: bounds.right, y: clampDockY(height * 0.53, bounds) }));
  const [panel, setPanel] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const [hiddenPath, setHiddenPath] = useState<string>();
  const pending = useRef<(() => void) | null>(null);
  const context = pitContext(path);
  const current = activities.find(item => item.id === activity.session?.activity);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboard(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboard(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    if (reduced) { position.setValue(anchor); return; }
    const snap = Animated.spring(position, { toValue: anchor, useNativeDriver: true, damping: 22, stiffness: 220, mass: 0.8 });
    snap.start();
    return () => snap.stop();
  }, [anchor, position, reduced]);

  const pan = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponderCapture: (_, g) => Math.abs(g.dx) > 8 || Math.abs(g.dy) > 8,
    onPanResponderGrant: () => position.stopAnimation(),
    onPanResponderMove: (_, g) => position.setValue({
      x: Math.min(bounds.right, Math.max(bounds.left, anchor.x + g.dx)),
      y: clampDockY(anchor.y + g.dy, bounds),
    }),
    onPanResponderRelease: (_, g) => {
      const inward = dock.side === 'right' ? -g.dx : g.dx;
      const pulled = inward > 42 && Math.abs(g.dx) > Math.abs(g.dy);
      const side = pulled ? dock.side : anchor.x + g.dx > width / 2 ? 'right' : 'left';
      setDock({ side, y: clampDockY(anchor.y + g.dy, bounds) });
      if (pulled) setPanel(true);
    },
    onPanResponderTerminate: () => position.setValue(anchor),
  }), [anchor, bounds, dock.side, position, width]);

  function afterClose(action: () => void) {
    pending.current = action;
    setPanel(false);
    // iOS must dismiss its current presentation before opening the activity modal.
    if (Platform.OS !== 'ios') { pending.current = null; action(); }
  }

  const hidden = keyboard || hiddenPath === path || activity.dialog !== null || ['/conta', '/editar-perfil'].includes(path);
  return <>
    {!hidden && <Animated.View {...pan.panHandlers} style={[styles.dockPosition, { transform: position.getTranslateTransform() }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Abrir P.I.T. ${context.title}`}
        accessibilityHint="Toque ou puxe para o centro. Arraste para cima ou para baixo para mudar a posição."
        testID="pit-companion" onPress={() => setPanel(true)} style={styles.dock}>
        <View style={styles.grip} />
        <CityWatchMascot state={current?.pit ?? 'hello'} size={49} />
        <Text maxFontSizeMultiplier={1.2} style={styles.dockLabel}>P.I.T.</Text>
        {activity.session && <View style={[styles.dot, { backgroundColor: activity.expired ? colors.alert : colors.security }]} />}
      </Pressable>
    </Animated.View>}

    <Modal visible={panel} transparent animationType={reduced ? 'none' : 'fade'} onRequestClose={() => setPanel(false)}
      onDismiss={() => { const action = pending.current; pending.current = null; action?.(); }}>
      {panel && <View style={styles.shade}>
        <Pressable style={StyleSheet.absoluteFill} accessibilityRole="button" accessibilityLabel="Fechar painel P.I.T." onPress={() => setPanel(false)} />
        <View accessibilityViewIsModal style={[styles.panel, { maxHeight: height - insets.top - insets.bottom - 24, marginBottom: insets.bottom + 12 }]}>
          <ScrollView contentContainerStyle={styles.panelContent} showsVerticalScrollIndicator={false}>
            <View style={styles.top}>
              <Text style={styles.eyebrow}>SEU COMPANHEIRO CITYWATCH</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Fechar P.I.T." style={styles.close} onPress={() => setPanel(false)}>
                <SymbolView name="xmark" size={18} tintColor={colors.text} />
              </Pressable>
            </View>
            <CityWatchMascot state={current?.pit ?? 'hello'} size={135} />
            <Text accessibilityRole="header" style={styles.title}>{context.title}</Text>
            <Text style={styles.message}>{context.message}</Text>
            {activity.session && <Text style={styles.session}>{current?.label} · {activity.expired ? 'Tempo encerrado' : `${Math.ceil(Math.max(0, activity.session.endsAt - activity.now) / 60000)} min restantes`}</Text>}
            <Pressable accessibilityRole="button" style={styles.primary} onPress={() => afterClose(activity.open)}>
              <Text style={styles.primaryText}>{activity.session ? 'Gerenciar minha atividade' : 'Planejar uma atividade'}</Text>
            </Pressable>
            <View style={styles.shortcuts}>
              <Pressable accessibilityRole="button" style={styles.shortcut} onPress={() => afterClose(() => router.push('/mapa'))}>
                <SymbolView name="map" size={21} tintColor={colors.link} /><Text style={styles.link}>Mapa</Text>
              </Pressable>
              <Pressable accessibilityRole="button" style={styles.shortcut} onPress={() => afterClose(() => router.push('/agenda'))}>
                <SymbolView name="calendar" size={21} tintColor={colors.link} /><Text style={styles.link}>Agenda</Text>
              </Pressable>
              <Pressable accessibilityRole="button" style={styles.shortcut} onPress={() => afterClose(() => router.push('/nova-ocorrencia'))}>
                <SymbolView name="plus.bubble" size={21} tintColor={colors.link} /><Text style={styles.link}>Relatar</Text>
              </Pressable>
            </View>
            <Pressable accessibilityRole="button" style={styles.hide} onPress={() => afterClose(onReplay)}>
              <Text style={styles.link}>Rever apresentação do P.I.T.</Text>
            </Pressable>
            <Pressable accessibilityRole="button" style={styles.hide} onPress={() => { setHiddenPath(path); setPanel(false); }}>
              <Text style={styles.note}>Recolher P.I.T. nesta tela</Text>
            </Pressable>
            <Text style={styles.note}>Dicas de navegação e sessões locais. Nenhum GPS é ativado por este painel.</Text>
          </ScrollView>
        </View>
      </View>}
    </Modal>
  </>;
}
const createStyles = (c: Colors) => StyleSheet.create({
  dockPosition: { position: 'absolute', left: 0, top: 0, zIndex: 8 },
  dock: { width: 56, minHeight: 82, paddingVertical: 5, alignItems: 'center', borderRadius: 20, backgroundColor: c.surface,
    borderWidth: 1, borderColor: c.link, boxShadow: '0 3px 12px #00000025' },
  grip: { width: 16, height: 3, backgroundColor: c.border, borderRadius: 2, marginBottom: 1 },
  dockLabel: { color: c.link, fontSize: 10, fontWeight: '900' }, dot: { width: 7, height: 7, borderRadius: 4, position: 'absolute', right: 5, top: 7 },
  shade: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 12, backgroundColor: '#080B1580' },
  panel: { width: '100%', maxWidth: 490, backgroundColor: c.surface, borderRadius: 28, borderWidth: 1, borderColor: c.border, overflow: 'hidden' },
  panelContent: { padding: 20, gap: 12 }, top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  eyebrow: { color: c.link, fontSize: 10, fontWeight: '800', letterSpacing: 1, flex: 1 }, close: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  title: { color: c.text, fontSize: 24, textAlign: 'center', fontWeight: '900' }, message: { color: c.muted, fontSize: 15, lineHeight: 22, textAlign: 'center' },
  session: { color: c.link, textAlign: 'center', fontSize: 14, fontWeight: '700' },
  primary: { minHeight: 50, borderRadius: 17, justifyContent: 'center', alignItems: 'center', backgroundColor: c.action, padding: 12 },
  primaryText: { color: c.onAction, fontSize: 15, fontWeight: '800', textAlign: 'center' },
  shortcuts: { flexDirection: 'row', gap: 8 }, shortcut: { flex: 1, minHeight: 66, gap: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: c.soft, borderRadius: 16 },
  link: { color: c.link, fontWeight: '700', fontSize: 12 }, hide: { minHeight: 44, justifyContent: 'center', alignItems: 'center' },
  note: { color: c.muted, fontSize: 12, textAlign: 'center', lineHeight: 17 },
});
