require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const commands = require('./basic_commands'); // Importar comandos desde basic_commands.js

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.on('ready', () => {
    console.log(`✅ Bot conectado como ${client.user.tag}`);
});

// Comandos basicos con lectura de mensajes, por ejemplo "!hola" usando una funcion interna
client.on('messageCreate', (message) => {
    if (message.author.bot) return; // Ignorar mensajes de bots
    const command = message.content;

    if(command === '!mija') {
        message.reply('Donde van');
    }
});

// Comandos basicos con lectura de mensajes, por ejemplo "!hola" usando un archivo externo
client.on('messageCreate', (message) => {
    if (message.author.bot) return; // Ignorar mensajes de bots

    const command = message.content;

    if (commands[command]) {
        commands[command](message); // Ejecutar el comando si existe en basic_commands.js
    }
});

client.login(process.env.DISCORD_TOKEN);
