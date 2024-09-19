import { Lucia } from 'lucia';
import { building, dev } from '$app/environment';
import { PrismaAdapter } from '@lucia-auth/adapter-prisma';
import { PrismaClient } from '@prisma/client';

const client = building ? (null as any as PrismaClient) : new PrismaClient();

const adapter = building
	? (null as any as PrismaAdapter<PrismaClient>)
	: new PrismaAdapter(client.session, client.user);

export const lucia = building
	? (null as any as Lucia)
	: new Lucia(adapter, {
			sessionCookie: {
				attributes: {
					secure: !dev
				}
			},
			getUserAttributes: (attributes) => {
				return {
					email: attributes.email
				};
			}
		});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: DatabaseUserAttributes;
	}
}

interface DatabaseUserAttributes {
	email: string;
}
