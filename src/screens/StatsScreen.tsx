import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';

import { useEntries } from '../hooks/useEntries';
import colors from '../theme/colors';
import spacing from '../theme/spacing';
import typography from '../theme/typography';
import type { EntriesMap } from '../services/storage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DAYS_IN_WEEK = 7;
const YEAR_DAYS = 365;
const COLUMN_GAP = 2; // gap between week columns

type DayCell = {
  date: Date;
  dateStr: string; // "YYYY-MM-DD"
  hasEntry: boolean;
};

type WeekColumn = DayCell[];

type MonthLabel = {
  weekIndex: number;
  label: string;
};

export default function StatsScreen() {
  const {
    entries,
    totalEntries = 0,
    entriesThisMonth = 0,
    currentStreak = 0,
    bestStreak = 0,
  } = useEntries();

  const { weeks, monthLabels } = useMemo(
    () => buildYearHeatmapData(entries),
    [entries],
  );

  const firstEntryDateLabel = useMemo(() => {
    const keys = Object.keys(entries || {});
    if (!keys.length) return '—';
    const sorted = [...keys].sort(); // ascending
    const [y, m, d] = sorted[0].split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }, [entries]);

  const hasAnyEntries = totalEntries > 0;

  const numWeeks = weeks.length || 1;
  const horizontalPadding = spacing.lg * 2; // same as content padding
  const availableWidth = SCREEN_WIDTH - horizontalPadding;

  // each week column = cell + gap (except last)
  const cellSize = Math.floor((availableWidth - COLUMN_GAP * (numWeeks - 1)) / numWeeks);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero streak */}
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>Current streak</Text>
        <View style={styles.heroRow}>
          <Text style={styles.heroValue}>{currentStreak}</Text>
          <Text style={styles.heroUnit}>days</Text>
        </View>
        <Text style={styles.heroSub}>One line at a time. Keep the chain going.</Text>
      </View>

      {/* Metrics grid */}
      <View style={styles.metricsGrid}>
        <MetricCard
          label="Total entries"
          value={totalEntries.toString()}
          subtitle="days you've written"
        />
        <MetricCard
          label="This month"
          value={entriesThisMonth.toString()}
          subtitle="lines this month"
        />
        <MetricCard label="Best streak" value={bestStreak.toString()} subtitle="longest run" />
        <MetricCard label="Since" value={firstEntryDateLabel} subtitle="first line" />
      </View>

      {/* Heatmap */}
      <View style={styles.heatmapSection}>
        <View style={styles.heatmapHeaderRow}>
          <Text style={styles.sectionTitle}>Writing rhythm</Text>
          <Text style={styles.sectionSubtitle}>Last 12 months</Text>
        </View>

        {hasAnyEntries ? (
          <>
            {/* Month labels row */}
            <View style={styles.monthLabelsRow}>
              <View style={styles.weekdaySpacer} />
              <View style={[styles.monthLabelsTrack, { width: availableWidth }]}>
                {monthLabels.map((m) => (
                  <Text
                    key={m.weekIndex}
                    style={[
                      styles.monthLabel,
                      {
                        left: m.weekIndex * (cellSize + COLUMN_GAP),
                      },
                    ]}
                  >
                    {m.label}
                  </Text>
                ))}
              </View>
            </View>

            {/* Grid */}
            <View style={styles.heatmapRow}>
              {/* Weekday labels */}
              <View style={styles.weekdayColumn}>
                {['Mon', 'Wed', 'Fri'].map((label) => (
                  <Text key={label} style={styles.weekdayLabel}>
                    {label}
                  </Text>
                ))}
              </View>

              {/* Full-width grid */}
              <View style={[styles.weeksRow, { width: availableWidth }]}>
                {weeks.map((week, weekIndex) => (
                  <View
                    key={weekIndex}
                    style={[
                      styles.weekColumn,
                      {
                        marginRight: weekIndex === weeks.length - 1 ? 0 : COLUMN_GAP,
                      },
                    ]}
                  >
                    {week.map((day, dayIndex) => (
                      <View
                        key={dayIndex}
                        style={[
                          styles.dayCell,
                          {
                            width: cellSize,
                            height: cellSize,
                          },
                          getDayCellStyle(day),
                        ]}
                      />
                    ))}
                  </View>
                ))}
              </View>
            </View>

            {/* Legend */}
            <View style={styles.legendRow}>
              <Text style={styles.legendLabel}>Less</Text>
              <View style={styles.legendBar}>
                <View style={[styles.legendDot, styles.legendDotEmpty]} />
                <View
                  style={[
                    styles.legendDot,
                    styles.legendDotActive,
                    { opacity: 0.5 },
                  ]}
                />
                <View
                  style={[
                    styles.legendDot,
                    styles.legendDotActive,
                    { opacity: 1 },
                  ]}
                />
              </View>
              <Text style={styles.legendLabel}>More</Text>
            </View>
          </>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptyText}>
              Your year will show up here as you write more lines.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

/* ------------ Metric Card ------------ */

type MetricCardProps = {
  label: string;
  value: string;
  subtitle?: string;
};

function MetricCard({ label, value, subtitle }: MetricCardProps) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      {subtitle ? <Text style={styles.metricSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

/* ------------ Heatmap helpers ------------ */

function buildYearHeatmapData(
  entries: EntriesMap,
): { weeks: WeekColumn[]; monthLabels: MonthLabel[] } {
  const today = stripTime(new Date());

  // last 365 days including today
  const start = new Date(today);
  start.setDate(start.getDate() - (YEAR_DAYS - 1));

  const entryDates = new Set(Object.keys(entries || {}));

  const days: DayCell[] = [];
  for (let i = 0; i < YEAR_DAYS; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const dateStr = toDateStr(d);
    days.push({
      date: d,
      dateStr,
      hasEntry: entryDates.has(dateStr),
    });
  }

  const weeks: WeekColumn[] = [];
  const monthLabels: MonthLabel[] = [];

  for (let i = 0; i < days.length; i += DAYS_IN_WEEK) {
    const slice = days.slice(i, i + DAYS_IN_WEEK);
    const weekIndex = weeks.length;
    weeks.push(slice);

    // Label month near its start (day 1–7)
    const firstDay = slice[0]?.date;
    if (!firstDay) continue;
    const dayOfMonth = firstDay.getDate();

    if (dayOfMonth <= 7) {
      const label = firstDay.toLocaleString(undefined, {
        month: 'short',
      });
      const last = monthLabels[monthLabels.length - 1];
      if (!last || last.label !== label) {
        monthLabels.push({ weekIndex, label });
      }
    }
  }

  return { weeks, monthLabels };
}

function stripTime(d: Date): Date {
  const nd = new Date(d);
  nd.setHours(0, 0, 0, 0);
  return nd;
}

function toDateStr(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getDayCellStyle(day: DayCell) {
  if (!day.hasEntry) {
    return {
      backgroundColor: colors.surface,
      opacity: 0.25,
    };
  }

  // Single intensity for now – still visually clear and not GitHub-identical
  return {
    backgroundColor: colors.accent ?? '#22c55e',
    opacity: 0.9,
  };
}

/* ------------ Styles ------------ */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },

  /* Hero */
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  heroLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  heroValue: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  heroUnit: {
    marginLeft: spacing.xs,
    fontSize: typography.subtitle,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  heroSub: {
    marginTop: spacing.sm,
    fontSize: typography.body,
    color: colors.textSecondary,
  },

  /* Metrics grid */
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  metricCard: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.md) / 2,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  metricSubtitle: {
    marginTop: spacing.xs,
    fontSize: typography.caption,
    color: colors.textSecondary,
  },

  /* Heatmap */
  heatmapSection: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  heatmapHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },

  monthLabelsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  weekdaySpacer: {
    width: 28, // roughly width of weekday column
  },
  monthLabelsTrack: {
    position: 'relative',
    height: 16,
  },
  monthLabel: {
    position: 'absolute',
    fontSize: typography.caption,
    color: colors.textSecondary,
  },

  heatmapRow: {
    flexDirection: 'row',
  },
  weekdayColumn: {
    width: 28,
    justifyContent: 'space-between',
    paddingVertical: 2,
    marginRight: spacing.sm,
  },
  weekdayLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  weeksRow: {
    flexDirection: 'row',
  },
  weekColumn: {
    flexDirection: 'column',
  },
  dayCell: {
    borderRadius: 3,
    marginVertical: 1,
  },

  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  legendLabel: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  legendBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.sm,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 3,
    marginHorizontal: 2,
  },
  legendDotEmpty: {
    backgroundColor: colors.surface,
    opacity: 0.25,
  },
  legendDotActive: {
    backgroundColor: colors.accent ?? '#22c55e',
  },

  emptyState: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginTop: spacing.sm,
  },
  emptyTitle: {
    fontSize: typography.subtitle,
    color: colors.textPrimary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: typography.body,
    color: colors.textSecondary,
  },
});
