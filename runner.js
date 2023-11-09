const app        = require('./app');
const config     = require('./config');
const { Logger } = require('./lib/utils/logger');

const logger = Logger('[App]');

async function shutdown() {
    await app.stop();

    logger.info('Exit');

    process.exit(0);
}

async function main() {
    process.on('SIGTERM', async () => {
        logger.info('SIGTERM signal was caught');

        await shutdown();
    });

    process.on('SIGINT', async () => {
        logger.info('SIGINT signal was caught');

        await shutdown();
    });

    process.on('unhandledRejection', err => {
        console.error(err);

        logger.error({
            type  : 'UnhandledRejection',
            error : err.stack
        });
    });

    process.on('uncaughtException', err => {
        console.error(err);

        logger.error({
            type  : 'UncaughtException',
            error : err.stack
        });
    });

    await app.start({ appPort: config.server.appPort });
}

main().catch(err => {
    console.error(err);

    process.exit(1);
});
