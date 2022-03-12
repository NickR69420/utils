import { ApplicationCommandData, BaseApplicationCommandOptionsData, ChatInputApplicationCommandData, Client } from 'discord.js';

export class SlashCreator {
	/** Discord Client. */
	public client: Client;
	public constructor(client: Client) {
		this.client = client;
	}

	public async syncGuildCommands(commands: ChatInputApplicationCommandData[], guildId: string) {
		const mainGuild = await this.client.guilds.fetch(guildId);
		if (!mainGuild) throw new Error('[nicky-utils] Invalid guildId provided.');

		let guildCommands = await mainGuild.commands.fetch();
		if (!guildCommands) return;

		guildCommands = guildCommands.filter((c) => c.type === 'CHAT_INPUT');
		const handledCommands: string[] = [];

		for (const [, gCommand] of guildCommands) {
			const cmd = commands.find((c) => c.name === gCommand.name);
			if (!cmd) {
				await mainGuild.commands.delete(gCommand);
				break;
			}

			if (
				cmd.name !== gCommand.name ||
				cmd.description !== gCommand.description ||
				cmd.options.length !== gCommand.options.length ||
				this.checkOptions(gCommand, cmd.options as BaseApplicationCommandOptionsData[])
			) {
				await mainGuild.commands.edit(gCommand.id, {
					name: cmd.name,
					description: cmd.description,
					options: cmd.options,
				});
			}

			handledCommands.push(cmd.name);
		}

		const unHandledCommands = commands.filter((c) => !handledCommands.includes(c.name));

		for (const cmd of unHandledCommands) {
			await mainGuild.commands.create(cmd);
		}
	}

	public async syncGlobalCommands(commands: ChatInputApplicationCommandData[]) {
		const { application } = this.client;
		if (!application)
			throw new Error(
				'[nicky-utils] Failed to sync commands globally as application is not available. (Make sure to run this function only after the client is ready.)'
			);

		let appCommands = await application.commands.fetch();
		if (!appCommands) return;
		appCommands = appCommands.filter((c) => c.type === 'CHAT_INPUT');
		const handledCommands: string[] = [];

		for (const [, appCommand] of appCommands) {
			const cmd = commands.find((c) => c.name === appCommand.name);
			if (!cmd) {
				await application.commands.delete(appCommand);
				break;
			}

			if (
				cmd.name !== appCommand.name ||
				cmd.description !== appCommand.description ||
				cmd.options.length !== appCommand.options.length ||
				this.checkOptions(appCommand, cmd.options as BaseApplicationCommandOptionsData[])
			) {
				await application.commands.edit(appCommand.id, {
					name: cmd.name,
					description: cmd.description,
					options: cmd.options,
				});
			}

			handledCommands.push(cmd.name);
		}

		const unHandledCommands = commands.filter((c) => !handledCommands.includes(c.name));

		for (const command of unHandledCommands) {
			await application.commands.create(command);
		}
	}

	public async syncGuildMenus(menus: ApplicationCommandData[], guildId: string) {
		const mainGuild = await this.client.guilds.fetch(guildId);
		if (!mainGuild) throw new Error('[nicky-utils] Invalid guild Id provided.');

		let guildMenus = await mainGuild.commands.fetch();
		if (!guildMenus) return;

		guildMenus = guildMenus.filter((c) => c.type === 'MESSAGE' || c.type === 'USER');
		const handledMenus: string[] = [];

		for (const [, gMenu] of guildMenus) {
			const menu = menus.find((c) => c.name === gMenu.name);
			if (!menu) {
				await mainGuild.commands.delete(gMenu);
				break;
			}

			const type = menu.type === 'MESSAGE' ? 'MESSAGE' : 'USER';

			if (menu.name !== gMenu.name) {
				await mainGuild.commands.edit(gMenu.id, {
					name: menu.name,
					type,
				});
			}

			handledMenus.push(menu.name);
		}

		const unhandledMenus = menus.filter((m) => !handledMenus.includes(m.name));

		for (const menu of unhandledMenus) {
			await mainGuild.commands.create(menu);
		}
	}

	public async syncGlobalMenus(menus: ApplicationCommandData[]) {
		const { application } = this.client;
		if (!application)
			throw new Error(
				'[nicky-utils] Failed to sync menus globally as application is not available. (Make sure to run this function only after the client is ready.)'
			);

		let appMenus = await application.commands.fetch();
		if (!appMenus) return;

		appMenus = appMenus.filter((m) => m.type !== 'CHAT_INPUT');
		const handledMenus: string[] = [];

		for (const [, gMenu] of appMenus) {
			const menu = menus.find((c) => c.name === gMenu.name);
			if (!menu) {
				await application.commands.delete(gMenu);
				break;
			}

			const type = menu.type === 'MESSAGE' ? 'MESSAGE' : 'USER';

			if (menu.name !== gMenu.name) {
				await application.commands.edit(gMenu.id, {
					name: menu.name,
					type,
				});
			}

			handledMenus.push(menu.name);
		}

		const unHandledMenus = menus.filter((m) => !handledMenus.includes(m.name));

		for (const menu of unHandledMenus) {
			await application.commands.create(menu);
		}
	}

	private checkOptions(command: any, options: BaseApplicationCommandOptionsData[]) {
		return (
			command.options?.filter((opt: any, index: number) => {
				return opt?.required !== options[index]?.required && opt?.name !== options[index]?.name && opt?.options?.length !== options.length;
			}).length !== 0 || false
		);
	}
}
