import { NOTIFICATION_PRIORITIES } from '$lib/constants/notification-priorities';
import { checkApiKey, fail, ok } from '$lib/server/api';
import { messaging } from '$lib/server/fcm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const error = await checkApiKey(request);
	if (error) {
		return error;
	}

	const body = (await request.json().catch(() => null)) as {
		notifications: {
			deviceToken: string;
			notificationId: string;
		}[];
	} | null;

	if (!body || !Array.isArray(body.notifications) || body.notifications.length === 0) {
		return fail(400, 'Bad Request');
	}

	for (const m of body.notifications) {
		if (typeof m.deviceToken !== 'string' || typeof m.notificationId !== 'string') {
			return fail(400, 'Bad Request');
		}
		if (m.deviceToken.length === 0 || m.notificationId.length === 0) {
			return fail(400, 'Bad Request');
		}
	}

	await messaging.sendEach(
		body.notifications.map((m) => ({
			token: m.deviceToken,
			data: {
				notificationId: m.notificationId
			},
			...NOTIFICATION_PRIORITIES
		}))
	);

	return ok({ success: true });
};
