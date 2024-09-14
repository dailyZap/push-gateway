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
						date: {
							gt: afterTimestamp
						}
					}
				: {
						date: {
							gte: yesterdayStart
						}
					},
			take
		})
	).map((m) => ({
		id: m.id,
		date: m.date.getTime(),
		time: {
			EU: m.timestampEU.getTime(),
			US: m.timestampUS.getTime(),
			WA: m.timestampWA.getTime(),
			EA: m.timestampEA.getTime()
		}
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
	let todayMoment = await prisma.moment.findFirst({
		where: {
			date: todayStart
		}
	});
	if (!todayMoment) {
		todayMoment = await createMoment(todayStart);
	}

	// most future moment
	const futureMoment = await prisma.moment.findFirstOrThrow({
		orderBy: {
			date: 'desc'
		}
	});
	const mostDaysInAdvance = 30;
	// if not enough moments, create more
	if (
		!futureMoment ||
		(futureMoment.date.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24) < mostDaysInAdvance
	) {
		const daysToCreate =
			mostDaysInAdvance -
			(futureMoment.date.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24);
		for (let i = 0; i < daysToCreate; i++) {
			await createMoment(
				new Date(todayStart.getFullYear(), todayStart.getMonth(), todayStart.getDate() + i)
			);
		}
	}
}

async function createMoment(date: Date) {
	const randomTimeStamp = () =>
		new Date(
			date.getFullYear(),
			date.getMonth(),
			date.getDate(),
			9 + Math.floor(Math.random() * 12),
			Math.floor(Math.random() * 60),
			Math.floor(Math.random() * 60),
			Math.floor(Math.random() * 1000)
		);

	const timezoneOffsetsHours = {
		EU: 0,
		US: -6,
		WA: -8,
		EA: 8
	};

	const timestampEU = randomTimeStamp();
	const timestampUS = new Date(timestampEU);
	timestampUS.setHours(timestampEU.getHours() + timezoneOffsetsHours.US);
	const timestampWA = new Date(timestampEU);
	timestampWA.setHours(timestampEU.getHours() + timezoneOffsetsHours.WA);
	const timestampEA = new Date(timestampEU);
	timestampEA.setHours(timestampEU.getHours() + timezoneOffsetsHours.EA);

	const justDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	return await prisma.moment.create({
		data: {
			id: id('Moment'),
			date: justDate,
			timestampEU,
			timestampUS,
			timestampWA,
			timestampEA
		}
	});
}
