require('dotenv').config();
const { Client, Events, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const { getCena } = require('./gpt');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent,]
});


client.on(Events.ClientReady, c => {
    console.log(`¡Alfred está listo como ${client.user.tag}!`);

    c.user.setActivity('Preparando la cena..');

    const cenaCommand = new SlashCommandBuilder()
        .setName('cena')
        .setDescription('Proporciona una alternativa saludable de cena');

    c.application.commands.create(cenaCommand);
});


client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    if (message.content.startsWith('!alfred')) {
        const prompt = message.content.slice(8).trim();
        if (!prompt) {
            return message.reply('Por favor, escribe una pregunta o solicitud después de "!alfred".');
        }

        try {
            const response = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: prompt }],
            });

            const reply = response.data.choices[0].message.content;
            message.reply(reply);
        } catch (error) {
            console.error('Error al procesar la solicitud:', error);
            message.reply('Lo siento, ocurrió un error procesando tu solicitud.');
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
