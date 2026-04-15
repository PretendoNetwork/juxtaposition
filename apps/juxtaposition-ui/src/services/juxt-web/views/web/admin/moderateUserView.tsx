import cx from 'classnames';
import moment from 'moment';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebPostView } from '@/services/juxt-web/views/web/post';
import { WebUserPageMeta, WebUserTier } from '@/services/juxt-web/views/web/userPageView';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { T } from '@/services/juxt-web/views/common/components/T';
import type { ReactNode } from 'react';
import type { GetUserDataResponse as AccountGetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { InferSchemaType } from 'mongoose';
import type { HydratedSettingsDocument } from '@/models/settings';
import type { ContentSchema } from '@/models/content';
import type { PostSchema } from '@/models/post';
import type { auditLogSchema } from '@/models/logs';
import type { Report } from '@/api/generated';

export type ModerateUserViewProps = {
	pnid: AccountGetUserDataResponse;
	userSettings: HydratedSettingsDocument;
	userContent: InferSchemaType<typeof ContentSchema>;
	removedPosts: InferSchemaType<typeof PostSchema>[];
	reports: Report[];
	submittedReports: Report[];
	reasonMap: string[];
	auditLog: InferSchemaType<typeof auditLogSchema>[];
};

type ModerateUserReportProps = {
	report: Report;
	reasonMap: string[];
};

function ModerateUserReportView(props: ModerateUserReportProps): ReactNode {
	const { reporter, resolved } = props.report;
	const createdAt = new Date(props.report.createdAt);
	const cache = useCache();
	const url = useUrl();

	return (
		<li key={props.report.id} className="reports">
			<details>
				<summary>
					<div className="hover">
						<a href={`/users/${reporter.pid}`} className="icon-container notify">
							<img src={url.cdn(`/mii/${reporter.pid}/normal_face.png`)} className="icon" />
						</a>
						<span className="body messages report">
							<span className="text">
								<a href={`/users/${reporter.pid}`} className="nick-name">
									Reported By:
									{' '}
									{cache.getUserName(reporter.pid)}
								</a>
								{'  '}
								<span title={moment(createdAt).toString()} className="timestamp">{moment(createdAt).fromNow()}</span>
							</span>
							<span className="text">
								<h4>
									{props.reasonMap[reporter.reasonId] ?? 'Unknown'}
								</h4>
								<p>
									{reporter.message}
								</p>
							</span>
							{ resolved.isResolved && resolved.reason === 'similarReportResolved'
								? (
										<>
											<span className="text">
												Resolved by similar report
											</span>
										</>
									)
								: resolved.isResolved
									? (
											<>
												<span className="text">
													<span className="nick-name">
														Resolved By:
														{' '}
														{resolved.pid ? cache.getUserName(resolved.pid) : 'Nobody'}
													</span>
													{'  '}
													<span title={moment(resolved.resolvedAt).toString()} className="timestamp">{moment(resolved.resolvedAt).fromNow()}</span>
												</span>
												<span className="text"><p>{resolved.note}</p></span>
											</>
										)
									: null}
						</span>
					</div>
				</summary>
				{ props.report.post ? <WebPostView post={props.report.post} isReply={false} /> : <p>Post could not be found</p> }
			</details>
		</li>
	);
}

export function WebModerateUserView(props: ModerateUserViewProps): ReactNode {
	const url = useUrl();
	const cache = useCache();
	const pnidName = props.pnid.mii?.name ?? props.pnid.username;
	const head = (
		<>
			<WebUserPageMeta user={props.pnid} userSettings={props.userSettings} withImage />
		</>
	);

	return (
		<WebRoot type="admin" head={head}>
			<h2 id="title" className="page-header">
				<T k="global.user_page" />
			</h2>
			<WebNavBar selection={-1} />
			<div id="toast"></div>
			<WebWrapper>
				<div className="community-top">
					<img className="banner" src="https://juxt-web-cdn.b-cdn.net/images/banner.png" alt="" />
					<div className="community-info">
						<img className={cx('user-icon', { verified: props.pnid.accessLevel > 2 })} src={url.cdn(`/mii/${props.userSettings.pid}/normal_face.png`)} />
						<h2 className="community-title">
							{pnidName}
							{' '}
							@
							{props.pnid.username}
							{props.pnid.accessLevel >= 2 ? <span className="verified-badge">✓</span> : null}
						</h2>
					</div>
					<h4 className="community-description">
						{props.userSettings.profile_comment}
						<WebUserTier user={props.pnid} />
					</h4>
					<div className="info-boxes-wrapper">
						<div>
							<h4><T k="user_page.country" /></h4>
							<h4>{props.pnid.country}</h4>
						</div>
						<div>
							<h4><T k="user_page.birthday" /></h4>
							<h4>{moment.utc(props.pnid.birthdate).format('MMM Do')}</h4>
						</div>
						<div>
							<h4><T k="user_page.game_experience" /></h4>
							<h4>
								{props.userSettings.game_skill === 0
									? (
											<><T k="setup.experience_text.beginner" /></>
										)
									: props.userSettings.game_skill === 1
										? (
												<><T k="setup.experience_text.intermediate" /></>
											)
										: props.userSettings.game_skill === 2
											? (
													<><T k="setup.experience_text.expert" /></>
												)
											: <><T k="user_page.game_experience_unknown" /></>}
							</h4>
						</div>
						<div>
							<h4><T k="user_page.followers" /></h4>
							<h4 id="user-page-followers-tab">{props.userContent.following_users.length}</h4>
						</div>
						<div>
							<h4>User Profile Link</h4>
							<h4><a href={`/users/${props.userSettings.pid}`}>User Profile Link</a></h4>
						</div>
					</div>
				</div>
				<div className="p-3 py-5">
					<div className="mt-5 text-center">
						<h4 className="text-right">Juxt User Settings</h4>
					</div>
					<div className="row mt-2">
						<div className="col">
							<label htmlFor="account_status" className="labels">Account Status</label>
							<select className="form-select" aria-label="Account Status" name="account_status" id="account_status">
								<option value="0" selected={props.userSettings.account_status === 0}>Normal</option>
								<option value="1" selected={props.userSettings.account_status === 1}>Limited from Posting</option>
								<option value="2" selected={props.userSettings.account_status === 2}>Temp Ban</option>
								<option value="3" selected={props.userSettings.account_status === 3}>Permanent Ban</option>
							</select>
						</div>
						<div className="col">
							<label htmlFor="ban_lift_date_picker" className="labels">Banned Until:</label>
							<input type="datetime-local" id="ban_lift_date_picker" name="ban_lift_date" />
							<input type="hidden" id="ban_lift_date" value={props.userSettings.ban_lift_date?.toISOString()} />
						</div>
						<div className="col">
							UTC:
							{' '}
							<span id="ban_lift_date_utc"></span>
						</div>
						<div className="col">
							Remaining:
							{' '}
							<span id="ban_lift_date_duration"></span>
						</div>
						<div className="col">
							<label htmlFor="ban_reason" className="labels">Ban Reason</label>
							<input id="ban_reason" type="text" className="form-control" placeholder="Ban reason" style={{ width: '100%' }} value={props.userSettings.ban_reason ?? undefined} />
						</div>
					</div>
					<div className="mt-5 text-center">
						<button className="btn btn-primary profile-button" type="button" data-button-admin-save-pnid={props.userSettings.pid}>Save User</button>
					</div>
				</div>
				<details open>
					<summary>
						<div className="mt-5">
							<h4>
								Recent Profile Actions (
								{props.auditLog.length}
								, limit 50 most recent)
							</h4>
						</div>
					</summary>
					<ul className="list-content-with-icon-and-text arrow-list">
						{props.auditLog.length === 0 ? <h4>There's nothing here...</h4> : null}
						{props.auditLog.map(log => (
							<li className="reports">
								<details>
									<summary>
										<div className="hover">
											<a href={`/users/${log.actor}`} className="icon-container notify">
												<img src={url.cdn(`/mii/${log.actor}/normal_face.png`)} className="icon" style={{ width: '32px', height: '32px' }} />
											</a>
											<span className="body messages report">
												<span className="text">
													<a href={`/users/${log.actor}`} className="nick-name">{cache.getUserName(log.actor)}</a>
													<span title={moment(log.timestamp).toString()} className="timestamp">
														:
														{log.action}
														{' '}
														{moment(log.timestamp).fromNow()}
													</span>
												</span>
											</span>
										</div>
									</summary>
									<span className="text">
										<p style={{ whiteSpace: 'pre-line', padding: '0 30px' }}>{log.context.trim()}</p>
									</span>
								</details>
							</li>
						))}
					</ul>
				</details>
				<details>
					<summary>
						<div className="mt-5">
							<h4>
								Recently Reported Posts (
								{props.reports.length}
								, limit 50 most recent)
							</h4>
						</div>
					</summary>
					<ul className="list-content-with-icon-and-text arrow-list">
						{props.reports.length === 0 ? <h4>There's nothing here...</h4> : null}
						{props.reports.map(report => <ModerateUserReportView key={report.id} report={report} reasonMap={props.reasonMap} />) }
					</ul>
				</details>
				<details>
					<summary>
						<div className="mt-5">
							<h4>
								Recently Submitted Reports (
								{props.submittedReports.length}
								, limit 50 most recent)
							</h4>
						</div>
					</summary>
					<ul className="list-content-with-icon-and-text arrow-list">
						{props.submittedReports.length === 0 ? <h4>There's nothing here...</h4> : null}
						{props.submittedReports.map(report => <ModerateUserReportView key={report.id} report={report} reasonMap={props.reasonMap} />) }
					</ul>
				</details>

				<details>
					<summary>
						<div className="mt-5">
							<h4>
								Recently Removed Posts (
								{props.removedPosts.length}
								, limit 50 most recent)
							</h4>
						</div>
					</summary>
					<ul className="list-content-with-icon-and-text arrow-list">
						{props.removedPosts.length === 0 ? <h4>There's nothing here...</h4> : null}
						{props.removedPosts.map(post => (
							<li className="reports">
								<details>
									<summary>
										<div className="hover">
											<a href={`/users/${post.removed_by}`} className="icon-container notify">
												<img src={url.cdn(`/mii/${post.removed_by}/normal_face.png`)} className="icon" />
											</a>
											<span className="body messages report">
												<span className="text">
													<a href={`/users/${post.removed_by}`} className="nick-name">
														Removed By:
														{post.removed_by ? cache.getUserName(post.removed_by) : 'Nobody'}
													</a>
													<span title={moment(post.removed_at).toString()} className="timestamp">{moment(post.removed_at).fromNow()}</span>
												</span>
												<span className="text">
													<p>
														{post.removed_reason}
													</p>
												</span>
											</span>
										</div>
									</summary>
									<WebPostView post={post} isReply={false} />
								</details>
							</li>
						))}
					</ul>
				</details>
			</WebWrapper>
		</WebRoot>
	);
}
