const SpotifyWebApi = require('spotify-web-api-node');
const serverless = require('serverless-http');
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

// Ruta principal
app.get('/', (req, res) => {
    res.send(`
      <h1>Bienvenido a la página de Spotify Bot</h1>
      <p>Para autenticarte, <a href="/login">haz clic aquí</a>.</p>
    `);
});

// Ruta para iniciar sesión (redirigir al usuario a Spotify para autorización)
app.get('/login', (req, res) => {
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes, null);
    res.redirect(authorizeURL);
});

// Ruta de callback de Spotify
app.get('/callback', async (req, res) => {
    const code = req.query.code;

    if (code) {
        try {
            // Intercambiar el código por un token de acceso
            const data = await spotifyApi.authorizationCodeGrant(code);
            const accessToken = data.body['access_token'];
            const refreshToken = data.body['refresh_token'];

            // Guardar los tokens en el objeto de la API de Spotify
            spotifyApi.setAccessToken(accessToken);
            spotifyApi.setRefreshToken(refreshToken);

            // Responder con el token de acceso
            res.send(`
                <h1>Autenticación exitosa</h1>
                <p>Tu token de acceso es: ${accessToken}</p>
                <p><a href="/">Volver a la página principal</a></p>
            `);
        } catch (error) {
            console.error('Error al obtener el token:', error);
            res.send('❌ Hubo un error al autenticarte. Intenta nuevamente.');
        }
    } else {
        res.send('❌ No se pudo obtener el código de autenticación.');
    }
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
const handler = serverless(app);  // Convertimos el servidor Express en una función sin servidor

module.exports.handler = handler;  // Exportamos el handler para Netlify
