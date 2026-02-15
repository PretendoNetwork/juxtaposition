import type { RenderContext } from '@/services/juxt-web/views/context';
import type { HydratedSettingsDocument } from '@/models/settings';

// Web doesn't render settings, so this file only holds the types.

export type UserSettingsViewProps = {
	ctx: RenderContext;
	userSettings: HydratedSettingsDocument;
};
