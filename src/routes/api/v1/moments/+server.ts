import { id } from '$lib/helpers';
import { checkApiKey, fail, ok } from '$lib/server/api';
import { prisma } from '$lib/server/db';
import type { RequestHandler } from './$types';

const MAX_MOMENTS = 30;

export const GET: RequestHandler = async ({ request, url }) => {
	const error = await checkApiKey(request);
	if (error) {
		return error;
	}

	await ensureMomentsForMonth();
	const take = Math.min(
		parseInt(url.searchParams.get('limit') as string) || MAX_MOMENTS,
		MAX_MOMENTS
	);
	const after = url.searchParams.get('after');
	const afterTimestamp = after ? new Date(parseInt(after)) : null;
	const yesterdayStart = new Date();
	yesterdayStart.setDate(yesterdayStart.getDate() - 1);
	yesterdayStart.setHours(0, 0, 0, 0);
	const moments = (
		await prisma.moment.findMany({
			orderBy: {
				id: 'asc'
			},
			where: afterTimestamp
				? {
						timestamp: {
							gt: afterTimestamp
						}
					}
				: {
						timestamp: {
							gte: yesterdayStart
						}
					},
			take
		})
	).map((m) => ({
		id: m.id,
		timestamp: m.timestamp.getTime()
	}));
	return ok({
		moments: moments
	});
};

async function ensureMomentsForMonth() {
	// ToDo: make smarter
	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);
	const todayStart = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
	const todayEnd = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);
	let todayMoment = await prisma.moment.findFirst({
		where: {
			AND: [{ timestamp: { gte: todayStart } }, { timestamp: { lt: todayEnd } }]
		}
	});
	if (!todayMoment) {
		todayMoment = await createMoment(todayStart);
	}
	for (let i = 1; i < 30; i++) {
		const date = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + i);
		const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const end = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
		let moment = await prisma.moment.findFirst({
			where: {
				AND: [{ timestamp: { gte: start } }, { timestamp: { lt: end } }]
			}
		});
		if (!moment) {
			moment = await createMoment(start);
		}
	}
}

async function createMoment(date: Date) {
	const timestamp = new Date(
		date.getFullYear(),
		date.getMonth(),
		date.getDate(),
		9 + Math.floor(Math.random() * 12),
		Math.floor(Math.random() * 60),
		Math.floor(Math.random() * 60),
		Math.floor(Math.random() * 1000)
	);
	return await prisma.moment.create({
		data: {
			timestamp,
			id: id('Moment')
		}
	});
}
