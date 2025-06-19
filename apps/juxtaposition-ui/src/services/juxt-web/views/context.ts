export type RenderContext = {
	lang: Record<string, any>;
	cdnUrl: string;
	moderator: boolean;
	pid: number;
	usersMap: any; // TODO add types
};
