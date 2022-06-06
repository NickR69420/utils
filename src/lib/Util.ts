import { Client, Guild, GuildEmoji, GuildMember, Message, PermissionResolvable, Snowflake, SnowflakeUtil, TextChannel } from 'discord.js';
import { Duration } from '@sapphire/time-utilities';
import { createPaste } from 'hastebin';
import MS, { StringValue } from 'ms';
import glob from 'glob';
import { promisify } from 'util';
import axios from 'axios';
const load = promisify(glob);

export class Util {
	private client: Client;
	public constructor(client: Client) {
		this.client = client;
	}

	/**
	 *
	 * Import a module with ease.
	 * @param filePath The path of the file to import.
	 * @see Typescript only
	 */
	public import<T>(filePath: string): T {
		return require(filePath)?.default;
	}

	/**
	 *
	 * @param mem The ID or name of the member to get.
	 * @param guild The guild where the member resides.
	 * @example```ts
	 * getMember('Nick', message.guild)
	 * ```
	 */
	fetchMember(mem: string, guild: Guild) {
		const member = guild.members.cache.find((m) => m.id === mem || m.user.username === mem || m.displayName === mem || m.user.tag === mem);
		if (member) return member;
		else return null;
	}

	/**
	 *
	 * Formats a string.
	 * @param str String to format.
	 * @example```ts
	 * formatString('TEST') // Test
	 * ```
	 */
	public formatString(str: string) {
		return str.charAt(0).toUpperCase() + str.substring(1).toLowerCase();
	}

	/**
	 *
	 * Formats a permission.
	 * @param perm The permission to format.
	 * @example```ts
	 * formatPerm("SEND_MESSAGES"); // Send Messages
	 * ```
	 */
	public formatPerm(perm: PermissionResolvable) {
		const permission = perm.toString().replace(/\_/g, ' ');
		const split = permission.trim().split(' ');
		const splitFixed: string[] = [];
		split.forEach((e) => {
			e = e.charAt(0).toUpperCase() + e.slice(1).toLocaleLowerCase();
			splitFixed.push(e);
		});
		return splitFixed.join(' ');
	}

	/**
	 *
	 * Generates a random ID.
	 * @example```ts
	 * generateId() // 928616268376965120
	 * ```
	 */
	public generateId() {
		return SnowflakeUtil.generate().toString();
	}
	/**
	 *
	 * Creates a codeblock.
	 * @param content The content for the codeblock.
	 * @param language The language for the codeblock.
	 * @example```ts
	 * codeBlock("console.log('Hello World')", "javascript")
	 * ```
	 */
	public codeBlock(content: string, language?: string) {
		return language ? `\`\`\`${language}\n${content}\`\`\`` : `\`\`\`${content}\`\`\``;
	}

	/**
	 *
	 * Mention a user with ease.
	 * @param userId The ID of the user to mention.
	 * @example```ts
	 * mention('928616268376965120') // <@928616268376965120>
	 * ```
	 */
	public mention(userId: Snowflake) {
		return `<@${userId}>`;
	}

	/**
	 *
	 * Mention a role with ease.
	 * @param roleId The ID of the role to mention.
	 * @example```ts
	 * mentionRole('928616268376965120') // <@&928616268376965120>
	 * ```
	 */
	public mentionRole(roleId: Snowflake) {
		return `<@&${roleId}>`;
	}

	/**
	 *
	 * Find a channel in a guild with ease.
	 * @param ch The Name or ID of the channel.
	 * @param guild The guild to check.
	 * @example```ts
	 * findChannel('general', message.guild)
	 * ```
	 */
	public fetchChannel(ch: string, guild: Guild) {
		const channel = guild.channels.cache.find((c) => c.name == ch || c.id === ch) as TextChannel;
		if (channel) return channel;
		else return null;
	}

	/**
	 *
	 * Delete a message with ease.
	 * @param message The message to delete.
	 * @param timeout After how long to delete the message. (In milliseconds)
	 * @example```ts
	 * deleteMsg(message, 2000) // Deletes the message after 2 seconds.
	 * ```
	 */
	public deleteMsg(message: Message, timeout?: number) {
		if (timeout) {
			setTimeout(() => {
				message.delete().catch(() => {});
			}, timeout);
		} else {
			message.delete();
		}
	}

	/**
	 *
	 * The ms package for typescript users.
	 * @param value The value to convert
	 * @example```ts
	 * ms('1m') // 60000
	 * ```
	 */
	public ms(value: any) {
		return MS(value as StringValue);
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
	public fetchRole(role: string, guild: Guild) {
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
	 * ```
	 */
	public hasPermission(member: GuildMember, perm: PermissionResolvable) {
		return member.permissions.has(perm);
	}

	/**
	 *
	 * Fetch a user.
	 * @param Id The user's Id.
	 * @example```ts
	 * getUser('928616268376965120');
	 * ```
	 */
	public async getUser(Id: Snowflake) {
		const user = await this.client.users.fetch(Id);

		if (!user) return null;
		else return user;
	}

	/**
	 *
	 * Fetch an emoji.
	 * @param arg Emoji name or Id.
	 * @example```ts
	 * fetchEmoji('pepe');
	 * ```
	 */
	public fetchEmoji(arg: string) {
		const emoji = this.client.emojis.cache.find((e) => e.name === arg || e.id === arg) as GuildEmoji;

		return emoji;
	}

	/**
	 *
	 * Returns a fancy discord timestamp.
	 * @param time The timestamp.
	 * @param type The type of timestamp style.
	 * @example```ts
	 * timestamp(Date.now(), 'R');
	 * ```
	 */
	public timestamp(time: number | Date, type: Timestamps): string {
		if (typeof time !== 'number') {
			time = Math.floor(time?.getTime() / 1000);
		}

		return `<t:${time}:${type}>`;
	}

	/**
	 *
	 * Load some files.
	 * @param path The path to the files. (use glob pattern.)
	 * @example```ts
	 * await loadFiles(path.join(__dirname, 'commands') + '*{.ts,.js}');
	 * ```
	 */
	public async loadFiles(path: string) {
		return await load(path);
	}

	/**
	 *
	 * @param path the path.
	 * @example```ts
	 * getDirectory('User/Docs/Bot/commands/General/help.js'); // General;
	 * ```
	 */
	public getDirectory(path: string) {
		const split = path.split('/');
		return split[split.length - 2];
	}

	/**
	 *
	 * Fetch an api.
	 * @param api The api to get.
	 * @example```ts
	 * const data = await getApi('memer.api');
	 *
	 * console.log(data.memeLink);
	 * ```
	 */
	public getApi<T>(api: string): Promise<T> {
		return new Promise<any>(async (res, rej) => {
			await axios
				.get(api)
				.then((response) => {
					return res(response.data);
				})
				.catch((err) => {
					rej(err);
				});
		});
	}

	/**
	 *
	 * Remove a specific element from an array.
	 * @param array The array to remove the element from.
	 * @param element The element to remove.
	 * @example```ts
	 * const array = ["This", "is", "not", "cool"];
	 *
	 * removeFromArray(array, "not"); // ["This", "is", "cool"]
	 * ```
	 */
	public removeFromArray<T>(array: T[], element: T) {
		let el = array.indexOf(element);

		array.splice(el);

		return array;
	}
}

type Timestamps = 't' | 'T' | 'd' | 'D' | 'f' | 'F' | 'R';
