const { REST, Routes, SlashCommandBuilder } = require('discord.js');
const config = require('./config.json');

const commands = [
  new SlashCommandBuilder().setName('ping').setDescription('Ping NV'),
  new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set AFK')
    .addStringOption(o =>
      o.setName('reason').setDescription('AFK reason')
    ),
  new SlashCommandBuilder().setName('help').setDescription('Help menu')
].map(c => c.toJSON());

const rest = new REST({ version: '10' }).setToken(config.token);

(async () => {
  await rest.put(
    Routes.applicationGuildCommands(config.clientId, config.guildId),
    { body: commands }
  );
  console.log('Slash commands registered');
})();
