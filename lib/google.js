const path          = require('path');
const MqttTransport = require('homie-sdk/lib/Broker/mqtt');
const HomieCloud    = require('homie-sdk/lib/homie/HomieCloud');

const { mqtt }          = require('../config');
const { Logger }        = require('./utils/logger');
const IntentsController = require('./services/core/IntentsController');
const SmartHome         = require('./services/core/SmartHome');
const IntentsProcessor  = require('./services/core/IntentsProcessor');

const GOOGLE_JWT_PATH = path.join(__dirname, '..', 'config', 'google', 'smart-home-key.json');

async function makeSmartHomeApp() {
    const mqttTransport = new MqttTransport({
        uri      : mqtt.uri,
        username : mqtt.username,
        password : mqtt.password
    });
    const homieCloud = new HomieCloud({ transport: mqttTransport });
    const intentsProcessor = new IntentsProcessor(homieCloud, Logger(IntentsProcessor.name));
    const intentsController = new IntentsController(intentsProcessor, Logger(IntentsController.name));

    const jwt = require(GOOGLE_JWT_PATH);
    const smartHome = new SmartHome({ jwt }, intentsController);

    await smartHome.init();

    const app = smartHome.getApp();

    return app;
}

module.exports = {
    makeSmartHomeApp
};
