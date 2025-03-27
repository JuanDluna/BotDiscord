const http = require('http');
const SpotifyWebApi = require('spotify-web-api-node');
const url = require('url');

// Configuración de Spotify
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.SPOTIFY_REDIRECT_URI
});

// Permisos necesarios para reproducir música y leer el estado de la reproducción
const scopes = [
    'user-library-read',                
    'user-read-playback-state',         
    'user-read-currently-playing',      
    'user-modify-playback-state',      
    'playlist-read-private',            
    'playlist-read-collaborative',      
    'app-remote-control',               
];

let accessToken = null;
let refreshToken = null;

// Función para iniciar el proceso de vinculación con Spotify
function startSpotifyLink(message) {
    const link = spotifyApi.createAuthorizeURL(scopes);
    message.reply(`Por favor, autoriza el acceso a tu cuenta de Spotify para vincularla con el bot. Haz clic aquí: ${link}`);
}

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
        const data = await spotifyApi.refreshAccessToken();
        accessToken = data.body['access_token'];
        spotifyApi.setAccessToken(accessToken);
        console.log('✅ El access_token se ha actualizado correctamente');
        return accessToken;
    } catch (error) {
        console.log('❌ Error al refrescar el access_token:', error);
        return null;
    }
}

// Función para iniciar el servidor HTTP
function startSpotifyServer() {
    const server = http.createServer(async (req, res) => {
        const parsedUrl = url.parse(req.url, true);
        
        if (parsedUrl.pathname === '/') {
            // Página principal
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`
                <h1>Bienvenido al bot de Spotify</h1>
                <p><a href="/login">Autenticarse con Spotify</a></p>
            `);
        } else if (parsedUrl.pathname === '/login') {
            // Redirigir al usuario a la autenticación de Spotify
            const authorizeURL = spotifyApi.createAuthorizeURL(scopes, null);
            res.writeHead(302, { 'Location': authorizeURL });
            res.end();
        } else if (parsedUrl.pathname === '/callback') {
            // Callback de autenticación
            const code = parsedUrl.query.code;
            if (code) {
                try {
                    const data = await spotifyApi.authorizationCodeGrant(code);
                    accessToken = data.body['access_token'];
                    refreshToken = data.body['refresh_token'];
                    
                    spotifyApi.setAccessToken(accessToken);
                    spotifyApi.setRefreshToken(refreshToken);

                    res.writeHead(200, { 'Content-Type': 'text/html' });
                    res.end(`
                        <h1>Autenticación exitosa</h1>
                        <p>Tu token de acceso es: ${accessToken}</p>
                        <p><a href="/">Volver a la página principal</a></p>
                    `);
                } catch (error) {
                    console.error('Error al obtener el token:', error);
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    res.end('❌ Hubo un error al autenticarte. Intenta nuevamente.');
                }
            } else {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('❌ No se pudo obtener el código de autenticación.');
            }
        } else {
            // Ruta no encontrada
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('❌ Ruta no encontrada.');
        }
    });

    const PORT = 8888;
    server.listen(PORT, () => {
        console.log(`Servidor HTTP iniciado en http://localhost:${PORT}`);
        console.log(`URL de autenticación de Spotify: ${spotifyApi.createAuthorizeURL(scopes)}`);
    });
}

// Exportar funciones para su uso en otros archivos
module.exports = {
    spotifyApi,
    startSpotifyServer,
    startSpotifyLink,
    getAccessToken,
    refreshAccessToken
};
