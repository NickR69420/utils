import { Client } from 'discord.js';
import { QuickDB } from 'quick.db';
import { Util } from './Util';
import pms from 'pretty-ms';

export class CooldownManager {
	/** Discord Client. */
	private client: Client;
	private utils: Util;
	private db = new QuickDB();
	public constructor(client: Client) {
		this.client = client;
		this.utils = new Util(client);

		this.init();
	}

	/**
	 *
	 * Create a new cooldown for a user.
	 * @param command The command.
	 * @param userId The user's id
	 * @param cooldown The cooldown in milliseconds.
	 * @example```ts
	 * CooldownManager.create('test', '775265751954096138', 10); // Sets cooldown for 10 seconds.
	 *```
	 */
	public async create(command: string, userId: string, cooldown: number) {
		cooldown = cooldown * 1000;
		const expires = this.getExpires(cooldown);

		const newCooldown: Cooldown = {
			command,
			userId,
			cooldown,
			expireDate: expires,
			remainingTime: this.getRemainingTime(expires),
		};

		await this.db.set(`${command}-${userId}`, newCooldown);

		return newCooldown;
	}

	/**
	 *
	 * Removes a cooldown for a user.
	 * @param command The command.
	 * @param userId The user's id
	 * @example```ts
	 * CooldownManager.remove('test', '775265751954096138'); // removes the cooldown.
	 * ```
	 */
	public async remove(command: string, userId: string) {
		const data: Cooldown = await this.get(command, userId);
		if (!data) return null;

		this.db.delete(`${command}-${userId}`);

		return data;
	}

	/**
	 *
	 * Get cooldown data.
	 * @param command The command.
	 * @param userId The userId
	 * @example```ts
	 * CooldownManager.get('test', '775265751954096138'); // returns cooldown data.
	 * ```
	 */
	public async get(command: string, userId: string) {
		const data: Cooldown = await this.db.get(`${command}-${userId}`);
		if (!data) return null;

		return {
			command: data.command,
			cooldown: data.cooldown,
			expireDate: new Date(data.expireDate),
			remainingTime: data.remainingTime,
			userId: data.userId,
		} as Cooldown;
	}

	/**
	 *
	 * Get all cooldowns. This returns an array with all the cooldown data.
	 */
	public async getAll() {
		const cooldowns: dbData[] = await this.db.all();
		const cooldownList: Cooldown[] = [];

		for (const cooldown of cooldowns) {
			const [cmd, userId] = cooldown.id.split('-');
			const data = await this.get(cmd, userId);

			cooldownList.push(data);

			break;
		}

		return cooldownList;
	}

	/**
	 *
	 * Check whether a user is still on cooldown. If yes, then it will return with some cooldown data.
	 * @param command The command ran.
	 * @param userId The user's id
	 * @example```ts
	 * const cooldown = await CooldownManager.onCooldown('test', '775265751954096138');
	 *
	 * 	if(cooldown) {
	 *  const seconds = Math.floor(cooldown.remainingTime / 1000);
	 *
	 * 	console.log(`You need to wait ${seconds} seconds before running this command.`)
	 * 	}
	 *
	 * ```
	 */
	public async onCooldown(command: string, userId: string) {
		const data: Cooldown = await this.get(command, userId);

		if (data) {
			const expires = data.expireDate.getTime();
			const now = Date.now();
			if (now < expires) {
				return data;
			}
		}

		return null;
	}

	private getRemainingTime(date: Date) {
		return date.getTime() - Date.now();
	}

	private getExpires(cooldown: number) {
		return this.utils.getExpires(this.utils.getDuration(pms(cooldown)));
	}

	private async updateTime(data: Cooldown) {
		const expires = data.expireDate;
		const now = Date.now();

		if (now < expires.getTime()) await this.db.set(`${data.command}-${data.userId}.remainingTime`, this.getRemainingTime(expires));

		return;
	}

	private init() {
		this.client.on('ready', () => {
			setInterval(async () => {
				const cooldowns = await this.getAll();

				for (const c of cooldowns) {
					if (c.expireDate.getTime() <= Date.now()) this.remove(c.command, c.userId);
					else await this.updateTime(c);
				}
			}, 2000);
		});
	}
}

export interface Cooldown {
	/**
	 * The command ran.
	 */
	command: string;
	/**
	 * The user who ran the command.
	 */
	userId: string;
	/**
	 * The cooldown of the command in milliseconds.
	 */
	cooldown: number;
	/**
	 * Date at which the cooldown will expire.
	 */
	expireDate: Date;
	/**
	 * The remaining amount of time for the cooldown to expire in milliseconds.
	 */
	remainingTime: number | null;
}

export interface dbData {
	id: string;
	value: string;
}
