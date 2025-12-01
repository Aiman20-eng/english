
const SETTINGS_KEY = 'app_credentials';

export interface AppSettings {
  adminPass: string;
  studentPass: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  adminPass: '1234',
  studentPass: '1234'
};

export const initSettings = () => {
  if (!localStorage.getItem(SETTINGS_KEY)) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  }
};

export const getSettings = (): AppSettings => {
  const stored = localStorage.getItem(SETTINGS_KEY);
  return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
};

export const updateSettings = (newSettings: Partial<AppSettings>) => {
  const current = getSettings();
  const updated = { ...current, ...newSettings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  return updated;
};

export const verifyPassword = (role: 'ADMIN' | 'STUDENT', inputPass: string): boolean => {
  const settings = getSettings();
  if (role === 'ADMIN') return inputPass === settings.adminPass;
  if (role === 'STUDENT') return inputPass === settings.studentPass;
  return false;
};
