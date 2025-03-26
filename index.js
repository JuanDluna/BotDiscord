require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const commands = require('./basic_commands'); // Importar comandos desde basic_commands.js
const deployCommands = require('./deploy_commands');
const { startSpotifyServer } = require('./spotify');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});


client.on('ready', () => {
    // Enviar los comandos Slash a Discord
    deployCommands();

    // Iniciar el servidor de autenticación de Spotify
    startSpotifyServer(); 
    

    // Mensaje en consola cuando el bot está listo
    console.log(`✅ Bot conectado como ${client.user.tag}`);
});

// Comandos basicos con lectura de mensajes, por ejemplo "!hola" usando un archivo externo
client.on('messageCreate', (message) => {
    if (message.author.bot) return; // Ignorar mensajes de bots

    // Obtener el contenido del mensaje
    const command = message.content;

    // Usando funcion interna
    if(command === '!mija') {
        message.reply('Donde van');
    }

    // Buscando desde el archivo externo
    if (commands[command]) {
        commands[command](message); // Ejecutar el comando si existe en basic_commands.js
    }

});

// Importamos el path para manejar los archivos
const path = require('path');
const fs = require('fs');

client.on('interactionCreate', async (interaction) => {
    // Asegurarnos de que sea una interacción de tipo comando
    if (!interaction.isCommand()) return;

    // Obtener el nombre del comando
    const { commandName } = interaction;

    // Cargar los comandos disponibles desde la carpeta 'slash_commands'
    const commandFiles = fs.readdirSync(path.join(__dirname, 'slash_commands')).filter(file => file.endsWith('.js'));

    // Buscar el archivo correspondiente al comando ejecutado
    for (const file of commandFiles) {
        const command = require(`./slash_commands/${file}`);

        // Si el nombre del comando coincide, ejecutar su lógica
        if (command.data.name === commandName) {
            try {
                await command.execute(interaction); // Ejecutar el comando
            } catch (error) {
                console.error('Error al ejecutar el comando:', error);
                await interaction.reply({ content: 'Hubo un error al ejecutar el comando.', ephemeral: true });
            }
            return; // Salir una vez que el comando ha sido ejecutado
        }
    }
});



client.login(process.env.DISCORD_TOKEN);
