export const automodAction = ['blocked', 'logged'] as const;
export type AutomodAction = (typeof automodAction)[number];
