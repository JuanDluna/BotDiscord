// basic_commands.js
const { spotifyApi, startSpotifyLink, getAccessToken, refreshAccessToken } = require('./spotify');

// Comando para mostrar lo que está reproduciendo el bot en Spotify
const playing = async (message) => {
    let accessToken = getAccessToken(); // Obtenemos el token de acceso de Spotify
    
    // Verificamos si el accessToken está vacío
    if (!accessToken) {
        console.log('❌ No se tiene un accessToken, se intenta refrescar.');
        accessToken = await refreshAccessToken(); // Refrescamos el token de acceso
        if (!accessToken) {
            message.reply('❌ No se pudo obtener el token de acceso. Por favor, vincula tu cuenta de Spotify con !link.');
            return;
        }
    }

    try {
        // Comprobamos si el bot tiene acceso a la información de la canción en reproducción
        const trackData = await spotifyApi.getMyCurrentPlayingTrack();

        if (trackData.body && trackData.body.item) {
            const track = trackData.body.item;
            message.reply(`🎶 Actualmente estoy reproduciendo: ${track.name} por ${track.artists.map(a => a.name).join(', ')}`);
        } else {
            message.reply('❌ No estoy reproduciendo ninguna canción en este momento.');
        }
    } catch (error) {
        message.reply('❌ Hubo un error al intentar obtener la canción que estoy reproduciendo.');
        console.log(error);
    }
};


module.exports = {
    '!hola': (message) => {
        message.reply('¡Hola! ¿Cómo estás? 😊');
    },
    '!ping': (message) => {
        message.reply('🏓 ¡Pong!');
    },
    "!link": (message) => {
        startSpotifyLink(message);
    },
    // API SPOTIFY
    '!playing': playing, // Comando para mostrar lo que está reproduciendo el bot en Spotify
    // Añadir más comandos
};
