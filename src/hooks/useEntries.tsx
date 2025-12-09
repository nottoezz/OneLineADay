import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  Entry,
  EntriesMap,
  clearAllEntries,
  getAllEntries,
  saveEntry,
} from '../services/storage';
import { getTodayDateString } from '../utils/date';
import {
  calculateStreaks,
  countEntriesThisMonth,
  countTotalEntries,
} from '../utils/stats';

type EntriesContextValue = {
  entries: EntriesMap;
  loading: boolean;
  error: string | null;
  todayEntry: Entry | null;
  saveTodayEntry: (text: string) => Promise<void>;
  clearEntries: () => Promise<void>;
  totalEntries: number;
  entriesThisMonth: number;
  currentStreak: number;
  bestStreak: number;
  // Legacy naming kept for Today screen compatibility
  streakCurrent: number;
};

const EntriesContext = createContext<EntriesContextValue | undefined>(undefined);

type EntriesProviderProps = {
  children: React.ReactNode;
};

export function EntriesProvider({ children }: EntriesProviderProps) {
  const [entries, setEntries] = useState<EntriesMap>({});
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEntries, setTotalEntries] = useState<number>(0);
  const [entriesThisMonth, setEntriesThisMonth] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;

    async function loadEntries() {
      setLoading(true);
      try {
        const allEntries = await getAllEntries();
        if (!isMounted) {
          return;
        }

        const todayKey = getTodayDateString();

        setEntries(allEntries);
        setTodayEntry(allEntries[todayKey] ?? null);
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

  useEffect(() => {
    const total = countTotalEntries(entries);
    const monthly = countEntriesThisMonth(entries);
    const { currentStreak: cStreak, bestStreak: bStreak } = calculateStreaks(entries);

    setTotalEntries(total);
    setEntriesThisMonth(monthly);
    setCurrentStreak(cStreak);
    setBestStreak(bStreak);
  }, [entries]);

  const saveTodayEntry = useCallback(
    async (text: string) => {
      const cleaned = text.trim();
      const nowIso = new Date().toISOString();
      const todayKey = getTodayDateString();
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

  const clearEntries = useCallback(async () => {
    try {
      await clearAllEntries();
      setEntries({});
      setTodayEntry(null);
      setError(null);
    } catch (err) {
      console.error('[useEntries] clear error', err);
      setError('Failed to clear entries');
    }
  }, []);

  const value = useMemo<EntriesContextValue>(
    () => ({
      entries,
      loading,
      error,
      todayEntry,
      saveTodayEntry,
      clearEntries,
      totalEntries,
      entriesThisMonth,
      currentStreak,
      bestStreak,
      streakCurrent: currentStreak,
    }),
    [
      entries,
      loading,
      error,
      todayEntry,
      saveTodayEntry,
      clearEntries,
      totalEntries,
      entriesThisMonth,
      currentStreak,
      bestStreak,
    ],
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

