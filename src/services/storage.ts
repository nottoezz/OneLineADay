import AsyncStorage from '@react-native-async-storage/async-storage';

export type Entry = {
  date: string; // YYYY-MM-DD
  text: string;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
};

export type EntriesMap = {
  [date: string]: Entry;
};

const STORAGE_KEY = 'one-line-a-day-entries';

export async function getAllEntries(): Promise<EntriesMap> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as EntriesMap | null;
    if (parsed && typeof parsed === 'object') {
      return parsed;
    }

    return {};
  } catch (error) {
    console.error('[storage] getAllEntries error', error);
    return {};
  }
}

export async function getEntryByDate(date: string): Promise<Entry | null> {
  try {
    const entries = await getAllEntries();
    return entries[date] ?? null;
  } catch (error) {
    console.error('[storage] getEntryByDate error', error);
    return null;
  }
}

export async function saveEntry(entry: Entry): Promise<void> {
  try {
    const entries = await getAllEntries();
    const updated: EntriesMap = {
      ...entries,
      [entry.date]: entry,
    };

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('[storage] saveEntry error', error);
  }
}

