import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { useEntries } from '../hooks/useEntries';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import typography from '../theme/typography';

const MAX_CHARS = 240;

export default function TodayScreen() {
  const { todayEntry, saveTodayEntry, loading, currentStreak: streakCurrent, error } =
    useEntries();
  const [text, setText] = useState<string>(todayEntry?.text ?? '');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    setText(todayEntry?.text ?? '');
  }, [todayEntry]);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    [],
  );

  const handleChange = (value: string) => {
    setText(value.slice(0, MAX_CHARS));
  };

  const handleSave = async () => {
    if (status === 'saving') {
      return;
    }

    setStatus('saving');
    try {
      await saveTodayEntry(text.trim());
      setStatus('saved');
      setTimeout(() => setStatus('idle'), 1500);
    } catch (err) {
      setStatus('idle');
    }
  };

  const isDisabled = status === 'saving' || text.trim().length === 0;

  if (loading && !todayEntry) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.dateText}>{todayLabel}</Text>
          <Text style={styles.subtitle}>Write one line about your day.</Text>
        </View>

        {streakCurrent > 0 && (
          <View style={styles.streakCard}>
            <Text style={styles.streakText}>Streak: {streakCurrent} day(s) 🔥</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.prompt}>What happened today that mattered?</Text>

          <TextInput
            value={text}
            onChangeText={handleChange}
            placeholder="What happened today that mattered?"
            placeholderTextColor={colors.textSecondary}
            multiline
            maxLength={MAX_CHARS}
            style={styles.input}
          />

          <View style={styles.counterRow}>
            <Text style={styles.counter}>
              {text.length} / {MAX_CHARS}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.button, isDisabled && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isDisabled}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>
              {status === 'saving' ? 'Saving...' : status === 'saved' ? 'Saved ✓' : "Save today's line"}
            </Text>
          </TouchableOpacity>

          {status === 'saved' && <Text style={styles.savedText}>Saved ✓</Text>}
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
  },
  header: {
    marginBottom: spacing.lg,
  },
  dateText: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subtitle: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  streakCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  streakText: {
    color: colors.textPrimary,
    fontSize: typography.body,
    fontWeight: '600',
  },
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  prompt: {
    fontSize: typography.subtitle,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  input: {
    minHeight: 140,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    color: colors.textPrimary,
    fontSize: typography.body,
    textAlignVertical: 'top',
    backgroundColor: '#1f2028',
  },
  counterRow: {
    marginTop: spacing.sm,
    alignItems: 'flex-end',
  },
  counter: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.textPrimary,
    fontSize: typography.subtitle,
    fontWeight: '700',
  },
  savedText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.caption,
  },
  errorText: {
    marginTop: spacing.sm,
    color: '#f87171',
    fontSize: typography.caption,
  },
  loadingText: {
    marginTop: spacing.sm,
    color: colors.textSecondary,
    fontSize: typography.body,
  },
});
