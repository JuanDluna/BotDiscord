// slash_commands/recommend.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { spotifyApi, getAccessToken, refreshAccessToken } = require('../functions/spotify'); // Asegúrate de tener esta configuración para usar Spotify

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recommend')
        .setDescription('Recomienda una canción de Spotify basada en tus gustos.')
        .addStringOption(option =>
            option.setName('genre')
                .setDescription('El género de música que te interesa (por ejemplo: pop, rock, hip-hop)')
                .setRequired(false)
        ),
    async execute(interaction) {
        const genre = interaction.options.getString('genre');
        let accessToken = getAccessToken(); // Obtener el token de acceso de Spotify

        // Si no tenemos el token de acceso, lo refrescamos
        if (!accessToken) {
            accessToken = await refreshAccessToken();
            if (!accessToken) {
                return interaction.reply('❌ No se pudo obtener el token de acceso de Spotify. Intenta vincular tu cuenta de Spotify con !link.');
            }
        }

        try {
            // Si el usuario proporciona un género, buscamos canciones de ese género
            let searchQuery = genre ? `genre:${genre}` : 'pop'; // Si no se da un género, por defecto se buscarán canciones pop

            // Buscar canciones en Spotify usando la API, limitando la búsqueda a 20 canciones
            const searchResults = await spotifyApi.searchTracks(searchQuery, { limit: 20 });

            if (searchResults.body.tracks.items.length === 0) {
                return interaction.reply(`❌ No encontré canciones para el género "${genre || 'pop'}". Intenta otro género.`);
            }

            // Seleccionar una canción aleatoria de las 20 canciones encontradas
            const randomIndex = Math.floor(Math.random() * searchResults.body.tracks.items.length);
            const track = searchResults.body.tracks.items[randomIndex]; // Tomamos la canción aleatoria

            // Responder con la canción recomendada
            await interaction.reply(`🎶 Te recomiendo la canción: **${track.name}** por ${track.artists.map(a => a.name).join(', ')}. Escúchala en Spotify: [${track.name}](${track.external_urls.spotify})`);
        } catch (error) {
            console.error('Error al obtener recomendación de Spotify:', error);
            await interaction.reply('❌ Hubo un error al intentar recomendar una canción. Intenta nuevamente.');
        }
    },
};
