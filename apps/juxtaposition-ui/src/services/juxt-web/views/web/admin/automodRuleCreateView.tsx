import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebModerationTabs } from '@/services/juxt-web/views/web/admin/admin';
import type { ReactNode } from 'react';

type DropdownProps = {
	name: string;
	id?: string;
	value?: string | number;
};

export function WebAutomodRuleTypeDropdown(props: DropdownProps): ReactNode {
	return (
		<select className="form-select" value={props.value} name={props.name} id={props.id}>
			<option value="keyword">Keyword</option>
		</select>
	);
}

export function WebAutomodRuleModeDropdown(props: DropdownProps): ReactNode {
	return (
		<select className="form-select" value={props.value} name={props.name} id={props.id}>
			<option value="block">Block post</option>
			<option value="log">Allow & log</option>
		</select>
	);
}

export function WebAutomodRuleCreateView(): ReactNode {
	return (
		<WebRoot type="admin">
			<h2 id="title" className="page-header">
				New automod rule
			</h2>
			<WebNavBar selection={5} />
			<div id="toast"></div>
			<WebWrapper className="community-create">
				<WebModerationTabs selected="automod" />
				<form action="/admin/automod/rules/create" method="post">
					<div className="col-md-3">
						<label className="labels" htmlFor="rule-title">Title:</label>
						<input type="text" id="rule-title" name="title" className="form-control" value="" placeholder="Name of your rule" required />
					</div>
					<div className="col-md-3">
						<label className="labels" htmlFor="rule-type">Rule type</label>
						<WebAutomodRuleTypeDropdown name="type" id="rule-type" />
					</div>
					<div className="col-md-3">
						<label className="labels" htmlFor="rule-mode">Rule mode</label>
						<WebAutomodRuleModeDropdown name="mode" id="rule-mode" />
					</div>
					<div className="col-md-3">
						<button className="btn btn-primary profile-button" type="submit">Create rule</button>
					</div>
				</form>
			</WebWrapper>
		</WebRoot>
	);
}
