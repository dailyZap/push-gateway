import { checkApiKey, fail, ok } from '$lib/server/api';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request, locals }) => {
	const error = await checkApiKey(request);
	if (error) {
		return error;
	}
	return ok({ success: true });
};
