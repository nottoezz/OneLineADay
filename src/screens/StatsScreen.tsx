import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useEntries } from '../hooks/useEntries';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import typography from '../theme/typography';

export default function StatsScreen() {
  const {
    loading,
    error,
    totalEntries,
    entriesThisMonth,
    currentStreak,
    bestStreak,
  } = useEntries();

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.accent} />
        <Text style={styles.loadingText}>Loading your stats...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>Could not load stats</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Your Journaling Stats</Text>
      <Text style={styles.subheader}>
        Small lines, big picture. Here’s how your habit looks.
      </Text>

      <View style={styles.grid}>
        <StatCard label="Current streak" value={currentStreak.toString()} subtitle="days" />
        <StatCard label="Best streak" value={bestStreak.toString()} subtitle="all time" />
        <StatCard
          label="Total entries"
          value={totalEntries.toString()}
          subtitle="days you've written"
        />
        <StatCard
          label="This month"
          value={entriesThisMonth.toString()}
          subtitle="entries"
        />
      </View>
    </ScrollView>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  subtitle?: string;
};

function StatCard({ label, value, subtitle }: StatCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
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
  errorTitle: {
    fontSize: typography.subtitle,
    color: '#f87171',
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    flexBasis: '48%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  cardLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  cardSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
});
