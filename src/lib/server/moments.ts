import { TIME_WINDOW, REGIONS } from '$lib/constants/regions';
import { id } from '$lib/helpers';
import { prisma } from './db';
import { scheduleMoment } from './now';

export async function ensureMomentsForMonth() {
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
			TIME_WINDOW.start + Math.floor(Math.random() * (TIME_WINDOW.end - TIME_WINDOW.start)),
			Math.floor(Math.random() * 60),
			Math.floor(Math.random() * 60),
			Math.floor(Math.random() * 1000)
		);

	const timestampEU = randomTimeStamp();
	timestampEU.setHours(timestampEU.getHours() + REGIONS.EU.utcOffset);
	const timestampUS = new Date(timestampEU);
	timestampUS.setHours(timestampEU.getHours() + REGIONS.US.utcOffset);
	const timestampWA = new Date(timestampEU);
	timestampWA.setHours(timestampEU.getHours() + REGIONS.WA.utcOffset);
	const timestampEA = new Date(timestampEU);
	timestampEA.setHours(timestampEU.getHours() + REGIONS.EA.utcOffset);

	const justDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
	const moment = await prisma.moment.create({
		data: {
			id: id('Moment'),
			date: justDate,
			timestampEU,
			timestampUS,
			timestampWA,
			timestampEA
		}
	});
	scheduleMoment(moment);
	return moment;
}
