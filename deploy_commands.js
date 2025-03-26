require('dotenv').config();  // Cargar variables desde el archivo .env

const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const fs = require('fs');
const path = require('path');

// Obtener los valores desde el archivo .env
const clientId = process.env.DISCORD_APP_ID;
const token = process.env.DISCORD_TOKEN;

// Verificar si el clientId y token están definidos
if (!clientId || !token) {
    console.error('❌ No se han definido clientId o token en el archivo .env');
    process.exit(1);
}

const rest = new REST({ version: '9' }).setToken(token);

// Función para registrar los comandos
async function deployCommands() {
    const commands = [];
    
    // Leer los archivos de la carpeta 'slash_commands' y cargar sus comandos
    const commandFiles = fs.readdirSync(path.join(__dirname, 'slash_commands')).filter(file => file.endsWith('.js'));

    console.log("🔍 Cargando comandos Slash desde la carpeta 'slash_commands':");

    for (const file of commandFiles) {
        const command = require(`./slash_commands/${file}`);
        
        // Imprimir información del comando para debugging
        console.log(`🔧 Cargando comando: ${command.data.name}`);
        console.log(`   Descripción: ${command.data.description}`);
        
        commands.push(command.data.toJSON());  // Añadir el comando al array
    }

    try {
        console.log('🚀 Registrando comandos Slash...');

        // Registrar comandos globales en Discord
        await rest.put(
            Routes.applicationCommands(clientId), // Usamos esta ruta para comandos globales
            { body: commands }
        );

        console.log('✅ Comandos Slash registrados correctamente!');

    } catch (error) {
        console.error('❌ Error registrando comandos Slash:', error);
    }
}

module.exports = deployCommands;
