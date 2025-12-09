import type { EntriesMap, Entry } from '../services/storage';
import { getTodayDateString, getYesterdayDateString } from './date';

/**
 * Count total number of entries.
 */
export function countTotalEntries(entries: EntriesMap): number {
  return Object.keys(entries).length;
}

/**
 * Count how many entries are in the same month/year as today.
 */
export function countEntriesThisMonth(entries: EntriesMap): number {
  const today = new Date();
  const month = today.getMonth();
  const year = today.getFullYear();

  return Object.values(entries).filter((entry: Entry) => {
    const [y, m] = entry.date.split('-').map(Number);
    return y === year && m - 1 === month;
  }).length;
}

/**
 * Calculate streak information.
 *
 * currentStreak: consecutive days up to *today* that have entries.
 * bestStreak: longest streak found.
 */
export function calculateStreaks(entries: EntriesMap): {
  currentStreak: number;
  bestStreak: number;
} {
  const dates = Object.keys(entries);
  if (dates.length === 0) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  // Sort ascending
  dates.sort();

  // Build a Set for quick lookup
  const dateSet = new Set(dates);

  let bestStreak = 0;

  // Find all streaks
  for (const dateStr of dates) {
    // A streak "start" is a date where the previous day is not in the set
    const prev = getYesterdayFrom(dateStr);
    if (!dateSet.has(prev)) {
      let streak = 1;
      let current = dateStr;

      while (true) {
        const next = getNextDay(current);
        if (!dateSet.has(next)) break;
        streak += 1;
        current = next;
      }

      if (streak > bestStreak) bestStreak = streak;
    }
  }

  // Now compute current streak up to *today*
  const todayStr = getTodayDateString();
  let currentStreak = 0;

  if (dateSet.has(todayStr)) {
    // Walk backwards from today until we break
    let current = todayStr;
    while (true) {
      if (!dateSet.has(current)) break;
      currentStreak += 1;
      current = getYesterdayFrom(current);
    }
  } else {
    // If today has no entry, look at a streak ending yesterday
    const yesterdayStr = getYesterdayDateString();
    if (dateSet.has(yesterdayStr)) {
      let current = yesterdayStr;
      while (true) {
        if (!dateSet.has(current)) break;
        currentStreak += 1;
        current = getYesterdayFrom(current);
      }
    }
  }

  return { currentStreak, bestStreak };
}

/**
 * Helper: get the YYYY-MM-DD string for the day before a given YYYY-MM-DD.
 */
function getYesterdayFrom(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() - 1);
  return formatDate(d);
}

/**
 * Helper: get next day in YYYY-MM-DD from given YYYY-MM-DD
 */
function getNextDay(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + 1);
  return formatDate(d);
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}


