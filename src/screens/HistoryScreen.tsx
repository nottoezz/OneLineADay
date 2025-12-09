import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useEntries } from '../hooks/useEntries';
import type { Entry } from '../services/storage';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import typography from '../theme/typography';
import { formatEntryDate, sortEntriesDesc } from '../utils/date';

export default function HistoryScreen() {
  const { entries, loading, error } = useEntries();

  const data = useMemo<Entry[]>(() => {
    const arr = Object.values(entries || {});
    return arr.sort(sortEntriesDesc);
  }, [entries]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>Loading your entries...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Something went wrong loading your history.</Text>
        <Text style={styles.errorSubText}>{error}</Text>
      </View>
    );
  }

  if (!data.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>No entries yet</Text>
        <Text style={styles.emptySubtitle}>
          Start by writing your first line on the Today tab.{'\n'}
          Your history will appear here.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <HistoryItem entry={item} />}
      />
    </View>
  );
}

type HistoryItemProps = {
  entry: Entry;
};

function HistoryItem({ entry }: HistoryItemProps) {
  const formattedDate = formatEntryDate(entry.date);
  const updatedLabel = entry.updatedAt
    ? new Date(entry.updatedAt).toLocaleString()
    : null;

  return (
    <View style={styles.card}>
      <Text style={styles.date}>{formattedDate}</Text>
      <Text style={styles.text}>{entry.text}</Text>
      {updatedLabel && <Text style={styles.meta}>Last updated: {updatedLabel}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingVertical: spacing.md,
  },
  center: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  errorText: {
    fontSize: typography.subtitle,
    color: '#f87171',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  errorSubText: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  card: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    padding: spacing.md,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  date: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  text: {
    fontSize: typography.body,
    color: colors.textPrimary,
  },
  meta: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
});
