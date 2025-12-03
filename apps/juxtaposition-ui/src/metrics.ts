import { Gauge } from 'prom-client';
import expressMetrics from 'express-prom-bundle';
import express from 'express';
import { logger } from '@/logger';
import { config } from '@/config';
import { SETTINGS } from '@/models/settings';
import type { Express } from 'express';

export const onlineNowGauge = new Gauge({
	name: 'juxtaposition_online_users_now',
	help: 'Users active in the last 10 minutes',
	async collect(): Promise<void> {
		const onlineRangeMs = 10 * 60 * 1000; // 10 minutes
		const cutoff = new Date(Date.now() - onlineRangeMs);
		const [{ n }] = await SETTINGS.aggregate<{ n: number }>([
			{ $match: { last_active: { $gt: cutoff } } },
			{ $count: 'n' }
		]);
		this.set(n);
	}
});

export const activeMonthlyGauge = new Gauge({
	name: 'juxtaposition_active_users_monthly',
	help: 'Users active in the last 30 days',
	async collect(): Promise<void> {
		const monthlyRangeMs = 30 * 24 * 60 * 60 * 1000;
		const cutoff = new Date(Date.now() - monthlyRangeMs);
		const [{ n }] = await SETTINGS.aggregate<{ n: number }>([
			{ $match: { last_active: { $gt: cutoff } } },
			{ $count: 'n' }
		]);
		this.set(n);
	}
});

export const activeYearlyGauge = new Gauge({
	name: 'juxtaposition_active_users_yearly',
	help: 'Users active in the last 365 days',
	async collect(): Promise<void> {
		const yearlyRangeMs = 365 * 24 * 60 * 60 * 1000;
		const cutoff = new Date(Date.now() - yearlyRangeMs);
		const [{ n }] = await SETTINGS.aggregate<{ n: number }>([
			{ $match: { last_active: { $gt: cutoff } } },
			{ $count: 'n' }
		]);
		this.set(n);
	}
});

export const totalUsersGauge = new Gauge({
	name: 'juxtaposition_user_count_total',
	help: 'Total number of registered users',
	async collect(): Promise<void> {
		const count = await SETTINGS.estimatedDocumentCount();
		this.set(count);
	}
});

export async function getUserMetrics(): Promise<{ totalUsers: number; currentOnlineUsers: number }> {
	// This assumes that both gauges have no labels
	return {
		totalUsers: (await totalUsersGauge.get()).values[0].value,
		currentOnlineUsers: (await onlineNowGauge.get()).values[0].value
	};
}

export function registerMetrics(app: Express): Express {
	const metrics = express();

	if (config.metrics.enabled) {
		logger.info('Setting up metrics');
		app.use(expressMetrics({
			// Include full express and nodejs metrics
			includeMethod: true,
			includePath: true,
			urlValueParser: {
				minBase64Length: 15
			},
			promClient: {
				collectDefaultMetrics: {}
			},

			// Keep metrics on a different app (so they aren't exposed)
			autoregister: false,
			metricsApp: metrics
		}));
	}

	return metrics;
}

export function listenMetrics(metricsApp: Express): void {
	if (!config.metrics.enabled) {
		return;
	}

	const port = config.metrics.port;
	metricsApp.listen(port, '0.0.0.0', () => {
		logger.success(`Metrics server started on port ${port}`);
	});
}
