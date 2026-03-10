import type { HydratedSettingsDocument } from '@/models/settings';

// Web doesn't render settings, so this file only holds the types.

export type UserSettingsViewProps = {
	userSettings: HydratedSettingsDocument;
};
