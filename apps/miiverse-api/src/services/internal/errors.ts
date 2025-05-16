export class InternalAPIError extends Error {
	status: number;

	constructor(status: number, message?: string) {
		super(message);
		this.status = status;
	}
}

export const errors = {
	badRequest: InternalAPIError.bind(null, 400),
	unauthorized: InternalAPIError.bind(null, 401),
	forbidden: InternalAPIError.bind(null, 403),

	serverError: InternalAPIError.bind(null, 500)
};
