import type { UserSettings } from '@/api/generated';

// Web doesn't render settings, so this file only holds the types.

export type UserSettingsViewProps = {
	userSettings: UserSettings;
};
