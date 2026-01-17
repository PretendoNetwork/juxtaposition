import cx from 'classnames';
import moment from 'moment';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { utils } from '@/services/juxt-web/views/utils';
import { WebPostView } from '@/services/juxt-web/views/web/post';
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
	const pageTitle = `Juxt - ${pnidName}`;
	const pageImage = utils.cdn(props.ctx, `/mii/${props.userSettings.pid}/smile_open_mouth.png`);
	const head = (
		<>
			<script src="/js/admin.global.js"></script>
			<link rel="stylesheet" href="/css/admin.css" />
			<title>{pageTitle}</title>

			{/* Google / Search Engine Tags */}
			<meta itemProp="name" content={pageTitle} />
			{props.userSettings.profile_comment_visibility ? <meta itemProp="description" content={props.userSettings.profile_comment ?? undefined} /> : null}
			<meta itemProp="image" content={pageImage} />

			{/* Open Graph Meta Tags */}
			<meta property="og:title" content={pageTitle} />
			{props.userSettings.profile_comment_visibility ? <meta property="og:description" content={props.userSettings.profile_comment ?? undefined} /> : null}
			<meta property="og:url" content={`https://juxt.pretendo.network/users/${props.userSettings.pid}`} />
			<meta property="og:image" content={pageImage} />
			<meta property="og:site_name" content="Juxtaposition" />

			{/* Twitter Meta Tags */}
			<meta name="twitter:card" content="summary_large_image" />
			<meta name="twitter:title" content={pageTitle} />
			{props.userSettings.profile_comment_visibility ? <meta name="twitter:description" content={props.userSettings.profile_comment ?? undefined} /> : null}
			<meta name="twitter:site" content="@PretendoNetwork" />
			<meta name="twitter:image" content={pageImage} />
			<meta name="twitter:creator" content="@PretendoNetwork" />

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
						{props.pnid.tierName === 'Mario'
							? (
									<span className="supporter-star mario">
										|
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 23 23" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
									</span>
								)
							: props.pnid.tierName === 'Super Mario'
								? (
										<span className="supporter-star super">
											|
											<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 23 23" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
										</span>
									)
								: props.pnid.tierName === 'Mega Mushroom'
									? (
											<span className="supporter-star mega">
												|
												<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 23 23" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" className="feather feather-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
											</span>
										)
									: null }

						{ props.pnid.accessLevel === 3
							? (
									<span className="supporter-star dev">
										|
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 23 23" fill="rainbow" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-tool">
											<defs>
												<linearGradient id="rainbow">
													<stop offset="16%" stop-color="red" />
													<stop offset="32%" stop-color="orange" />
													<stop offset="48%" stop-color="yellow" />
													<stop offset="64%" stop-color="green" />
													<stop offset="80%" stop-color="blue" />
													<stop offset="96%" stop-color="purple" />
												</linearGradient>
											</defs>
											<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
										</svg>
									</span>
								)
							: null}
						{ props.pnid.accessLevel === 2
							? (
									<span className="supporter-star mega">
										|
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 23 23" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="feather feather-shield"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
									</span>
								)
							: null}
						{ props.pnid.accessLevel === 1
							? (
									<span className="supporter-star tester">
										|
										<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 256 256" fill="none" stroke="currentColor">
											<path d="M104,32V93.8a8.4,8.4,0,0,1-1.1,4.1l-63.6,106A8,8,0,0,0,46.1,216H209.9a8,8,0,0,0,6.8-12.1l-63.6-106a8.4,8.4,0,0,1-1.1-4.1V32" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
											<line x1="88" y1="32" x2="168" y2="32" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
											<path d="M62.6,165c11.8-8.7,32.1-13.6,65.4,3,35.7,17.9,56.5,10.8,67.9,1.1" stroke-linecap="round" stroke-linejoin="round" stroke-width="16" />
										</svg>
									</span>
								)
							: null}
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
							if (!post) {
								return <React.Fragment key={report.id} />;
							}
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
										<WebPostView ctx={props.ctx} post={post} isReply={false} />
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
							if (!post) {
								return <React.Fragment key={report.id} />;
							}
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
										<WebPostView ctx={props.ctx} post={post} isReply={false} />
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
