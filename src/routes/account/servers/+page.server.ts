import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { prisma } from '$lib/server/db';
import { randomBytes } from 'node:crypto';
import { validateServerDomain } from '$lib/server/validators';
import { MAX_SERVERS } from '$lib/config/config';

export const load: PageServerLoad = async (event) => {
	if (!event.locals.user) redirect(302, '/auth/login');

	const servers = await prisma.server.findMany({
		where: {
			userId: event.locals.user.id
		},
		include: {
			apiKeys: true
		}
	});
	return {
		servers: servers.map((s) => ({
			...s,
			apiKeys: s.apiKeys.map((apiKey) => ({
				...apiKey,
				shortenedKey: apiKey.key.slice(0, 8)
			}))
		})),
		user: event.locals.user
	};
};

export const actions: Actions = {
	createApiKey: async ({ request, locals }) => {
		const formData = await request.formData();
		const serverId = formData.get('serverId') as string;
		const server = await prisma.server.findFirstOrThrow({
			where: {
				id: serverId,
				userId: locals.user!.id
			}
		});
		const apiKey = `apik_${randomBytes(32).toString('hex')}`;
		await prisma.apiKey.create({
			data: {
				key: apiKey,
				serverId: server.id
			}
		});
	},
	deactivateApiKey: async ({ request, locals }) => {
		const formData = await request.formData();
		const apiKeyId = formData.get('apiKeyId') as string;
		const serverId = formData.get('serverId') as string;
		const apiKey = await prisma.apiKey.findFirstOrThrow({
			where: {
				id: apiKeyId,
				server: {
					id: serverId,
					userId: locals.user!.id
				}
			}
		});
		await prisma.apiKey.update({
			where: {
				id: apiKey.id
			},
			data: {
				active: false
			}
		});
	},
	createServer: async ({ request, locals }) => {
		const serverCount = await prisma.server.count({
			where: {
				userId: locals.user!.id
			}
		});
		if (serverCount >= MAX_SERVERS) {
			return fail(400, {
				message: 'You already have the maximum number of servers'
			});
		}

		const formData = await request.formData();
		const domain = formData.get('domain') as string;

		const successOrFailure = await validateServerDomain(domain);
		if (successOrFailure !== true) {
			return successOrFailure;
		}

		await prisma.server.create({
			data: {
				domain,
				userId: locals.user!.id
			}
		});
	}
};
