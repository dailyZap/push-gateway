// routes/signup/+page.server.ts
import { lucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import { generateIdFromEntropySize } from 'lucia';
import { hash } from '@node-rs/argon2';

import type { Actions } from './$types';
import { dev } from '$app/environment';
import { prisma } from '$lib/server/db';
import { Prisma, type Server, type User } from '@prisma/client';
import { validateServerDomain } from '$lib/server/validators';

export const actions: Actions = {
	register: async (event) => {
		const formData = await event.request.formData();
		const domain = formData.get('server');
		const name = formData.get('name');
		const password = formData.get('password');
		const passwordConfirmation = formData.get('passwordConfirmation');
		const email = formData.get('email');

		if (
			typeof domain !== 'string' ||
			typeof name !== 'string' ||
			typeof password !== 'string' ||
			typeof passwordConfirmation !== 'string' ||
			typeof email !== 'string'
		) {
			return fail(400, {
				message: 'Invalid form data'
			});
		}

		// validate server
		// must be domain only
		if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(domain)) {
			return fail(400, {
				message: 'Invalid server'
			});
		}

		const successOrFailure = await validateServerDomain(domain);
		if (successOrFailure !== true) {
			return successOrFailure;
		}

		if (typeof password !== 'string' || password.length < 6 || password.length > 255) {
			return fail(400, {
				message: 'Invalid password. Must be between 6 and 255 characters'
			});
		}
		if (password !== passwordConfirmation) {
			return fail(400, {
				message: 'Passwords do not match'
			});
		}
		const passwordHash = await hash(password, {
			// recommended minimum parameters
			memoryCost: 19456,
			timeCost: 2,
			outputLen: 32,
			parallelism: 1
		});

		let server: Server | null = null;
		try {
			server = await prisma.server.create({
				data: {
					domain,
					user: {
						create: {
							name,
							email,
							passwordHash
						}
					}
				}
			});
		} catch (e) {
			if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
				if ((e.meta?.target as string[])?.includes?.('email')) {
					return fail(400, {
						message: 'Email already in use'
					});
				} else if ((e.meta?.target as string[])?.includes?.('domain')) {
					return fail(400, {
						message: 'Domain already in use'
					});
				}
			}
			return fail(400, {
				message: 'Failed to create server'
			});
		}

		const session = await lucia.createSession(server.userId, {});
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/');
	}
};
