import { Client, Guild, GuildMember, PermissionResolvable } from 'discord.js';
import { Utils } from 'dobro-utils';
import { Duration } from '@sapphire/time-utilities';
import { createPaste } from 'hastebin';

export class Util extends Utils {
	public client: Client;
	public constructor(client: Client) {
		super();

		this.client = client;
	}

	/**
	 *
	 * Check if a member has a particular or higher role.
	 * @param member The member to check.
	 * @param roleId The Id of the role.
	 * @param checkPos Checks if the member has a higher role (needs guild parameter).
	 * @param guild The guild.
	 * @example```ts
	 * hasRole(message.member, '928616268376965120', true, message.guild) // returns true
	 * ```
	 */
	public hasRole(member: GuildMember, roleId: string, checkPos?: boolean, guild?: Guild) {
		if (checkPos && guild) {
			const role = guild.roles.cache.get(roleId);
			if (!role) return false;
			if (role.position > member.roles.highest.position) return false;
			else return true;
		} else return member.roles.cache.has(roleId);
	}

	/**
	 *
	 * Get a role in a guild.
	 * @param role The role's name or id.
	 * @param guild The guild to find the role in.
	 * @example```ts
	 * getRole('Admin', message.guild);
	 * ```
	 */
	public getRole(role: string, guild: Guild) {
		const r = guild.roles.cache.find((r) => r.name === role || r.id === role);

		if (!r) return null;
		else r;
	}

	/**
	 *
	 * Upload content to hastebin
	 * @param content The content to paste
	 * @example```ts
	 * hastebin('This is cool.');
	 * ```
	 */
	public async hastebin(content: string) {
		const url = await createPaste(content, {
			raw: true,
			server: 'https://www.toptal.com/developers/hastebin/',
		});

		return url;
	}

	/**
	 *
	 * Check if a provided duration is valid or not.
	 * @param time The time to check
	 * @example```ts
	 * isValidTime("1h") // true
	 * ```
	 */
	public isValidTime(time: string) {
		if (isNaN(this.ms(time))) return false;
		else return true;
	}

	/**
	 *
	 * Converts a duration string into a duration(date form).
	 * @param time The time to convert into duration.
	 * @example```ts
	 * getDuration("1h")
	 * ```
	 */
	public getDuration(time: string) {
		if (!time) return null;
		return new Duration(time).fromNow || null;
	}

	/**
	 *
	 * Returns the expiring date.
	 * @param duration The duration(date form).
	 * ```
	 * getExpires(getDuration("1h")) // returns with a date 1 hour from now
	 * ```
	 */
	public getExpires(duration: Date) {
		if (!isNaN(duration.getTime()) && duration.getTime() > Date.now()) {
			return new Date(duration);
		} else return null;
	}

	/**
	 *
	 * Check if a member has a specific permission
	 * @param member The member to check.
	 * @param perm The permission.
	 * @example```ts
	 * hasPermission(member, 'ADMINISTRATOR');
	 */
	public hasPermission(member: GuildMember, perm: PermissionResolvable) {
		return member.permissions.has(perm);
	}

	public async getUser(u: string) {
		const user = await this.client.users.fetch(u);

		if (!user) return null;
		else return user;
	}

	public DiscordDate(time: number | Date, type: string): string {
		let timestamp;
		if (typeof time !== 'number') {
			timestamp = Math.floor(time?.getTime() / 1000)
		} else {
			timestamp = time
		}



		return `<t:${time}:${type}>`
	}
}
