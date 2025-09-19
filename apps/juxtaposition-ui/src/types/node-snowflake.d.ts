declare module 'node-snowflake' {
	export type SnowflakeDef = {
		nextId(): string;
	};
	export const Snowflake: SnowflakeDef;
}
