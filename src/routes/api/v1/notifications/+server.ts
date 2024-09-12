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
			// Ensure that data-only notifications are also delivered when the app is closed.
			android: {
				priority: 'high'
			},
			apns: {
				payload: {
					aps: {
						contentAvailable: true
					}
				},
				headers: {
					'apns-push-type': 'background',
					'apns-priority': '5', // Must be `5` when `contentAvailable` is set to true.
					'apns-topic': 'io.flutter.plugins.firebase.messaging' // Required for background notifications on iOS.
				}
			}
		}))
	);

	return ok({ success: true });
};
