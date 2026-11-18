import type { ComponentRef, Ref } from 'react';
import { type Colors, useThemedStyles, useColors } from '../features/theme';
import { Pressable, StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';

export function Field({ label, multiline, style, inputRef, ...props }: TextInputProps & { label: string; inputRef?: Ref<ComponentRef<typeof TextInput>> }) {
  const styles = useThemedStyles(createStyles);
  const colors = useColors();
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...props}
        ref={inputRef}
        accessibilityLabel={label}
        placeholderTextColor={colors.muted}
        multiline={multiline}
        style={[styles.input, multiline && styles.multiline, style]}
      />
    </View>
  );
}

export function Action({ title, onPress, disabled, secondary }: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  secondary?: boolean;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action, secondary && styles.secondary, (disabled || pressed) && styles.dimmed,
      ]}
    >
      <Text style={[styles.actionText, secondary && styles.secondaryText]}>{title}</Text>
    </Pressable>
  );
}

export function Notice({ message, error = false }: { message: string; error?: boolean }) {
  const styles = useThemedStyles(createStyles);
  return (
    <Text accessibilityRole="alert" style={[styles.notice, error && styles.error]}>
      {message}
    </Text>
  );
}

const createStyles = (colors: Colors) => StyleSheet.create({
  field: { gap: 6 },
  label: { color: colors.text, fontSize: 15, fontWeight: '700' },
  input: {
    minHeight: 48, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
    color: colors.text, fontSize: 16, paddingHorizontal: 12, paddingVertical: 10,
  },
  multiline: { minHeight: 108, textAlignVertical: 'top' },
  action: { minHeight: 48, backgroundColor: colors.action, borderRadius: 12, justifyContent: 'center', padding: 12 },
  actionText: { color: colors.onAction, fontSize: 16, fontWeight: '700', textAlign: 'center' },
  secondary: { backgroundColor: colors.soft },
  secondaryText: { color: colors.link },
  dimmed: { opacity: 0.6 },
  notice: { borderRadius: 12, padding: 12, color: colors.link, backgroundColor: colors.soft, fontSize: 14 },
  error: { color: colors.error, backgroundColor: colors.errorBg },
});
