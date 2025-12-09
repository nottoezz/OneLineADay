import React, { useState } from 'react';
import {
  Alert,
  Button,
  Platform,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { useEntries } from '../hooks/useEntries';
import { useSettings } from '../hooks/useSettings';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import typography from '../theme/typography';

export default function SettingsScreen() {
  const { settings, loading, error, setReminderEnabled, setReminderTime } = useSettings();
  const { clearEntries } = useEntries();

  const [showTimePicker, setShowTimePicker] = useState(false);
  const [busy, setBusy] = useState(false);

  const reminderTimeLabel = formatTimeLabel(settings.reminderTime);

  const onChangeTime = async (event: DateTimePickerEvent, date?: Date | undefined) => {
    if (Platform.OS === 'android') {
      setShowTimePicker(false);
    }
    if (!date) return;
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const value = `${hh}:${mm}`;
    await setReminderTime(value);
  };

  const handleClearEntries = () => {
    Alert.alert(
      'Clear all entries',
      'This will delete all your lines. This cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, clear',
          style: 'destructive',
          onPress: async () => {
            setBusy(true);
            try {
              await clearEntries();
            } catch (e) {
              console.error('Failed to clear entries', e);
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>
      <Text style={styles.subheader}>Customize your reminders and manage your data.</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Daily Reminder</Text>

        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Enable reminder</Text>
            <Text style={styles.rowSubtitle}>Get a gentle nudge to write your line.</Text>
          </View>
          <Switch
            value={settings.reminderEnabled}
            onValueChange={(val) => setReminderEnabled(val)}
            thumbColor={settings.reminderEnabled ? colors.accent : undefined}
            trackColor={{ true: colors.accent, false: '#4b5563' }}
          />
        </View>

        <TouchableOpacity
          style={[styles.row, styles.rowButton]}
          onPress={() => setShowTimePicker(true)}
          disabled={!settings.reminderEnabled}
        >
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Reminder time</Text>
            <Text style={styles.rowSubtitle}>
              {settings.reminderEnabled
                ? `Daily at ${reminderTimeLabel}`
                : 'Enable reminders to set a time'}
            </Text>
          </View>
        </TouchableOpacity>

        {showTimePicker && (
          <DateTimePicker
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            value={timeFromSettings(settings.reminderTime)}
            onChange={onChangeTime}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <Text style={styles.rowTitle}>Clear all entries</Text>
            <Text style={styles.rowSubtitle}>Permanently delete all your lines.</Text>
          </View>
          <Button
            title={busy ? 'Clearing...' : 'Clear'}
            color="#ef4444"
            disabled={busy}
            onPress={handleClearEntries}
          />
        </View>
      </View>
    </View>
  );
}

function formatTimeLabel(timeStr: string): string {
  const [hour, minute] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function timeFromSettings(timeStr: string): Date {
  const [hour, minute] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(hour, minute, 0, 0);
  return d;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  header: {
    fontSize: typography.title,
    color: colors.textPrimary,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  subheader: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  error: {
    color: '#f87171',
    fontSize: typography.body,
    marginBottom: spacing.md,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowButton: {
    justifyContent: 'space-between',
  },
  rowText: {
    flex: 1,
    paddingRight: spacing.md,
  },
  rowTitle: {
    fontSize: typography.body,
    color: colors.textPrimary,
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
});
