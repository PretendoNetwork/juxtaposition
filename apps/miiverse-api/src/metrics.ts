import { Gauge } from 'prom-client';
import expressMetrics from 'express-prom-bundle';
import express from 'express';
import { logger } from '@/logger';
import { config } from '@/config';
import { Settings } from '@/models/settings';
import { Post } from '@/models/post';
import type { Express, NextFunction, Request, Response } from 'express';

// This file contains juxtaposition_ui prefixed metrics.
// This is for backwards compatibility from when they were in the juxtaposition-ui project

export const onlineNowGauge = new Gauge({
	name: 'juxtaposition_online_users_now',
	help: 'Users active in the last 10 minutes',
	async collect(): Promise<void> {
		const onlineRangeMs = 10 * 60 * 1000; // 10 minutes
		const cutoff = new Date(Date.now() - onlineRangeMs);
		const [result] = await Settings.aggregate<{ n: number } | undefined>([
			{ $match: { last_active: { $gt: cutoff } } },
			{ $count: 'n' }
		]);
		this.set(result?.n ?? 0);
	}
});

export const activeMonthlyGauge = new Gauge({
	name: 'juxtaposition_active_users_monthly',
	help: 'Users active in the last 30 days',
	async collect(): Promise<void> {
		const monthlyRangeMs = 30 * 24 * 60 * 60 * 1000;
		const cutoff = new Date(Date.now() - monthlyRangeMs);
		const [result] = await Settings.aggregate<{ n: number } | undefined>([
			{ $match: { last_active: { $gt: cutoff } } },
			{ $count: 'n' }
		]);
		this.set(result?.n ?? 0);
	}
});

export const activeYearlyGauge = new Gauge({
	name: 'juxtaposition_active_users_yearly',
	help: 'Users active in the last 365 days',
	async collect(): Promise<void> {
		const yearlyRangeMs = 365 * 24 * 60 * 60 * 1000;
		const cutoff = new Date(Date.now() - yearlyRangeMs);
		const [result] = await Settings.aggregate<{ n: number } | undefined>([
			{ $match: { last_active: { $gt: cutoff } } },
			{ $count: 'n' }
		]);
		this.set(result?.n ?? 0);
	}
});

export const totalUsersGauge = new Gauge({
	name: 'juxtaposition_user_count_total',
	help: 'Total number of registered users',
	async collect(): Promise<void> {
		const count = await Settings.estimatedDocumentCount();
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

export const dailyPostGauge = new Gauge({
	name: 'juxtaposition_post_count_daily',
	help: 'New posts in the last 24 hours',
	async collect(): Promise<void> {
		const dailyRangeMs = 24 * 60 * 60 * 1000;
		const cutoff = new Date(Date.now() - dailyRangeMs);
		const [result] = await Post.aggregate<{ n: number } | undefined>([
			{ $match: { created_at: { $gt: cutoff }, message_to_pid: null } },
			{ $count: 'n' }
		]);
		this.set(result?.n ?? 0);
	}
});

export const monthlyPostGauge = new Gauge({
	name: 'juxtaposition_post_count_monthly',
	help: 'New posts in the last 30 days',
	async collect(): Promise<void> {
		const monthyRangeMs = 30 * 24 * 60 * 60 * 1000;
		const cutoff = new Date(Date.now() - monthyRangeMs);
		const [result] = await Post.aggregate<{ n: number } | undefined>([
			{ $match: { created_at: { $gt: cutoff }, message_to_pid: null } },
			{ $count: 'n' }
		]);
		this.set(result?.n ?? 0);
	}
});

export const yearlyPostGauge = new Gauge({
	name: 'juxtaposition_post_count_yearly',
	help: 'New posts in the last 365 days',
	async collect(): Promise<void> {
		const yearlyRangeMs = 365 * 24 * 60 * 60 * 1000;
		const cutoff = new Date(Date.now() - yearlyRangeMs);
		const [result] = await Post.aggregate<{ n: number } | undefined>([
			{ $match: { created_at: { $gt: cutoff }, message_to_pid: null } },
			{ $count: 'n' }
		]);
		this.set(result?.n ?? 0);
	}
});

export const totalPostsGauge = new Gauge({
	name: 'juxtaposition_post_count_total',
	help: 'Total number of posts',
	async collect(): Promise<void> {
		const [result] = await Post.aggregate<{ n: number } | undefined>([
			{ $match: { message_to_pid: null } },
			{ $count: 'n' }
		]);
		this.set(result?.n ?? 0);
	}
});

export async function getPostMetrics(): Promise<{ totalPosts: number; dailyPosts: number }> {
	// This assumes that both gauges have no labels
	return {
		totalPosts: (await totalPostsGauge.get()).values[0].value,
		dailyPosts: (await dailyPostGauge.get()).values[0].value
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

	metrics.use((error: Error, req: Request, res: Response, _next: NextFunction) => {
		logger.error(error, 'Request failed!');
		res.sendStatus(500);
	});

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
