import cx from 'classnames';
import moment from 'moment';
import { WebRoot, WebWrapper } from '@/services/juxt-web/views/web/root';
import { WebNavBar } from '@/services/juxt-web/views/web/navbar';
import { WebPostView } from '@/services/juxt-web/views/web/post';
import { WebUserPageMeta, WebUserTier } from '@/services/juxt-web/views/web/userPageView';
import { useUrl } from '@/services/juxt-web/views/common/hooks/useUrl';
import { useCache } from '@/services/juxt-web/views/common/hooks/useCache';
import { T } from '@/services/juxt-web/views/common/components/T';
import { WebAccountStatusEditor } from '@/services/juxt-web/views/web/admin/accountStatusEditor';
import type { ReactNode } from 'react';
import type { GetUserDataResponse as AccountGetUserDataResponse } from '@pretendonetwork/grpc/account/get_user_data_rpc';
import type { InferSchemaType } from 'mongoose';
import type { HydratedSettingsDocument } from '@/models/settings';
import type { ContentSchema } from '@/models/content';
import type { HydratedReportDocument } from '@/models/report';
import type { PostSchema } from '@/models/post';
import type { auditLogSchema } from '@/models/logs';

export type ModerateUserViewProps = {
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
					<WebAccountStatusEditor userSettings={props.userSettings} />
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
						{props.reports.map((report) => {
							const post = props.postsMap.find(post => post.id === report.post_id);
							return (
								<li key={report.id} className="reports">
									<details>
										<summary>
											<div className="hover">
												<a href={`/users/${report.reported_by}`} className="icon-container notify">
													<img src={url.cdn(`/mii/${report.reported_by}/normal_face.png`)} className="icon" />
												</a>
												<span className="body messages report">
													<span className="text">
														<a href={`/users/${report.reported_by}`} className="nick-name">
															Reported By:
															{cache.getUserName(report.reported_by)}
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
																			{report.resolved_by ? cache.getUserName(report.resolved_by) : 'Nobody'}
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
										{ post ? <WebPostView post={post} isReply={false} /> : <p>Post could not be found</p> }
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
												<a href={`/users/${report.reported_by}`} className="icon-container notify">
													<img src={url.cdn(`/mii/${report.reported_by}/normal_face.png`)} className="icon" />
												</a>
												<span className="body messages report">
													<span className="text">
														<a href={`/users/${report.reported_by}`} className="nick-name">
															Reported By:
															{cache.getUserName(report.reported_by)}
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
																			{report.resolved_by ? cache.getUserName(report.resolved_by) : 'Nobody'}
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
										{ post ? <WebPostView post={post} isReply={false} /> : <p>Post could not be found</p> }
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
