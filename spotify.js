// spotify.js 
const SpotifyWebApi = require('spotify-web-api-node');
const express = require('express');
const app = express();

// Configuración de Spotify
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

    // Permisos necesarios para reproducir música y leer el estado de la reproducción
    const scopes = [
        'user-library-read',                // Permite acceder a la biblioteca del usuario.
        'user-read-playback-state',         // Permite leer el estado de la reproducción.
        'user-read-currently-playing',      // Permite leer la canción que se está reproduciendo.
        'user-modify-playback-state',      // Permite modificar la reproducción (pausar, reproducir, etc.).
        'playlist-read-private',            // Permite leer las listas de reproducción privadas.
        'playlist-read-collaborative',      // Permite leer las listas de reproducción colaborativas.
        'app-remote-control',               // Permite controlar la reproducción de Spotify en dispositivos remotos.
    ];

// Almacenamos el token de acceso para el usuario
let accessToken = null;
let refreshToken = null;

// Ruta para iniciar el proceso de vinculación
function startSpotifyLink(message) {
    const link = spotifyApi.createAuthorizeURL(scopes);
    message.reply(`Por favor, autoriza el acceso a tu cuenta de Spotify para vincularla con el bot. Haz clic aquí: ${link}`);
}

// Ruta de Express para redirigir a la autenticación
app.get('/login', (req, res) => {


    // Genera la URL de autorización con los permisos
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
    
    // Redirige a la URL de autorización
    res.redirect(authorizeURL);
});

// Callback de Spotify después de la autorización
app.get('/callback', (req, res) => {
    const code = req.query.code; // El código de autorización que Spotify nos envía
    spotifyApi.authorizationCodeGrant(code).then(
        (data) => {
            accessToken = data.body['access_token'];
            refreshToken = data.body['refresh_token'];  // Guardamos el refresh_token
            spotifyApi.setAccessToken(accessToken);
            spotifyApi.setRefreshToken(refreshToken);  // Establecemos el refresh_token
            res.send('¡Cuenta de Spotify vinculada exitosamente!');
        },
        (err) => {
            res.send('Hubo un error durante el proceso de vinculación.');
            console.log(err);
        }
    );
});

// Obtener el token de acceso
function getAccessToken() {
    return accessToken;
}

// Función para refrescar el access_token usando el refresh_token
async function refreshAccessToken() {
    if (!refreshToken) {
        console.log('❌ No se ha proporcionado un refresh_token');
        return null;
    }

    try {
        const data = await spotifyApi.refreshAccessToken();  // Solicitar un nuevo access_token
        accessToken = data.body['access_token'];
        spotifyApi.setAccessToken(accessToken);  // Actualizamos el access_token
        console.log('✅ El access_token se ha actualizado correctamente');
        return accessToken;
    } catch (error) {
        console.log('❌ Error al refrescar el access_token:', error);
        return null;
    }
}

// Configurar el servidor Express para manejar las rutas
function startSpotifyServer() {
    app.listen(8888, () => {
        console.log(`Servidor de autenticación Spotify corriendo en http://localhost:8888/login`);
    });
}

module.exports = {
    spotifyApi,
    startSpotifyLink,
    getAccessToken,
    startSpotifyServer,
    refreshAccessToken
};
