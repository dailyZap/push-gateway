import type { Moment } from '@prisma/client';
import { Scheduler } from './schedule';
import { messaging } from './fcm';
import type { Region } from '$lib/types/Region';

export function scheduleMoment(moment: Moment) {
	Scheduler.scheduleIfNotScheduled(`${moment.id}-EU`, moment.timestampEU, () =>
		handleMomentNotification(moment, 'EU')
	);
	Scheduler.scheduleIfNotScheduled(`${moment.id}-US`, moment.timestampUS, () =>
		handleMomentNotification(moment, 'US')
	);
	Scheduler.scheduleIfNotScheduled(`${moment.id}-WA`, moment.timestampWA, () =>
		handleMomentNotification(moment, 'WA')
	);
	Scheduler.scheduleIfNotScheduled(`${moment.id}-EA`, moment.timestampEA, () =>
		handleMomentNotification(moment, 'EA')
	);
}

export async function handleMomentNotification(moment: Moment, region: Region) {
	console.log(`Sending notification for moment ${moment.id} in ${region}`);

	await messaging.send({
		topic: getTopicForRegion(region),
		data: {
			momentId: moment.id.toString(),
			momentTimestamp: moment[`timestamp${region}`].getTime().toString()
		}
	});
}

function getTopicForRegion(region: Region) {
	return `time-to-zap.${region.toLowerCase()}`;
}
