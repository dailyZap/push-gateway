// src/app.d.ts
declare global {
	namespace App {
		interface Locals {
			user: import('@prisma/client').User | null;
			session: import('lucia').Session | null;
		}
	}
}

export {};
