import { renderToStaticMarkup } from 'react-dom/server';
import { buildContext } from '@/services/juxt-web/views/context';
import { WebErrorView } from '@/services/juxt-web/views/web/errorView';
import { CtrErrorView } from '@/services/juxt-web/views/ctr/errorView';
import { PortalErrorView } from '@/services/juxt-web/views/portal/errorView';
import type { ReactElement } from 'react';
import type { RequestHandler } from 'express';
import type { ErrorViewProps } from '@/services/juxt-web/views/web/errorView';

const htmlDoctype = '<!DOCTYPE html>';

export function renderJsx(el: ReactElement): string {
	const html = renderToStaticMarkup(el);
	const htmlWithEvents = html.replace(/ evt-([a-z]+)="/g, ' on$1="');
	return htmlWithEvents;
}

/**
 * Render JSX as static markup. Only static! No state or event handlers are supported.
 */
export const jsxRenderer: RequestHandler = (request, response, next) => {
	response.jsx = (el, addDoctype): typeof response => {
		const prefix = (addDoctype ?? true) ? htmlDoctype + '\n' : '';
		response.send(prefix + renderJsx(el));
		return response;
	};

	response.jsxForDirectory = (opt): typeof response => {
		const disabledFor = opt.disableDoctypeFor ?? [];
		const directory = request.directory;
		if (directory === 'ctr' && opt.ctr) {
			response.jsx(opt.ctr, !disabledFor.includes('ctr'));
			return response;
		}

		if (directory === 'portal' && opt.portal) {
			response.jsx(opt.portal, !disabledFor.includes('portal'));
			return response;
		}

		if (directory === 'web' && opt.web) {
			response.jsx(opt.web, !disabledFor.includes('web'));
			return response;
		}

		throw new Error('Invalid directory to render JSX for');
	};

	response.renderError = (opt): typeof response => {
		const props: ErrorViewProps = {
			ctx: buildContext(response),
			requestId: request.id,
			code: opt.code,
			message: opt.message
		};
		response.jsxForDirectory({
			web: <WebErrorView {...props} />,
			ctr: <CtrErrorView {...props} />,
			portal: <PortalErrorView {...props} />
		});
		return response;
	};
	next();
};
