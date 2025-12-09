import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { Entry, EntriesMap, getAllEntries, saveEntry } from '../services/storage';

type EntriesContextValue = {
  entries: EntriesMap;
  loading: boolean;
  error: string | null;
  todayEntry: Entry | null;
  streakCurrent: number;
  saveTodayEntry: (text: string) => Promise<void>;
};

const EntriesContext = createContext<EntriesContextValue | undefined>(undefined);

function getDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayKey(): string {
  return getDateKey(new Date());
}

function getPreviousDateKey(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, (month ?? 1) - 1, day ?? 1);
  date.setDate(date.getDate() - 1);
  return getDateKey(date);
}

function computeStreak(entries: EntriesMap): number {
  let streak = 0;
  let cursor = getTodayKey();

  while (entries[cursor]) {
    streak += 1;
    cursor = getPreviousDateKey(cursor);
  }

  return streak;
}

type EntriesProviderProps = {
  children: React.ReactNode;
};

export function EntriesProvider({ children }: EntriesProviderProps) {
  const [entries, setEntries] = useState<EntriesMap>({});
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [streakCurrent, setStreakCurrent] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function loadEntries() {
      setLoading(true);
      try {
        const allEntries = await getAllEntries();
        if (!isMounted) {
          return;
        }

        const todayKey = getTodayKey();

        setEntries(allEntries);
        setTodayEntry(allEntries[todayKey] ?? null);
        setStreakCurrent(computeStreak(allEntries));
        setError(null);
      } catch (err) {
        console.error('[useEntries] load error', err);
        if (isMounted) {
          setError('Failed to load entries');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadEntries();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveTodayEntry = useCallback(
    async (text: string) => {
      const cleaned = text.trim();
      const nowIso = new Date().toISOString();
      const todayKey = getTodayKey();
      const existing = entries[todayKey];

      const entry: Entry = {
        date: todayKey,
        text: cleaned,
        createdAt: existing?.createdAt ?? nowIso,
        updatedAt: nowIso,
      };

      try {
        await saveEntry(entry);
        setEntries((prev) => {
          const next = { ...prev, [todayKey]: entry };
          setTodayEntry(entry);
          setStreakCurrent(computeStreak(next));
          return next;
        });
        setError(null);
      } catch (err) {
        console.error('[useEntries] save error', err);
        setError('Failed to save entry');
        throw err;
      }
    },
    [entries],
  );

  const value = useMemo<EntriesContextValue>(
    () => ({
      entries,
      loading,
      error,
      todayEntry,
      streakCurrent,
      saveTodayEntry,
    }),
    [entries, loading, error, todayEntry, streakCurrent, saveTodayEntry],
  );

  return <EntriesContext.Provider value={value}>{children}</EntriesContext.Provider>;
}

export function useEntries(): EntriesContextValue {
  const context = useContext(EntriesContext);
  if (!context) {
    throw new Error('useEntries must be used within an EntriesProvider');
  }
  return context;
}

