import { Client, GuildMember, Message, Role, TextChannel, VoiceChannel } from 'discord.js';
import { Util } from './Util';

export class Args {
	/** Discord Client */
	public client: Client;
	/** The message */
	public message: Message;
	/** The arguments provided with the command run.
	 * @example```ts
	 * const prefix = '!'
	 * const args = message.content.slice(prefix.length).trim().split(/ +/).shift();
	 * ```
	 */
	public args: any[];
	/** The command's needed arguments in an array. */
	public readonly commandArgs: string[];

	private utils: Util;
	/**
	 *
	 * @param client Discord Client.
	 * @param message The message.
	 * @param args  The arguments provided with the command run.
	 * @argsExample ```ts
	 * const prefix = '!'
	 * const args = message.content.slice(prefix.length).trim().split(/ +/).shift();
	 * ```
	 *
	 * @param commandUsage The arguments needed as a string. Each argument should be seperated by a space.
	 * @usageExample ```ts
	 *  const arguments = 'member duration';
	 * ```
	 */
	constructor(client: Client, message: Message, args: any[], commandUsage: string) {
		this.client = client;
		this.message = message;
		this.args = args;
		this.commandArgs = typeof commandUsage === 'string' && commandUsage.length > 0 ? commandUsage.split(' ') : null;
		this.utils = new Util(this.client);
	}

	/** Displays provided arguments. */
	public get raw(): string[] {
		return this.args;
	}

	/** The size of the provided arguments. */
	public get size() {
		return this.args.length;
	}

	/**
	 *
	 * Pick an argument.
	 * @param index The index of the argument.
	 * @param type The type of the argument.
	 * @example```ts
	 * // args = ['Nick', '16']
	 *
	 * const name = Args.pick(0, 'string'); // 'Nick'
	 * const age = Args.pick(1, 'integer'); // 16
	 * ```
	 */
	public pick<T extends keyof ArgTypes>(index: number, type: T) {
		const arg = this.args[index];
		if (!arg) return null;

		const result = this.checkArgument(arg, type);

		if (result == undefined) return null;
		else return result;
	}

	/**
	 * Check if there are missing arguments.
	 */
	public isMissing() {
		if (!this.commandArgs) return false;

		if (this.args.length < this.commandArgs.length) return true;
		else return false;
	}

	/**
	 *
	 * Check for missing/invalid arguments. If there are invalid arguments, it returns an array of the missing arguments, else it will return an empty array.
	 */
	public checkInvalidArguments() {
		const missingArgs: string[] = [];

		for (let i = 0; i < this.commandArgs.length; i++) {
			const arg = this.args[i];

			if (!arg) missingArgs.push(this.commandArgs[i]);
		}

		return missingArgs;
	}

	private checkArgument(arg: any, type: keyof ArgTypes) {
		if (type === 'string') {
			if (typeof arg === 'string') return this.returnArg(arg, type);
			else return null;
		}
		if (type === 'integer') {
			const integer = parseInt(arg);

			if (isNaN(integer)) return null;
			else return this.returnArg(integer, type);
		}
		if (type === 'boolean') {
			const argument = (arg as string).toLowerCase();

			const truths = ['true', 'on', 'yes', 'y'];
			const falses = ['false', 'off', 'no', 'n'];

			if (truths.includes(argument)) return this.returnArg(true, type);
			else if (falses.includes(argument)) return this.returnArg(false, type);
			else return null;
		}
		if (type === 'member') {
			const member = this.utils.fetchMember(arg, this.message.guild) ?? this.message.mentions.members.first();

			if (!member) return null;
			else return this.returnArg(member, type);
		}
		if (type === 'role') {
			const role = this.utils.fetchRole(arg, this.message.guild) ?? this.message.mentions.roles.first();

			if (!role) return null;
			else return this.returnArg(role, type);
		}
		if (type === 'TextChannel') {
			const channel = this.utils.fetchChannel(arg, this.message.guild) ?? this.message.mentions.channels.first();

			if (!channel || !channel.isText()) return null;
			else return this.returnArg(channel, type);
		}
		if (type === 'VoiceChannel') {
			const vc = this.utils.fetchChannel(arg, this.message.guild) ?? this.message.mentions.channels.first();

			if (!vc || !vc.isVoice()) return null;
			else return this.returnArg(vc, 'VoiceChannel');
		}
		if (type === 'duration') {
			const ms = this.utils.ms(arg);

			if (isNaN(ms)) return null;
			else return this.returnArg(ms, type);
		}
		if (type === 'durationDate') {
			const duration = this.utils.getDuration(arg);

			if (!duration) return null;
			else return this.returnArg(duration, type);
		}
	}

	private returnArg<T extends keyof ArgTypes>(value: any, type: T) {
		return value as ArgTypes[T];
	}
}

interface ArgTypes {
	string: string;
	integer: number;
	boolean: boolean;
	member: GuildMember;
	role: Role;
	VoiceChannel: VoiceChannel;
	TextChannel: TextChannel;
	duration: number;
	durationDate: Date;
}
