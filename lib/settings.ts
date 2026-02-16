import { storage } from 'wxt/storage';
import { DEFAULT_SETTINGS, type ExtensionSettings } from '@/effects/types';

const SETTINGS_KEY = 'sync:transitfx-settings';

export const settingsStorage = storage.defineItem<ExtensionSettings>(SETTINGS_KEY, {
  fallback: DEFAULT_SETTINGS,
});

export async function getSettings(): Promise<ExtensionSettings> {
  const raw = await settingsStorage.getValue();

  // Migrate legacy settings
  let migrated = false;
  const settings = { ...raw } as ExtensionSettings & { selectedTheme?: string };

  // Remove legacy selectedTheme
  if ('selectedTheme' in settings) {
    delete settings.selectedTheme;
    migrated = true;
  }

  // Map legacy 'theme-tint' filter to 'off'
  if ((settings.pageFilter as string) === 'theme-tint') {
    settings.pageFilter = 'off';
    migrated = true;
  }

  if (migrated) {
    await settingsStorage.setValue(settings);
  }

  return settings;
}

export async function updateSettings(partial: Partial<ExtensionSettings>): Promise<ExtensionSettings> {
  const current = await getSettings();
  const updated = { ...current, ...partial };
  await settingsStorage.setValue(updated);
  return updated;
}
