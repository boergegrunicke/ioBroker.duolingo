/*
 * Created with @iobroker/create-adapter v2.4.0
 */

// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
import * as utils from '@iobroker/adapter-core';
import axios from 'axios';

// Load your modules here, e.g.:
// import * as fs from "fs";

class Duolingo extends utils.Adapter {
	USER_AGENT =
		'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.116 Safari/537.36';

	public constructor(options: Partial<utils.AdapterOptions> = {}) {
		super({
			...options,
			name: 'duolingo',
		});
		this.on('ready', this.onReady.bind(this));
		// this.on('objectChange', this.onObjectChange.bind(this));
		// this.on('message', this.onMessage.bind(this));
		this.on('unload', this.onUnload.bind(this));
	}

	/**
	 * Is called when databases are connected and adapter received configuration.
	 */
	private async onReady(): Promise<void> {
		await this.createStates();

		try {
			const response = await axios.get('https://www.duolingo.com/api/1/version_info', {
				headers: { 'User-Agent': this.USER_AGENT },
			});
			if (response.status == 200) {
				this.setState('country', response.data.country);
				this.setState('age_restriction_limit', response.data.age_restriction_limit);
			}
			const userResponse = await axios.get(`https://www.duolingo.com/users/${this.config.username}`, {
				headers: { 'User-Agent': this.USER_AGENT, Authorization: `Bearer ${this.config.jwt}` },
			});
			if (userResponse.status == 200) {
				const username = userResponse.data.username.toString().replace('.', '_');
				this.createStatesForUsername(username);

				this.setState(`${username}.learning_language`, {
					val: userResponse.data.learning_language_string,
					ack: true,
				});
				this.setState(`${username}.email`, { val: userResponse.data.learning_language_string, ack: true });
				this.setState(`${username}.fullname`, { val: userResponse.data.fullname, ack: true });
				this.setState(`${username}.streak_extended_today`, {
					val: userResponse.data.streak_extended_today,
					ack: true,
				});
				this.setState(`${username}.daily_goal`, { val: userResponse.data.daily_goal, ack: true });
				this.setState(`${username}.id`, { val: userResponse.data.id, ack: true });
				this.setState(`${username}.streak`, { val: userResponse.data.site_streak, ack: true });

				this.log.info('calendar-elements : ' + userResponse.data.calendar.length);
				const todayElements = userResponse.data.calendar.filter((element: CalendarElement) =>
					this.isTimestampFromDay(element.datetime, 0),
				);
				const yesterdayElements = userResponse.data.calendar.filter((element: CalendarElement) =>
					this.isTimestampFromDay(element.datetime, 1),
				);
				let todayPoints = 0;
				todayElements.forEach((element: CalendarElement) => {
					todayPoints += element.improvement;
				});
				let yesterdayPoints = 0;
				yesterdayElements.forEach((element: CalendarElement) => {
					yesterdayPoints += element.improvement;
				});

				this.setState(`${username}.today.exercises`, { val: todayElements.length, ack: true });
				this.setState(`${username}.today.points`, { val: todayPoints, ack: true });
				this.setState(`${username}.yesterday.exercises`, { val: yesterdayElements.length, ack: true });
				this.setState(`${username}.yesterday.points`, { val: yesterdayPoints, ack: true });
			}
		} catch (exception) {
			this.log.error('error : ' + exception);
		}

		// The adapters config (in the instance object everything under the attribute "native") is accessible via
		// this.config:
		// this.config.userId
	}

	private async createStates(): Promise<void> {
		await this.setObjectNotExistsAsync('country', {
			type: 'state',
			common: {
				name: 'API-Country',
				type: 'string',
				role: 'indicator',
				read: true,
				write: false,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync('age_restriction_limit', {
			type: 'state',
			common: {
				name: 'Age restriction limit',
				type: 'number',
				role: 'indicator',
				read: true,
				write: false,
			},
			native: {},
		});
	}

	private async createStatesForUsername(username: string): Promise<void> {
		await this.setObjectNotExistsAsync(`${username}.learning_language`, {
			type: 'state',
			common: {
				name: 'Learning language',
				type: 'string',
				role: 'indicator',
				read: true,
				write: false,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync(`${username}.streak_extended_today`, {
			type: 'state',
			common: {
				name: 'Streak extended todayy',
				type: 'boolean',
				role: 'indicator',
				read: true,
				write: false,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync(`${username}.email`, {
			type: 'state',
			common: {
				name: 'E-Mail',
				type: 'string',
				role: 'indicator',
				read: true,
				write: false,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync(`${username}.fullname`, {
			type: 'state',
			common: {
				name: 'Fullname',
				type: 'string',
				role: 'indicator',
				read: true,
				write: false,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync(`${username}.daily_goal`, {
			type: 'state',
			common: {
				name: 'Daily goal',
				type: 'number',
				role: 'indicator',
				read: true,
				write: false,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync(`${username}.id`, {
			type: 'state',
			common: {
				name: 'ID',
				type: 'number',
				role: 'indicator',
				read: true,
				write: false,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync(`${username}.streak`, {
			type: 'state',
			common: {
				name: 'Streak',
				type: 'number',
				role: 'indicator',
				read: true,
				write: false,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync(`${username}.today.exercises`, {
			type: 'state',
			common: {
				name: 'Exercises today',
				type: 'number',
				role: 'indicator',
				read: true,
				write: false,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync(`${username}.today.points`, {
			type: 'state',
			common: {
				name: 'Points today',
				type: 'number',
				role: 'indicator',
				read: true,
				write: false,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync(`${username}.yesterday.exercises`, {
			type: 'state',
			common: {
				name: 'Exercises yesterday',
				type: 'number',
				role: 'indicator',
				read: true,
				write: false,
			},
			native: {},
		});
		await this.setObjectNotExistsAsync(`${username}.yesterday.points`, {
			type: 'state',
			common: {
				name: 'Points yesterday',
				type: 'number',
				role: 'indicator',
				read: true,
				write: false,
			},
			native: {},
		});
	}

	private isTimestampFromDay(timestamp: number, correction: number): boolean {
		// Create a Date object from the timestamp
		const date = new Date(timestamp);

		// Get the current date
		const currentDate = new Date();

		// Compare the year, month, and day of the two dates
		if (
			date.getFullYear() === currentDate.getFullYear() &&
			date.getMonth() === currentDate.getMonth() &&
			date.getDate() === currentDate.getDate() - correction
		) {
			return true; // The timestamp is from today
		}

		return false; // The timestamp is not from today
	}

	/**
	 * Is called when adapter shuts down - callback has to be called under any circumstances!
	 */
	private onUnload(callback: () => void): void {
		try {
			// Here you must clear all timeouts or intervals that may still be active
			// clearTimeout(timeout1);
			// clearTimeout(timeout2);
			// ...
			// clearInterval(interval1);

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  */
	// private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  */
	// private onMessage(obj: ioBroker.Message): void {
	// 	if (typeof obj === 'object' && obj.message) {
	// 		if (obj.command === 'send') {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info('send command');

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, 'Message received', obj.callback);
	// 		}
	// 	}
	// }
}

if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options: Partial<utils.AdapterOptions> | undefined) => new Duolingo(options);
} else {
	// otherwise start the instance directly
	(() => new Duolingo())();
}

type CalendarElement = {
	skill_id: string;
	improvement: number;
	event_type: string;
	datetime: number;
};
