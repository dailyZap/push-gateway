import { Job, scheduleJob, cancelJob } from 'node-schedule';

type ScheduledAction = () => void | Promise<void>;

export class Scheduler {
	static scheduledActions = new Map<string, Job>();

	static schedule(name: string, time: Date, action: ScheduledAction) {
		if (time < new Date()) {
			return;
		}
		if (this.scheduledActions.has(name)) {
			throw new Error(`Action with name "${name}" already exists`);
		}
		this.scheduledActions.set(
			name,
			scheduleJob(time, () => {
				this.scheduledActions.delete(name);
				action();
			})
		);
	}

	static cancel(name: string) {
		const job = this.scheduledActions.get(name);
		if (job) {
			cancelJob(job);
			this.scheduledActions.delete(name);
		}
	}

	static cancelAll() {
		for (const job of this.scheduledActions.values()) {
			cancelJob(job);
		}
		this.scheduledActions.clear();
	}

	static isScheduled(name: string) {
		return this.scheduledActions.has(name);
	}

	static scheduleIfNotScheduled(name: string, time: Date, action: ScheduledAction) {
		if (!this.isScheduled(name)) {
			this.schedule(name, time, action);
		}
	}
}
