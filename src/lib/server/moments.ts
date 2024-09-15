import { TIME_WINDOW, REGIONS } from '$lib/constants/regions';
import { id } from '$lib/helpers';
import { prisma } from './db';
import { scheduleMoment } from './now';

export async function ensureMomentsForNext30Days() {
	const today = new Date();
	const startDay = new Date();
	startDay.setDate(today.getDate() - 1);
	const endDay = new Date();
	endDay.setDate(today.getDate() + 30);
	const generationStartDate = new Date(
		startDay.getFullYear(),
		startDay.getMonth(),
		startDay.getDate()
	);
	const generationEndDate = new Date(endDay.getFullYear(), endDay.getMonth(), endDay.getDate());

	const newestMoment = await prisma.moment.findFirst({
		orderBy: {
			date: 'desc'
		}
	});

	if (!newestMoment) {
		await createMoments(generationStartDate, generationEndDate);
		return;
	}

	const newestMomentDate = new Date(newestMoment.date);
	if (newestMomentDate >= generationEndDate) return;

	const lastGeneratedDate = newestMomentDate;
	lastGeneratedDate.setDate(lastGeneratedDate.getDate() + 1);
	await createMoments(lastGeneratedDate, generationEndDate);
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
