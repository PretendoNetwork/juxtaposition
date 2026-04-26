import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebModerationTabs } from '@/services/juxt-web/views/web/admin/admin';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { WebAutomodRuleModeDropdown, WebAutomodRuleTypeDropdown } from '@/services/juxt-web/views/web/admin/automodRuleCreateView';
import type { ReactNode } from 'react';
import type { AutomodRule } from '@/api/generated';

export type AutomodRuleItemViewProps = {
	rule: AutomodRule;
};

export type AutomodRuleListViewProps = {
	total: number;
	items: AutomodRule[];
	page: number;
	hasNextPage: boolean;
};

function AutomodRuleItem({ rule }: AutomodRuleItemViewProps): ReactNode {
	return (
		<li className="reports">
			<span className="body messages report">
				<h4 className="text" style={{ textDecoration: rule.enabled ? 'none' : 'line-through' }}>
					{rule.title}
					{' '}
					<span className="pid-display">{`${rule.type} - ${rule.mode}`}</span>
				</h4>
				{rule.description ? <span>{rule.description}</span> : null}
			</span>
			<details className="community-create" style={{ marginTop: '1rem' }}>
				<summary>Edit</summary>
				<form action={`/admin/automod/rules/${rule.id}/update`} method="post">
					<div className="col-md-3">
						<label className="labels" htmlFor="rule-title">Title:</label>
						<input type="text" id="rule-title" name="title" className="form-control" value={rule.title} placeholder="Name of your rule" required />
					</div>
					<div className="col-md-3">
						<label className="labels" htmlFor="rule-desc">Description:</label>
						<textarea id="rule-desc" name="description" className="form-control" value={rule.description ?? ''} placeholder="Description of your rule" />
					</div>
					<div className="col-md-4">
						<label className="form-check-label" htmlFor="enabled">Enabled:</label>
						<div className="form-switch">
							<input className="form-check-input" type="checkbox" checked={rule.enabled} id="enabled" name="enabled" />
						</div>
					</div>
					<div className="col-md-3">
						<label className="labels" htmlFor="rule-mode">Rule mode</label>
						<WebAutomodRuleModeDropdown name="mode" value={rule.mode} id="rule-mode" />
					</div>
					<div className="col-md-3">
						<label className="labels" htmlFor="rule-type">Rule type</label>
						<WebAutomodRuleTypeDropdown name="type" value={rule.type} id="rule-type" />
					</div>
					{ rule.type === 'keyword'
						? (
								<>
									<div className="col-md-3">
										<label className="labels" htmlFor="keywordSettingsKeywords">Keywords (1 per line):</label>
										<textarea id="keywordSettingsKeywords" name="keywordSettingsKeywords" className="form-control" value={rule.settings?.keyword?.keywords.join('\n') ?? ''} />
									</div>
								</>
							)
						: null}
					<div className="button-spacer">
						<button type="submit">Save</button>
					</div>
				</form>
				<hr />
				<form action={`/admin/automod/rules/${rule.id}/delete`} method="post">
					<div className="button-spacer">
						<button type="submit">Delete</button>
					</div>
				</form>
			</details>
		</li>
	);
}

export function WebAutomodRuleListView(props: AutomodRuleListViewProps): ReactNode {
	const url = useUrl();
	const prevUrl = url.url('/admin/automod/rules', { page: props.page - 1 });
	const nextUrl = url.url('/admin/automod/rules', { page: props.page + 1 });

	return (
		<WebRoot type="admin">
			<h2 id="title" className="page-header">
				Automod rules
			</h2>
			<WebNavBar selection={5} />
			<div id="toast"></div>
			<WebWrapper>
				<WebModerationTabs selected="automod" />
				<button style={{ marginTop: '1em' }}>
					<a href="/admin/automod/rules/create" className="button">New rule</a>
				</button>
				{props.items.length === 0
					? (
							<p>
								No rules found
							</p>
						)
					: null }
				<ul className="list-content-with-icon-and-text arrow-list accounts" id="news-list-content">
					{props.items.map(rule => (
						<AutomodRuleItem rule={rule} key={rule.id} />
					))}
				</ul>
				<div className="buttons tabs">
					{ props.page > 0 ? <a href={prevUrl} className="button">Previous Page</a> : null }
					{ props.hasNextPage ? <a href={nextUrl} className="button">Next Page</a> : null }
				</div>
			</WebWrapper>
		</WebRoot>
	);
}
