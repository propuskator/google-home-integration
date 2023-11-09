const path            = require('path');
const { promisify }   = require('util');
const express         = require('express');
const mustacheExpress = require('mustache-express');

const { Logger }            = require('./lib/utils/logger');
const middleware            = require('./lib/middleware');
const oauthRouter           = require('./lib/router/oauth');
const createSmartHomeRouter = require('./lib/router/smartHome');
const { makeSmartHomeApp }  = require('./lib/google');

const logger = Logger('[RestApiApp]');
const app = express();

// Set Mustache as template engine
app.engine('mustache', mustacheExpress());
app.set('view engine', 'mustache');
app.set('views', path.join(__dirname, 'views'));

app.use(middleware.json);
app.use(middleware.urlencoded);
app.use(middleware.cors);

app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/api/v1', oauthRouter);

let server = null;

async function start({ appPort }) {
    const smartHomeApp = await makeSmartHomeApp(); // must create and initialize SmartHome app before defining routing
    const smartHomeRouter = createSmartHomeRouter(smartHomeApp);

    app.use('/api/v1', smartHomeRouter);

    server = app.listen(appPort, () => {
        const { port, address } = server.address();

        logger.info(`STARTING AT PORT [${port}] ADDRESS [${address}]`);
    });

    server.closeAsync = promisify(server.close);
}

async function stop() {
    if (!server) return;

    logger.info('Closing server');

    await server.closeAsync();
}


module.exports = {
    app,
    start,
    stop
};
