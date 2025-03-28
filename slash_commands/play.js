const { SlashCommandBuilder } = require('@discordjs/builders');
const { spotifyApi, getAccessToken, refreshAccessToken } = require('../spotify');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('Reproduce una canción en el servidor.')
        .addStringOption(option =>
            option.setName('cancion')
                .setDescription('El nombre de la canción que quieres reproducir.')
                .setRequired(true)
        ),
    async execute(interaction) {
        await interaction.deferReply(); // Deferir respuesta para evitar error 10062

        const song = interaction.options.getString('cancion');
        
        // 1. Obtener token de acceso
        let accessToken = getAccessToken();
        if (!accessToken) {
            accessToken = await refreshAccessToken();
            if (!accessToken) {
                return interaction.editReply('❌ No se pudo obtener el token de acceso de Spotify. Por favor, vincula tu cuenta de Spotify.');
            }
        }

        try {
            // 2. Buscar la canción
            const searchResults = await spotifyApi.searchTracks(song);
            if (searchResults.body.tracks.items.length === 0) {
                return interaction.editReply('❌ No se encontró ninguna canción con ese nombre.');
            }

            const track = searchResults.body.tracks.items[0];

            // 3. Obtener dispositivos disponibles
            const devices = await spotifyApi.getMyDevices();
            const activeDevice = devices.body.devices.find(device => device.is_active);

            if (!activeDevice) {
                return interaction.editReply('❌ No hay ningún dispositivo de reproducción activo.');
            }

            // 4. Reproducir la canción en el dispositivo activo
            await spotifyApi.play({
                uris: [track.uri],
                device_id: activeDevice.id
            });

            // Responder al usuario usando editReply()
            await interaction.editReply(`🎶 Reproduciendo: **${track.name}** por ${track.artists.map(a => a.name).join(', ')}`);
        } catch (error) {
            console.error(error);
            return interaction.editReply('❌ Hubo un error al intentar reproducir la canción.');
        }
    },
};
