// src/hooks.server.ts
import { lucia } from '$lib/server/auth';
import { bootup } from '$lib/server/bootup';
import { prisma } from '$lib/server/db';
import type { Handle } from '@sveltejs/kit';

await bootup();

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	if (user) {
		event.locals.user = await prisma.user.findUnique({ where: { id: user.id } });
		event.locals.session = session;
	}
	return resolve(event);
};
