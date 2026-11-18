import { type Colors, useThemedStyles, useColors } from '../features/theme';
import type { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({ title, children, nativeHeader }: PropsWithChildren<{ title?: string; nativeHeader?: boolean }>) {
  const styles = useThemedStyles(createStyles);
  return (
    <SafeAreaView style={styles.screen} edges={nativeHeader ? ['bottom', 'left', 'right'] : ['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        {title && <Text accessibilityRole="header" style={styles.title}>{title}</Text>}
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { width: '100%', maxWidth: 620, alignSelf: 'center', padding: 20, gap: 14 },
  title: { color: colors.text, fontSize: 32, fontWeight: '800', letterSpacing: -1 },
});

export function useScreenText() {
  return { color: useColors().muted, fontSize: 16 };
}
