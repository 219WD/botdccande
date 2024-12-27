require('dotenv').config();
const express = require('express');
const { Client, Events, GatewayIntentBits, SlashCommandBuilder } = require('discord.js');
const { getRespuesta } = require('./gpt');

const app = express(); // Inicializa Express
const PORT = process.env.PORT || 3000; // Lee el puerto desde el archivo .env

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

// Mapa para gestionar cooldowns por usuario
const cooldowns = new Map();

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
        const userId = interaction.user.id;

        // Verifica si el usuario está en cooldown
        if (cooldowns.has(userId)) {
            const remainingTime = cooldowns.get(userId) - Date.now();
            if (remainingTime > 0) {
                return interaction.reply(`Por favor, espera ${Math.ceil(remainingTime / 1000)} segundos antes de hacer otra consulta.`);
            }
        }

        // Agrega al usuario al cooldown por 30 segundos
        cooldowns.set(userId, Date.now() + 30000); // 30 segundos de cooldown

        try {
            await interaction.deferReply(); // Responde inmediatamente para evitar el timeout
            const userPrompt = interaction.options.getString('mensaje');
            const respuesta = await getRespuesta(userPrompt); // Lógica para procesar la respuesta
            await interaction.editReply(respuesta); // Envía la respuesta final
        } catch (error) {
            console.error('Error procesando la interacción:', error);
            await interaction.editReply('Hubo un error procesando tu solicitud. Por favor, intenta más tarde.');
        } finally {
            // Elimina al usuario del cooldown después de 30 segundos
            setTimeout(() => cooldowns.delete(userId), 30000);
        }
    }
});

// Inicia el cliente de Discord
client.login(process.env.DISCORD_BOT_TOKEN);
