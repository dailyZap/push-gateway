import { prisma } from '$lib/server/db';
import { messaging } from '$lib/server/fcm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const fail = (code: number, error: string) => {
		return new Response(JSON.stringify({ error }), {
			status: code,
			headers: {
				'content-type': 'application/json'
			}
		});
	};
	const apiKey = request.headers.get('x-api-key');
	if (!apiKey) {
		return fail(401, 'Unauthorized');
	}

	const dbApiKey = await prisma.apiKey.findUnique({
		where: {
			key: apiKey
		},
		include: {
			server: true
		}
	});

	if (!dbApiKey || !dbApiKey.active) {
		return fail(401, 'Unauthorized');
	}

	await prisma.apiKey.update({
		where: {
			id: dbApiKey.id
		},
		data: {
			lastUsed: new Date()
		}
	});

	const body = (await request.json().catch(() => null)) as {
		messages: {
			deviceToken: string;
			notificationId: string;
		}[];
	} | null;

	if (!body || !Array.isArray(body.messages) || body.messages.length === 0) {
		return fail(400, 'Bad Request');
	}

	for (const m of body.messages) {
		if (typeof m.deviceToken !== 'string' || typeof m.notificationId !== 'string') {
			return fail(400, 'Bad Request');
		}
		if (m.deviceToken.length === 0 || m.notificationId.length === 0) {
			return fail(400, 'Bad Request');
		}
	}

	await messaging.sendEach(
		body.messages.map((m) => ({
			token: m.deviceToken,
			data: {
				notificationId: m.notificationId
			}
		}))
	);

	return new Response(JSON.stringify({ success: true }), {
		headers: {
			'content-type': 'application/json'
		}
	});
};
