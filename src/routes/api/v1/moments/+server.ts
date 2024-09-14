import { checkApiKey, fail, ok } from '$lib/server/api';
import { prisma } from '$lib/server/db';
import type { RequestHandler } from './$types';

const MAX_MOMENTS = 30;

export const GET: RequestHandler = async ({ request, url }) => {
	const error = await checkApiKey(request);
	if (error) {
		return error;
	}

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
