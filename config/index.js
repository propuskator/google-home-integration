module.exports = Object.freeze({
    server : {
        appPort : process.env.APP_PORT || '3000'
    },
    google : {
        clientId                  : process.env.GOOGLE_CLIENT_ID || '',
        clientSecret              : process.env.GOOGLE_CLIENT_SECRET || '',
        projectId                 : process.env.GOOGLE_PROJECT_ID || '',
        baseRedirectUri           : 'https://oauth-redirect.googleusercontent.com/r',
        baseSandboxRedirectUri    : 'https://oauth-redirect-sandbox.googleusercontent.com/r',
        basePlaygroundRedirectUri : 'https://developers.google.com/oauthplayground'
    },
    secret : process.env.SESSION_COOKIE_SECRET || 'secret!!!!!',
    mqtt   : {
        uri      : process.env.MQTT_URI || '',
        username : process.env.MQTT_USER || '',
        password : process.env.MQTT_PASS || ''
    },
    api : {
        url : process.env.API_URL || ''
    },
    services : {
        backend : {
            protocol : process.env.ACCESS_BACKEND_PROTOCOL || 'http',
            host     : process.env.ACCESS_BACKEND_HOST || 'access-backend',
            port     : process.env.ACCESS_BACKEND_PORT || 8000
        }
    }
});
