require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { OpenAIApi } = require('openai');

// Configura la API de OpenAI
const openai = new OpenAIApi({
    apiKey: process.env.OPENAI_API_KEY, // Asegúrate de que esta clave esté definida en el archivo .env
});

// Configura el cliente de Discord
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
});

// Cuando el bot esté listo
client.once('ready', () => {
    console.log(`¡Alfred está listo como ${client.user.tag}!`);
});

// Maneja mensajes
client.on('messageCreate', async (message) => {
    if (message.author.bot) return; // Ignorar mensajes de otros bots

    if (message.content.startsWith('!alfred')) {
        const prompt = message.content.slice(8).trim(); // Toma el contenido después de "!alfred"
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
            console.error('Error al procesar la solicitud:', error.message);
            message.reply('Lo siento, ocurrió un error procesando tu solicitud.');
        }
    }
});

// Inicia el bot
client.login(process.env.DISCORD_BOT_TOKEN);
