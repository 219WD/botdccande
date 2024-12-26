require('dotenv').config();
const { Client, Events, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const { getRespuesta } = require('./gpt');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.on(Events.ClientReady, c => {
    console.log('Bot Conectado');

    c.user.setActivity('Listo para asistirte..');

    const alfredCommand = new SlashCommandBuilder()
        .setName('alfred')
        .setDescription('Hazme cualquier pregunta o pídeme ayuda.')
        .addStringOption(option =>
            option.setName('mensaje')
                .setDescription('Tu pregunta o solicitud')
                .setRequired(true)
        );

    c.application.commands.create(alfredCommand);
});

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'alfred') {
            const userPrompt = interaction.options.getString('mensaje');
            await interaction.deferReply();
            const respuesta = await getRespuesta(userPrompt);
            await interaction.editReply(respuesta);
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
