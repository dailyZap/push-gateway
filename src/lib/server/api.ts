import { prisma } from './db';

export async function fail(code: number, error: string) {
	return new Response(JSON.stringify({ error }), {
		status: code,
		headers: {
			'content-type': 'application/json'
		}
	});
}

export async function ok(data: any) {
	return new Response(JSON.stringify(data), {
		headers: {
			'content-type': 'application/json'
		}
	});
}

export async function checkApiKey(request: Request) {
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
	return null;
}
