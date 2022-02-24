# `@nickdoespackages/utils`

Utility for the Nicky bot, but can be used by all!

## Slash Creator

Easily register slash commands and menus for bot!

```ts
import { Client } from 'discord.js';
import { SlashCreator } from '@nickdoespackages/utils';

const client = new Client({ intents: 32767 });

// Get all your commands & menus here

client.on('ready', async (client) => {
	const creator = new SlashCreator(client);

	await creator.syncGuildCommands(arrayOfCommands, 'guildId');
	await creator.syncGuildMenus(arrayOfMenus, 'guildId');
});
```

It also comes with other cool utilities, so make sure to try that out too!
