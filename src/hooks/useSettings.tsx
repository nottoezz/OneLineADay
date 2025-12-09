import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  cancelDailyReminder,
  requestNotificationPermissions,
  scheduleDailyReminder,
} from '../services/notifications';
import type { AppSettings } from '../services/settingsStorage';
import { loadSettings, saveSettings } from '../services/settingsStorage';

type SettingsContextValue = {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  setReminderEnabled: (enabled: boolean) => Promise<void>;
  setReminderTime: (time: string) => Promise<void>;
};

const defaultSettings: AppSettings = {
  reminderEnabled: false,
  reminderTime: '20:00',
};

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

type ProviderProps = {
  children: React.ReactNode;
};

export function SettingsProvider({ children }: ProviderProps) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function init() {
      try {
        const loaded = await loadSettings();
        if (!mounted) return;
        setSettings(loaded);
      } catch (e) {
        console.error('Failed to load settings', e);
        if (mounted) setError('Failed to load settings');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
    };
  }, []);

  const persistAndUpdate = async (partial: Partial<AppSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    await saveSettings(next);
  };

  const setReminderEnabled = async (enabled: boolean) => {
    try {
      if (enabled) {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          await persistAndUpdate({ reminderEnabled: false });
          return;
        }
        await scheduleDailyReminder(settings.reminderTime);
      } else {
        await cancelDailyReminder();
      }
      await persistAndUpdate({ reminderEnabled: enabled });
      setError(null);
    } catch (e) {
      console.error('Failed to update reminder', e);
      setError('Failed to update reminder settings');
    }
  };

  const setReminderTime = async (time: string) => {
    try {
      await persistAndUpdate({ reminderTime: time });
      if (settings.reminderEnabled) {
        await scheduleDailyReminder(time);
      }
      setError(null);
    } catch (e) {
      console.error('Failed to update reminder time', e);
      setError('Failed to update reminder settings');
    }
  };

  const value: SettingsContextValue = {
    settings,
    loading,
    error,
    setReminderEnabled,
    setReminderTime,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return ctx;
}


