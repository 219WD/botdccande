require('dotenv').config();
const express = require('express');
const { Client, Events, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const { getRespuesta } = require('./gpt');

const app = express(); // Inicializa Express
const PORT = process.env.PORT; // Lee el puerto desde el archivo .env

// Ruta básica para mantener el servicio activo
app.get('/', (req, res) => {
    res.send('El bot está funcionando.');
});

// Inicia el servidor HTTP
app.listen(PORT, () => {
    console.log(`Servidor HTTP corriendo en el puerto ${PORT}`);
});

// Configuración del cliente de Discord
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
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
    if (interaction.isChatInputCommand() && interaction.commandName === 'alfred') {
        await interaction.deferReply(); // Responde inmediatamente para evitar el timeout

        try {
            const userPrompt = interaction.options.getString('mensaje');
            const respuesta = await getRespuesta(userPrompt); // Lógica para procesar la respuesta
            await interaction.editReply(respuesta); // Envía la respuesta final
        } catch (error) {
            console.error('Error procesando la interacción:', error);
            await interaction.editReply('Hubo un error procesando tu solicitud.');
        }
    }
});


// Inicia el cliente de Discord
client.login(process.env.DISCORD_BOT_TOKEN);
