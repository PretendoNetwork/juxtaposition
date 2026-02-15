import cx from 'classnames';
import moment from 'moment';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { utils } from '@/services/juxt-web/views/utils';
import { WebPostView } from '@/services/juxt-web/views/web/post';
import { WebUserPageMeta, WebUserTier } from '@/services/juxt-web/views/web/userPageView';
import type { ReactNode } from 'react';
import type { GetUserDataResponse as AccountGetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { InferSchemaType } from 'mongoose';
import type { RenderContext } from '@/services/juxt-web/views/context';
import type { HydratedSettingsDocument } from '@/models/settings';
import type { ContentSchema } from '@/models/content';
import type { HydratedReportDocument } from '@/models/report';
import type { PostSchema } from '@/models/post';
import type { auditLogSchema } from '@/models/logs';

export type ModerateUserViewProps = {
	ctx: RenderContext;
	pnid: AccountGetUserDataResponse;
	userSettings: HydratedSettingsDocument;
	userContent: InferSchemaType<typeof ContentSchema>;
	removedPosts: InferSchemaType<typeof PostSchema>[];
	reports: HydratedReportDocument[];
	submittedReports: HydratedReportDocument[];
	postsMap: InferSchemaType<typeof PostSchema>[];
	reasonMap: string[];
	auditLog: InferSchemaType<typeof auditLogSchema>[];
};

export function WebModerateUserView(props: ModerateUserViewProps): ReactNode {
	const pnidName = props.pnid.mii?.name ?? props.pnid.username;
	const head = (
		<>
			<script src="/js/admin.global.js"></script>
			<link rel="stylesheet" href="/css/admin.css" />
			<WebUserPageMeta ctx={props.ctx} user={props.pnid} userSettings={props.userSettings} />
		</>
	);

	return (
		<WebRoot head={head}>
			<h2 id="title" className="page-header">
				{props.ctx.lang.global.user_page}
			</h2>
			<WebNavBar ctx={props.ctx} selection={-1} />
			<div id="toast"></div>
			<WebWrapper>
				<div className="community-top">
					<img className="banner" src="https://juxt-web-cdn.b-cdn.net/images/banner.png" alt="" />
					<div className="community-info">
						<img className={cx('user-icon', { verified: props.pnid.accessLevel > 2 })} src={utils.cdn(props.ctx, `/mii/${props.userSettings.pid}/normal_face.png`)} />
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
							<h4>{props.ctx.lang.user_page.country}</h4>
							<h4>{props.pnid.country}</h4>
						</div>
						<div>
							<h4>{ props.ctx.lang.user_page.birthday }</h4>
							<h4>{moment.utc(props.pnid.birthdate).format('MMM Do')}</h4>
						</div>
						<div>
							<h4>{ props.ctx.lang.user_page.game_experience }</h4>
							<h4>
								{props.userSettings.game_skill === 0
									? (
											<>{props.ctx.lang.setup.experience_text.beginner}</>
										)
									: props.userSettings.game_skill === 1
										? (
												<>{props.ctx.lang.setup.experience_text.intermediate}</>
											)
										: props.userSettings.game_skill === 2
											? (
													<>{props.ctx.lang.setup.experience_text.expert}</>
												)
											: <>N/A</>}
							</h4>
						</div>
						<div>
							<h4>{props.ctx.lang.user_page.followers}</h4>
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
						<button className="btn btn-primary profile-button" type="button" evt-click={`savePNID(${props.userSettings.pid})`}>Save User</button>
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
											<a href={`/users/${log.actor}`} data-pjax="#body" className="icon-container notify">
												<img src={utils.cdn(props.ctx, `/mii/${log.actor}/normal_face.png`)} className="icon" style={{ width: '32px', height: '32px' }} />
											</a>
											<span className="body messages report">
												<span className="text">
													<a href={`/users/${log.actor}`} className="nick-name">{props.ctx.usersMap.get(log.actor)}</a>
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
						{props.reports.map((report) => {
							const post = props.postsMap.find(post => post.id === report.post_id);
							return (
								<li key={report.id} className="reports">
									<details>
										<summary>
											<div className="hover">
												<a href={`/users/${report.reported_by}`} data-pjax="#body" className="icon-container notify">
													<img src={utils.cdn(props.ctx, `/mii/${report.reported_by}/normal_face.png`)} className="icon" />
												</a>
												<span className="body messages report">
													<span className="text">
														<a href={`/users/${report.reported_by}`} className="nick-name">
															Reported By:
															{props.ctx.usersMap.get(report.reported_by)}
														</a>
														<span title={moment(report.created_at).toString()} className="timestamp">{moment(report.created_at).fromNow()}</span>
													</span>
													<span className="text">
														<h4>
															{props.reasonMap[report.reason] ?? 'Unknown'}
														</h4>
														<p>
															{report.message}
														</p>
													</span>
													{ report.resolved
														? (
																<>
																	<span className="text">
																		<span className="nick-name">
																			Resolved By:
																			{report.resolved_by ? props.ctx.usersMap.get(report.resolved_by) : 'Nobody'}
																		</span>
																		<span title={moment(report.resolved_at).toString()} className="timestamp">{moment(report.resolved_at).fromNow()}</span>
																	</span>
																	<span className="text"><p>{report.note}</p></span>
																</>
															)
														: null}
												</span>
											</div>
										</summary>
										{ post ? <WebPostView ctx={props.ctx} post={post} isReply={false} /> : <p>Post could not be found</p> }
									</details>
								</li>
							);
						})}
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
						{props.submittedReports.map((report) => {
							const post = props.postsMap.find(post => post.id === report.post_id);
							return (
								<li key={report.id} className="reports">
									<details>
										<summary>
											<div className="hover">
												<a href={`/users/${report.reported_by}`} data-pjax="#body" className="icon-container notify">
													<img src={utils.cdn(props.ctx, `/mii/${report.reported_by}/normal_face.png`)} className="icon" />
												</a>
												<span className="body messages report">
													<span className="text">
														<a href={`/users/${report.reported_by}`} className="nick-name">
															Reported By:
															{props.ctx.usersMap.get(report.reported_by)}
														</a>
														<span title={moment(report.created_at).toString()} className="timestamp">{moment(report.created_at).fromNow()}</span>
													</span>
													<span className="text">
														<h4>
															{props.reasonMap[report.reason] ?? 'Unknown'}
														</h4>
														<p>
															{report.message}
														</p>
													</span>
													{ report.resolved
														? (
																<>
																	<span className="text">
																		<span className="nick-name">
																			Resolved By:
																			{report.resolved_by ? props.ctx.usersMap.get(report.resolved_by) : 'Nobody'}
																		</span>
																		<span title={moment(report.resolved_at).toString()} className="timestamp">{moment(report.resolved_at).fromNow()}</span>
																	</span>
																	<span className="text"><p>{report.note}</p></span>
																</>
															)
														: null}
												</span>
											</div>
										</summary>
										{ post ? <WebPostView ctx={props.ctx} post={post} isReply={false} /> : <p>Post could not be found</p> }
									</details>
								</li>
							);
						})}
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
											<a href={`/users/${post.removed_by}`} data-pjax="#body" className="icon-container notify">
												<img src={utils.cdn(props.ctx, `/mii/${post.removed_by}/normal_face.png`)} className="icon" />
											</a>
											<span className="body messages report">
												<span className="text">
													<a href={`/users/${post.removed_by}`} className="nick-name">
														Removed By:
														{post.removed_by ? props.ctx.usersMap.get(post.removed_by) : 'Nobody'}
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
									<WebPostView ctx={props.ctx} post={post} isReply={false} />
								</details>
							</li>
						))}
					</ul>
				</details>
			</WebWrapper>
		</WebRoot>
	);
}
