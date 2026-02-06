import apiClient from '../api/client';

export interface SettingItem {
  key: string;
  value: string;
  description: string;
  is_public: boolean;
}

export interface SettingsGroup {
  name: string;
  items: SettingItem[];
}

export type SettingsResponse = SettingItem[];

const BASE_PATH = '/settings';

export const settingsService = {
  getAll: async () => {
    return await apiClient.get<{ data: SettingsResponse }>(BASE_PATH);
  },

  update: async (key: string, value: string) => {
    return await apiClient.patch<{ data: SettingItem }>(`${BASE_PATH}/${key}`, { value });
  },

  create: async (data: Omit<SettingItem, 'is_public'>) => {
      // Assuming creating a new setting (like a new voice) is via POST to /settings
      // Adjust if your API differs
      return await apiClient.post<{ data: SettingItem }>(BASE_PATH, data);
  }
};
