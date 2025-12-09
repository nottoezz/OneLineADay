import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_KEY = 'one-line-a-day-settings';

export type AppSettings = {
  reminderEnabled: boolean;
  reminderTime: string; // "HH:MM" 24h
};

const defaultSettings: AppSettings = {
  reminderEnabled: false,
  reminderTime: '20:00',
};

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as AppSettings;
    return { ...defaultSettings, ...parsed };
  } catch (e) {
    console.warn('Failed to load settings', e);
    return defaultSettings;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.warn('Failed to save settings', e);
  }
}


