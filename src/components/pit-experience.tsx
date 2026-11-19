import { BlurView } from 'expo-blur';
import { StatusBar } from 'expo-status-bar';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { activities, useActivity } from '../features/activity';
import { useProfile } from '../features/profile';
import { useReducedMotion } from '../features/reduced-motion';
import { type Colors, useColors, useThemedStyles } from '../features/theme';
import { ActivityDashboard } from './activity-dashboard';
import { CityWatchMascot } from './city-watch-mascot';
import { Action, Field, Notice } from './form';

export function PitExperience() {
  const activity = useActivity();
  const { ready: profileReady } = useProfile();
  const colors = useColors();
  const styles = useThemedStyles(createStyles);
  const reduced = useReducedMotion();
  const insets = useSafeAreaInsets();
  const [duration, setDuration] = useState('30');
  const chosen = activities.find((item) => item.id === activity.draft);
  const current = activities.find((item) => item.id === activity.session?.activity);
  const visible = profileReady && activity.dialog !== null;

  return (
    <>
      {activity.expired && !activity.noticeDismissed && !visible && (
        <View pointerEvents="box-none" style={[styles.noticeFrame, { top: insets.top + 8 }]}>
          <View style={styles.notice}>
            <View style={styles.noticeCopy}>
              <Text accessibilityRole="alert" style={styles.noticeTitle}>O tempo de {current?.label.toLowerCase()} terminou.</Text>
              <Text style={styles.note}>Você pode prolongar ou finalizar sua sessão.</Text>
            </View>
            <Pressable accessibilityRole="button" onPress={activity.open} style={styles.noticeAction}>
              <Text style={styles.link}>Gerenciar</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel="Dispensar aviso da sessão"
              onPress={activity.dismissNotice} style={styles.dismiss}>
              <SymbolView name={{ ios: 'xmark', android: 'close' }} size={17} tintColor={colors.muted} />
            </Pressable>
          </View>
        </View>
      )}

      <Modal visible={visible} transparent presentationStyle="overFullScreen"
        animationType={reduced ? 'none' : 'fade'} onRequestClose={activity.close}>
        {visible && <>
          <StatusBar style="light" />
          <BlurView intensity={28} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[styles.overlay, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 12 }]}>
            <View style={styles.dialog} accessibilityViewIsModal>
              <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets showsVerticalScrollIndicator={false}>
                <View style={styles.top}>
                  <Text style={styles.pitName}>P.I.T. <Text style={styles.pitSubtitle}>· CityWatch</Text></Text>
                  <Pressable accessibilityRole="button" accessibilityLabel="Fechar P.I.T."
                    onPress={activity.close} disabled={activity.busy} style={styles.dismiss}>
                    <SymbolView name={{ ios: 'xmark', android: 'close' }} size={18} tintColor={colors.muted} />
                  </Pressable>
                </View>
                {activity.dialog !== 'manage' && <CityWatchMascot state={activity.dialog === 'celebration' ? 'celebration' :
                  activity.dialog === 'duration' ? chosen?.pit : 'hello'} size={155} />}

                {activity.dialog === 'activity' && <>
                  <Text accessibilityRole="header" style={styles.title}>E aí! O que você está pensando em fazer agora?</Text>
                  <View style={styles.activities}>
                    {activities.map(({ id, label, icon }) => (
                      <Pressable key={id} accessibilityRole="button" accessibilityLabel={label}
                        onPress={() => activity.choose(id)} disabled={activity.busy} style={styles.activity}>
                        <SymbolView name={icon} size={22} tintColor={colors.link} />
                        <Text style={styles.activityText}>{label}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>}

                {activity.dialog === 'duration' && <>
                  <Text accessibilityRole="header" style={styles.title}>Por quanto tempo?</Text>
                  <Text style={styles.copy}>{chosen?.message}</Text>
                  <View style={styles.presets}>
                    {[15, 30, 60, 120].map((minutes) => (
                      <Pressable key={minutes} accessibilityRole="button" accessibilityLabel={`${minutes} minutos`}
                        accessibilityState={{ selected: Number(duration) === minutes }}
                        disabled={activity.busy} onPress={() => setDuration(String(minutes))}
                        style={[styles.preset, Number(duration) === minutes && styles.presetSelected]}>
                        <Text style={[styles.link, Number(duration) === minutes && styles.selectedText]}>{minutes} min</Text>
                      </Pressable>
                    ))}
                  </View>
                  <Field label="Duração em minutos" value={duration} onChangeText={setDuration} keyboardType="number-pad"
                    maxLength={3} editable={!activity.busy} />
                  {chosen?.id === 'dirigir' && <Notice message="Configure a sessão antes de dirigir. Durante a direção, mantenha o celular guardado." />}
                  <Action title="Iniciar sessão" disabled={activity.busy || !activity.ready}
                    onPress={() => void activity.start(Number(duration))} />
                  <Action title="Trocar atividade" secondary disabled={activity.busy} onPress={activity.change} />
                </>}

                {activity.dialog === 'manage' && activity.ready && <>
                  <ActivityDashboard manage={false} />
                  <Action title="Prolongar por 15 minutos" secondary disabled={activity.busy}
                    onPress={() => void activity.extend(15)} />
                  <Action title="Trocar atividade" secondary disabled={activity.busy} onPress={activity.change} />
                  <Action title="Finalizar sessão" disabled={activity.busy} onPress={() => void activity.finish()} />
                </>}

                {activity.dialog === 'celebration' && <>
                  <Text accessibilityRole="header" style={styles.title}>Sessão finalizada!</Text>
                  <Text style={styles.copy}>Você concluiu sua atividade. Até a próxima!</Text>
                  <Action title="Voltar ao CityWatch" onPress={activity.close} />
                </>}

                {activity.error ? <>
                  <Notice error message={activity.error} />
                  {!activity.ready && <Action title="Tentar carregar sessão" onPress={activity.retry} />}
                </> : null}

                {activity.dialog !== 'celebration' && <Action
                  title={activity.dialog === 'manage' ? 'Continuar no aplicativo' : 'Ignorar por agora'}
                  secondary onPress={activity.close} disabled={activity.busy} />}
                <Text style={styles.note}>A sessão controla apenas o tempo escolhido neste aparelho.</Text>
              </ScrollView>
            </View>
          </View>
        </>}
      </Modal>
    </>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18, backgroundColor: '#080B158C' },
  dialog: { width: '100%', maxWidth: 460, maxHeight: '100%', borderRadius: 28, overflow: 'hidden',
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  content: { padding: 20, gap: 13 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pitName: { color: colors.link, fontSize: 19, fontWeight: '900' },
  pitSubtitle: { color: colors.muted, fontSize: 14, fontWeight: '500' },
  title: { color: colors.text, textAlign: 'center', fontSize: 25, letterSpacing: -0.6, fontWeight: '800' },
  copy: { color: colors.muted, fontSize: 16, lineHeight: 23, textAlign: 'center' },
  activities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  activity: { flexGrow: 1, flexBasis: '45%', minHeight: 68, flexDirection: 'row', justifyContent: 'center',
    alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 12, borderRadius: 15, backgroundColor: colors.soft },
  activityText: { color: colors.text, fontWeight: '700', fontSize: 15, flexShrink: 1 },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  preset: { flexGrow: 1, minHeight: 44, padding: 10, justifyContent: 'center', alignItems: 'center', borderRadius: 12,
    backgroundColor: colors.soft },
  presetSelected: { backgroundColor: colors.action },
  selectedText: { color: colors.onAction },
  note: { color: colors.muted, fontSize: 12 },
  noticeFrame: { position: 'absolute', left: 12, right: 12, zIndex: 5 },
  notice: { alignSelf: 'center', maxWidth: 650, flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, borderRadius: 18, padding: 10,
    boxShadow: '0 4px 14px #00000025' },
  noticeCopy: { flex: 1, gap: 4 },
  noticeTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  noticeAction: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 7 },
  link: { color: colors.link, fontWeight: '700', fontSize: 13 },
  dismiss: { width: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center' },
});
