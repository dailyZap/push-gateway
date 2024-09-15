import { TIME_WINDOW, REGIONS } from '$lib/constants/regions';
import { id } from '$lib/helpers';
import { prisma } from './db';
import { scheduleMoment } from './now';

function dayOnlyDate(date: Date) {
	return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function offsetDateByDays(date: Date, days: number) {
	date.setDate(date.getDate() + days);
	return date;
}

export async function ensureMomentsForNext30Days() {
	const today = dayOnlyDate(new Date());
	const startDate = offsetDateByDays(today, -1);
	const endDate = offsetDateByDays(today, 30);

	const newestMoment = await prisma.moment.findFirst({
		orderBy: {
			date: 'desc'
		}
	});

	if (!newestMoment) {
		await createMoments(startDate, endDate);
		return;
	}

	const newestMomentDate = new Date(newestMoment.date);
	if (newestMomentDate >= endDate) return;

	const lastGeneratedDate = newestMomentDate;
	lastGeneratedDate.setDate(lastGeneratedDate.getDate() + 1);
	await createMoments(lastGeneratedDate, endDate);
}

async function createMoments(start: Date, end: Date) {
	const date = new Date(start);
	while (date <= end) {
		await createMoment(date);
		date.setDate(date.getDate() + 1);
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
