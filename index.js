const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// AFK DATA
const afkPath = path.join(__dirname, 'afk.json');
let afkData = JSON.parse(fs.readFileSync(afkPath, 'utf8'));

function formatDuration(ms) {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d) return `${d}d ${h % 24}h`;
  if (h) return `${h}h ${m % 60}m`;
  if (m) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

// BOT READY
client.once('clientReady', () => {
  console.log(`NV is online as ${client.user.tag}`);
});


// ANIME WELCOME
client.on('guildMemberAdd', member => {
  const welcomeChannel = member.guild.channels.cache.get(config.welcomeChannelId);
  if (!welcomeChannel) return;

  const rolesChannel = `<#${config.rolesChannelId}>`;
  const introChannel = `<#${config.introChannelId}>`;
  const rulesChannel = `<#${config.rulesChannelId}>`;

  const welcomeEmbed = new EmbedBuilder()
    .setColor(0xff9ad5) // sakura pink
    .setTitle('🌸 ようこそ | Welcome to the Server!')
    .setDescription(
      `✨ **Hey ${member}, welcome to our anime world!** ✨\n\n` +

      `📜 **Step 1 — Read the Rules**\n` +
      `👉 ${rulesChannel}\n\n` +

      `🎭 **Step 2 — Pick Your Roles**\n` +
      `👉 ${rolesChannel}\n\n` +

      `💬 **Step 3 — Introduce Yourself**\n` +
      `👉 ${introChannel}\n\n` +

      `🌙 *Follow these steps to unlock your journey!*`
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true }))
    .setFooter({ text: 'NV • Your anime guide ✨' })
    .setTimestamp();

  welcomeChannel.send({ embeds: [welcomeEmbed] });
});


// MESSAGE HANDLER
client.on('messageCreate', message => {
  if (message.author.bot) return;

  // REMOVE AFK
  if (afkData[message.author.id]) {
    const time = Date.now() - afkData[message.author.id].time;
    delete afkData[message.author.id];
    fs.writeFileSync(afkPath, JSON.stringify(afkData, null, 2));
message.reply({
  embeds: [
    new EmbedBuilder()
      .setColor(0xb6fcd5)
      .setTitle('🌱 Welcome Back')
      .setDescription(
        `✨ **You’ve returned!**\n\n` +
        `⏱ **Time away:** ${formatDuration(time)}\n` +
        `🌸 *Hope your rest was nice*`
      )
      .setFooter({ text: 'NV • Glad you’re back ✨' })
      .setTimestamp()
  ]
});

  }

  // AFK MENTION CHECK
  message.mentions.users.forEach(user => {
   message.mentions.users.forEach(user => {
  if (afkData[user.id]) {
    const data = afkData[user.id];
    message.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(0xffb347)
          .setTitle('💤 Currently Away')
          .setDescription(
            `🌸 **${user.username} is resting right now**\n\n` +
            `📝 **Reason:** ${data.reason}\n` +
            `⏱ **Away for:** ${formatDuration(Date.now() - data.time)}\n\n` +
            `🌙 *NV asks for a little patience…*`
          )
          .setFooter({ text: 'NV • AFK Notice ✨' })
          .setTimestamp()
      ]
    });
  }
});

  });

  // PREFIX COMMANDS
  if (!message.content.startsWith(config.prefix)) return;
  const args = message.content.slice(1).trim().split(/ +/);
  const cmd = args.shift().toLowerCase();

  if (cmd === 'ping') {
    message.reply('🏓 Pong!');
  }

  if (cmd === 'help') {
    message.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle('🤖 NV | Commands')
          .setDescription('!ping\n!afk [reason]\n!help')
          .setColor(0x00ffee)
      ]
    });
  }

  if (cmd === 'afk') {
    const reason = args.join(' ') || 'AFK';
    afkData[message.author.id] = { reason, time: Date.now() };
    fs.writeFileSync(afkPath, JSON.stringify(afkData, null, 2));

message.reply({
  embeds: [
    new EmbedBuilder()
      .setColor(0xffc1cc)
      .setTitle('🌙 AFK Mode Enabled')
      .setDescription(
        `✨ **You’re now resting…**\n\n` +
        `📝 **Reason:** ${reason}\n\n` +
        `🌸 *NV will quietly watch over the server for you*`
      )
      .setFooter({ text: 'NV • Softly standing by ✨' })
      .setTimestamp()
  ]
});


  }
});
client.on('interactionCreate', async interaction => {
  try {
    if (!interaction.isChatInputCommand()) return;

    // /ping
    if (interaction.commandName === 'ping') {
      return await interaction.reply('🏓 Pong!');
    }

    // /help
    if (interaction.commandName === 'help') {
      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('🤖 NV | Commands')
            .setDescription(
              '`/ping` → Check NV\n' +
              '`/afk [reason]` → Set AFK\n' +
              '`!afk [reason]` → Prefix AFK\n' +
              '`!help` → Prefix help'
            )
            .setColor(0x00ffee)
        ]
      });
    }

    // /afk
    if (interaction.commandName === 'afk') {
      const reason = interaction.options.getString('reason') || 'AFK';

      afkData[interaction.user.id] = {
        reason,
        time: Date.now()
      };

      fs.writeFileSync(afkPath, JSON.stringify(afkData, null, 2));

      return await interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor(0xffcc00)
            .setDescription(`😴 **NV marked you AFK**\nReason: ${reason}`)
        ]
      });
    }
  } catch (err) {
    console.error('❌ Interaction error:', err);

    if (!interaction.replied) {
      await interaction.reply({
        content: '⚠️ NV ran into an error. Try again.',
        ephemeral: true
      });
    }
  }
});


client.login(config.token);
