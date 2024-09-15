import { scheduleJob } from 'node-schedule';
import { prisma } from './db';
import { ensureMomentsForNext30Days } from './moments';
import { scheduleMoment } from './now';

export async function bootup() {
	await ensureMomentsForNext30Days();
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);
	const moments = await prisma.moment.findMany({
		where: {
			date: {
				gte: startOfToday
			}
		}
	});
	for (const moment of moments) {
		scheduleMoment(moment);
	}
	scheduleJob('0 1 0 * * *', async () => {
		await ensureMomentsForNext30Days();
	});
}
